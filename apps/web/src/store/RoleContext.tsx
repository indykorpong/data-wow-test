"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "@/lib/types";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
  /** Flips admin <-> user, backing the sidebar's "Switch to ..." item. */
  switchRole: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("admin");

  const switchRole = useCallback(() => {
    setRole((current) => (current === "admin" ? "user" : "admin"));
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({ role, setRole, switchRole }),
    [role, switchRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used inside <RoleProvider>");
  }
  return context;
}
