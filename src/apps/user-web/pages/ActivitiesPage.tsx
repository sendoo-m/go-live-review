// ============================================================================
// Daleel Ay Khidma - Unified Search & Activities Discovery Page
// Supports unified searching across: Products, Businesses (Shops), and Services
// Displays synchronized results on the map and below the map.
// ============================================================================

import React, { useState } from "react";
import { useUnifiedSearch } from "../hooks/useUnifiedSearch";
import { InteractiveMap } from "../components/InteractiveMap";
import { UnifiedSearchResultCard } from "../components/UnifiedSearchResultCard";
import { UnifiedSearchItemDTO } from "../../../packages/types";
import { Button, Pagination, Skeleton } from "../../../packages/ui";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Map as MapIcon,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  MapPin,
  Tag,
  Star,
  Crosshair,
  Store,
  Wrench,
  Package,
  Bike,
  Compass,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface ActivitiesPageProps {
  initialFilters?: {
    search?: string;
    category_id?: number | string;
    location_id?: number | string;
    item_type?: string;
    featured?: boolean;
    layout?: "grid" | "list" | "map";
  };
  onNavigate: (route: string, params?: any) => void;
}

export function ActivitiesPage({ initialFilters, onNavigate }: ActivitiesPageProps) {
  const [layout, setLayout] = useState<"grid" | "list" | "map">(initialFilters?.layout || "grid");

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
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    page,
    setPage,
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
    initialSearch: initialFilters?.search || "",
    initialItemType: initialFilters?.item_type || "all",
    initialCategoryId: initialFilters?.category_id || "all",
    initialLocationId: initialFilters?.location_id || "all",
    pageSize: layout === "map" ? 60 : 18,
  });

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
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 mb-1.5">
            <Search className="w-3.5 h-3.5" />
            البحث الموحد الشامل
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            دليل البحث الشامل (المنتجات • المحلات • الخدمات)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ابحث وقارن بين {totalCount} عنصر تجاري وخدمي موثق في جمهورية مصر العربية
          </p>
        </div>

        {/* Layout & Mode Switchers */}
        <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setLayout("grid")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                layout === "grid" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="عرض شبكي (Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout("list")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                layout === "list" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="عرض قائمة (List)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout("map")}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                layout === "map" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="عرض الخريطة التفاعلية والنتائج أدناها"
            >
              <MapIcon className="w-4 h-4" />
              <span>الخريطة التفاعلية</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate("add-activity")}
            className="mr-auto"
          >
            أضف نشاطك مجاناً
          </Button>
        </div>
      </div>

      {/* Unified Search Filter Header Strip */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Keyword Search + Item Type Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث عن اسم منتج (مثل: آيفون 15)، محل تجاري، أو خدمة فنية (مثل: صيانة تكييف)..."
              className="w-full bg-slate-50 text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Type Segment Control Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => {
                setItemType("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                itemType === "all"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الكل ({totalCount})
            </button>
            <button
              onClick={() => {
                setItemType("shop");
                setPage(1);
              }}
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
              onClick={() => {
                setItemType("service");
                setPage(1);
              }}
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
              onClick={() => {
                setItemType("product");
                setPage(1);
              }}
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

        {/* Quick Meta Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Location Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium shrink-0">المحافظة:</span>
              <select
                value={locationId}
                onChange={(e) => {
                  setLocationId(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 text-xs px-3 py-1.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">كافة المحافظات</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium shrink-0">التصنيف:</span>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 text-xs px-3 py-1.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">كافة التصنيفات</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery filter */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasDelivery}
                onChange={(e) => {
                  setHasDelivery(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              <span>توصيل متاح</span>
            </label>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 text-xs px-3 py-1.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="recommended">الأكثر تطابقاً</option>
              {userCoords && <option value="distance">الأقرب جغرافياً (GPS)</option>}
              <option value="rating_desc">الأعلى تقييماً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="created_at">الأحدث إضافة</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODE 1: Interactive Map Mode (Map on top, Results below)        */}
      {/* ================================================================ */}
      {layout === "map" ? (
        <div className="space-y-6">
          {/* Top Full-Width Map Canvas */}
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
              heightClass="h-[540px] sm:h-[600px] lg:h-[640px]"
              activeTypeFilter={itemType}
              onTypeFilterChange={(t) => setItemType(t)}
            />
          )}

          {/* Unified Search Results Placed Below the Map */}
          <section className="space-y-4 pt-2">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  قائمة النتائج المعروضة على الخريطة ({items.length} عنصر)
                </h2>
                <p className="text-xs text-slate-500">
                  اضغط على أي عنصر للتحليق مباشرة نحو موقعه على الخريطة وفتح بطاقته التفاعلية
                </p>
              </div>

              <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                مزامنة الخريطة والنتائج مفعلة
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">لا توجد نتائج تطابق هذا البحث على الخريطة</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  جرب توسيع نطاق البحث الجغرافي أو اختيار نوع عنصر آخر.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <UnifiedSearchResultCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItemId === item.id}
                    onSelect={handleSelectItem}
                    onNavigateDetails={(i) => handleNavigateDetail(i.parent_activity_id || i.numeric_id, i)}
                    layout="grid"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* ================================================================ */
        /* MODE 2: Standard Grid / List Search Page Layout                   */
        /* ================================================================ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar Filter Panel (4 cols) */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>فلاتر البحث الدقيق</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  مسح الفلاتر
                </button>
              )}
            </div>

            {/* GPS Location Trigger */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">الموقع وحساب المسافة</label>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        setSortBy("distance");
                      },
                      () => {
                        setUserCoords({ lat: 30.0444, lng: 31.2357 });
                        setSortBy("distance");
                      }
                    );
                  }
                }}
                className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  userCoords
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>{userCoords ? "موقعك مفعل (ترتيب حسب الأقرب)" : "تحديد موقعي GPS للأقرب"}</span>
              </button>
            </div>

            {/* Price Range (especially for products) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">نطاق السعر (ج.م)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="من"
                  value={minPrice || ""}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="إلى"
                  value={maxPrice || ""}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Quick Summary Counts Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-800">إحصائيات النتائج المتاحة:</div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  المحلات والمتاجر:
                </span>
                <span className="font-black text-slate-900">{shopsCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  الخدمات والفنيين:
                </span>
                <span className="font-black text-slate-900">{servicesCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  المنتجات التجارية:
                </span>
                <span className="font-black text-slate-900">{productsCount}</span>
              </div>
            </div>
          </aside>

          {/* Results Main Section (8 cols) */}
          <main className="lg:col-span-8 space-y-5">
            {/* Header info bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-slate-600 font-medium">
                عرض <strong className="text-slate-900 font-black">{items.length}</strong> من إجمالي{" "}
                <strong className="text-indigo-600 font-black">{totalCount}</strong> نتيجة
              </span>

              <button
                onClick={() => setLayout("map")}
                className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>عرض النتائج على الخريطة التفاعلية</span>
              </button>
            </div>

            {/* Results Grid / List */}
            {loading ? (
              <div
                className={
                  layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
                    : "flex flex-col gap-4"
                }
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">لم يتم العثور على أي نتائج</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  تأكد من كتابة الكلمات بشكل صحيح أو قم بإعادة ضبط الفلاتر لاستعراض كافة الأنشطة والمنتجات.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
                  إعادة ضبط الفلاتر
                </Button>
              </div>
            ) : (
              <div
                className={
                  layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
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
                    layout={layout}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
