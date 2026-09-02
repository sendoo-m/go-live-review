// ============================================================================
// Daleel Ay Khidma - Activity Card Component
// (Hierarchical Geography, Delivery Status & Section Badge)
// ============================================================================

import React, { useState } from "react";
import { ActivityDTO } from "../../../packages/types";
import { RatingStars, Badge, SocialShareModal } from "../../../packages/ui";
import { MapPin, Phone, Eye, CheckCircle2, Star, Sparkles, Bike, Store, Clock, Layers, Share2 } from "lucide-react";

export interface ActivityCardProps {
  activity: ActivityDTO;
  onClick: () => void;
  layout?: "grid" | "list";
  [key: string]: any;
}

export function ActivityCard({ activity, onClick, layout = "grid" }: ActivityCardProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const isList = layout === "list";

  const locationDisplay =
    activity.neighborhood?.name_ar && activity.city?.name_ar
      ? `${activity.neighborhood.name_ar} • ${activity.city.name_ar}`
      : activity.city?.name_ar && activity.governorate?.name_ar
      ? `${activity.city.name_ar} • ${activity.governorate.name_ar}`
      : activity.address_ar || activity.location?.name_ar;

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex ${
        isList ? "flex-col sm:flex-row items-stretch" : "flex-col"
      } text-right`}
    >
      {/* Cover Image Container */}
      <div className={`relative overflow-hidden ${isList ? "sm:w-64 sm:shrink-0 h-48 sm:h-auto" : "h-48"} bg-slate-100`}>
        <img
          src={activity.cover_image}
          alt={activity.name_ar}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {activity.is_featured && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3" />
              مميز
            </span>
          )}
          {activity.status === "verified" ? (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              موثق رسمياً
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              قيد المراجعة
            </span>
          )}
        </div>

        {/* Top Left: Delivery Badge */}
        <div className="absolute top-3 left-3">
          {activity.has_delivery ? (
            <span className="inline-flex items-center gap-1 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              <Bike className="w-3 h-3" />
              <span>توصيل متاح</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-slate-900/70 backdrop-blur-xs text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
              <Store className="w-2.5 h-2.5" />
              <span>استلام بالفرع</span>
            </span>
          )}
        </div>

        {/* Bottom Section & Category Tag over image */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 flex-wrap">
          {activity.section && (
            <span className="text-[10px] font-bold text-indigo-100 bg-indigo-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-indigo-700/50">
              {activity.section.name_ar}
            </span>
          )}
          <span className="text-[10px] font-bold text-white bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {activity.category?.name_ar || "تصنيف عام"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {activity.name_ar}
          </h3>

          {/* Hierarchical Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate font-semibold text-slate-700">{locationDisplay}</span>
          </div>

          {/* Delivery Details hint if available */}
          {activity.has_delivery && (activity.delivery_estimated_time || activity.delivery_fee_from) && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50/70 px-2 py-1 rounded-lg w-fit">
              <Bike className="w-3 h-3 text-emerald-600" />
              {activity.delivery_estimated_time && (
                <span>المدة: {activity.delivery_estimated_time}</span>
              )}
              {activity.delivery_fee_from !== undefined && activity.delivery_fee_to !== undefined && (
                <span className="font-bold border-r border-emerald-200 pr-1.5 mr-1.5">
                  التوصيل: {activity.delivery_fee_from}-{activity.delivery_fee_to} ج.م
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-0.5">{activity.description_ar}</p>
        </div>

        {/* Card Footer: Rating & Views */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <RatingStars rating={activity.rating_avg} reviewsCount={activity.reviews_count} />

          <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShareOpen(true);
              }}
              className="p-1 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"
              title="مشاركة"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {activity.views_count.toLocaleString()}
            </span>
            {activity.phone && (
              <span className="hidden sm:flex items-center gap-1 text-indigo-600 font-semibold">
                <Phone className="w-3 h-3" />
                اتصال
              </span>
            )}
          </div>
        </div>
      </div>

      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        item={{
          id: activity.id,
          title: activity.name_ar,
          description: activity.description_ar,
          type: "activity",
          category: activity.category?.name_ar,
          imageUrl: activity.cover_image,
          address: locationDisplay,
          phone: activity.phone,
          whatsapp: activity.whatsapp_number,
        }}
      />
    </div>
  );
}

