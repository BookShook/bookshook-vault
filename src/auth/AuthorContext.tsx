import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAuthorMe, authorLogin, authorLogout, ApiError, type AuthorMeResponse } from "../lib/api";
import { useNavigate } from "react-router-dom";

type AuthorContextValue = {
  author: AuthorMeResponse | null;
  isLoading: boolean;
  refresh: () => Promise<void>;

  // Helpers
  isAuthenticated: boolean;
  csrfToken: string | null;

  // Actions
  login: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthorContext = createContext<AuthorContextValue | null>(null);

export function AuthorProvider({ children }: { children: React.ReactNode }) {
  const [author, setAuthor] = useState<AuthorMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuthorMe();
      setAuthor(data);
    } catch (err) {
      setAuthor({ isAuthenticated: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isAuthenticated = !!author && author.isAuthenticated === true;
  const csrfToken = isAuthenticated && "csrf" in author ? author.csrf : null;

  const login = useCallback(async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authorLogin(token);
      // After login, refresh to get full author data
      await refresh();
      return { success: true };
    } catch (err) {
      if (err instanceof ApiError) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Login failed" };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await authorLogout();
    } finally {
      setAuthor({ isAuthenticated: false });
    }
  }, []);

  const value = useMemo<AuthorContextValue>(
    () => ({
      author,
      isLoading,
      refresh,
      isAuthenticated,
      csrfToken,
      login,
      logout,
    }),
    [author, isLoading, refresh, isAuthenticated, csrfToken, login, logout]
  );

  return <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>;
}

export function useAuthor() {
  const ctx = useContext(AuthorContext);
  if (!ctx) throw new Error("useAuthor must be used within AuthorProvider");
  return ctx;
}
