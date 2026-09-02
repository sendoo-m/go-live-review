// ============================================================================
// Daleel Ay Khidma - Dynamic RBAC & User Role Management
// ============================================================================

import React, { useState, useEffect } from "react";
import { api } from "../../../packages/api-client";
import { RoleDTO, PermissionDTO, UserDTO, LocationDTO } from "../../../packages/types";
import { PERMISSION_MODULES } from "../../../packages/core";
import { Button, Input, Modal, Skeleton } from "../../../packages/ui";
import {
  Shield,
  ShieldCheck,
  Users,
  PlusCircle,
  Edit,
  MapPin,
  Lock,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";

export function AdminUsersRolesPage() {
  const [activeSubTab, setActiveSubTab] = useState<"roles" | "users">("roles");

  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Role Create / Edit Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDisplayName, setRoleDisplayName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleRequiresGeo, setRoleRequiresGeo] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submittingRole, setSubmittingRole] = useState(false);

  // User Role Assignment Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [assignedRoleId, setAssignedRoleId] = useState<number>(1);
  const [assignedLocationId, setAssignedLocationId] = useState<number | null>(null);
  const [submittingUser, setSubmittingUser] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes, locsRes] = await Promise.all([
        api.getRoles(),
        api.getUsers(),
        api.getLocations(),
      ]);

      if (rolesRes.data) {
        setRoles(rolesRes.data.roles);
        setPermissions(rolesRes.data.available_permissions);
      }
      if (usersRes.results) setUsers(usersRes.results);
      if (locsRes.data) setLocations(locsRes.data);
    } catch (err) {
      console.error("RBAC load err:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRoleModal = (role?: RoleDTO) => {
    if (role) {
      setEditingRoleId(role.id);
      setRoleName(role.name);
      setRoleDisplayName(role.display_name_ar);
      setRoleDesc(role.description_ar);
      setRoleRequiresGeo(role.requires_geo_scope);
      setSelectedPermissions(role.permissions || []);
    } else {
      setEditingRoleId(null);
      setRoleName("");
      setRoleDisplayName("");
      setRoleDesc("");
      setRoleRequiresGeo(false);
      setSelectedPermissions(["view_activities"]);
    }
    setRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRole(true);
    try {
      if (editingRoleId) {
        await api.updateRole(editingRoleId, {
          name: roleName,
          display_name_ar: roleDisplayName,
          description_ar: roleDesc,
          requires_geo_scope: roleRequiresGeo,
          permissions: selectedPermissions,
        });
      } else {
        await api.createRole({
          name: roleName || roleDisplayName.replace(/\s+/g, "_"),
          display_name_ar: roleDisplayName,
          description_ar: roleDesc,
          requires_geo_scope: roleRequiresGeo,
          permissions: selectedPermissions,
        });
      }
      setRoleModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "فشل حفظ الدور");
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleOpenUserModal = (u: UserDTO) => {
    setSelectedUser(u);
    setAssignedRoleId(u.role_id);
    setAssignedLocationId(u.location_id);
    setUserModalOpen(true);
  };

  const handleSaveUserAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingUser(true);
    try {
      await api.updateUserRole(selectedUser.id, assignedRoleId, assignedLocationId);
      setUserModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "فشل تحديث صلاحيات المستخدم");
    } finally {
      setSubmittingUser(false);
    }
  };

  const togglePermission = (permName: string) => {
    if (selectedPermissions.includes(permName)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permName));
    } else {
      setSelectedPermissions([...selectedPermissions, permName]);
    }
  };

  return (
    <div className="space-y-6 text-right pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">نظام الصلاحيات الديناميكي (RBAC)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إنشاء أدوار تشغيلية مخصصة، تحديد النطاق الجغرافي الإلزامي، وإدارة فريق العمل
          </p>
        </div>

        {activeSubTab === "roles" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenRoleModal()}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            إنشاء دور تشغيلي جديد
          </Button>
        )}
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("roles")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === "roles" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          الأدوار ومصفوفة الصلاحيات ({roles.length})
        </button>
        <button
          onClick={() => setActiveSubTab("users")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === "users" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          المستخدمين وفريق التشغيل ({users.length})
        </button>
      </div>

      {/* 1. Roles & Permissions Tab */}
      {activeSubTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {role.requires_geo_scope && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        نطاق جغرافي إلزامي
                      </span>
                    )}
                    <button
                      onClick={() => handleOpenRoleModal(role)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{role.display_name_ar}</h3>
                  <span className="text-[11px] font-mono text-slate-400">{role.name}</span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{role.description_ar}</p>
                </div>

                {/* Permissions Badges */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    الصلاحيات الممنوحة:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.includes("all") ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        كافة الصلاحيات (Super Admin)
                      </span>
                    ) : (
                      role.permissions.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono"
                        >
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>المستخدمين المسجلين: <strong className="text-slate-800">{role.users_count || 0}</strong></span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {role.is_system ? "نظامي" : "مخصص"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Users Management Tab */}
      {activeSubTab === "users" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">المستخدم</th>
                  <th className="p-3.5">الدور التشغيلي</th>
                  <th className="p-3.5">النطاق الجغرافي المعيّن</th>
                  <th className="p-3.5">الهاتف</th>
                  <th className="p-3.5">حالة الحساب</th>
                  <th className="p-3.5 text-left">تعديل الصلاحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover border" />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-indigo-700 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100">
                        {u.role_display_name_ar}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.location_name_ar || "كافة المحافظات"}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{u.phone}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {u.is_active ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className="p-3.5 text-left">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenUserModal(u)}>
                        تعيين دور
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Create/Edit Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={editingRoleId ? "تعديل الدور والصلاحيات" : "إنشاء دور تشغيلي جديد"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveRole} className="space-y-5 text-right">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="الاسم الظاهر بالعربية"
              required
              value={roleDisplayName}
              onChange={(e) => setRoleDisplayName(e.target.value)}
              placeholder="مثال: مشرف قطاع طبي"
            />
            <Input
              label="الرمز البرمجي للدور (Slug)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. medical_moderator"
            />
          </div>

          <Input
            label="الوصف والمهام التشغيلية"
            value={roleDesc}
            onChange={(e) => setRoleDesc(e.target.value)}
          />

          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={roleRequiresGeo}
              onChange={(e) => setRoleRequiresGeo(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                تفعيل النطاق الجغرافي الإلزامي (Strict Geographic Scope)
              </span>
              <span className="text-[11px] text-amber-700">
                تقييد شاغل هذا الدور بمحافظته فقط وتطبيق فلترة WHERE location_id تلقائياً
              </span>
            </div>
          </label>

          {/* Granular Permissions Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">تحديد الصلاحيات الممنوحة</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded-2xl">
              {permissions.map((p) => {
                const checked = selectedPermissions.includes(p.name) || selectedPermissions.includes("all");
                return (
                  <label
                    key={p.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      checked ? "bg-indigo-50/70 border-indigo-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(p.name)}
                      className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.display_name_ar}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.name}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setRoleModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submittingRole}>
              حفظ الدور والصلاحيات
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Assignment Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="تعيين الدور والنطاق الجغرافي للمستخدم"
      >
        <form onSubmit={handleSaveUserAssignment} className="space-y-4 text-right">
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
            <img src={selectedUser?.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">{selectedUser?.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono">{selectedUser?.email}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">الدور التشغيلي</label>
            <select
              value={assignedRoleId}
              onChange={(e) => setAssignedRoleId(Number(e.target.value))}
              className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name_ar} ({r.requires_geo_scope ? "مقيد جغرافياً" : "وصول شامل"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">المحافظة / النطاق الجغرافي المعين</label>
            <select
              value={assignedLocationId || ""}
              onChange={(e) => setAssignedLocationId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">كافة المحافظات (وصول عام)</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name_ar} ({l.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setUserModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submittingUser}>
              تطبيق التعيين
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
