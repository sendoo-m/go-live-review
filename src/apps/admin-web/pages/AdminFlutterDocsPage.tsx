// ============================================================================
// Daleel Ay Khidma - Flutter Mobile Apps Developer Hub & Spec Page
// Architectural guidelines, Endpoints, Deep Links, and State Contracts for Android & iOS
// ============================================================================

import React, { useState } from "react";
import { useI18n } from "../../../packages/i18n";
import {
  Smartphone,
  CheckCircle2,
  Code2,
  Layers,
  KeyRound,
  Compass,
  Download,
  Copy,
  Check,
  Globe,
  Share2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function AdminFlutterDocsPage() {
  const { t, isRtl } = useI18n();
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 3000);
  };

  const flutterServiceSnippet = `// lib/core/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://daleel.test/api/v2';
  String? _authToken;

  void setAuthToken(String token) {
    _authToken = token;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ar',
    if (_authToken != null) 'Authorization': 'Bearer \$_authToken',
  };

  // 1. Initial Bootstrap (Settings, Categories, Geo)
  Future<Map<String, dynamic>> fetchBootstrap() async {
    final res = await http.get(Uri.parse('\$baseUrl/app/bootstrap'), headers: _headers);
    return jsonDecode(res.body)['data'];
  }

  // 2. Unified Live Search (Products, Shops, Services)
  Future<Map<String, dynamic>> searchUnified(String query, {int? governorateId, String? section}) async {
    final uri = Uri.parse('\$baseUrl/search/unified').replace(queryParameters: {
      'q': query,
      if (governorateId != null) 'governorate_id': governorateId.toString(),
      if (section != null) 'section': section,
    });
    final res = await http.get(uri, headers: _headers);
    return jsonDecode(res.body)['data'];
  }

  // 3. Visitor / User Authentication
  Future<Map<String, dynamic>> login(String emailOrPhone, String password) async {
    final res = await http.post(
      Uri.parse('\$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({'email_or_phone': emailOrPhone, 'password': password}),
    );
    final data = jsonDecode(res.body);
    if (data['success'] == true) {
      _authToken = data['data']['token'];
    }
    return data;
  }
}`;

  const deepLinkConfigSnippet = `<!-- AndroidManifest.xml (Android Deep Linking) -->
<activity android:name=".MainActivity" ...>
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="daleel" android:host="activity" />
        <data android:scheme="daleel" android:host="offer" />
    </intent-filter>
</activity>

<!-- Info.plist (iOS Deep Linking) -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>daleel</string>
        </array>
    </dict>
</array>`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Flutter Mobile Developer Architecture Guide</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">تهيئة وتكامل تطبيقات Flutter (Android & iOS)</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            دليل التطوير المتكامل لإنشاء تطبيقي Flutter (تطبيق المستخدم وتطبيق التاجر) مع توثيق معمارية الـ REST APIs، الروابط العميقة، والمصادقة الموحدة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/Daleel_Ay_Khidma_Technical_Documentation.docx"
            download="Daleel_Ay_Khidma_Technical_Documentation.docx"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all border border-indigo-400"
          >
            <Download className="w-4 h-4" />
            <span>تحميل ملف Word الرسمي (.docx)</span>
          </a>
          <a
            href="/Daleel_Ay_Khidma_Technical_Documentation.md"
            download="Daleel_Ay_Khidma_Technical_Documentation.md"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Markdown (.md)</span>
          </a>
          <div className="px-3 py-2.5 rounded-2xl bg-white/5 text-slate-300 font-mono text-xs border border-white/10">
            API v2.4.0
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "بنية Stateless RESTful",
            desc: "رموز Sanctum Tokens مستقلة عن الجلسات ومناسبة تماماً لـ Dio / Http في Flutter.",
            icon: Zap,
            color: "text-amber-500 bg-amber-50",
          },
          {
            title: "تطبيقين مستخدم وتاجر",
            desc: "عزل الصلاحيات عبر UserDTO و RoleDTO (زائر / عميل / تاجر / مدير).",
            icon: Layers,
            color: "text-indigo-500 bg-indigo-50",
          },
          {
            title: "روابط عميقة Deep Links",
            desc: "مخطط daleel:// موحد لفتح المحلات، المنتجات، والعروض مباشرة داخل التطبيق.",
            icon: Compass,
            color: "text-emerald-500 bg-emerald-50",
          },
          {
            title: "دعم كامل للعربية والإنجليزية",
            desc: "استقبال ترويسة Accept-Language: ar/en وإرجاع البيانات المترجمة والاتجاهات.",
            icon: Globe,
            color: "text-sky-500 bg-sky-50",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Code Snippets & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flutter API Client Implementation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span>خدمة الاتصال بالـ API في Flutter (Dart Client)</span>
            </h3>
            <button
              onClick={() => copyToClipboard(flutterServiceSnippet, "api")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              {copiedSnippet === "api" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === "api" ? "تم النسخ" : "نسخ الكود"}</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
            <pre className="select-all">{flutterServiceSnippet}</pre>
          </div>
        </div>

        {/* Deep Linking Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>إعدادات Deep Linking للأندرويد و iOS</span>
            </h3>
            <button
              onClick={() => copyToClipboard(deepLinkConfigSnippet, "deeplink")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              {copiedSnippet === "deeplink" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet === "deeplink" ? "تم النسخ" : "نسخ الكود"}</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
            <pre className="select-all">{deepLinkConfigSnippet}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
