"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as api from "@/lib/api";
import type { AuthUser } from "@/lib/types";

const TOKEN_KEY = "auth_token";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: Status;
  login: (email: string, password: string) => Promise<AuthUser>;
  /** Registers, then logs in with the same credentials — `POST /auth/register`
   *  returns the created user but no token, so a second call is required to
   *  reach an authenticated session. */
  register: (fullName: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Hydrate from a previously stored token on first load.
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      // localStorage is only reachable client-side, so this hydration check
      // has to run in an effect rather than as a useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unauthenticated");
      return;
    }

    api
      .me(stored)
      .then((fetchedUser) => {
        setToken(stored);
        setUser(fetchedUser);
        setStatus("authenticated");
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: loggedInUser } = await api.login(email, password);
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(loggedInUser);
    setStatus("authenticated");
    return loggedInUser;
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      await api.register(fullName, email, password);
      return login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, status, login, register, logout }),
    [user, token, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
