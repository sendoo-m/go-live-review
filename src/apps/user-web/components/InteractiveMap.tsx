// ============================================================================
// Daleel Ay Khidma - React-Leaflet Interactive Unified Services & Map
// ============================================================================

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { ActivityDTO, LocationDTO, CategoryDTO, UnifiedSearchItemDTO } from "../../../packages/types";
import {
  MapPin,
  Navigation,
  Crosshair,
  Star,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  Compass,
  Building2,
  Store,
  Wrench,
  Package,
  MessageCircle,
  Bike,
  ExternalLink,
} from "lucide-react";
import { Button, RatingStars, Badge } from "../../../packages/ui";

// Color mapping per category and item type
const CATEGORY_COLORS: Record<number, string> = {
  1: "#f97316", // Restaurants / Food - Orange
  2: "#ef4444", // Medical - Red
  3: "#0284c7", // Automotive - Sky
  4: "#8b5cf6", // Tech & Electronics - Violet
  5: "#10b981", // Home Services / Crafts - Emerald
  6: "#ec4899", // Retail / Shopping - Pink
};

const ITEM_TYPE_DEFAULT_COLORS: Record<string, string> = {
  shop: "#f59e0b",    // Amber
  service: "#10b981", // Emerald
  product: "#6366f1", // Indigo
};

