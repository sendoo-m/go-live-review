// ============================================================================
// Daleel Ay Khidma - Auth Package & RBAC State Provider
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserDTO, RoleDTO } from "../types";
import { api } from "../api-client";
import { userHasPermission, userIsGeoRestricted } from "../core";

export const SYSTEM_DEMO_USERS: UserDTO[] = [
  {
    id: 1,
    name: "م. طارق الخالدي",
    email: "admin@daleel.test",
    phone: "+201000000001",
    role_id: 1,
    role_name: "مدير_عام",
    role_display_name_ar: "المدير العام",
    location_id: null,
    location_name_ar: "كافة المحافظات (وصول شامل)",
    requires_geo_scope: false,
    permissions: ["all"],
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    is_active: true,
    last_login_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "أحمد سمير",
    email: "operations@daleel.test",
    phone: "+201000000002",
    role_id: 2,
    role_name: "مدير_تشغيل",
    role_display_name_ar: "مدير تشغيل",
    location_id: null,
    location_name_ar: "كافة المحافظات",
    requires_geo_scope: false,
    permissions: ["manage_content", "manage_activities", "manage_team", "view_activities", "view_users", "view_reports"],
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    is_active: true,
    last_login_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "عمر الصعيدي",
    email: "reviewer.asyut@daleel.test",
    phone: "+201000000004",
    role_id: 3,
    role_name: "مراجع_أنشطة",
    role_display_name_ar: "مراجع أنشطة (أسيوط)",
    location_id: 4,
    location_name_ar: "محافظة أسيوط",
    requires_geo_scope: true,
    permissions: ["review_activities", "verify_activities", "view_activities"],
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    is_active: true,
    last_login_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "خالد محمود",
    email: "reviewer.cairo@daleel.test",
    phone: "+201000000003",
    role_id: 3,
    role_name: "مراجع_أنشطة",
    role_display_name_ar: "مراجع أنشطة (القاهرة)",
    location_id: 1,
    location_name_ar: "محافظة القاهرة",
    requires_geo_scope: true,
    permissions: ["review_activities", "verify_activities", "view_activities"],
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    is_active: true,
    last_login_at: new Date().toISOString(),
  },
  {
    id: 8,
    name: "محمد عبد الله (عميل / مستخدم)",
    email: "user@daleel.test",
    phone: "+201088889999",
    role_id: 7,
    role_name: "مستخدم",
    role_display_name_ar: "مستخدم نهائي",
    location_id: 1,
    location_name_ar: "القاهرة",
    requires_geo_scope: false,
    permissions: ["create_activity", "submit_review"],
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    is_active: true,
    last_login_at: new Date().toISOString(),
  },
];

interface AuthContextType {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, phone?: string, locationId?: number) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (user: UserDTO) => void;
  can: (permission: string) => boolean;
  isGeoRestricted: boolean;
  userLocationId: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(SYSTEM_DEMO_USERS[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Sync api client with current user ID
    if (user) {
      api.setToken(`sanctum_token_user_${user.id}`, user.id);
    }
  }, [user]);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const found = SYSTEM_DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        ...SYSTEM_DEMO_USERS[4],
        email,
      };
      setUser(found);
      api.setToken(`sanctum_token_user_${found.id}`, found.id);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone?: string, locationId?: number) => {
    setIsLoading(true);
    try {
      const newUser: UserDTO = {
        id: Date.now(),
        name,
        email,
        phone: phone || "+201000000000",
        role_id: 7,
        role_name: "مستخدم",
        role_display_name_ar: "مستخدم مسجل",
        location_id: locationId || 1,
        location_name_ar: "القاهرة",
        requires_geo_scope: false,
        permissions: ["create_activity", "submit_review"],
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        is_active: true,
        last_login_at: new Date().toISOString(),
      };
      setUser(newUser);
      api.setToken(`sanctum_token_user_${newUser.id}`, newUser.id);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout().catch(() => {});
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = (selectedUser: UserDTO) => {
    setUser(selectedUser);
    api.setToken(`sanctum_token_user_${selectedUser.id}`, selectedUser.id);
  };

  const can = (permission: string): boolean => {
    return userHasPermission(user, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchUser,
        can,
        isGeoRestricted: userIsGeoRestricted(user),
        userLocationId: user?.location_id || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function usePermission(permissionName: string): boolean {
  const { can } = useAuth();
  return can(permissionName);
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = useAuth();
  if (!can(permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

export * from "./AuthModal";

