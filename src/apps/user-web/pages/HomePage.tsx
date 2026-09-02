// ============================================================================
// Daleel Ay Khidma - User Web App Home Page
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { ActivityDTO, CategoryDTO, LocationDTO, OfferDTO } from "../../../packages/types";
import { useSettings } from "../../../packages/settings";
import { useI18n } from "../../../packages/i18n";
import { ActivityCard } from "../components/ActivityCard";
import { Button, Skeleton } from "../../../packages/ui";
import {
  Search,
  MapPin,
  Map as MapIcon,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  ChevronLeft,
  UtensilsCrossed,
  Stethoscope,
  CarFront,
  Laptop,
  Wrench,
  ShoppingBag,
  ArrowLeft,
  Crosshair,
  Flame,
  Percent,
} from "lucide-react";

interface HomePageProps {
  onNavigate: (route: string, params?: any) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  UtensilsCrossed,
  Stethoscope,
  CarFront,
  Laptop,
  Wrench,
  ShoppingBag,
};

export function HomePage({ onNavigate }: HomePageProps) {
  const { lang } = useI18n();
  const { settings, siteName, tagline, description } = useSettings();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [featuredActivities, setFeaturedActivities] = useState<ActivityDTO[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<OfferDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [catsRes, locsRes, actsRes, offersRes] = await Promise.all([
          api.getCategories(),
          api.getLocations(),
          api.getActivities({ per_page: 6, featured: true }),
          api.getOffers().catch(() => ({ success: true, data: [] })),
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (locsRes.data) setLocations(locsRes.data);
        if (actsRes.results) setFeaturedActivities(actsRes.results);
        if (offersRes.data) setFeaturedOffers(offersRes.data.filter((o: OfferDTO) => o.is_active));
      } catch (err) {
        console.error("Failed to load home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate("activities", {
      search: searchQuery,
      location_id: selectedLocation !== "all" ? selectedLocation : undefined,
      category_id: selectedCategory !== "all" ? selectedCategory : undefined,
    });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section with Rich Arabic Directory Search */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 md:p-14 shadow-xl text-right">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {tagline || (lang === "ar" ? "الدليل التجاري والخدمي الأول في مصر" : "The Leading Business Directory")}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
            ابحث في <span className="text-indigo-400">{siteName}</span> عن المنتجات، المحلات، والخدمات الموثقة
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-indigo-200/90 leading-relaxed max-w-2xl">
            {description || "محرك بحث موحد يربطك بالمنتجات التجارية، المتاجر والمحلات، والخدمات الفنية المعتمدة مع نتائج تفاعلية على الخريطة مباشرة."}
          </p>

          {/* Search Box Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 bg-white rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col md:flex-row items-stretch gap-2.5 text-slate-800"
          >
            {/* Search Input */}
            <div className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج، متجر تجاري، فني صيانة، أو خدمة..."
                className="w-full text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-transparent focus:border-indigo-300 focus:bg-slate-50 outline-none transition-all"
              />
            </div>

            {/* Location Selector */}
            <div className="w-full md:w-44 relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-slate-50 text-slate-700 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">كافة المحافظات</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="w-full md:w-48 relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 text-slate-700 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">كافة التصنيفات</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button variant="primary" size="md" type="submit" className="md:px-6 shrink-0">
              بحث الآن
            </Button>
          </form>

          {/* Quick pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 text-xs text-indigo-200">
            <span className="font-semibold">الأكثر بحثاً:</span>
            {["مطاعم القاهرة", "صيانة سيارات أسيوط", "عيادات تخصصية", "حلول برمجية"].map((term) => (
              <button
                key={term}
                onClick={() => onNavigate("activities", { search: term })}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-medium transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 1.5. Interactive Map Quick Discovery Banner */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5 text-right">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
            <MapIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-1">
              <Crosshair className="w-3 h-3" />
              محدد المواقع الجغرافي الحي (GPS)
            </div>
            <h3 className="text-base font-black text-slate-900">
              تصفح الخدمات القريبة منك على الخريطة التفاعلية
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              استكشف المطاعم، العيادات، وورش الصيانة في نطاقك الجغرافي المباشر مع حساب دقيق للمسافات.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onNavigate("map")}
          leftIcon={<MapIcon className="w-4 h-4" />}
          className="shrink-0 w-full md:w-auto"
        >
          فتح الخريطة التفاعلية
        </Button>
      </section>

      {/* 2. Categories Grid */}
      <section className="space-y-4 text-right">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("categories")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            عرض كافة التصنيفات
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">تصفح حسب التصنيف الخدمي</h2>
            <p className="text-xs text-slate-500">اختر نوع الخدمة أو المجال التجاري المطلوب</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.icon] || Building2;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate("activities", { category_id: cat.id })}
                  className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-right flex flex-col justify-between space-y-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name_ar}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {cat.activities_count || 0} نشاط تجاري
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 2.5 Special Deals & Offers Section */}
      {featuredOffers.length > 0 && (
        <section className="bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-amber-500/10 border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-6 text-right">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("offers")}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-100/50 font-bold"
            >
              عرض كافة العروض ({featuredOffers.length})
            </Button>
            <div>
              <div className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-xs mb-1">
                <Flame className="w-4 h-4 fill-rose-600" />
                تخفيضات وصفقات حصرية
              </div>
              <h2 className="text-xl font-black text-slate-900">عروض وخصومات المحلات اليوم</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredOffers.slice(0, 3).map((offer) => (
              <div
                key={offer.id}
                onClick={() => onNavigate("offers")}
                className="bg-white p-4 rounded-2xl border border-rose-100 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 font-black text-[11px] border border-rose-100 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {offer.discount_type === "percentage"
                        ? `خصم ${offer.discount_value}%`
                        : `خصم ${offer.discount_value} ج.م`}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {offer.activity?.name_ar}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{offer.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{offer.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  {offer.code ? (
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      كود: {offer.code}
                    </span>
                  ) : (
                    <span className="text-slate-400">عرض مباشر بدون كود</span>
                  )}
                  <span className="text-rose-600 font-bold flex items-center gap-0.5">
                    استفد من العرض
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Featured Activities */}
      <section className="space-y-4 text-right">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("activities", { featured: true })}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            عرض الكل ({featuredActivities.length})
          </Button>
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              الأنشطة المميزة المعتمدة
            </div>
            <h2 className="text-xl font-bold text-slate-900">أنشطة حازت على أعلى التقييمات</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredActivities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                onClick={() => onNavigate("activity-detail", { id: act.id })}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Cities / Governorates Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6 text-right">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("locations")}
            className="text-white border-slate-700 hover:bg-slate-800"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            استعراض كافة المحافظات
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">تغطية جغرافية شاملة لمحافظات مصر</h2>
            <p className="text-xs text-slate-400 mt-1">
              تصفح الأنشطة التجارية حسب النطاق الجغرافي والإشراف الميداني
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onNavigate("activities", { location_id: loc.id })}
              className="bg-slate-800/80 hover:bg-indigo-600/90 border border-slate-700/80 p-4 rounded-2xl transition-all text-right space-y-2 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-200">
                  {loc.code}
                </span>
                <MapPin className="w-4 h-4 text-indigo-400 group-hover:text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">{loc.name_ar}</h3>
              <p className="text-[11px] text-slate-400 group-hover:text-indigo-100">
                {loc.activities_count || 0} نشاط مسجل
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Business Owner CTA */}
      <section className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-right">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            انضم لشبكة الأعمال الموثوقة
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            هل تمتلك نشاطاً تجارياً أو تقدم خدمات مهنية؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === "ar"
              ? `سجّل نشاطك التجاري اليوم في «${siteName}» لتصل إلى آلاف العملاء الجدد في منطقتك ومحافظتك مع توثيق رسمي مجاني.`
              : `List your business today on "${siteName}" to reach thousands of new customers in your area with verified badges.`}
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => onNavigate("add-activity")}
          className="shrink-0"
        >
          أضف نشاطك التجاري الآن
        </Button>
      </section>
    </div>
  );
}
