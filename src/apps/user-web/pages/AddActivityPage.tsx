// ============================================================================
// Daleel Ay Khidma - Add Activity Page (Multi-Step Merchant Submission Wizard)
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { CategoryDTO, LocationDTO } from "../../../packages/types";
import { useAuth } from "../../../packages/auth";
import { Button, Input, Select, Textarea } from "../../../packages/ui";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Building2,
  MapPin,
  Map as MapIcon,
  Image,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Store,
  Layers,
  Crosshair,
  Phone,
  MessageCircle,
  Clock,
  Globe,
} from "lucide-react";

function LocationPickerMap({
  coords,
  onChange,
}: {
  coords: { lat: number; lng: number };
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.flyTo([coords.lat, coords.lng], map.getZoom());
  }, [coords, map]);

  return (
    <Marker
      position={[coords.lat, coords.lng]}
      icon={L.divIcon({
        html: `
          <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -50%);">
            <div style="
              width: 36px;
              height: 36px;
              background: #4f46e5;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="transform: rotate(45deg); width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        className: "picker-map-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })}
    />
  );
}

interface AddActivityPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export function AddActivityPage({ onNavigate }: AddActivityPageProps) {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);

  // Form State
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [locationId, setLocationId] = useState<number>(1);
  const [addressAr, setAddressAr] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || "");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [workingHours, setWorkingHours] = useState("يومياً من 09:00 ص إلى 10:00 م");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800");
  const [isFeatured, setIsFeatured] = useState(false);

  // Map Coordinates (Default Cairo)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 30.0444, lng: 31.2357 });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedActivityId, setSubmittedActivityId] = useState<number | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [catsRes, locsRes] = await Promise.all([api.getCategories(), api.getLocations()]);
        if (catsRes.data) {
          setCategories(catsRes.data);
          if (catsRes.data.length > 0) setCategoryId(catsRes.data[0].id);
        }
        if (locsRes.data) {
          setLocations(locsRes.data);
          if (locsRes.data.length > 0) {
            setLocationId(locsRes.data[0].id);
            setCoords({ lat: locsRes.data[0].latitude, lng: locsRes.data[0].longitude });
          }
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !addressAr) {
      alert("يرجى ملء الحقول الإلزامية");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createActivity({
        name_ar: nameAr,
        name_en: nameEn || undefined,
        category_id: Number(categoryId),
        location_id: Number(locationId),
        address_ar: addressAr,
        address_line: addressLine || undefined,
        latitude: coords.lat,
        longitude: coords.lng,
        phone: phone || undefined,
        whatsapp_number: whatsappNumber || undefined,
        website_url: websiteUrl || undefined,
        working_hours: workingHours || undefined,
        description_ar: descriptionAr,
        cover_image: coverImage,
        is_featured: isFeatured,
      });

      if (res.data?.id) {
        setSubmittedActivityId(res.data.id);
        setStep(4); // Success step
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء حفظ النشاط التجاري.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: "البيانات الأساسية والتواصل", icon: Store },
    { num: 2, title: "التصنيف والموقع الجغرافي", icon: MapPin },
    { num: 3, title: "الصور والوصف وساعات العمل", icon: Image },
    { num: 4, title: "التأكيد والاعتماد", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-right pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">تسجيل نشاط تجاري أو حرفي جديد</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          انضم إلى شبكة دليل أي خدمة لنشر متاجرك، أسعارك، وربطها بالخرائط الجغرافية بدقة لملايين الزبائن
        </p>
      </div>

      {/* Steps Visual Progress */}
      <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {stepsHeader.map((s) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div
              key={s.num}
              className={`p-2 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-right transition-colors ${
                isCurrent
                  ? "bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold"
                  : isDone
                  ? "text-emerald-700 bg-emerald-50/60 font-semibold"
                  : "text-slate-400 font-normal"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="text-xs leading-tight truncate">{s.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Step Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              الخطوة 1: البيانات الأساسية وأرقام التواصل
            </h2>

            <div className="space-y-4">
              <Input
                label="اسم النشاط أو المحل باللغة العربية"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: مطعم واحة المشويات الأصيل"
              />

              <Input
                label="اسم النشاط باللغة الإنجليزية (اختياري)"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Al-Waha BBQ & Restaurant"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="رقم هاتف الاتصال"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                />

                <Input
                  label="رقم واتساب المباشر للطلبات"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="01012345678"
                />
              </div>

              <Input
                label="الموقع الإلكتروني أو صفحة الفيسبوك (اختياري)"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://facebook.com/..."
              />

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-900 block">طلب تمييز النشاط (Featured Listing)</span>
                  <span className="text-[11px] text-amber-700">
                    الحصول على أولوية الظهور في الصفحة الرئيسية وأعلى نتائج البحث
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  if (!nameAr.trim()) {
                    alert("يرجى إدخال اسم النشاط بالعربية");
                    return;
                  }
                  setStep(2);
                }}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                المتابعة للموقع الجغرافي
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              الخطوة 2: التصنيف والموقع الجغرافي على الخريطة
            </h2>

            <div className="space-y-4">
              <Select
                label="التصنيف التجاري الرئيسي"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                options={categories.map((c) => ({ value: c.id, label: c.name_ar }))}
              />

              <Select
                label="المحافظة / المدينة التابع لها"
                required
                value={locationId}
                onChange={(e) => {
                  const locId = Number(e.target.value);
                  setLocationId(locId);
                  const selectedLoc = locations.find((l) => l.id === locId);
                  if (selectedLoc) {
                    setCoords({ lat: selectedLoc.latitude, lng: selectedLoc.longitude });
                  }
                }}
                options={locations.map((l) => ({ value: l.id, label: `${l.name_ar} (${l.code})` }))}
              />

              <Input
                label="العنوان المختصر واسم المنطقة"
                required
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                placeholder="مثال: وسط البلد - شارع الجمهورية"
              />

              <Input
                label="تفاصيل العنوان (رقم العقار / المعلم المميز)"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="مثال: عمارة النصر، بجوار بنك مصر، الدور الأرضي"
              />

              {/* Interactive Location Pin on Map */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      تحديد الموقع الجغرافي الدقيق على الخريطة (GPS)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      انقر على الخريطة لتثبيت دبوس النشاط بدقة أو اضغط على زر التحديد التلقائي
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                          },
                          () => {
                            setCoords({ lat: 30.0444, lng: 31.2357 });
                          }
                        );
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>تحديد موقعي الحالي GPS</span>
                  </button>
                </div>

                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
                  <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPickerMap coords={coords} onChange={(lat, lng) => setCoords({ lat, lng })} />
                  </MapContainer>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>خط العرض: <strong className="text-slate-800">{coords.lat.toFixed(5)}</strong></span>
                  <span>خط الطول: <strong className="text-slate-800">{coords.lng.toFixed(5)}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(1)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                السابق
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!addressAr.trim()) {
                    alert("يرجى إدخال العنوان الرئيسي");
                    return;
                  }
                  setStep(3);
                }}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                المتابعة لصور وساعات العمل
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              الخطوة 3: الصور وساعات العمل والوصف
            </h2>

            <div className="space-y-4">
              <Input
                label="ساعات وأوقات العمل الرسمية"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="مثال: يومياً من 09:00 ص إلى 11:00 م"
              />

              <Input
                label="رابط صورة الغلاف للنشاط (Cover Image URL)"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />

              {coverImage && (
                <div className="rounded-2xl overflow-hidden h-40 border border-slate-200">
                  <img src={coverImage} alt="معاينة الغلاف" className="w-full h-full object-cover" />
                </div>
              )}

              <Textarea
                label="الوصف التفصيلي والخدمات المقدمة"
                rows={4}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="اكتب نبذة عن نشاطك، جودة خدماتك، والمنتجات الرئيسية المتاحة..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="secondary" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                السابق
              </Button>
              <Button
                variant="emerald"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                حفظ وإرسال للتدقيق والاعتماد
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">تم تسجيل النشاط بنجاح!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              تم إدراج نشاطك وإحداثياته الجغرافية في قاعدة البيانات، وأصبح بإمكانك الآن إدارة منتجاتك وأسعارك عبر لوحة تحكم التجار.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
              {submittedActivityId && (
                <Button
                  variant="primary"
                  onClick={() => onNavigate("activity-detail", { id: submittedActivityId })}
                >
                  معاينة صفحة النشاط
                </Button>
              )}
              <Button variant="secondary" onClick={() => onNavigate("activities")}>
                استعراض دليل الأنشطة
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
