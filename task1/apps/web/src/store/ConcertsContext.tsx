"use client";

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { CURRENT_USER, initialConcertsState } from "@/lib/seed";
import type { ConcertsState, HistoryEntry, SeatStats } from "@/lib/types";

/**
 * Every action carries the ids and timestamps it needs rather than generating
 * them internally. That keeps the reducer pure and, more importantly, keeps
 * `crypto.randomUUID()` and `Date.now()` out of the render path — both would
 * otherwise differ between the server and client passes and break hydration.
 */
type Action =
  | {
      type: "CREATE_CONCERT";
      payload: { id: string; name: string; description: string; totalSeats: number };
    }
  | { type: "DELETE_CONCERT"; payload: { id: string } }
  | { type: "RESERVE"; payload: { concertId: string; entryId: string; dateTime: string } }
  | { type: "CANCEL"; payload: { concertId: string; entryId: string; dateTime: string } };

function log(
  state: ConcertsState,
  concertId: string,
  entryId: string,
  dateTime: string,
  action: HistoryEntry["action"],
): HistoryEntry[] {
  const concert = state.concerts.find((item) => item.id === concertId);
  const entry: HistoryEntry = {
    id: entryId,
    dateTime,
    username: CURRENT_USER,
    concertName: concert?.name ?? "Unknown concert",
    action,
  };
  // Newest first — the table reads top-down as most-recent-first.
  return [entry, ...state.history];
}

function reducer(state: ConcertsState, action: Action): ConcertsState {
  switch (action.type) {
    case "CREATE_CONCERT": {
      const { id, name, description, totalSeats } = action.payload;
      return {
        ...state,
        concerts: [...state.concerts, { id, name, description, totalSeats }],
      };
    }

    case "DELETE_CONCERT": {
      const { id } = action.payload;
      return {
        ...state,
        concerts: state.concerts.filter((concert) => concert.id !== id),
        // A deleted concert cannot stay reserved. History is deliberately left
        // intact: it is an audit trail, not a view of current state.
        reservedConcertIds: state.reservedConcertIds.filter((item) => item !== id),
      };
    }

    case "RESERVE": {
      const { concertId, entryId, dateTime } = action.payload;
      if (state.reservedConcertIds.includes(concertId)) return state;
      return {
        ...state,
        reservedConcertIds: [...state.reservedConcertIds, concertId],
        history: log(state, concertId, entryId, dateTime, "reserve"),
      };
    }

    case "CANCEL": {
      const { concertId, entryId, dateTime } = action.payload;
      if (!state.reservedConcertIds.includes(concertId)) return state;
      return {
        ...state,
        reservedConcertIds: state.reservedConcertIds.filter((item) => item !== concertId),
        history: log(state, concertId, entryId, dateTime, "cancel"),
      };
    }

    default:
      return state;
  }
}

interface ConcertsContextValue {
  state: ConcertsState;
  stats: SeatStats;
  isReserved: (concertId: string) => boolean;
  createConcert: (input: { name: string; description: string; totalSeats: number }) => void;
  deleteConcert: (id: string) => void;
  reserve: (concertId: string) => void;
  cancel: (concertId: string) => void;
}

const ConcertsContext = createContext<ConcertsContextValue | null>(null);

export function ConcertsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialConcertsState);

  const createConcert = useCallback(
    (input: { name: string; description: string; totalSeats: number }) => {
      dispatch({ type: "CREATE_CONCERT", payload: { id: crypto.randomUUID(), ...input } });
    },
    [],
  );

  const deleteConcert = useCallback((id: string) => {
    dispatch({ type: "DELETE_CONCERT", payload: { id } });
  }, []);

  const reserve = useCallback((concertId: string) => {
    dispatch({
      type: "RESERVE",
      payload: { concertId, entryId: crypto.randomUUID(), dateTime: new Date().toISOString() },
    });
  }, []);

  const cancel = useCallback((concertId: string) => {
    dispatch({
      type: "CANCEL",
      payload: { concertId, entryId: crypto.randomUUID(), dateTime: new Date().toISOString() },
    });
  }, []);

  // The three stat cards are projections of state, never stored values.
  const stats = useMemo<SeatStats>(
    () => ({
      totalSeats: state.concerts.reduce((sum, concert) => sum + concert.totalSeats, 0),
      reserved: state.reservedConcertIds.length,
      cancelled: state.history.filter((entry) => entry.action === "cancel").length,
    }),
    [state.concerts, state.reservedConcertIds, state.history],
  );

  const isReserved = useCallback(
    (concertId: string) => state.reservedConcertIds.includes(concertId),
    [state.reservedConcertIds],
  );

  const value = useMemo<ConcertsContextValue>(
    () => ({ state, stats, isReserved, createConcert, deleteConcert, reserve, cancel }),
    [state, stats, isReserved, createConcert, deleteConcert, reserve, cancel],
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
