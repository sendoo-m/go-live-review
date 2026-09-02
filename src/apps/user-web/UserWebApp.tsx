// ============================================================================
// Daleel Ay Khidma - User Web Application Entry & Layout Shell
// ============================================================================

import React, { useState } from "react";
import { UserHeader, UserFooter } from "./components/UserHeader";
import { useSettings } from "../../packages/settings";
import { useI18n } from "../../packages/i18n";
import { HomePage } from "./pages/HomePage";
import { ActivitiesPage } from "./pages/ActivitiesPage";
import { ActivityDetailPage } from "./pages/ActivityDetailPage";
import { AddActivityPage } from "./pages/AddActivityPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { LocationsPage } from "./pages/LocationsPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { InteractiveMapPage } from "./pages/InteractiveMapPage";
import { OffersPage } from "./pages/OffersPage";
import { AlertTriangle, Wrench, Shield, Phone, MessageCircle } from "lucide-react";

interface UserWebAppProps {
  onOpenAdmin: () => void;
  onOpenMerchant?: () => void;
}

export function UserWebApp({ onOpenAdmin, onOpenMerchant }: UserWebAppProps) {
  const { isRtl, lang } = useI18n();
  const { isMaintenanceMode, maintenanceMessage, siteName, settings } = useSettings();
  const [currentRoute, setCurrentRoute] = useState<string>("home");
  const [routeParams, setRouteParams] = useState<any>({});
  const [maintenanceDismissed, setMaintenanceDismissed] = useState(false);

  const handleNavigate = (route: string, params: any = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-indigo-600 selection:text-white" dir={isRtl ? "rtl" : "ltr"}>
      {/* Maintenance Mode Warning Notice if Active */}
      {isMaintenanceMode && !maintenanceDismissed && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce text-slate-950" />
            <span>
              {maintenanceMessage || (lang === "ar" ? "المنصة قيد الصيانة المجدولة حالياً." : "Platform scheduled maintenance in progress.")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="px-2 py-0.5 bg-slate-900 text-amber-300 rounded text-[11px] hover:bg-slate-800 font-bold"
            >
              {lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
            </button>
            <button
              onClick={() => setMaintenanceDismissed(true)}
              className="text-xs font-mono hover:opacity-75 px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* User Header Navigation */}
      <UserHeader
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenAdmin={onOpenAdmin}
        onOpenMerchant={onOpenMerchant}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentRoute === "home" && <HomePage onNavigate={handleNavigate} />}
        {currentRoute === "offers" && <OffersPage onNavigate={handleNavigate} />}
        {currentRoute === "activities" && (
          <ActivitiesPage initialFilters={routeParams} onNavigate={handleNavigate} />
        )}
        {currentRoute === "map" && (
          <InteractiveMapPage
            initialLocationId={routeParams?.location_id}
            initialCategoryId={routeParams?.category_id}
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === "activity-detail" && (
          <ActivityDetailPage
            activityId={routeParams?.id || 1}
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === "add-activity" && (
          <AddActivityPage onNavigate={handleNavigate} />
        )}
        {currentRoute === "categories" && (
          <CategoriesPage onNavigate={handleNavigate} />
        )}
        {currentRoute === "locations" && (
          <LocationsPage onNavigate={handleNavigate} />
        )}
        {currentRoute === "profile" && (
          <UserProfilePage onNavigate={handleNavigate} />
        )}
      </main>

      {/* User Footer */}
      <UserFooter onNavigate={handleNavigate} />
    </div>
  );
}
