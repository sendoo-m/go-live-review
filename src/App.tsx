// ============================================================================
// Daleel Ay Khidma - Monorepo Master Application Entry
// Integrated with Laravel 11 Backend API (RESTful v2)
// User Web App + Admin Web App + Backend Architecture & Contracts
// ============================================================================

import React, { useState } from "react";
import { AuthProvider } from "./packages/auth";
import { I18nProvider } from "./packages/i18n";
import { SettingsProvider } from "./packages/settings";
import { UserWebApp } from "./apps/user-web/UserWebApp";
import { AdminWebApp } from "./apps/admin-web/AdminWebApp";
import { MerchantWebApp } from "./apps/merchant-web/MerchantWebApp";
import { CodeExplorer } from "./components/CodeExplorer";
import { LayoutDashboard, Store, Code2, ArrowRightLeft, Sparkles, ShieldCheck, ShoppingBag } from "lucide-react";

type ActiveAppMode = "user-web" | "merchant-web" | "admin-web" | "laravel-code";

export function App() {
  const [appMode, setAppMode] = useState<ActiveAppMode>("user-web");

  return (
    <I18nProvider>
      <SettingsProvider>
        <AuthProvider>
        <div className="relative min-h-screen bg-slate-100 antialiased selection:bg-indigo-600 selection:text-white">
          {/* Floating Quick App Switcher Bar */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/90 backdrop-blur-md text-white p-1.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-1">
            <button
              onClick={() => setAppMode("user-web")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                appMode === "user-web"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>دليل المستخدم (User Web)</span>
            </button>

            <button
              onClick={() => setAppMode("merchant-web")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                appMode === "merchant-web"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-900/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>لوحة التجار والخدمات (Vendor Panel)</span>
            </button>

            <button
              onClick={() => setAppMode("admin-web")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                appMode === "admin-web"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>لوحة الإدارة (Admin)</span>
            </button>

            <button
              onClick={() => setAppMode("laravel-code")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                appMode === "laravel-code"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>معمارية Laravel 11</span>
            </button>
          </div>

          {/* Dynamic App Renderer */}
          {appMode === "user-web" && (
            <UserWebApp onOpenAdmin={() => setAppMode("admin-web")} onOpenMerchant={() => setAppMode("merchant-web")} />
          )}

          {appMode === "merchant-web" && (
            <MerchantWebApp onOpenUserWeb={() => setAppMode("user-web")} onOpenAdmin={() => setAppMode("admin-web")} />
          )}

          {appMode === "admin-web" && (
            <AdminWebApp onOpenUserWeb={() => setAppMode("user-web")} />
          )}

          {appMode === "laravel-code" && (
            <div className="min-h-screen bg-slate-900 text-slate-100 p-6 max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Laravel 11.2 Production Architecture (PHP 8.3)
                  </div>
                  <h1 className="text-2xl font-black text-white mt-2">معمارية وهيكل الكود المصدري للـ Backend API</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    استعراض كامل لملفات Models, Controllers, Policies, Scopes, DTOs, Pest Tests
                  </p>
                </div>

                <button
                  onClick={() => setAppMode("user-web")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  العودة لبوابة المستخدم
                </button>
              </div>

              <CodeExplorer />
            </div>
          )}
        </div>
        </AuthProvider>
      </SettingsProvider>
    </I18nProvider>
  );
}

export default App;
