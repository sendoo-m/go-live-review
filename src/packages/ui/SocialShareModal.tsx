// ============================================================================
// Daleel Ay Khidma - Social Sharing Modal Component
// Supports WhatsApp, Facebook, X (Twitter), Telegram, LinkedIn, Web Share API, Copy Link & Deep Links
// ============================================================================

import React, { useState } from "react";
import { useI18n } from "../i18n";
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Globe,
  QrCode,
  Sparkles,
} from "lucide-react";

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  categoryName?: string;
  locationName?: string;
  itemType?: "activity" | "product" | "service" | "offer";
  id?: number | string;
  item?: {
    id?: number | string;
    title?: string;
    description?: string;
    type?: string;
    category?: string;
    imageUrl?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    url?: string;
  };
}

export function SocialShareModal({
  isOpen,
  onClose,
  title = "",
  description = "",
  url = typeof window !== "undefined" ? window.location.href : "",
  imageUrl,
  categoryName,
  locationName,
  itemType = "activity",
  id,
  item,
}: SocialShareModalProps) {
  const { t, isRtl } = useI18n();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const effectiveTitle = item?.title || title || "";
  const effectiveDescription = item?.description || description || "";
  const effectiveImageUrl = item?.imageUrl || imageUrl;
  const effectiveCategory = item?.category || categoryName;
  const effectiveLocation = item?.address || locationName;
  const effectiveId = item?.id || id;
  const effectiveType = (item?.type || itemType || "activity") as "activity" | "product" | "service" | "offer";
  const currentUrl = item?.url || url || (typeof window !== "undefined" ? window.location.href : "https://daleel.test");
  const deepLink = `daleel://${effectiveType}/${effectiveId || 1}`;

  // Formatted text for WhatsApp and direct sharing
  const shareText = isRtl
    ? `✨ ${effectiveTitle}\n📍 ${effectiveLocation ? `الموقع: ${effectiveLocation}\n` : ""}${effectiveCategory ? `🏷️ التصنيف: ${effectiveCategory}\n` : ""}${effectiveDescription ? `📝 ${effectiveDescription.slice(0, 120)}...\n` : ""}\n🔗 شاهد التفاصيل الكاملة وتواصل مباشرة عبر منصة دليل أي خدمة:\n${currentUrl}`
    : `✨ ${effectiveTitle}\n📍 ${effectiveLocation ? `Location: ${effectiveLocation}\n` : ""}${effectiveCategory ? `🏷️ Category: ${effectiveCategory}\n` : ""}\n🔗 View details on Daleel Ay Khidma:\n${currentUrl}`;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  // Social Sharing URLs
  const shareChannels = [
    {
      id: "whatsapp",
      name: "واتساب (WhatsApp)",
      nameEn: "WhatsApp",
      icon: MessageCircle,
      bg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20",
      badgeColor: "bg-emerald-500/20 text-emerald-100",
      url: `https://wa.me/?text=${encodedText}`,
    },
    {
      id: "facebook",
      name: "فيسبوك (Facebook)",
      nameEn: "Facebook",
      icon: Globe,
      bg: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20",
      badgeColor: "bg-blue-500/20 text-blue-100",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "x",
      name: "منصة X (تويتر سابقاً)",
      nameEn: "X (Twitter)",
      icon: Share2,
      bg: "bg-slate-900 hover:bg-black text-white shadow-slate-900/20",
      badgeColor: "bg-slate-800 text-slate-300",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`,
    },
    {
      id: "telegram",
      name: "تيليجرام (Telegram)",
      nameEn: "Telegram",
      icon: Smartphone,
      bg: "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-900/20",
      badgeColor: "bg-sky-400/20 text-sky-100",
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
    },
    {
      id: "linkedin",
      name: "لينكد إن (LinkedIn)",
      nameEn: "LinkedIn",
      icon: Globe,
      bg: "bg-blue-800 hover:bg-blue-900 text-white shadow-blue-950/20",
      badgeColor: "bg-blue-700/20 text-blue-100",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: currentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 text-right animate-in zoom-in-95 duration-200"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Share2 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">{t("share.title")}</h3>
            </div>
            <p className="text-xs text-slate-300 pr-10">{t("share.subtitle")}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Preview Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          {effectiveImageUrl && (
            <img
              src={effectiveImageUrl}
              alt={effectiveTitle}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{effectiveTitle}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
              {effectiveCategory && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                  {effectiveCategory}
                </span>
              )}
              {effectiveLocation && <span className="truncate">{effectiveLocation}</span>}
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick 1-Click Social Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {shareChannels.map((ch) => {
              const Icon = ch.icon;
              return (
                <a
                  key={ch.id}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-3 rounded-2xl font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer ${ch.bg}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{isRtl ? ch.name : ch.nameEn}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              );
            })}
          </div>

          {/* Direct Copy Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">{t("share.copy_link")}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-900/20"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t("share.link_copied") : t("share.copy_link")}</span>
              </button>
            </div>
          </div>

          {/* Native Web Share & Flutter Deep Link Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            {typeof navigator !== "undefined" && navigator.share ? (
              <button
                onClick={handleNativeShare}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>{t("share.native_share")}</span>
              </button>
            ) : null}

            <button
              onClick={() => setShowQr(!showQr)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>{t("share.qr_code")}</span>
            </button>
          </div>

          {/* QR Code & Deep Link View Toggle */}
          {showQr && (
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-center space-y-3 animate-in fade-in duration-200">
              <div className="inline-block p-3 bg-white rounded-2xl shadow-sm border border-indigo-100">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}`}
                  alt="QR Code"
                  className="w-32 h-32 mx-auto"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-900">{t("share.deep_link")}</p>
                <code className="text-[11px] font-mono text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 inline-block mt-1">
                  {deepLink}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
