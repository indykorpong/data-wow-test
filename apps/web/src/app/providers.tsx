"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/store/AuthContext";
import { ConcertsProvider } from "@/store/ConcertsContext";
import { ToastProvider } from "@/store/ToastContext";

/**
 * One client boundary for all app state, so the root layout can stay a Server
 * Component. Order matters: ConcertsProvider reads the token from
 * AuthProvider, and ToastProvider must wrap anything that calls `useToast()`
 * during an interaction.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConcertsProvider>
        <ToastProvider>{children}</ToastProvider>
      </ConcertsProvider>
    </AuthProvider>
  );
}
