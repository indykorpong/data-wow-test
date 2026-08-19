"use client";

import type { ReactNode } from "react";
import { ConcertsProvider } from "@/store/ConcertsContext";
import { RoleProvider } from "@/store/RoleContext";
import { ToastProvider } from "@/store/ToastContext";

/**
 * One client boundary for all app state, so the root layout can stay a Server
 * Component. Order matters only in that ToastProvider must wrap anything that
 * calls `useToast()` during an interaction.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <ConcertsProvider>
        <ToastProvider>{children}</ToastProvider>
      </ConcertsProvider>
    </RoleProvider>
  );
}
