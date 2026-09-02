// ============================================================================
// Daleel Ay Khidma - User Profile & Account Page
// ============================================================================

import React, { useState, useEffect } from "react";
import { useAuth, SYSTEM_DEMO_USERS } from "../../../packages/auth";
import { api } from "../../../packages/api-client";
import { ActivityDTO } from "../../../packages/types";
import { Button, Badge, Skeleton } from "../../../packages/ui";
import { ActivityCard } from "../components/ActivityCard";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Layers,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  LogOut,
} from "lucide-react";

interface UserProfilePageProps {
  onNavigate: (route: string, params?: any) => void;
}

export function UserProfilePage({ onNavigate }: UserProfilePageProps) {
  const { user, switchUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"activities" | "favorites" | "personas">("activities");
  const [myActivities, setMyActivities] = useState<ActivityDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUserActivities() {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.getActivities({ per_page: 20 });
        if (res.results) {
          // Filter activities belonging to current user or show a selection
          setMyActivities(res.results.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load user activities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserActivities();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">يرجى تسجيل الدخول للوصول لحسابك</h2>
        <Button variant="primary" onClick={() => switchUser(SYSTEM_DEMO_USERS[4])}>
          دخول كـ "مستخدم عادي" (محمد عبد الله)
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-right pb-16">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {user.role_display_name_ar || user.role_name}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                {user.location_name_ar || "كافة المحافظات"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                {user.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate("add-activity")}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            إضافة نشاط جديد
          </Button>
          <Button variant="outline" size="sm" onClick={() => logout()} leftIcon={<LogOut className="w-4 h-4 text-red-500" />}>
            خروج
          </Button>
        </div>
      </div>

      {/* 2. Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("activities")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "activities" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          أنشطتي المسجلة ({myActivities.length})
        </button>
        <button
          onClick={() => setActiveTab("personas")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "personas" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          محاكي تبديل الحسابات والأدوار (Demo Personas)
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "activities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">سجل الأنشطة والمحال التابعة لحسابك</h2>
            <span className="text-xs text-slate-500">حالة التوثيق الميداني</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : myActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myActivities.map((act) => (
                <div key={act.id} className="relative">
                  <ActivityCard activity={act} onClick={() => onNavigate("activity-detail", { id: act.id })} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">لم تقم بإضافة أي أنشطة تجارية بعد</h3>
              <Button variant="primary" size="sm" onClick={() => onNavigate("add-activity")}>
                أضف نشاطك الأول الآن
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "personas" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">تبديل المستخدم الفعّال لاختبار الصلاحيات والنطاق الجغرافي</h2>
            <p className="text-xs text-slate-500 mt-1">
              اختر أي شخصية لتجربة سلوك النظام التلقائي والقيود الجغرافية المطبقة عبر الـ Middleware
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SYSTEM_DEMO_USERS.map((demo) => (
              <div
                key={demo.id}
                onClick={() => switchUser(demo)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  user.id === demo.id
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={demo.avatar_url} alt={demo.name} className="w-12 h-12 rounded-xl object-cover border" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{demo.name}</h4>
                    <span className="text-[11px] text-indigo-600 font-semibold">{demo.role_display_name_ar}</span>
                    <p className="text-[10px] text-slate-400 font-medium">{demo.location_name_ar}</p>
                  </div>
                </div>

                {user.id === demo.id && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    نشط حالياً
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
