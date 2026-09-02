// ============================================================================
// Daleel Ay Khidma - Admin Web App Sidebar & Navigation
// ============================================================================

import React from "react";
import { useAuth, SYSTEM_DEMO_USERS } from "../../../packages/auth";
import { useSettings } from "../../../packages/settings";
import {
  LayoutDashboard,
  Store,
  MessageSquare,
  Tags,
  MapPin,
  Users,
  Shield,
  ShieldCheck,
  History,
  TrendingUp,
  Terminal,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Layers,
  Crown,
  Flame,
  Settings,
  Smartphone,
} from "lucide-react";

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUserWeb: () => void;
  onResetSandbox: () => void;
}

export function AdminSidebar({
  currentTab,
  onSelectTab,
  onOpenUserWeb,
  onResetSandbox,
}: AdminSidebarProps) {
  const { user, switchUser, isGeoRestricted } = useAuth();
  const { siteName, settings } = useSettings();

  const menuItems = [
    { id: "dashboard", label: "لوحة المؤشرات العامة", icon: LayoutDashboard, badge: "Live" },
    { id: "settings", label: "إعدادات المنصة الشاملة", icon: Settings, badge: "Config" },
    { id: "flutter-docs", label: "تطبيقات Flutter للموبايل", icon: Smartphone, badge: "Mobile" },
    { id: "activities", label: "إدارة وتوثيق الأنشطة", icon: Store, badge: "Core" },
    { id: "plans", label: "باقات وخطط الأسعار", icon: Crown, badge: "Plans" },
    { id: "offers", label: "العروض والخصومات", icon: Flame, badge: "Deals" },
    { id: "reviews", label: "مراجعة التقييمات والبلاغات", icon: MessageSquare, badge: "Mod" },
    { id: "categories", label: "التصنيفات والقطاعات", icon: Tags, badge: "CRUD" },
    { id: "locations", label: "المحافظات والمدن", icon: MapPin, badge: "Geo" },
    { id: "users-roles", label: "المستخدمين والصلاحيات (RBAC)", icon: Users, badge: "Dynamic" },
    { id: "django-admin", label: "لوحة Django Admin الموحدة", icon: Shield, badge: "Master" },
    { id: "geo-simulator", label: "محاكي النطاق الجغرافي", icon: ShieldCheck, badge: "Scope" },
    { id: "audit-logs", label: "سجل العمليات غير القابل للمحو", icon: History, badge: "Audit" },
    { id: "analytics", label: "التحليلات ومصفوفة الأداء", icon: TrendingUp, badge: "Perf" },
    { id: "api-console", label: "مستكشف عقود الـ API v2", icon: Terminal, badge: "REST" },
    { id: "test-runner", label: "مشغل الاختبارات (Pest Tests)", icon: FlaskConical, badge: "Tests" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-l border-slate-800 shrink-0 sticky top-0 h-screen z-40 hidden md:flex text-right">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {settings.logo_url && settings.logo_url.startsWith("http") ? (
            <img
              src={settings.logo_url}
              alt={siteName}
              className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-900/40">
              {siteName.charAt(0) || "D"}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-xs truncate max-w-[110px]" title={siteName}>
                {siteName}
              </span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono font-semibold">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-400">نظام إدارة المنصة</p>
          </div>
        </div>

        <button
          onClick={onOpenUserWeb}
          title="معاينة بوابة المستخدم"
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
          الوحدات التشغيلية
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Active Persona & Geo-Scope Switcher Box */}
      <div className="p-3 m-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            المشرف الحالي والنطاق
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isGeoRestricted ? "bg-amber-400" : "bg-emerald-400"
            } animate-pulse`}
          />
        </div>

        {/* Persona Select Dropdown */}
        <select
          value={user?.id || 1}
          onChange={(e) => {
            const found = SYSTEM_DEMO_USERS.find((u) => u.id === parseInt(e.target.value));
            if (found) switchUser(found);
          }}
          className="w-full bg-slate-900 text-white text-xs px-2.5 py-2 rounded-xl border border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {SYSTEM_DEMO_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role_display_name_ar})
            </option>
          ))}
        </select>

        <div className="text-[11px] text-indigo-300 font-medium flex items-center justify-between pt-1 border-t border-slate-800">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span className="truncate max-w-[130px]">{user?.location_name_ar || "وصول شامل"}</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400">REST v2</span>
        </div>

        <button
          onClick={onResetSandbox}
          className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          إعادة تعيين بيئة الاختبار
        </button>
      </div>
    </aside>
  );
}

// ============================================================================
// Admin Header Navigation
// ============================================================================
export function AdminHeader({
  currentTab,
  onSelectTab,
  onOpenUserWeb,
}: {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUserWeb: () => void;
}) {
  const { user, isGeoRestricted } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-right">
      {/* Left: Geo Scope Banner & Current Status */}
      <div className="flex items-center gap-3">
        {isGeoRestricted ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold animate-pulse">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>نطاق جغرافي مقيد: {user?.location_name_ar} (يتم تطبيق WHERE location_id تلقائياً)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>صلاحية إدارة عليا (وصول شامل لكافة المحافظات)</span>
          </div>
        )}
      </div>

      {/* Right: Quick App Switcher & User Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenUserWeb}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>فتح بوابة المستخدم (User Web)</span>
        </button>

        <div className="flex items-center gap-2.5 pr-2 border-r border-slate-200">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-300"
          />
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">{user?.name}</div>
            <div className="text-[10px] text-slate-400">{user?.role_display_name_ar}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
