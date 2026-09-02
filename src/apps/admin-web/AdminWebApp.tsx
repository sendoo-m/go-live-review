// ============================================================================
// Daleel Ay Khidma - Admin Web Application Shell & Orchestrator
// ============================================================================

import React, { useState } from "react";
import { AdminSidebar, AdminHeader } from "./components/AdminSidebar";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminActivitiesPage } from "./pages/AdminActivitiesPage";
import { AdminReviewsPage } from "./pages/AdminReviewsPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminLocationsPage } from "./pages/AdminLocationsPage";
import { AdminUsersRolesPage } from "./pages/AdminUsersRolesPage";
import { AdminGeoSimulatorPage } from "./pages/AdminGeoSimulatorPage";
import { AdminAuditLogsPage } from "./pages/AdminAuditLogsPage";
import { AdminAnalyticsPage } from "./pages/AdminAnalyticsPage";
import { AdminApiConsolePage } from "./pages/AdminApiConsolePage";
import { AdminTestRunnerPage } from "./pages/AdminTestRunnerPage";
import { AdminPlansPage } from "./pages/AdminPlansPage";
import { AdminOffersPage } from "./pages/AdminOffersPage";
import { AdminInternalDjangoAdminPage } from "./pages/AdminInternalDjangoAdminPage";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { AdminFlutterDocsPage } from "./pages/AdminFlutterDocsPage";

interface AdminWebAppProps {

  onOpenUserWeb: () => void;
}

export function AdminWebApp({ onOpenUserWeb }: AdminWebAppProps) {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  const handleResetSandbox = async () => {
    if (!confirm("هل ترغب في إعادة تعيين كافة بيانات البيئة التجريبية للحالة الافتراضية؟")) return;
    try {
      await fetch("/api/v2/dev/reset-sandbox", { method: "POST" });
      window.location.reload();
    } catch (err) {
      alert("فشل إعادة التعيين");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 antialiased selection:bg-indigo-600 selection:text-white" dir="rtl">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenUserWeb={onOpenUserWeb}
        onResetSandbox={handleResetSandbox}
      />

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenUserWeb={onOpenUserWeb}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === "dashboard" && <AdminDashboardPage onNavigate={setCurrentTab} />}
          {currentTab === "settings" && <AdminSettingsPage />}
          {currentTab === "flutter-docs" && <AdminFlutterDocsPage />}
          {currentTab === "activities" && <AdminActivitiesPage />}
          {currentTab === "plans" && <AdminPlansPage />}
          {currentTab === "offers" && <AdminOffersPage />}
          {currentTab === "reviews" && <AdminReviewsPage />}
          {currentTab === "categories" && <AdminCategoriesPage />}
          {currentTab === "locations" && <AdminLocationsPage />}
          {currentTab === "users-roles" && <AdminUsersRolesPage />}
          {currentTab === "geo-simulator" && <AdminGeoSimulatorPage />}
          {currentTab === "audit-logs" && <AdminAuditLogsPage />}
          {currentTab === "analytics" && <AdminAnalyticsPage />}
          {currentTab === "django-admin" && <AdminInternalDjangoAdminPage />}
          {currentTab === "api-console" && <AdminApiConsolePage />}
          {currentTab === "test-runner" && <AdminTestRunnerPage />}
        </main>
      </div>
    </div>
  );
}
