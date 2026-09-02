// ============================================================================
// Daleel Ay Khidma - Admin Locations & Geographic Zones Management
// (Hierarchy: Governorates > Cities > Neighborhoods)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { LocationDTO, CityDTO, NeighborhoodDTO, GeoHierarchyDTO } from "../../../packages/types";
import { Button, Input, Modal, Skeleton } from "../../../packages/ui";
import {
  MapPin,
  PlusCircle,
  Edit,
  Trash2,
  Globe,
  Shield,
  Building2,
  Home,
  Layers,
  ChevronRight,
  ChevronDown,
  Navigation,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { ExcelImportExportModal } from "../components/ExcelImportExportModal";

export function AdminLocationsPage() {
  const [activeTab, setActiveTab] = useState<"governorates" | "cities" | "neighborhoods" | "tree">("governorates");
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [locations, setLocations] = useState<LocationDTO[]>([]);

  const [cities, setCities] = useState<CityDTO[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodDTO[]>([]);
  const [hierarchyTree, setHierarchyTree] = useState<GeoHierarchyDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected filters in tabs
  const [filterGovId, setFilterGovId] = useState<string>("all");
  const [filterCityId, setFilterCityId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Governorate Modal
  const [govModalOpen, setGovModalOpen] = useState(false);
  const [editingGovId, setEditingGovId] = useState<number | null>(null);
  const [govNameAr, setGovNameAr] = useState("");
  const [govNameEn, setGovNameEn] = useState("");
  const [govCode, setGovCode] = useState("");
  const [govLat, setGovLat] = useState(30.0444);
  const [govLng, setGovLng] = useState(31.2357);

  // City Modal
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [editingCityId, setEditingCityId] = useState<number | null>(null);
  const [cityNameAr, setCityNameAr] = useState("");
  const [cityNameEn, setCityNameEn] = useState("");
  const [cityCode, setCityCode] = useState("");
  const [cityGovId, setCityGovId] = useState<number>(1);
  const [cityLat, setCityLat] = useState(30.0444);
  const [cityLng, setCityLng] = useState(31.2357);

  // Neighborhood Modal
  const [neighModalOpen, setNeighModalOpen] = useState(false);
  const [editingNeighId, setEditingNeighId] = useState<number | null>(null);
  const [neighNameAr, setNeighNameAr] = useState("");
  const [neighNameEn, setNeighNameEn] = useState("");
  const [neighCityId, setNeighCityId] = useState<number>(1);
  const [neighPostal, setNeighPostal] = useState("");
  const [neighLat, setNeighLat] = useState(30.0444);
  const [neighLng, setNeighLng] = useState(31.2357);

  const [submitting, setSubmitting] = useState(false);

  // Tree expanded nodes
  const [expandedGovs, setExpandedGovs] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [expandedCities, setExpandedCities] = useState<Record<number, boolean>>({ 1: true, 2: true, 4: true });

  const loadData = async () => {
    setLoading(true);
    try {
      const [locsRes, citiesRes, neighRes, treeRes] = await Promise.all([
        api.getLocations(),
        api.getCities(),
        api.getNeighborhoods(),
        api.getGeoHierarchyTree().catch(() => ({ success: true, data: [] })),
      ]);

      if (locsRes.data) setLocations(locsRes.data);
      if (citiesRes.data) setCities(citiesRes.data);
      if (neighRes.data) setNeighborhoods(neighRes.data);
      if (treeRes.data) setHierarchyTree(treeRes.data);
    } catch (err) {
      console.error("Locations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Governorate Handlers
  const handleOpenGovModal = (gov?: LocationDTO) => {
    if (gov) {
      setEditingGovId(gov.id);
      setGovNameAr(gov.name_ar);
      setGovNameEn(gov.name_en);
      setGovCode(gov.code);
      setGovLat(gov.latitude);
      setGovLng(gov.longitude);
    } else {
      setEditingGovId(null);
      setGovNameAr("");
      setGovNameEn("");
      setGovCode("EGY-");
      setGovLat(30.0444);
      setGovLng(31.2357);
    }
    setGovModalOpen(true);
  };

  const handleSaveGov = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingGovId) {
        await api.updateLocation(editingGovId, {
          name_ar: govNameAr,
          name_en: govNameEn,
          code: govCode,
          latitude: Number(govLat),
          longitude: Number(govLng),
          is_active: true,
        });
      } else {
        await api.createLocation({
          name_ar: govNameAr,
          name_en: govNameEn,
          code: govCode,
          latitude: Number(govLat),
          longitude: Number(govLng),
          is_active: true,
        });
      }
      setGovModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "فشل حفظ المحافظة");
    } finally {
      setSubmitting(false);
    }
  };

  // City Handlers
  const handleOpenCityModal = (city?: CityDTO) => {
    if (city) {
      setEditingCityId(city.id);
      setCityNameAr(city.name_ar);
      setCityNameEn(city.name_en);
      setCityCode(city.code);
      setCityGovId(city.governorate_id);
      setCityLat(city.latitude || 30.0444);
      setCityLng(city.longitude || 31.2357);
    } else {
      setEditingCityId(null);
      setCityNameAr("");
      setCityNameEn("");
      setCityCode("CITY-");
      setCityGovId(locations[0]?.id || 1);
      setCityLat(30.0444);
      setCityLng(31.2357);
    }
    setCityModalOpen(true);
  };

  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCityId) {
        await api.updateCity(editingCityId, {
          name_ar: cityNameAr,
          name_en: cityNameEn,
          code: cityCode,
          governorate_id: cityGovId,
          latitude: Number(cityLat),
          longitude: Number(cityLng),
          is_active: true,
        });
      } else {
        await api.createCity({
          name_ar: cityNameAr,
          name_en: cityNameEn,
          code: cityCode,
          governorate_id: cityGovId,
          latitude: Number(cityLat),
          longitude: Number(cityLng),
          is_active: true,
        });
      }
      setCityModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "فشل حفظ المدينة");
    } finally {
      setSubmitting(false);
    }
  };

  // Neighborhood Handlers
  const handleOpenNeighModal = (neigh?: NeighborhoodDTO) => {
    if (neigh) {
      setEditingNeighId(neigh.id);
      setNeighNameAr(neigh.name_ar);
      setNeighNameEn(neigh.name_en);
      setNeighCityId(neigh.city_id);
      setNeighPostal(neigh.postal_code || "");
      setNeighLat(neigh.latitude || 30.0444);
      setNeighLng(neigh.longitude || 31.2357);
    } else {
      setEditingNeighId(null);
      setNeighNameAr("");
      setNeighNameEn("");
      setNeighCityId(cities[0]?.id || 1);
      setNeighPostal("");
      setNeighLat(30.0444);
      setNeighLng(31.2357);
    }
    setNeighModalOpen(true);
  };

  const handleSaveNeigh = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedCity = cities.find(c => c.id === neighCityId);
      const govId = selectedCity ? selectedCity.governorate_id : 1;

      if (editingNeighId) {
        await api.updateNeighborhood(editingNeighId, {
          name_ar: neighNameAr,
          name_en: neighNameEn,
          city_id: neighCityId,
          governorate_id: govId,
          postal_code: neighPostal,
          latitude: Number(neighLat),
          longitude: Number(neighLng),
          is_active: true,
        });
      } else {
        await api.createNeighborhood({
          name_ar: neighNameAr,
          name_en: neighNameEn,
          city_id: neighCityId,
          governorate_id: govId,
          postal_code: neighPostal,
          latitude: Number(neighLat),
          longitude: Number(neighLng),
          is_active: true,
        });
      }
      setNeighModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "فشل حفظ الحي السكني");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGovExpanded = (id: number) => {
    setExpandedGovs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCityExpanded = (id: number) => {
    setExpandedCities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered lists
  const filteredGovs = locations.filter(g =>
    g.name_ar.includes(searchQuery) || g.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || g.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = cities.filter(c => {
    if (filterGovId !== "all" && c.governorate_id !== Number(filterGovId)) return false;
    return c.name_ar.includes(searchQuery) || c.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredNeighs = neighborhoods.filter(n => {
    if (filterGovId !== "all" && n.governorate_id !== Number(filterGovId)) return false;
    if (filterCityId !== "all" && n.city_id !== Number(filterCityId)) return false;
    return n.name_ar.includes(searchQuery) || n.name_en.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 text-right pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">الهيكل الجغرافي والأحياء السكنية</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة تسلسل الهيكل الجغرافي: المحافظات ← المدن والمراكز ← الأحياء والمناطق السكنية
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="open-locations-excel-modal-btn"
            onClick={() => setExcelModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            استيراد / تصدير الهيكل الجغرافي (Excel)
          </button>

          {activeTab === "governorates" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenGovModal()}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              إضافة محافظة
            </Button>
          )}
          {activeTab === "cities" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCityModal()}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              إضافة مدينة / مركز
            </Button>
          )}
          {activeTab === "neighborhoods" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenNeighModal()}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              إضافة حي سكني
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-500">المحافظات المسجلة</span>
            <div className="text-2xl font-black text-slate-900">{locations.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-500">المدن والمراكز الإدارية</span>
            <div className="text-2xl font-black text-slate-900">{cities.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-500">الأحياء والمناطق السكنية</span>
            <div className="text-2xl font-black text-emerald-600">{neighborhoods.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Home className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("governorates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "governorates"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>المحافظات ({locations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("cities")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "cities"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>المدن والمراكز ({cities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("neighborhoods")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "neighborhoods"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>الأحياء والمناطق السكنية ({neighborhoods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tree")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "tree"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>شجرة الهيكل الجغرافي الكامل</span>
        </button>
      </div>

      {/* Filter Bar */}
      {activeTab !== "tree" && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الكود..."
            className="w-full sm:w-64 bg-slate-50 text-xs px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab === "neighborhoods" && (
              <select
                value={filterGovId}
                onChange={(e) => {
                  setFilterGovId(e.target.value);
                  setFilterCityId("all");
                }}
                className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">كافة المحافظات</option>
                {locations.map(g => (
                  <option key={g.id} value={g.id}>{g.name_ar}</option>
                ))}
              </select>
            )}

            {activeTab === "neighborhoods" && (
              <select
                value={filterCityId}
                onChange={(e) => setFilterCityId(e.target.value)}
                className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">كافة المدن</option>
                {cities
                  .filter(c => filterGovId === "all" || c.governorate_id === Number(filterGovId))
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
              </select>
            )}

            {activeTab === "cities" && (
              <select
                value={filterGovId}
                onChange={(e) => setFilterGovId(e.target.value)}
                className="bg-slate-50 text-xs px-3 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">كافة المحافظات</option>
                {locations.map(g => (
                  <option key={g.id} value={g.id}>{g.name_ar}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Governorates Table */}
      {activeTab === "governorates" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">رمز النطاق</th>
                    <th className="p-3.5">اسم المحافظة</th>
                    <th className="p-3.5">الاسم اللاتيني</th>
                    <th className="p-3.5">المدن التابعة</th>
                    <th className="p-3.5">الأحياء</th>
                    <th className="p-3.5">الأنشطة المسجلة</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredGovs.map((loc) => {
                    const childCities = cities.filter(c => c.governorate_id === loc.id);
                    const childNeighs = neighborhoods.filter(n => n.governorate_id === loc.id);
                    return (
                      <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-indigo-600">{loc.code}</td>
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{loc.name_ar}</span>
                        </td>
                        <td className="p-3.5 text-slate-500 font-medium">{loc.name_en}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800">{childCities.length}</span> مدينة
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-emerald-600">{childNeighs.length}</span> حي
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800">{loc.activities_count || 0}</span> نشاط
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              loc.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {loc.is_active ? "مفعل" : "معطل"}
                          </span>
                        </td>
                        <td className="p-3.5 text-left">
                          <button
                            onClick={() => handleOpenGovModal(loc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cities Table */}
      {activeTab === "cities" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">رمز المدينة</th>
                    <th className="p-3.5">اسم المدينة / المركز</th>
                    <th className="p-3.5">المحافظة التابعة</th>
                    <th className="p-3.5">الاسم اللاتيني</th>
                    <th className="p-3.5">عدد الأحياء</th>
                    <th className="p-3.5">الأنشطة</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCities.map((city) => {
                    const gov = locations.find(g => g.id === city.governorate_id);
                    const childNeighs = neighborhoods.filter(n => n.city_id === city.id);
                    return (
                      <tr key={city.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-sky-600">{city.code}</td>
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-sky-500" />
                          <span>{city.name_ar}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                            {gov?.name_ar || `محافظة #${city.governorate_id}`}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 font-medium">{city.name_en}</td>
                        <td className="p-3.5 font-bold text-emerald-600">{childNeighs.length} حي</td>
                        <td className="p-3.5 font-bold text-slate-800">{city.activities_count || 0}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              city.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {city.is_active ? "مفعل" : "معطل"}
                          </span>
                        </td>
                        <td className="p-3.5 text-left">
                          <button
                            onClick={() => handleOpenCityModal(city)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                            title="تعديل المدينة"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Neighborhoods Table */}
      {activeTab === "neighborhoods" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">اسم الحي / المنطقة</th>
                    <th className="p-3.5">المدينة</th>
                    <th className="p-3.5">المحافظة</th>
                    <th className="p-3.5">الرمز البريدي</th>
                    <th className="p-3.5">الاسم اللاتيني</th>
                    <th className="p-3.5">الأنشطة</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredNeighs.map((neigh) => {
                    const city = cities.find(c => c.id === neigh.city_id);
                    const gov = locations.find(g => g.id === neigh.governorate_id);
                    return (
                      <tr key={neigh.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{neigh.name_ar}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800">{city?.name_ar || `مدينة #${neigh.city_id}`}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {gov?.name_ar || `محافظة #${neigh.governorate_id}`}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">{neigh.postal_code || "-"}</td>
                        <td className="p-3.5 text-slate-500 font-medium">{neigh.name_en}</td>
                        <td className="p-3.5 font-bold text-slate-800">{neigh.activities_count || 0}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              neigh.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {neigh.is_active ? "مفعل" : "معطل"}
                          </span>
                        </td>
                        <td className="p-3.5 text-left">
                          <button
                            onClick={() => handleOpenNeighModal(neigh)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                            title="تعديل الحي"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Hierarchy Tree View */}
      {activeTab === "tree" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">شجرة النطاقات الجغرافية المتكاملة</h2>
              <p className="text-xs text-slate-500">استعراض هرمي ثلاثي المستويات للتوزيع المكاني في الدليل</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-indigo-600" /> محافظة</span>
              <span className="text-slate-300">←</span>
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-sky-600" /> مدينة</span>
              <span className="text-slate-300">←</span>
              <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-emerald-600" /> حي سكني</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {locations.map((gov) => {
              const govCities = cities.filter(c => c.governorate_id === gov.id);
              const isGovOpen = !!expandedGovs[gov.id];
              return (
                <div key={gov.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                  {/* Governorate Level */}
                  <div
                    onClick={() => toggleGovExpanded(gov.id)}
                    className="p-3.5 bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {isGovOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <span className="font-black text-sm text-slate-900">{gov.name_ar}</span>
                      <span className="font-mono text-xs text-slate-400">({gov.code})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-bold">{govCities.length} مدينة</span>
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        {neighborhoods.filter(n => n.governorate_id === gov.id).length} حي
                      </span>
                    </div>
                  </div>

                  {/* Cities Sub-tree */}
                  {isGovOpen && (
                    <div className="p-3 pr-8 space-y-2 border-t border-slate-200 bg-white">
                      {govCities.length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">لا توجد مدن مسجلة تحت هذه المحافظة بعد.</p>
                      ) : (
                        govCities.map((city) => {
                          const cityNeighs = neighborhoods.filter(n => n.city_id === city.id);
                          const isCityOpen = !!expandedCities[city.id];
                          return (
                            <div key={city.id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/80">
                              <div
                                onClick={() => toggleCityExpanded(city.id)}
                                className="p-2.5 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  {isCityOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                                  <span className="font-bold text-xs text-slate-800">{city.name_ar}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">({city.code})</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {cityNeighs.length} حي سكني
                                </span>
                              </div>

                              {/* Neighborhoods list */}
                              {isCityOpen && (
                                <div className="p-2.5 pr-6 bg-white border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {cityNeighs.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 py-1 col-span-3">لا توجد أحياء مسجلة.</p>
                                  ) : (
                                    cityNeighs.map((neigh) => (
                                      <div
                                        key={neigh.id}
                                        className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                                      >
                                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                          <Home className="w-3 h-3 text-emerald-600" />
                                          <span>{neigh.name_ar}</span>
                                        </div>
                                        {neigh.postal_code && (
                                          <span className="font-mono text-[10px] text-slate-400">
                                            #{neigh.postal_code}
                                          </span>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Governorate Modal */}
      <Modal
        isOpen={govModalOpen}
        onClose={() => setGovModalOpen(false)}
        title={editingGovId ? "تعديل المحافظة" : "إضافة محافظة جديدة"}
      >
        <form onSubmit={handleSaveGov} className="space-y-4">
          <Input
            label="اسم المحافظة بالعربية"
            required
            value={govNameAr}
            onChange={(e) => setGovNameAr(e.target.value)}
          />
          <Input
            label="اسم المحافظة بالإنجليزية"
            required
            value={govNameEn}
            onChange={(e) => setGovNameEn(e.target.value)}
          />
          <Input
            label="رمز المحافظة (Code)"
            required
            value={govCode}
            onChange={(e) => setGovCode(e.target.value)}
            placeholder="مثال: EGY-CAI"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="خط العرض (Latitude)"
              type="number"
              step="any"
              value={govLat}
              onChange={(e) => setGovLat(Number(e.target.value))}
            />
            <Input
              label="خط الطول (Longitude)"
              type="number"
              step="any"
              value={govLng}
              onChange={(e) => setGovLng(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setGovModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              حفظ المحافظة
            </Button>
          </div>
        </form>
      </Modal>

      {/* City Modal */}
      <Modal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        title={editingCityId ? "تعديل المدينة / المركز" : "إضافة مدينة أو مركز جديد"}
      >
        <form onSubmit={handleSaveCity} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">المحافظة التابعة</label>
            <select
              value={cityGovId}
              onChange={(e) => setCityGovId(Number(e.target.value))}
              className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {locations.map(g => (
                <option key={g.id} value={g.id}>{g.name_ar} ({g.code})</option>
              ))}
            </select>
          </div>
          <Input
            label="اسم المدينة / المركز بالعربية"
            required
            value={cityNameAr}
            onChange={(e) => setCityNameAr(e.target.value)}
            placeholder="مثال: مدينة نصر، السادس من أكتوبر..."
          />
          <Input
            label="اسم المدينة بالإنجليزية"
            required
            value={cityNameEn}
            onChange={(e) => setCityNameEn(e.target.value)}
            placeholder="e.g. Nasr City"
          />
          <Input
            label="رمز المدينة (Code)"
            required
            value={cityCode}
            onChange={(e) => setCityCode(e.target.value)}
            placeholder="مثال: CAI-NASR"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setCityModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              حفظ المدينة
            </Button>
          </div>
        </form>
      </Modal>

      {/* Neighborhood Modal */}
      <Modal
        isOpen={neighModalOpen}
        onClose={() => setNeighModalOpen(false)}
        title={editingNeighId ? "تعديل الحي السكني" : "إضافة حي أو منطقة سكنية جديدة"}
      >
        <form onSubmit={handleSaveNeigh} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">المدينة التابع لها الحي</label>
            <select
              value={neighCityId}
              onChange={(e) => setNeighCityId(Number(e.target.value))}
              className="w-full bg-slate-50 text-xs px-3 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {cities.map(c => {
                const parentGov = locations.find(g => g.id === c.governorate_id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.name_ar} ({parentGov?.name_ar || ""})
                  </option>
                );
              })}
            </select>
          </div>
          <Input
            label="اسم الحي السكني بالعربية"
            required
            value={neighNameAr}
            onChange={(e) => setNeighNameAr(e.target.value)}
            placeholder="مثال: حي السفارات، الحي المتميز، الدقي..."
          />
          <Input
            label="اسم الحي بالإنجليزية"
            required
            value={neighNameEn}
            onChange={(e) => setNeighNameEn(e.target.value)}
            placeholder="e.g. Embassies District"
          />
          <Input
            label="الرمز البريدي (اختياري)"
            value={neighPostal}
            onChange={(e) => setNeighPostal(e.target.value)}
            placeholder="مثال: 11765"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setNeighModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              حفظ الحي السكني
            </Button>
          </div>
        </form>
      </Modal>

      {/* Excel Import & Export Modal */}
      <ExcelImportExportModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        resourceType="locations"
        resourceTitleAr="الهيكل الجغرافي (محافظات، مدن، أحياء)"
        onImportPreview={async (rows) => {
          return await api.previewLocationsImport({ rows });
        }}
        onImportExecute={async (rows) => {
          return await api.executeLocationsImport({ rows });
        }}
        onExportFetch={async ({ format }) => {
          return await api.exportLocations({ format });
        }}
        onSuccessRefresh={() => {
          loadData();
        }}
      />
    </div>
  );
}

