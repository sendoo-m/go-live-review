import React, { useState } from "react";
import { LARAVEL_CODEBASE } from "../data/laravelCodebase";
import { LaravelFile } from "../types";
import { FileCode, Copy, Check, Info, Folder, Layers, Search, Code2 } from "lucide-react";

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<LaravelFile>(LARAVEL_CODEBASE[0]);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "الكل" },
    { id: "routes", label: "مسارات الـ API (Routes)" },
    { id: "scopes", label: "النطاق الجغرافي (Global Scopes)" },
    { id: "middleware", label: "الميدلوير (Middleware)" },
    { id: "models", label: "النماذج (Models)" },
    { id: "observers", label: "المراقبون (Observers)" },
    { id: "services", label: "الخدمات والتحليلات (Services)" },
    { id: "controllers", label: "المتحكمات (Controllers)" },
    { id: "seeders", label: "المغذيات (Seeders)" },
    { id: "lang", label: "التعريب (Localization)" },
    { id: "tests", label: "اختبارات الـ Feature (PHPUnit)" },
    { id: "bootstrap", label: "إعدادات Laravel 11 (Bootstrap)" },
  ];

  const filteredFiles = LARAVEL_CODEBASE.filter((f) => {
    const matchesCategory = filterCategory === "all" || f.category === filterCategory;
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold mb-2.5">
              <Layers className="w-3.5 h-3.5" />
              هيكل المشروع المبني وفق أحدث معايير Laravel 11 & PHP 8.3
            </div>
            <h2 className="text-xl font-bold text-slate-900">مستكشف الكود المصدري لمنظومة «دليل أي خدمة»</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              تم بناء كافة طبقات النظام من الصفر: قاعدة البيانات (Migrations)، النماذج والعلاقات (Models)، النطاق الجغرافي التلقائي (Geographic Global Scope)،
              الأدوار الديناميكية (RBAC)، سجل العمليات غير القابل للمحو (Append-Only AuditLog)، والتحليلات المجمعة المحسنة.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">إجمالي الملفات:</span>
            <span className="text-sm font-bold text-indigo-700">{LARAVEL_CODEBASE.length} ملف مكتمل</span>
          </div>
        </div>
      </div>

      {/* Main Code View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Sidebar: Files Navigation */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              placeholder="بحث في الملفات أو الشروح البرمجية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer font-medium ${
                  filterCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-right p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                  selectedFile.path === file.path
                    ? "bg-indigo-50/80 border-r-4 border-indigo-600"
                    : "hover:bg-slate-50"
                }`}
              >
                <FileCode
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    selectedFile.path === file.path ? "text-indigo-600" : "text-slate-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold truncate ${
                        selectedFile.path === file.path ? "text-indigo-950" : "text-slate-800"
                      }`}
                    >
                      {file.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0 font-mono font-medium">
                      {file.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate ltr text-left">{file.path}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* File Header */}
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{selectedFile.title}</h3>
                <p className="text-xs text-slate-500 font-mono ltr text-left">{selectedFile.path}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center gap-1.5 font-medium cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "تم النسخ بنجاح!" : "نسخ الكود"}
              </button>
            </div>
          </div>

          {/* Description & Technical Insight */}
          <div className="bg-indigo-50/50 p-4 border-b border-indigo-100/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-950 font-medium leading-relaxed">{selectedFile.description}</p>
          </div>

          {/* Code Body with Line Numbers */}
          <div className="p-4 overflow-x-auto font-mono text-xs text-slate-200 bg-slate-950 max-h-[520px]">
            <pre className="leading-relaxed">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

