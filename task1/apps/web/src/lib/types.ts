/** Which side of the product the visitor is currently using. */
export type Role = "admin" | "user";

export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
}

/** What a history row records. Mirrors the three-column table in the design. */
export type HistoryAction = "reserve" | "cancel";

export interface HistoryEntry {
  id: string;
  /** ISO 8601. Rendered with a fixed locale so SSR and CSR agree. */
  dateTime: string;
  username: string;
  concertName: string;
  action: HistoryAction;
}

export interface ConcertsState {
  concerts: Concert[];
  /** Concert ids the current user holds a seat for. */
  reservedConcertIds: string[];
  history: HistoryEntry[];
}

/** Derived values behind the three stat cards. Never stored — always computed. */
export interface SeatStats {
  totalSeats: number;
  reserved: number;
  cancelled: number;
}
