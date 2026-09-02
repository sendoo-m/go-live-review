import React from "react";
import { Shield, MapPin, User, CheckCircle2, Globe, Database, Server, Search, Menu, X, ChevronDown } from "lucide-react";
import { Persona } from "../types";

interface HeaderProps {
  personas: Persona[];
  activePersona: Persona;
  onSelectPersona: (p: Persona) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  personas,
  activePersona,
  onSelectPersona,
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: "code", label: "معمارية وكود Laravel 11", icon: "📁" },
    { id: "api", label: "مختبر عقود الـ API v2", icon: "⚡" },
    { id: "geo", label: "محاكي النطاق الجغرافي", icon: "🗺️" },
    { id: "rbac", label: "الأدوار والصلاحيات", icon: "🛡️" },
    { id: "audit", label: "سجل العمليات (Audit Log)", icon: "📜" },
    { id: "analytics", label: "التحليلات المتقدمة", icon: "📈" },
    { id: "tests", label: "مشغل الاختبارات (Feature Tests)", icon: "🧪" },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Right side: Search or Title */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-xs sm:max-w-sm w-full hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          <input
            type="text"
            placeholder="بحث في السجلات أو الأنشطة أو المسارات..."
            className="w-full bg-slate-100 text-slate-800 placeholder:text-slate-400 border border-slate-200/80 rounded-full pr-10 pl-4 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium md:hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>منظومة دليل أي خدمة v2</span>
        </div>
      </div>

      {/* Left side: Persona Profile & Quick Badges */}
      <div className="flex items-center gap-3">
        {/* Persona Role & Scope Badges */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3 text-indigo-600" />
            {activePersona.roleDisplayName}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 border ${
              activePersona.requiresGeoScope
                ? "bg-purple-50 text-purple-700 border-purple-200/80"
                : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
            }`}
          >
            <MapPin className="w-3 h-3" />
            {activePersona.requiresGeoScope ? activePersona.locationName : "وصول شامل"}
          </span>
        </div>

        {/* Persona Selector Dropdown */}
        <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 p-1.5 pr-2.5 rounded-xl border border-slate-200 transition-colors">
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">{activePersona.name}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                {activePersona.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate max-w-[130px]">
              {activePersona.requiresGeoScope ? activePersona.locationName : "وصول جغرافي شامل"}
            </span>
          </div>

          <div className="relative">
            <select
              id="persona-selector"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              value={activePersona.id}
              onChange={(e) => {
                const selected = personas.find((p) => p.id === parseInt(e.target.value));
                if (selected) onSelectPersona(selected);
              }}
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.roleDisplayName} {p.locationName ? `• ${p.locationName}` : "• شامل"})
                </option>
              ))}
            </select>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-xs">
              <img
                src={activePersona.avatar}
                alt={activePersona.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

