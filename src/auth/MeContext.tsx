import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMe, ApiError, type MeResponse } from "../lib/api";
import { openGhostPortal } from "../lib/ghostPortal";

type MeContextValue = {
  me: MeResponse | null;
  isLoading: boolean;
  refresh: () => Promise<void>;

  // Helpers
  isAuthenticated: boolean;
  isPaid: boolean;

  requireAuth: () => void;
  requirePaid: () => void;
};

const MeContext = createContext<MeContextValue | null>(null);

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMe();
      setMe(data);
    } catch (err) {
      // If /api/me fails, keep SPA usable; treat as logged out.
      if (err instanceof ApiError) {
        setMe({ isAuthenticated: false });
      } else {
        setMe({ isAuthenticated: false });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isAuthenticated = !!me && me.isAuthenticated === true;
  const isPaid = isAuthenticated && "isPaid" in me ? !!me.isPaid : false;

  const requireAuth = useCallback(() => {
    openGhostPortal("signin");
  }, []);

  const requirePaid = useCallback(() => {
    // For free members, "signup" is the cleanest upgrade entry
    openGhostPortal("signup");
  }, []);

  const value = useMemo<MeContextValue>(
    () => ({
      me,
      isLoading,
      refresh,
      isAuthenticated,
      isPaid,
      requireAuth,
      requirePaid,
    }),
    [me, isLoading, refresh, isAuthenticated, isPaid, requireAuth, requirePaid]
  );

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMe() {
  const ctx = useContext(MeContext);
  if (!ctx) throw new Error("useMe must be used within MeProvider");
  return ctx;
}
