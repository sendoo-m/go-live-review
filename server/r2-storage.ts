import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string; // e.g. "https://images.dalilaykhidma.com"
}

export type StorageFolder =
  | "activities"
  | "products"
  | "offers"
  | "profiles"
  | "reviews"
  | "media"
  | "temp";

export type ImageVariant =
  | "thumbnail"
  | "card"
  | "detail"
  | "cover"
  | "avatar"
  | "gallery"
  | "original";

export interface ImageVariantOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "cover" | "contain" | "crop" | "scale-down";
  format?: "auto" | "webp" | "avif" | "jpeg";
}

export const IMAGE_VARIANT_PRESETS: Record<ImageVariant, ImageVariantOptions> = {
  thumbnail: { width: 160, height: 160, quality: 75, fit: "crop", format: "auto" },
  card: { width: 480, quality: 80, fit: "scale-down", format: "auto" },
  detail: { width: 960, quality: 85, fit: "scale-down", format: "auto" },
  cover: { width: 1400, quality: 85, fit: "scale-down", format: "auto" },
  avatar: { width: 200, height: 200, quality: 80, fit: "crop", format: "auto" },
  gallery: { width: 1200, quality: 85, fit: "scale-down", format: "auto" },
  original: {},
};

export interface UploadResult {
  url: string;
  key: string;
  folder: StorageFolder;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  isR2: boolean;
  uploadedAt: string;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  finalPublicUrl: string;
  key: string;
  folder: StorageFolder;
  fileName: string;
  expiresInSeconds: number;
}