// Create custom SVG Leaflet divIcon with item type & category branding
function createUnifiedPin(item: UnifiedSearchItemDTO, isSelected: boolean = false) {
  const color = CATEGORY_COLORS[item.category_id] || ITEM_TYPE_DEFAULT_COLORS[item.item_type] || "#4f46e5";
  const size = isSelected ? 48 : 38;
  const strokeWidth = isSelected ? 3.5 : 2;

  // Icon symbol inside pin
  let iconSvg = "";
  if (item.item_type === "shop") {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>`;
  } else if (item.item_type === "service") {
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
  } else {
    // Product
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
  }

  const starBadge = item.is_featured
    ? `<span style="position: absolute; top: -6px; right: -6px; background: #f59e0b; color: white; border-radius: 9999px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">★</span>`
    : "";

  const selectedGlow = isSelected ? `filter: drop-shadow(0 0 8px ${color});` : "";

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; transform: translate(-50%, -50%); cursor: pointer; transition: transform 0.2s; ${selectedGlow}">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${strokeWidth}px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${iconSvg}
        </div>
      </div>
      ${starBadge}
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-unified-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// User GPS Location Pin Icon
const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 26px; height: 26px; transform: translate(-50%, -50%);">
      <div style="
        position: absolute;
        width: 26px;
        height: 26px;
        background: rgba(59, 130, 246, 0.4);
        border-radius: 50%;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: #2563eb;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.5);
      "></div>
    </div>
  `,
  className: "user-gps-pin",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// Map Controller for Center / Zoom changes
function MapViewController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export interface InteractiveMapProps {
  items?: UnifiedSearchItemDTO[];
  activities?: ActivityDTO[]; // For backward compatibility
  locations?: LocationDTO[];
  categories?: CategoryDTO[];
  selectedItemId?: string | number | null;
  selectedActivityId?: number | null; // For backward compatibility
  onSelectItem?: (item: UnifiedSearchItemDTO) => void;
  onSelectActivity?: (activity: ActivityDTO) => void;
  onNavigateDetail?: (id: number, item?: UnifiedSearchItemDTO) => void;
  userCoords?: { lat: number; lng: number } | null;
  onUserCoordsChange?: (coords: { lat: number; lng: number } | null) => void;
  searchRadiusKm?: number;
  onRadiusChange?: (radius: number) => void;
  heightClass?: string;
  activeTypeFilter?: string;
  onTypeFilterChange?: (type: string) => void;
}

export function InteractiveMap({
  items,
  activities = [],
  locations = [],
  categories = [],
  selectedItemId,
  selectedActivityId,
  onSelectItem,
  onSelectActivity,
  onNavigateDetail,
  userCoords,
  onUserCoordsChange,
  searchRadiusKm = 25,
  onRadiusChange,
  heightClass = "h-[560px] md:h-[620px]",
  activeTypeFilter = "all",
  onTypeFilterChange,
}: InteractiveMapProps) {
  // Normalize items list from either items or activities prop
  const unifiedItemsList: UnifiedSearchItemDTO[] = React.useMemo(() => {
    if (items && items.length > 0) return items;
    if (activities && activities.length > 0) {
      return activities.map((act) => {
        const isService =
          act.section_slug === "crafts" ||
          act.section_slug === "services" ||
          act.section_slug === "teachers" ||
          (act.category_id >= 7 && act.category_id <= 21);
        const item_type = isService ? ("service" as const) : ("shop" as const);
        return {
          id: `${item_type}-${act.id}`,
          numeric_id: act.id,
          item_type,
          title: act.name_ar,
          title_en: act.name_en,
          slug: act.slug,
          description: act.description_ar,
          category_id: act.category_id,
          category_name_ar: act.category?.name_ar || (isService ? "خدمات وصيانة" : "متاجر وتسوق"),
          category_icon: act.category?.icon,
          governorate_id: act.governorate_id,
          city_id: act.city_id,
          neighborhood_id: act.neighborhood_id,
          address_ar: act.address_ar,
          latitude: act.latitude,
          longitude: act.longitude,
          cover_image: act.cover_image,
          rating_avg: act.rating_avg,
          reviews_count: act.reviews_count,
          phone: act.phone,
          whatsapp_number: act.whatsapp_number,
          has_delivery: !!act.has_delivery,
          delivery_fee_from: act.delivery_fee_from,
          delivery_estimated_time: act.delivery_estimated_time,
          status: act.status,
          is_featured: act.is_featured,
          distance_km: act.distance_km,
          created_at: act.created_at,
        };
      });
    }
    return [];
  }, [items, activities]);

  // Default center: Cairo, Egypt
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.0444, 31.2357]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [locating, setLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<number | "all">("all");
  const [selectedItemState, setSelectedItemState] = useState<UnifiedSearchItemDTO | null>(null);

  // Markers reference for automatic popup opening
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // Filter items that have coordinates and pass category filter
  const filterableItems = unifiedItemsList.filter((item) => {
    if (activeCategoryFilter !== "all" && item.category_id !== activeCategoryFilter) {
      return false;
    }
    return item.latitude !== undefined && item.longitude !== undefined && item.latitude !== null && item.longitude !== null;
  });

  // When selectedItemId or selectedActivityId changes from outside
  useEffect(() => {
    const targetIdStr = selectedItemId ? String(selectedItemId) : selectedActivityId ? String(selectedActivityId) : null;
    if (targetIdStr) {
      const found = unifiedItemsList.find(
        (i) => i.id === targetIdStr || String(i.numeric_id) === targetIdStr
      );
      if (found && found.latitude && found.longitude) {
        setSelectedItemState(found);
        setMapCenter([found.latitude, found.longitude]);
        setMapZoom(15);
        // Open the corresponding marker popup after a short tick
        const marker = markerRefs.current[found.id];
        if (marker) {
          setTimeout(() => marker.openPopup(), 200);
        }
      }
    }
  }, [selectedItemId, selectedActivityId, unifiedItemsList]);

  // Fit bounds if results update and no manual selection
  useEffect(() => {
    if (filterableItems.length > 0 && !selectedItemId && !selectedActivityId) {
      const firstWithCoords = filterableItems[0];
      if (firstWithCoords.latitude && firstWithCoords.longitude) {
        setMapCenter([firstWithCoords.latitude, firstWithCoords.longitude]);
      }
    }
  }, [filterableItems.length]);

  // Handle Geolocation
  const handleLocateMe = () => {
    setLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (onUserCoordsChange) {
          onUserCoordsChange(coords);
        }
        setMapCenter([coords.lat, coords.lng]);
        setMapZoom(13);
        setLocating(false);
      },
      (error) => {
        console.warn("Geolocation warning:", error.message);
        // Fallback to Cairo Center Coordinates for sandbox simulation
        const fallbackCairo = { lat: 30.0444, lng: 31.2357 };
        if (onUserCoordsChange) {
          onUserCoordsChange(fallbackCairo);
        }
        setMapCenter([fallbackCairo.lat, fallbackCairo.lng]);
        setMapZoom(13);
        setGeoError("تم تحديد موقع تقديري (وسط القاهرة) للمحاكاة.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quick City Fly-to
  const handleCitySelect = (loc: LocationDTO) => {
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(12);
  };

  // Marker Click
  const handleMarkerClick = (item: UnifiedSearchItemDTO) => {
    setSelectedItemState(item);
    if (item.latitude && item.longitude) {
      setMapCenter([item.latitude, item.longitude]);
    }
    if (onSelectItem) {
      onSelectItem(item);
    }
    if (onSelectActivity) {
      // Find matching activity if applicable
      const act = activities.find((a) => a.id === item.numeric_id);
      if (act) onSelectActivity(act);
    }

    // Scroll to the card below the map smoothly
    const cardElement = document.getElementById(`search-card-${item.id}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden text-right flex flex-col transition-all">
      {/* Top Map Controls Bar */}
      <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 z-20">
        {/* Left Side: Geolocation CTA & Radius */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Crosshair className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
            <span>{locating ? "جارٍ تحديد موقعك..." : "تحديد موقعي الحالي (GPS)"}</span>
          </button>

          {/* Radius Selector */}
          {userCoords && onRadiusChange && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400 font-medium">نطاق البحث:</span>
              <select
                value={searchRadiusKm}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value={5} className="bg-slate-800 text-white">5 كم</option>
                <option value={15} className="bg-slate-800 text-white">15 كم</option>
                <option value={25} className="bg-slate-800 text-white">25 كم</option>
                <option value={50} className="bg-slate-800 text-white">50 كم</option>
                <option value={100} className="bg-slate-800 text-white">100 كم</option>
                <option value={9999} className="bg-slate-800 text-white">الكل</option>
              </select>
            </div>
          )}

          {userCoords && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              موقعك مفعل ({userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)})
            </span>
          )}
        </div>

        {/* Right Side: Quick City Jumper Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 hidden lg:inline font-medium">المدن:</span>
          {locations.slice(0, 6).map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleCitySelect(loc)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {loc.name_ar}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar z-10">
        <span className="text-xs font-bold text-slate-600 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          التصنيف:
        </span>
        <button
          onClick={() => setActiveCategoryFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shrink-0 cursor-pointer ${
            activeCategoryFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
          }`}
        >
          كافة النتائج ({unifiedItemsList.length})
        </button>
        {categories.map((cat) => {
          const count = unifiedItemsList.filter((a) => a.category_id === cat.id).length;
          const isActive = activeCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat.id] || "#6366f1" }}
              />
              <span>{cat.name_ar}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {geoError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 font-medium flex items-center justify-between">
          <span>{geoError}</span>
          <button
            onClick={() => setGeoError(null)}
            className="text-amber-600 hover:underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Full-Width Map Canvas (No Sidebar beside the map) */}
      <div className={`relative ${heightClass} w-full`}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewController center={mapCenter} zoom={mapZoom} />

          {/* User GPS Location Marker & Radius Circle */}
          {userCoords && (
            <>
              <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon}>
                <Popup>
                  <div className="p-3 text-right space-y-1">
                    <div className="font-bold text-xs text-blue-700">موقعك الحالي (GPS)</div>
                    <div className="text-[11px] text-slate-600">
                      يتم حساب المسافات لجميع المحلات والخدمات والمنتجات انطلاقاً من هذا الموقع.
                    </div>
                  </div>
                </Popup>
              </Marker>

              {searchRadiusKm && searchRadiusKm < 9999 && (
                <Circle
                  center={[userCoords.lat, userCoords.lng]}
                  radius={searchRadiusKm * 1000}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: "4, 6",
                  }}
                />
              )}
            </>
          )}

          {/* Unified Items Markers (Shops, Services, Products) */}
          {filterableItems.map((item) => {
            if (item.latitude === undefined || item.longitude === undefined || item.latitude === null || item.longitude === null) return null;
            const isSelected = selectedItemState?.id === item.id;
            const customIcon = createUnifiedPin(item, isSelected);

            const effectivePrice = item.sale_price !== null && item.sale_price !== undefined ? item.sale_price : item.price;
            const hasDiscount = item.sale_price !== null && item.sale_price !== undefined && item.price !== null && item.price !== undefined && item.sale_price < item.price;

            const waPhone = (item.whatsapp_number || item.phone || "").replace(/[^0-9]/g, "");
            const waText = encodeURIComponent(
              item.item_type === "product"
                ? `مرحباً، أود طلب منتج "${item.title}" المعروض في دليل أي خدمة.`
                : `مرحباً ${item.title}، تواصلت معكم عبر دليل أي خدمة.`
            );
            const whatsappUrl = waPhone ? `https://wa.me/${waPhone}?text=${waText}` : null;

            return (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(item),
                }}
                ref={(ref) => {
                  markerRefs.current[item.id] = ref;
                }}
              >
                <Popup>
                  <div className="w-72 text-right overflow-hidden font-sans">
                    {/* Popup Cover Image */}
                    <div className="relative h-28 bg-slate-900">
                      <img
                        src={item.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* Item Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black rounded-md shadow-xs ${
                            item.item_type === "shop"
                              ? "bg-amber-500 text-white"
                              : item.item_type === "service"
                              ? "bg-emerald-600 text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {item.item_type === "shop" ? "محل / متجر" : item.item_type === "service" ? "خدمة / فني" : "منتج تجاري"}
                        </span>
                      </div>

                      {/* Verified Badge */}
                      {item.status === "verified" && (
                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white flex items-center gap-1 shadow">
                            <CheckCircle2 className="w-3 h-3" />
                            موثق
                          </span>
                        </div>
                      )}

                      {/* Price if product */}
                      {item.item_type === "product" && effectivePrice !== undefined && effectivePrice !== null && (
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-emerald-400 text-xs font-black border border-white/20">
                          {effectivePrice} {item.currency || "ج.م"}
                        </div>
                      )}
                    </div>

                    {/* Popup Content */}
                    <div className="p-3 space-y-2 bg-white">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-indigo-600">{item.category_name_ar}</span>
                        {item.distance_km !== undefined && (
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                            يبعد {item.distance_km.toFixed(1)} كم
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      {/* If Product: Parent Shop */}
                      {item.item_type === "product" && item.parent_activity_name_ar && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Store className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>متوفر لدى:</span>
                          <span className="font-bold text-slate-800">{item.parent_activity_name_ar}</span>
                        </div>
                      )}

                      {/* Location & Delivery */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span className="truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {item.neighborhood_name_ar || item.city_name_ar || item.address_ar || "موقع محدد"}
                        </span>
                        {item.has_delivery && (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                            توصيل متاح
                          </span>
                        )}
                      </div>

                      {/* Ratings if available */}
                      {item.rating_avg !== undefined && item.rating_avg > 0 && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <RatingStars rating={item.rating_avg} size="sm" />
                          <span className="font-bold text-slate-700">({item.reviews_count || 0})</span>
                        </div>
                      )}

                      {/* Popup Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200"
                              title="واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1"
                              title="اتصال"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateDetail) {
                              onNavigateDetail(item.parent_activity_id || item.numeric_id, item);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer mr-auto"
                        >
                          <span>عرض التفاصيل</span>
                          <ArrowRight className="w-3 h-3 rotate-180" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-xl text-[11px] font-semibold text-slate-700 space-y-2 z-10 hidden sm:block">
          <div className="font-black text-slate-900 border-b border-slate-100 pb-1 text-xs flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            دليل المؤشرات على الخريطة:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="font-bold text-amber-900">محلات ومتاجر</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="font-bold text-emerald-900">خدمات وصيانة</span>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
              <span className="font-bold text-indigo-900">منتجات تجارية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
