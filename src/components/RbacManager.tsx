import React, { useState, useEffect } from "react";
import { Shield, Plus, Check, Lock, Users, AlertCircle, RefreshCw, Key } from "lucide-react";
import { Persona } from "../types";

interface RbacManagerProps {
  activePersona: Persona;
}

export const RbacManager: React.FC<RbacManagerProps> = ({ activePersona }) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDisplayName, setNewRoleDisplayName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleRequiresGeo, setNewRoleRequiresGeo] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [createMsg, setCreateMsg] = useState<{ success: boolean; text: string } | null>(null);

  const fetchRolesData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v2/admin/roles", {
        headers: { "X-User-Id": String(activePersona.id) },
      });
      const data = await res.json();
      if (data.success) {
        setRoles(data.data.roles || []);
        setPermissions(data.data.available_permissions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, [activePersona]);

  const togglePermission = (permName: string) => {
    if (selectedPerms.includes(permName)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== permName));
    } else {
      setSelectedPerms([...selectedPerms, permName]);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);

    try {
      const res = await fetch("/api/v2/admin/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(activePersona.id),
        },
        body: JSON.stringify({
          name: newRoleName,
          display_name_ar: newRoleDisplayName,
          description_ar: newRoleDesc,
          requires_geo_scope: newRoleRequiresGeo,
          permissions: selectedPerms,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCreateMsg({ success: true, text: json.message });
        setNewRoleName("");
        setNewRoleDisplayName("");
        setNewRoleDesc("");
        setSelectedPerms([]);
        setShowCreateModal(false);
        fetchRolesData();
      } else {
        setCreateMsg({ success: false, text: json.message || "فشلت عملية إنشاء الدور" });
      }
    } catch (err: any) {
      setCreateMsg({ success: false, text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold mb-2.5">
              <Shield className="w-3.5 h-3.5" />
              نظام صلاحيات متقدم بأدوار قابلة للإنشاء (Dynamic RBAC)
            </div>
            <h2 className="text-xl font-bold text-slate-900">إدارة الأدوار والمصفوفة الديناميكية للصلاحيات</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              تعتمد المنظومة جدول وسيط (Pivot Table: <code className="text-indigo-700 font-mono bg-slate-100 px-1.5 py-0.5 rounded">permission_role</code>)
              لربط الصلاحيات، مما يتيح للإدارة إنشاء أدوار وظيفية جديدة في أي وقت بدون التعديل على بنية الأكواد أو الـ Enums الثابتة.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إنشاء دور مخصص جديد
          </button>
        </div>
      </div>

      {createMsg && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium ${
            createMsg.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {createMsg.text}
        </div>
      )}

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm hover:border-indigo-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{role.display_name_ar}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{role.name}</span>
                </div>
              </div>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  role.is_system ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {role.is_system ? "دور نظامي" : "مخصص"}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">{role.description_ar}</p>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                {role.permissions?.length || 0} صلاحيات مسندة
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  role.requires_geo_scope
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {role.requires_geo_scope ? "مقيد جغرافياً" : "وصول شامل"}
              </span>
            </div>

            {/* Permission Badges Preview */}
            <div className="flex flex-wrap gap-1 pt-1">
              {role.permissions?.slice(0, 4).map((p: string) => (
                <span key={p} className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded font-mono font-medium">
                  {p}
                </span>
              ))}
              {role.permissions?.length > 4 && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-1.5 py-0.5 rounded font-mono font-bold">
                  +{role.permissions.length - 4} المزيد
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-900">مصفوفة الصلاحيات الشاملة (Permission Matrix):</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3">الصلاحية / الوحدة</th>
                <th className="p-3">الرمز البرمجي</th>
                {roles.map((r) => (
                  <th key={r.id} className="p-3 text-center whitespace-nowrap">
                    {r.display_name_ar}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">
                    <div>{perm.display_name_ar}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{perm.description_ar}</div>
                  </td>
                  <td className="p-3 font-mono text-indigo-700 text-[11px] ltr text-left font-medium">{perm.name}</td>
                  {roles.map((r) => {
                    const has = r.name === "مدير_عام" || r.permissions?.includes(perm.name);
                    return (
                      <td key={r.id} className="p-3 text-center">
                        {has ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                إنشاء دور وظيفي جديد (Custom Dynamic Role)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الاسم بالإنجليزية (slug):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. delta_supervisor"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الاسم بالعربية للعرض:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مشرف منطقة الدلتا"
                    value={newRoleDisplayName}
                    onChange={(e) => setNewRoleDisplayName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">وصف الدور والمسؤوليات:</label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="وصف مختصر للمهام المنوطة بهذا الدور..."
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="requiresGeo"
                  checked={newRoleRequiresGeo}
                  onChange={(e) => setNewRoleRequiresGeo(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="requiresGeo" className="text-slate-800 font-bold cursor-pointer">
                  يتطلب تقييداً جغرافياً تلقائياً (Geographic Scope Restriction)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2">تحديد الصلاحيات المرتبطة:</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {permissions.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 text-slate-700 hover:text-slate-900 cursor-pointer font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(perm.name)}
                        onChange={() => togglePermission(perm.name)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="truncate">{perm.display_name_ar}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium cursor-pointer border border-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  حفظ وإنشاء الدور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
