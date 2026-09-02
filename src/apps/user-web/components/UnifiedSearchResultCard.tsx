// ============================================================================
// Daleel Ay Khidma - Unified Search Result Card Component
// ============================================================================

import React from "react";
import { UnifiedSearchItemDTO } from "../../../packages/types";
import { RatingStars, Badge, Button } from "../../../packages/ui";
import {
  Store,
  Wrench,
  Package,
  MapPin,
  Bike,
  Phone,
  MessageCircle,
  ExternalLink,
  Tag,
  CheckCircle2,
  Navigation,
  Clock,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export interface UnifiedSearchResultCardProps {
  key?: React.Key;
  item: UnifiedSearchItemDTO;
  isSelected?: boolean;
  onSelect?: (item: UnifiedSearchItemDTO) => void;
  onNavigateDetails?: (item: UnifiedSearchItemDTO) => void;
  layout?: "grid" | "list";
  [key: string]: any;
}

export function UnifiedSearchResultCard({
  item,
  isSelected = false,
  onSelect,
  onNavigateDetails,
  layout = "grid",
}: UnifiedSearchResultCardProps) {
  const isProduct = item.item_type === "product";
  const isService = item.item_type === "service";
  const isShop = item.item_type === "shop";

  const effectivePrice = item.sale_price !== null && item.sale_price !== undefined ? item.sale_price : item.price;
  const hasDiscount = item.sale_price !== null && item.sale_price !== undefined && item.price !== null && item.price !== undefined && item.sale_price < item.price;

  // Type-specific badge and styling
  const typeBadgeConfig = {
    shop: {
      label: "محل / متجر",
      icon: Store,
      badgeVariant: "amber" as const,
      colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    },
    service: {
      label: "خدمة / فني",
      icon: Wrench,
      badgeVariant: "emerald" as const,
      colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    product: {
      label: "منتج تجاري",
      icon: Package,
      badgeVariant: "indigo" as const,
      colorClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
  }[item.item_type] || {
    label: "نشاط تجاري",
    icon: Store,
    badgeVariant: "slate" as const,
    colorClass: "text-slate-700 bg-slate-50 border-slate-200",
  };

  const TypeIcon = typeBadgeConfig.icon;

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking a direct action button, let it handle its own event
    if ((e.target as HTMLElement).closest("button, a")) return;
    if (onSelect) onSelect(item);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateDetails) {
      onNavigateDetails(item);
    } else if (onSelect) {
      onSelect(item);
    }
  };

  const waPhone = (item.whatsapp_number || item.phone || "").replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(
    isProduct
      ? `مرحباً، أود الاستفسار والطلب لمنتج "${item.title}" المعروض في دليل أي خدمة بسعر ${effectivePrice} ${item.currency || "ج.م"}.`
      : `مرحباً ${item.title}، تواصلت معكم من خلال دليل أي خدمة.`
  );
  const whatsappUrl = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : null;

  if (layout === "list") {
    return (
      <div
        id={`search-card-${item.id}`}
        onClick={handleCardClick}
        className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-stretch ${
          isSelected
            ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-md bg-indigo-50/10"
            : "border-slate-200/90 hover:border-indigo-200 hover:shadow-md"
        }`}
      >
        {/* Thumbnail */}
        <div className="relative w-full sm:w-44 h-36 sm:h-auto shrink-0 rounded-xl overflow-hidden bg-slate-100">
          <img
            src={item.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {/* Type Badge Floating on Image */}
          <div className="absolute top-2 right-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md shadow-xs ${typeBadgeConfig.colorClass}`}
            >
              <TypeIcon className="w-3 h-3" />
              {typeBadgeConfig.label}
            </span>
          </div>

          {/* Discount Pill if product on sale */}
          {hasDiscount && (
            <div className="absolute bottom-2 right-2 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
              خصم
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between space-y-2.5 min-w-0">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="text-xs text-slate-500 font-medium">{item.category_name_ar}</span>
                  {item.distance_km !== undefined && item.distance_km !== null && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      <Navigation className="w-2.5 h-2.5" />
                      يبعد {item.distance_km.toFixed(1)} كم
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>

              {/* Price if product */}
              {isProduct && effectivePrice !== undefined && effectivePrice !== null && (
                <div className="text-left shrink-0">
                  <div className="text-base font-black text-emerald-700">
                    {effectivePrice} <span className="text-xs font-bold">{item.currency || "ج.م"}</span>
                  </div>
                  {hasDiscount && item.price && (
                    <div className="text-xs text-slate-400 line-through font-medium">
                      {item.price} {item.currency || "ج.م"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Parent Shop if Product */}
            {isProduct && item.parent_activity_name_ar && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>متوفر لدى:</span>
                <span className="font-bold text-slate-800">{item.parent_activity_name_ar}</span>
              </div>
            )}

            {/* Description */}
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Meta & Footer info */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 text-slate-500">
              {/* Location */}
              {(item.neighborhood_name_ar || item.city_name_ar) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[140px]">
                    {item.neighborhood_name_ar || item.city_name_ar}
                  </span>
                </span>
              )}

              {/* Delivery */}
              {item.has_delivery && (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Bike className="w-3.5 h-3.5 shrink-0" />
                  <span>توصيل متاح</span>
                </span>
              )}

              {/* Ratings */}
              {!isProduct && item.rating_avg !== undefined && item.rating_avg > 0 && (
                <div className="inline-flex items-center gap-1">
                  <RatingStars rating={item.rating_avg} size="sm" />
                  <span className="text-[11px] font-bold text-slate-700">({item.reviews_count || 0})</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                  title="طلب عبر واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  title="اتصال هاتفي"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <Button size="sm" variant="primary" onClick={handleViewDetails}>
                <span>عرض التفاصيل</span>
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout Card (Default)
  return (
    <div
      id={`search-card-${item.id}`}
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col overflow-hidden ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg bg-indigo-50/10 scale-[1.01]"
          : "border-slate-200/90 hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      {/* Top Cover Media */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
        <img
          src={item.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 flex-wrap">
          {/* Type Badge */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg border backdrop-blur-md shadow-xs ${typeBadgeConfig.colorClass}`}
          >
            <TypeIcon className="w-3 h-3" />
            {typeBadgeConfig.label}
          </span>
        </div>

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {/* Distance Badge */}
          {item.distance_km !== undefined && item.distance_km !== null && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-slate-950/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 shadow-xs">
              <Navigation className="w-2.5 h-2.5 text-indigo-300" />
              {item.distance_km.toFixed(1)} كم
            </span>
          )}

          {/* Discount Pill */}
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
              خصم
            </span>
          )}
        </div>

        {/* Delivery Badge floating at bottom */}
        {item.has_delivery && (
          <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[10px] font-bold bg-white/90 backdrop-blur-md text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/70 shadow-xs">
            <Bike className="w-3 h-3 text-emerald-600" />
            <span>توصيل متوفر</span>
            {item.delivery_estimated_time && (
              <span className="text-slate-500 font-normal">({item.delivery_estimated_time})</span>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Status */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-indigo-600">{item.category_name_ar}</span>
            {!isProduct && item.rating_avg !== undefined && item.rating_avg > 0 && (
              <div className="flex items-center gap-1">
                <RatingStars rating={item.rating_avg} size="sm" />
                <span className="font-bold text-slate-700">({item.reviews_count || 0})</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
            {item.title}
          </h3>

          {/* If Product: Parent Shop Name */}
          {isProduct && item.parent_activity_name_ar && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>متوفر لدى:</span>
              <span className="font-bold text-slate-800 truncate">{item.parent_activity_name_ar}</span>
            </div>
          )}

          {/* Short Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Address */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {item.neighborhood_name_ar
                  ? `${item.city_name_ar || ""} - ${item.neighborhood_name_ar}`
                  : item.city_name_ar || item.address_ar || "موقع محدد"}
              </span>
            </div>

            {/* Price section for products */}
            {isProduct && effectivePrice !== undefined && effectivePrice !== null && (
              <div className="text-left shrink-0">
                <span className="text-sm font-black text-emerald-700">
                  {effectivePrice} <span className="text-[10px] font-bold">{item.currency || "ج.م"}</span>
                </span>
                {hasDiscount && item.price && (
                  <span className="mr-1.5 text-[10px] text-slate-400 line-through">
                    {item.price}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                  title="طلب واستفسار عبر واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  title="اتصال هاتفي"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>

            <Button
              size="sm"
              variant={isSelected ? "primary" : "outline"}
              className="flex-1 text-xs"
              onClick={handleViewDetails}
            >
              <span>عرض التفاصيل</span>
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
