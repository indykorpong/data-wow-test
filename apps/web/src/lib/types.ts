/** Which side of the product the visitor is currently using. */
export type Role = "admin" | "user";

/** The role literal as returned by the API. */
export type ApiRole = "ADMIN" | "USER";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: ApiRole;
}

export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  /** Count of currently active reservations, computed server-side. */
  reservedSeats: number;
  /** Whether the signed-in user holds a seat for this concert. Always false for admins. */
  isReservedByMe: boolean;
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
  history: HistoryEntry[];
  loading: boolean;
}

/** Derived values behind the three stat cards. Never stored — always computed. */
export interface SeatStats {
  totalSeats: number;
  reserved: number;
  cancelled: number;
}
