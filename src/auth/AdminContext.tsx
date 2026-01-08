import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { adminLogin, adminLogout } from "../lib/api";

type AdminContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  csrfToken: string | null;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Check if we have a valid session on mount by trying to access a protected endpoint
  useEffect(() => {
    // We don't have a /api/admin/me endpoint, so we just check localStorage for csrf
    const storedCsrf = sessionStorage.getItem("admin_csrf");
    if (storedCsrf) {
      setIsAuthenticated(true);
      setCsrfToken(storedCsrf);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string) => {
    try {
      const res = await adminLogin(password);
      if (res.ok && res.csrf) {
        setIsAuthenticated(true);
        setCsrfToken(res.csrf);
        sessionStorage.setItem("admin_csrf", res.csrf);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Login failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
      // Ignore logout errors
    }
    setIsAuthenticated(false);
    setCsrfToken(null);
    sessionStorage.removeItem("admin_csrf");
  }, []);

  return (
    <AdminContext.Provider value={{ isLoading, isAuthenticated, csrfToken, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
}
