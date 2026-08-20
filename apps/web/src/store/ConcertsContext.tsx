"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/store/AuthContext";
import type { ConcertsState, SeatStats } from "@/lib/types";

const EMPTY_STATE: ConcertsState = { concerts: [], history: [], loading: true };
const EMPTY_STATS: SeatStats = { totalSeats: 0, reserved: 0, cancelled: 0 };

interface ConcertsContextValue {
  state: ConcertsState;
  stats: SeatStats;
  createConcert: (input: { name: string; description: string; totalSeats: number }) => Promise<void>;
  deleteConcert: (id: string) => Promise<void>;
  reserve: (concertId: string) => Promise<void>;
  cancel: (concertId: string) => Promise<void>;
}

const ConcertsContext = createContext<ConcertsContextValue | null>(null);

export function ConcertsProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [state, setState] = useState<ConcertsState>(EMPTY_STATE);
  const [stats, setStats] = useState<SeatStats>(EMPTY_STATS);

  const refresh = useCallback(async () => {
    if (!token || !user) {
      setState(EMPTY_STATE);
      setStats(EMPTY_STATS);
      return;
    }

    const isAdmin = user.role === "ADMIN";
    const [concerts, history] = await Promise.all([
      api.getConcerts(token),
      isAdmin ? api.getAllHistory(token) : api.getMyHistory(token),
    ]);
    setState({ concerts, history, loading: false });

    if (isAdmin) {
      const adminStats = await api.getAdminStats(token);
      setStats(adminStats);
    } else {
      setStats(EMPTY_STATS);
    }
  }, [token, user]);

  useEffect(() => {
    // Re-fetches whenever the signed-in user (or token) changes; `refresh`
    // itself sets state after its awaits resolve, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const createConcert = useCallback(
    async (input: { name: string; description: string; totalSeats: number }) => {
      if (!token) return;
      await api.createConcert(token, input);
      await refresh();
    },
    [token, refresh],
  );

  const deleteConcert = useCallback(
    async (id: string) => {
      if (!token) return;
      await api.deleteConcert(token, id);
      await refresh();
    },
    [token, refresh],
  );

  const reserveSeat = useCallback(
    async (concertId: string) => {
      if (!token) return;
      await api.reserve(token, concertId);
      await refresh();
    },
    [token, refresh],
  );

  const cancelSeat = useCallback(
    async (concertId: string) => {
      if (!token) return;
      await api.cancelReservation(token, concertId);
      await refresh();
    },
    [token, refresh],
  );

  const value = useMemo<ConcertsContextValue>(
    () => ({
      state,
      stats,
      createConcert,
      deleteConcert,
      reserve: reserveSeat,
      cancel: cancelSeat,
    }),
    [state, stats, createConcert, deleteConcert, reserveSeat, cancelSeat],
  );

  return <ConcertsContext.Provider value={value}>{children}</ConcertsContext.Provider>;
}

export function useConcerts(): ConcertsContextValue {
  const context = useContext(ConcertsContext);
  if (!context) {
    throw new Error("useConcerts must be used inside <ConcertsProvider>");
  }
  return context;
}
