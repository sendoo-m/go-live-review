// ============================================================================
// Daleel Ay Khidma - Dedicated Interactive Map & Unified Search Page
// Features full-width map with unified results (Products, Shops, Services) below
// ============================================================================

import React, { useState } from "react";
import { useUnifiedSearch } from "../hooks/useUnifiedSearch";
import { InteractiveMap } from "../components/InteractiveMap";
import { UnifiedSearchResultCard } from "../components/UnifiedSearchResultCard";
import { UnifiedSearchItemDTO } from "../../../packages/types";
import { Button, Skeleton } from "../../../packages/ui";
import {
  Map as MapIcon,
  Search,
  Crosshair,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Navigation,
  Compass,
  MapPin,
  CheckCircle2,
  Store,
  Wrench,
  Package,
  Bike,
  LayoutGrid,
  List,
  Layers,
  ArrowUpDown,
} from "lucide-react";

interface InteractiveMapPageProps {
  initialLocationId?: number | string;
  initialCategoryId?: number | string;
  initialSearch?: string;
  onNavigate: (route: string, params?: any) => void;
}

export function InteractiveMapPage({
  initialLocationId,
  initialCategoryId,
  initialSearch,
  onNavigate,
}: InteractiveMapPageProps) {
  const [resultsLayout, setResultsLayout] = useState<"grid" | "list">("grid");

  const {
    q,
    setQ,
    itemType,
    setItemType,
    categoryId,
    setCategoryId,
    locationId,
    setLocationId,
    hasDelivery,
    setHasDelivery,
    sortBy,
    setSortBy,
    userCoords,
    setUserCoords,
    radiusKm,
    setRadiusKm,
    selectedItemId,
    setSelectedItemId,
    items,
    totalCount,
    shopsCount,
    servicesCount,
    productsCount,
    categories,
    locations,
    loading,
    hasActiveFilters,
    resetFilters,
  } = useUnifiedSearch({
    initialSearch,
    initialLocationId,
    initialCategoryId,
    pageSize: 60,
  });

  // Handle selecting an item from the map or list
  const handleSelectItem = (item: UnifiedSearchItemDTO) => {
    setSelectedItemId(item.id);
  };

  const handleNavigateDetail = (id: number, item?: UnifiedSearchItemDTO) => {
    if (item && item.item_type === "product" && item.parent_activity_id) {
      onNavigate("activity-detail", { id: item.parent_activity_id, productId: item.numeric_id });
    } else {
      onNavigate("activity-detail", { id });
    }
  };

  return (
    <div className="space-y-6 text-right pb-20">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
            <MapIcon className="w-3.5 h-3.5" />
            استكشاف جغرافي وبحث موحد
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            الخريطة التفاعلية الشاملة (محلات • خدمات • منتجات)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            استعرض كافة الأنشطة والمحلات والخدمات والمنتجات المعروضة على الخريطة مباشرة مع نتائج تفصيلية متزامنة أسفلها
          </p>
        </div>

        {/* Counts summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-amber-50 border border-amber-200/80 px-3 py-2 rounded-2xl text-center">
            <div className="text-[11px] text-amber-700 font-medium">المحلات</div>
            <div className="text-base font-black text-amber-900">{shopsCount}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-2xl text-center">
            <div className="text-[11px] text-emerald-700 font-medium">الخدمات</div>
            <div className="text-base font-black text-emerald-900">{servicesCount}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200/80 px-3 py-2 rounded-2xl text-center">
            <div className="text-[11px] text-indigo-700 font-medium">المنتجات</div>
            <div className="text-base font-black text-indigo-900">{productsCount}</div>
          </div>
        </div>
      </div>

      {/* Unified Search & Multi-Level Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Row 1: Keyword Input + Reset */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن اسم منتج، محل تجاري، فني، أو خدمة..."
              className="w-full bg-slate-50 text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setItemType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                itemType === "all"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الكل ({totalCount})
            </button>
            <button
              onClick={() => setItemType("shop")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                itemType === "shop"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-amber-700"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>المحلات ({shopsCount})</span>
            </button>
            <button
              onClick={() => setItemType("service")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                itemType === "service"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>الخدمات ({servicesCount})</span>
            </button>
            <button
              onClick={() => setItemType("product")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                itemType === "product"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-indigo-700"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>المنتجات ({productsCount})</span>
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold shrink-0 cursor-pointer px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>

        {/* Row 2: Dropdowns & Toggles */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Location Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium shrink-0">المحافظة:</span>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">كافة المحافظات والمدن</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium shrink-0">التصنيف:</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">كافة التصنيفات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* Has Delivery Toggle */}
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasDelivery}
              onChange={(e) => setHasDelivery(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
            <span>توصيل متاح فقط</span>
          </label>
        </div>
      </div>

      {/* 1) Full-Width Interactive Leaflet Map (Primary Visual Hero) */}
      <div className="space-y-3">
        {loading && items.length === 0 ? (
          <Skeleton className="h-[580px] rounded-3xl" />
        ) : (
          <InteractiveMap
            items={items}
            locations={locations}
            categories={categories}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
            onNavigateDetail={handleNavigateDetail}
            userCoords={userCoords}
            onUserCoordsChange={(coords) => setUserCoords(coords)}
            searchRadiusKm={radiusKm}
            onRadiusChange={(r) => setRadiusKm(r)}
            heightClass="h-[540px] sm:h-[580px] lg:h-[640px]"
            activeTypeFilter={itemType}
            onTypeFilterChange={(t) => setItemType(t)}
          />
        )}
      </div>

      {/* 2) Results Section Positioned Directly BELOW the Map */}
      <section className="space-y-4 pt-2">
        {/* Section Header with Sort & Layout Switcher */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              نتائج البحث الموحدة ({items.length} عنصر)
            </h2>
            <p className="text-xs text-slate-500">
              انقر على أي بطاقة لتكبير موقعها التفاعلي على الخريطة وفتح تفاصيلها
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">ترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="recommended">المقترح والأكثر تطابقاً</option>
                {userCoords && <option value="distance">الأقرب لموقعي (GPS)</option>}
                <option value="rating_desc">الأعلى تقييماً</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="created_at">الأحدث إضافة</option>
              </select>
            </div>

            {/* Grid / List Toggles */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setResultsLayout("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  resultsLayout === "grid" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
                title="عرض شبكي (Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setResultsLayout("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  resultsLayout === "list" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
                title="عرض قائمة (List)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Result Cards Grid / List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Skeleton key={idx} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">لم يتم العثور على نتائج تطابق هذا البحث</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              جرب البحث بكلمات أخرى أو اختر "الكل" من تصنيف المحلات والخدمات والمنتجات، أو وسّع دائرة البحث الجغرافي.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
              إعادة تعيين كافة الفلاتر
            </Button>
          </div>
        ) : (
          <div
            className={
              resultsLayout === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {items.map((item) => (
              <UnifiedSearchResultCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={handleSelectItem}
                onNavigateDetails={(i) => handleNavigateDetail(i.parent_activity_id || i.numeric_id, i)}
                layout={resultsLayout}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
