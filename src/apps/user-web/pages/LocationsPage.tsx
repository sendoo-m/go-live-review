// ============================================================================
// Daleel Ay Khidma - Locations & Cities Directory Page
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { LocationDTO } from "../../../packages/types";
import { Skeleton } from "../../../packages/ui";
import { MapPin, Navigation, ArrowLeft, Search, Building } from "lucide-react";

interface LocationsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export function LocationsPage({ onNavigate }: LocationsPageProps) {
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getLocations();
        if (res.data) setLocations(res.data);
      } catch (err) {
        console.error("Failed to load locations:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = locations.filter(
    (l) => l.name_ar.includes(searchQuery) || l.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-right pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">المحافظات والمدن المشمولة بالتغطية</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            دليل موزّع جغرافياً مع مشرفين محليين للتحقق الميداني والتوثيق في كل محافظة
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المحافظة أو الرمز..."
            className="w-full bg-slate-50 text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Locations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((loc) => (
            <div
              key={loc.id}
              onClick={() => onNavigate("activities", { location_id: loc.id })}
              className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {loc.code}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {loc.name_ar}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {loc.name_en} • الإحداثيات: ({loc.latitude}, {loc.longitude})
                </p>
                <p className="text-xs text-slate-600 font-semibold pt-1">
                  {loc.activities_count || 0} نشاط تجاري معتمد
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                <span>تصفح أنشطة المحافظة</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
