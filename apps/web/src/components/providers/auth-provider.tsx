"use client";

import { useEffect } from "react";

import { refreshSession } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const markHydrated = useAuthStore((state) => state.markHydrated);

  useEffect(() => {
    let active = true;

    refreshSession()
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          markHydrated();
        }
      });

    return () => {
      active = false;
    };
  }, [markHydrated]);

  return <>{children}</>;
}
