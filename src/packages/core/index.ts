// ============================================================================
// Daleel Ay Khidma - Core Package (Constants, Utilities & Formatters)
// ============================================================================

import { UserDTO, RoleDTO, ActivityStatus } from "../types";

export const APP_CONFIG = {
  name: "دليل أي خدمة",
  nameEn: "Daleel Ay Khidma",
  tagline: "الدليل الشامل للأنشطة والخدمات التجارية في مصر",
  apiVersion: "v2",
  apiBaseUrl: "/api/v2",
  defaultLocale: "ar",
  direction: "rtl",
  itemsPerPage: 12,
};

export const ACTIVITY_STATUS_MAP: Record<ActivityStatus, { label: string; bgClass: string; textClass: string; borderClass: string }> = {
  verified: {
    label: "موثق ومعتمد",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
  },
  pending: {
    label: "قيد المراجعة",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
  },
  rejected: {
    label: "مرفوض",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
    borderClass: "border-red-200",
  },
  suspended: {
    label: "موقوف مؤقتاً",
    bgClass: "bg-slate-100",
    textClass: "text-slate-700",
    borderClass: "border-slate-300",
  },
};

export const PERMISSION_MODULES: Record<string, string> = {
  activities: "إدارة الأنشطة والتوثيق",
  content: "إدارة المحتوى والتصنيفات",
  reviews: "إدارة التقييمات والبلاغات",
  users: "إدارة المستخدمين والفرق",
  roles: "الأدوار والصلاحيات",
  analytics: "التقارير والمؤشرات",
  audit: "سجل العمليات والرقابة",
};

/**
 * Format Arabic Numbers with Eastern Arabic or Standard Arabic format
 */
export function formatArabicNumber(num: number): string {
  return new Intl.NumberFormat("ar-EG").format(num);
}

/**
 * Format Date to Arabic relative or localized string
 */
export function formatArabicDate(dateString: string, includeTime = false): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  } catch {
    return dateString;
  }
}

/**
 * RBAC Helper: Check if user has a specific permission
 */
export function userHasPermission(user: UserDTO | null, permissionName: string): boolean {
  if (!user) return false;
  if (user.role_name === "مدير_عام" || user.permissions?.includes("all")) return true;
  return user.permissions?.includes(permissionName) || false;
}

/**
 * Check if user is restricted by geographic scope
 */
export function userIsGeoRestricted(user: UserDTO | null): boolean {
  if (!user) return false;
  if (user.role_name === "مدير_عام") return false;
  return !!user.requires_geo_scope && user.location_id !== null;
}

/**
 * Slug generator for Arabic/English strings
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0621-\u064A-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Set Dynamic Page Meta Tags for SEO
 */
export function setPageSEO(title: string, description?: string) {
  const fullTitle = `${title} | ${APP_CONFIG.name}`;
  document.title = fullTitle;

  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);
  }
}

export * from "./excelEngine";
