// ============================================================================
// Daleel Ay Khidma - User Web App Header & Footer
// Multilingual (AR / EN), Visitor Auth Modal, Role Navigation & Branding
// ============================================================================

import React, { useState } from "react";
import { useAuth } from "../../../packages/auth";
import { useI18n } from "../../../packages/i18n";
import { useSettings } from "../../../packages/settings";
import { AuthModal } from "../../../packages/auth/AuthModal";
import { Button } from "../../../packages/ui";
import {
  Compass,
  Search,
  PlusCircle,
  User,
  LogOut,
  Shield,
  Layers,
  MapPin,
  Map as MapIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Store,
  Flame,
  Globe,
  UserPlus,
  LogIn,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  ExternalLink,
  Smartphone,
} from "lucide-react";

interface UserHeaderProps {
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  onOpenAdmin: () => void;
  onOpenMerchant?: () => void;
}

export function UserHeader({ currentRoute, onNavigate, onOpenAdmin, onOpenMerchant }: UserHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, lang, setLanguage, isRtl } = useI18n();
  const { settings, siteName, tagline } = useSettings();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "forgot">("login");

  const openAuth = (mode: "login" | "register" | "forgot" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const navLinks = [
    { id: "home", label: t("nav.home") },
    { id: "activities", label: t("nav.activities") },
    { id: "offers", label: t("nav.offers"), isHot: true },
    { id: "map", label: t("nav.map") },
    { id: "categories", label: t("nav.categories") },
    { id: "locations", label: t("nav.locations") },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        {/* Top Utility Announcement Bar */}
        <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[11px]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {lang === "ar"
                  ? `منصة ${siteName} الرسمية • ${tagline}`
                  : `Official ${siteName} Platform • ${tagline}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switcher Pill */}
              <button
                onClick={() => setLanguage(lang === "ar" ? "en" : "ar")}
                className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="تغيير لغة الموقع / Switch Language"
              >
                <Globe className="w-3 h-3 text-indigo-400" />
                <span className="font-sans text-[11px]">{lang === "ar" ? "English" : "العربية"}</span>
              </button>

              {onOpenMerchant && (
                <button
                  onClick={onOpenMerchant}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>{t("nav.vendor_panel")}</span>
                </button>
              )}

              <button
                onClick={onOpenAdmin}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span>{t("nav.admin_panel")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2.5 text-right group cursor-pointer"
            >
              {settings.logo_url && settings.logo_url.startsWith("http") ? (
                <img
                  src={settings.logo_url}
                  alt={siteName}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform border border-slate-200"
                  onError={(e) => {
                    // fallback if image link is broken
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
              )}
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-slate-900 tracking-tight">{siteName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded font-bold border border-indigo-100">
                    {settings.default_country || (lang === "ar" ? "مصر" : "Egypt")}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{tagline}</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50/80 font-extrabold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {link.isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-bounce" />}
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Add Activity CTA */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate("add-activity")}
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="hidden sm:inline-flex"
            >
              {t("nav.add_activity")}
            </Button>

            {/* User Account / Visitor Auth Modal Trigger */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img
                    src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <div className={`hidden sm:block ${isRtl ? "text-right" : "text-left"}`}>
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.name.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold">
                      {lang === "ar" ? (user.role_display_name_ar || "عضو") : (user.role || "Member")}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className={`absolute ${isRtl ? "left-0" : "right-0"} mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${isRtl ? "text-right" : "text-left"}`}>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate("profile");
                      }}
                      className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{t("nav.profile")}</span>
                    </button>

                    {onOpenMerchant && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenMerchant();
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>{t("nav.vendor_panel")}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>{t("nav.admin_panel")}</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>{t("nav.logout")}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAuth("login")}
                  leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {t("nav.login")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openAuth("register")}
                  leftIcon={<UserPlus className="w-3.5 h-3.5 text-indigo-600" />}
                  className="text-xs hidden sm:inline-flex bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100"
                >
                  {t("nav.register")}
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 text-right animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.id);
                }}
                className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold ${
                  currentRoute === link.id ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("add-activity");
                }}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                {t("nav.add_activity")}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Visitor Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </>
  );
}

// ============================================================================
// User Web App Footer
// ============================================================================
export function UserFooter({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { t, lang } = useI18n();
  const { settings, siteName, description, officeAddress, footerCopyright } = useSettings();

  const socialLinks = [
    { name: "Facebook", url: settings.facebook_url, icon: "FB" },
    { name: "X / Twitter", url: settings.x_twitter_url, icon: "𝕏" },
    { name: "Instagram", url: settings.instagram_url, icon: "IG" },
    { name: "YouTube", url: settings.youtube_url, icon: "YT" },
    { name: "TikTok", url: settings.tiktok_url, icon: "TT" },
    { name: "LinkedIn", url: settings.linkedin_url, icon: "IN" },
    { name: "Telegram", url: settings.telegram_channel, icon: "TG" },
  ].filter((s) => Boolean(s.url));

  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t border-slate-800 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: About & Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {(settings.logo_dark_url || settings.logo_url) && (settings.logo_dark_url || settings.logo_url).startsWith("http") ? (
                <img
                  src={settings.logo_dark_url || settings.logo_url}
                  alt={siteName}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
              )}
              <span className="text-base font-black text-white">{siteName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {description || t("common.footer_about")}
            </p>

            {/* Direct Contact Pills */}
            <div className="space-y-1.5 pt-1 text-xs text-slate-300">
              {settings.support_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a href={`tel:${settings.support_phone}`} className="hover:text-white transition-colors dir-ltr">
                    {settings.support_phone}
                  </a>
                </div>
              )}
              {settings.support_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a href={`mailto:${settings.support_email}`} className="hover:text-white transition-colors">
                    {settings.support_email}
                  </a>
                </div>
              )}
              {officeAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400 leading-normal">{officeAddress}</span>
                </div>
              )}
            </div>

            {/* Social Channels */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-300 mb-2">
                  {lang === "ar" ? "تابعنا على منصات التواصل" : "Follow Us"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-bold transition-all border border-slate-700/80 flex items-center gap-1 cursor-pointer"
                      title={s.name}
                    >
                      <span className="text-[10px] font-mono">{s.icon}</span>
                      <span>{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("nav.quick_links")}</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate("home")} className="hover:text-white transition-colors cursor-pointer">
                  {t("nav.home")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("activities")} className="hover:text-white transition-colors cursor-pointer">
                  {t("nav.activities")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("categories")} className="hover:text-white transition-colors cursor-pointer">
                  {t("nav.categories")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("locations")} className="hover:text-white transition-colors cursor-pointer">
                  {t("nav.locations")}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("offers")} className="hover:text-white transition-colors cursor-pointer">
                  {t("nav.offers")}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("nav.top_categories")}</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>مطاعم ومقاهي فاخرة • Fine Dining & Cafes</li>
              <li>مراكز وعيادات طبية متخصصة • Medical Clinics</li>
              <li>صيانة وسيارات متكاملة • Car Repair & Crafts</li>
              <li>حلول تقنية وإلكترونيات • Electronics & Tech</li>
              <li>معلمون ودروس خصوصية • Tutors & Teachers</li>
            </ul>

            {/* Mobile App Download Badges */}
            {(settings.android_user_app_url || settings.ios_user_app_url) && (
              <div className="pt-4 space-y-2">
                <h5 className="text-[11px] font-bold text-slate-300">
                  {lang === "ar" ? "حمّل تطبيق الموبايل (Flutter)" : "Get the Mobile App"}
                </h5>
                <div className="flex flex-col gap-1.5">
                  {settings.android_user_app_url && (
                    <a
                      href={settings.android_user_app_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-2 border border-slate-700"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Google Play (Android)</span>
                    </a>
                  )}
                  {settings.ios_user_app_url && (
                    <a
                      href={settings.ios_user_app_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-2 border border-slate-700"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                      <span>App Store (iOS)</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Col 4: Trust & Verification & WhatsApp Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("nav.trust_security")}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("common.trust_desc")}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("common.verified_badge")}</span>
            </div>

            {settings.support_whatsapp && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.support_whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === "ar" ? "تواصل معنا عبر واتساب" : "Chat on WhatsApp"}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>{footerCopyright || `© ${new Date().getFullYear()} ${siteName} • ${t("common.all_rights_reserved")}`}</p>
          <div className="flex items-center gap-4">
            <span>REST API v{settings.mobile_api_version || "2.4.0"}</span>
            <span>•</span>
            <span>Flutter & Web Unified Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
