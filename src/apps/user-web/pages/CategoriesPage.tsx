// ============================================================================
// Daleel Ay Khidma - Categories Directory Page
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { CategoryDTO } from "../../../packages/types";
import { Skeleton, Button } from "../../../packages/ui";
import {
  UtensilsCrossed,
  Stethoscope,
  CarFront,
  Laptop,
  Wrench,
  ShoppingBag,
  Building2,
  ArrowLeft,
  Search,
} from "lucide-react";

interface CategoriesPageProps {
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

export function CategoriesPage({ onNavigate }: CategoriesPageProps) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = categories.filter((c) =>
    c.name_ar.includes(searchTerm) || c.description_ar?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 text-right pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">التصنيفات والقطاعات التجارية</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            اختر القطاع الذي تبحث عنه للاطلاع على كافة الأنشطة والمحال المسجلة تحته
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في التصنيفات..."
            className="w-full bg-slate-50 text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat.icon] || Building2;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate("activities", { category_id: cat.id })}
                className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {cat.activities_count || 0} نشاط
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                    <IconComp className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name_ar}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description_ar || "تصفح أفضل الخدمات والمحلات في هذا المجال"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                  <span>استعراض الأنشطة</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