// Allowed MIME types and corresponding canonical extensions
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export class R2StorageService {
  private static instance: R2StorageService;
  private s3Client: S3Client | null = null;
  private config: R2Config | null = null;

  private constructor() {
    this.refreshConfig();
  }

  public static getInstance(): R2StorageService {
    if (!R2StorageService.instance) {
      R2StorageService.instance = new R2StorageService();
    }
    return R2StorageService.instance;
  }

  /**
   * Refreshes credentials from process.env
   */
  public refreshConfig(): void {
    const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || "dalil-media";
    let publicDomain = process.env.R2_PUBLIC_DOMAIN || "https://images.dalilaykhidma.com";

    // Ensure publicDomain has https:// and no trailing slash
    if (publicDomain) {
      if (!publicDomain.startsWith("http://") && !publicDomain.startsWith("https://")) {
        publicDomain = `https://${publicDomain}`;
      }
      publicDomain = publicDomain.replace(/\/+$/, "");
    }

    if (accountId && accessKeyId && secretAccessKey && bucketName) {
      this.config = {
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicDomain,
      };

      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      console.log(`[R2Storage] Cloudflare R2 initialized successfully for bucket "${bucketName}" with public domain "${publicDomain}"`);
    } else {
      this.config = null;
      this.s3Client = null;
      console.log("[R2Storage] Cloudflare R2 credentials not fully set. Operating in graceful fallback mode.");
    }
  }

  /**
   * Checks if R2 is configured
   */
  public isConfigured(): boolean {
    return this.s3Client !== null && this.config !== null;
  }

  /**
   * Returns current config info (excluding secret keys)
   */
  public getPublicConfig() {
    return {
      isConfigured: this.isConfigured(),
      bucketName: this.config?.bucketName || null,
      publicDomain: this.config?.publicDomain || "https://images.dalilaykhidma.com",
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: Object.keys(ALLOWED_MIME_TYPES),
    };
  }

  /**
   * Generates a collision-free and sanitized storage key
   * e.g. products/prod_102_1725289900000_a3b2c1d0.webp
   */
  public generateKey(
    folder: StorageFolder,
    originalName?: string,
    mimeType?: string,
    entityId?: string | number,
    prefix?: string
  ): { key: string; fileName: string; extension: string } {
    let extension = ".jpg";
    if (mimeType && ALLOWED_MIME_TYPES[mimeType]) {
      extension = ALLOWED_MIME_TYPES[mimeType];
    } else if (originalName) {
      const ext = path.extname(originalName).toLowerCase();
      if (Object.values(ALLOWED_MIME_TYPES).includes(ext)) {
        extension = ext;
      }
    }

    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(4).toString("hex");
    const sanitizedPrefix = prefix ? `${prefix.replace(/[^a-zA-Z0-9_-]/g, "")}_` : "";
    const sanitizedEntity = entityId ? `${entityId}_` : "";

    const fileName = `${sanitizedPrefix}${sanitizedEntity}${timestamp}_${randomHex}${extension}`;
    const key = `${folder}/${fileName}`;

    return { key, fileName, extension };
  }

  /**
   * Validates file buffer, size, and MIME type
   */
  public validateFile(buffer: Buffer, mimeType: string): { isValid: boolean; error?: string } {
    if (buffer.length === 0) {
      return { isValid: false, error: "حجم الملف فارغ (0 بايت)." };
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      const maxMb = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
      return { isValid: false, error: `تجاوز حجم الملف الحد الأقصى المسموح (${maxMb} ميجابايت).` };
    }

    const normalizedMime = mimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES[normalizedMime]) {
      return {
        isValid: false,
        error: `نوع الملف غير مدعوم (${normalizedMime}). الصيغ المدعومة هي: JPG, PNG, WebP, GIF, SVG, AVIF.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Uploads a Buffer directly to Cloudflare R2
   */
  public async uploadBuffer(
    buffer: Buffer,
    options: {
      folder?: StorageFolder;
      originalName?: string;
      mimeType: string;
      entityId?: string | number;
      prefix?: string;
      customMetadata?: Record<string, string>;
    }
  ): Promise<UploadResult> {
    const folder = options.folder || "media";
    const mimeType = options.mimeType || "image/jpeg";

    // 1. Validation
    const validation = this.validateFile(buffer, mimeType);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. Key Generation
    const { key, fileName } = this.generateKey(
      folder,
      options.originalName,
      mimeType,
      options.entityId,
      options.prefix
    );

    const uploadedAt = new Date().toISOString();

    // 3. R2 Upload or Graceful Fallback
    if (this.isConfigured() && this.s3Client && this.config) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          Metadata: {
            "uploaded-at": uploadedAt,
            "original-name": encodeURIComponent(options.originalName || fileName),
            ...(options.customMetadata || {}),
          },
          CacheControl: "public, max-age=31536000, immutable", // 1 year CDN caching for immutable images
        });

        await this.s3Client.send(command);

        const publicUrl = `${this.config.publicDomain}/${key}`;

        return {
          url: publicUrl,
          key,
          folder,
          fileName,
          sizeBytes: buffer.length,
          mimeType,
          isR2: true,
          uploadedAt,
        };
      } catch (err: any) {
        console.error("[R2Storage] S3 PutObject error:", err);
        throw new Error(`فشل رفع الصورة إلى Cloudflare R2: ${err.message || "خطأ غير معروف"}`);
      }
    } else {
      // Fallback for local/sandbox without R2 credentials:
      // Return custom domain formatted URL or high-fidelity simulated asset
      const publicDomain = this.config?.publicDomain || "https://images.dalilaykhidma.com";
      const fallbackUrl = `${publicDomain}/${key}`;

      console.warn(
        `[R2Storage Fallback] R2 is not configured. Simulating upload. Target URL: ${fallbackUrl}`
      );

      return {
        url: fallbackUrl,
        key,
        folder,
        fileName,
        sizeBytes: buffer.length,
        mimeType,
        isR2: false,
        uploadedAt,
      };
    }
  }

  /**
   * Uploads base64 or Data URI string
   */
  public async uploadBase64(
    base64String: string,
    options: {
      folder?: StorageFolder;
      originalName?: string;
      mimeType?: string;
      entityId?: string | number;
      prefix?: string;
    }
  ): Promise<UploadResult> {
    let rawBase64 = base64String;
    let detectedMime = options.mimeType || "image/jpeg";

    if (base64String.startsWith("data:")) {
      const match = base64String.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        rawBase64 = match[2];
      }
    }

    const buffer = Buffer.from(rawBase64, "base64");
    return this.uploadBuffer(buffer, {
      ...options,
      mimeType: detectedMime,
    });
  }

  /**
   * Generates a Pre-signed URL for direct client-side upload (Direct Upload)
   */
  public async generatePresignedUpload(options: {
    folder?: StorageFolder;
    originalName?: string;
    mimeType: string;
    entityId?: string | number;
    prefix?: string;
    expiresInSeconds?: number;
  }): Promise<PresignedUploadResult> {
    const folder = options.folder || "media";
    const mimeType = options.mimeType || "image/jpeg";
    const expiresInSeconds = options.expiresInSeconds || 300; // 5 minutes

    const { key, fileName } = this.generateKey(
      folder,
      options.originalName,
      mimeType,
      options.entityId,
      options.prefix
    );

    const publicDomain = this.config?.publicDomain || "https://images.dalilaykhidma.com";
    const finalPublicUrl = `${publicDomain}/${key}`;

    if (this.isConfigured() && this.s3Client && this.config) {
      const command = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
        ContentType: mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds,
      });

      return {
        uploadUrl,
        finalPublicUrl,
        key,
        folder,
        fileName,
        expiresInSeconds,
      };
    } else {
      // Mock direct upload endpoint for sandbox / local development
      return {
        uploadUrl: `/api/v2/media/upload-direct-mock?key=${encodeURIComponent(key)}`,
        finalPublicUrl,
        key,
        folder,
        fileName,
        expiresInSeconds,
      };
    }
  }

  /**
   * Derives an optimized image URL for a given variant.
   * If Cloudflare Image Resizing / Transformations is enabled, formats with /cdn-cgi/image/
   * Otherwise returns original pristine URL.
   */
  public getOptimizedImageUrl(
    originalUrl: string,
    variant: ImageVariant = "original",
    customOptions?: ImageVariantOptions
  ): string {
    if (!originalUrl) return "";
    if (variant === "original" && !customOptions) return originalUrl;

    const publicDomain = this.config?.publicDomain || "https://images.dalilaykhidma.com";
    const cleanDomain = publicDomain.replace(/^https?:\/\//, "");

    // Check if the URL is on our R2 domain
    const isOurDomain = originalUrl.includes(cleanDomain);

    const preset = IMAGE_VARIANT_PRESETS[variant] || {};
    const opts = { ...preset, ...(customOptions || {}) };

    // Build transformation options string for Cloudflare Image Resizing
    // e.g. width=400,quality=80,format=auto,fit=scale-down
    const parts: string[] = [];
    if (opts.width) parts.push(`width=${opts.width}`);
    if (opts.height) parts.push(`height=${opts.height}`);
    if (opts.quality) parts.push(`quality=${opts.quality}`);
    if (opts.fit) parts.push(`fit=${opts.fit}`);
    if (opts.format) parts.push(`format=${opts.format}`);

    const transformQuery = parts.join(",");

    // If Cloudflare Image Resizing is enabled via environment variable
    const isTransformEnabled =
      process.env.ENABLE_CLOUDFLARE_IMAGE_TRANSFORM === "true" ||
      process.env.CLOUDFLARE_IMAGES_TRANSFORM === "true";

    if (isOurDomain && isTransformEnabled && transformQuery) {
      try {
        const parsed = new URL(originalUrl);
        // Avoid double transformation prefix
        let pathName = parsed.pathname;
        if (pathName.startsWith("/cdn-cgi/image/")) {
          const split = pathName.split("/").slice(3).join("/");
          pathName = `/${split}`;
        }
        return `${parsed.protocol}//${parsed.host}/cdn-cgi/image/${transformQuery}${pathName}`;
      } catch (_) {
        return originalUrl;
      }
    }

    // Default clean behavior: return pristine URL
    return originalUrl;
  }

  /**
   * Safely deletes an old image when replaced by a new one
   */
  public async deleteOldMediaIfReplaced(oldUrl?: string, newUrl?: string): Promise<boolean> {
    if (!oldUrl || !newUrl) return false;
    if (oldUrl === newUrl) return false;

    const publicDomain = this.config?.publicDomain || "https://images.dalilaykhidma.com";
    const cleanDomain = publicDomain.replace(/^https?:\/\//, "");

    // Only delete if old image belongs to our R2 storage domain and is not a default/placeholder
    if (oldUrl.includes(cleanDomain) && !oldUrl.includes("default_") && !oldUrl.includes("placeholder")) {
      console.log(`[R2Storage Lifecycle] Replacing old media "${oldUrl}" with "${newUrl}"`);
      return await this.deleteObject(oldUrl);
    }
    return false;
  }

  /**
   * Cleans up expired temporary files in the temp/ folder
   */
  public async cleanupTempUploads(olderThanHours: number = 24): Promise<{
    deletedCount: number;
    errors: string[];
  }> {
    if (!this.isConfigured() || !this.s3Client || !this.config) {
      return { deletedCount: 0, errors: ["R2 is not configured"] };
    }

    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
    let deletedCount = 0;
    const errors: string[] = [];

    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        Prefix: "temp/",
      });

      const listResponse = await this.s3Client.send(listCommand);
      const objects = listResponse.Contents || [];

      for (const obj of objects) {
        if (obj.Key && obj.LastModified && obj.LastModified.getTime() < cutoffTime) {
          try {
            await this.s3Client.send(
              new DeleteObjectCommand({
                Bucket: this.config.bucketName,
                Key: obj.Key,
              })
            );
            deletedCount++;
          } catch (delErr: any) {
            errors.push(`Failed to delete ${obj.Key}: ${delErr.message}`);
          }
        }
      }

      console.log(`[R2Storage Lifecycle] Cleaned up ${deletedCount} temp files older than ${olderThanHours} hours.`);
      return { deletedCount, errors };
    } catch (err: any) {
      console.error("[R2Storage Lifecycle] Temp cleanup error:", err);
      return { deletedCount, errors: [err.message] };
    }
  }

  /**
   * Retrieves bucket storage statistics categorized by folder
   */
  public async getStorageStats(): Promise<{
    isConfigured: boolean;
    bucketName: string | null;
    totalObjects: number;
    totalSizeBytes: number;
    folders: Record<StorageFolder, { count: number; sizeBytes: number }>;
  }> {
    const emptyStats = {
      isConfigured: this.isConfigured(),
      bucketName: this.config?.bucketName || null,
      totalObjects: 0,
      totalSizeBytes: 0,
      folders: {
        activities: { count: 0, sizeBytes: 0 },
        products: { count: 0, sizeBytes: 0 },
        offers: { count: 0, sizeBytes: 0 },
        profiles: { count: 0, sizeBytes: 0 },
        reviews: { count: 0, sizeBytes: 0 },
        media: { count: 0, sizeBytes: 0 },
        temp: { count: 0, sizeBytes: 0 },
      } as Record<StorageFolder, { count: number; sizeBytes: number }>,
    };

    if (!this.isConfigured() || !this.s3Client || !this.config) {
      return emptyStats;
    }

    try {
      let isTruncated: boolean | undefined = true;
      let continuationToken: string | undefined = undefined;

      while (isTruncated) {
        const listCommand: ListObjectsV2Command = new ListObjectsV2Command({
          Bucket: this.config.bucketName,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        });

        const res = await this.s3Client.send(listCommand);
        const contents = res.Contents || [];

        for (const item of contents) {
          if (!item.Key) continue;
          const size = item.Size || 0;
          emptyStats.totalObjects++;
          emptyStats.totalSizeBytes += size;

          const topFolder = item.Key.split("/")[0] as StorageFolder;
          if (emptyStats.folders[topFolder]) {
            emptyStats.folders[topFolder].count++;
            emptyStats.folders[topFolder].sizeBytes += size;
          } else if (emptyStats.folders.media) {
            emptyStats.folders.media.count++;
            emptyStats.folders.media.sizeBytes += size;
          }
        }

        isTruncated = res.IsTruncated;
        continuationToken = res.NextContinuationToken;
      }

      return emptyStats;
    } catch (err) {
      console.error("[R2Storage] getStorageStats error:", err);
      return emptyStats;
    }
  }

  /**
   * Deletes an object from R2 by key or full URL
   */
  public async deleteObject(keyOrUrl: string): Promise<boolean> {
    if (!keyOrUrl) return false;

    // Extract key if a full URL was provided
    let key = keyOrUrl;
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
      try {
        const parsed = new URL(keyOrUrl);
        key = parsed.pathname.replace(/^\/+/, "");
      } catch (_) {
        key = keyOrUrl;
      }
    }

    if (!key) return false;

    if (this.isConfigured() && this.s3Client && this.config) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.config.bucketName,
          Key: key,
        });
        await this.s3Client.send(command);
        console.log(`[R2Storage] Deleted object "${key}" from bucket "${this.config.bucketName}"`);
        return true;
      } catch (err) {
        console.error(`[R2Storage] Failed to delete object "${key}":`, err);
        return false;
      }
    } else {
      console.log(`[R2Storage Fallback] Simulated delete for key "${key}"`);
      return true;
    }
  }

  /**
   * Diagnostic test checking R2 connection & permissions
   */
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
    bucket?: string;
    publicDomain?: string;
    details?: any;
  }> {
    if (!this.isConfigured() || !this.s3Client || !this.config) {
      return {
        success: false,
        message: "بيانات اعتماد Cloudflare R2 غير مكتملة في متغيرات البيئة (.env).",
      };
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucketName,
        MaxKeys: 1,
      });
      const response = await this.s3Client.send(command);

      return {
        success: true,
        message: `تم الاتصال بنجاح بـ Cloudflare R2 Bucket [${this.config.bucketName}].`,
        bucket: this.config.bucketName,
        publicDomain: this.config.publicDomain,
        details: {
          keyCount: response.KeyCount || 0,
          isTruncated: response.IsTruncated,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `فشل التحقق من اتصال Cloudflare R2: ${err.message}`,
        bucket: this.config.bucketName,
        details: err,
      };
    }
  }
}

export const r2Storage = R2StorageService.getInstance();
