import type { AuthUser, Concert, HistoryEntry } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {}

interface RequestOptions {
  method?: string;
  token?: string | null;
  body?: unknown;
}

/** Nest's default exception filter puts a string message on most errors, but
 *  an array of messages on class-validator failures. Both collapse to one
 *  string here so callers can hand it straight to `showToast`. */
function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      // Non-JSON error body — fall through to the generic message below.
    }
    throw new ApiError(extractMessage(payload, `Request failed (${res.status})`));
  }

  // Some success responses (e.g. POST /reservations, DELETE endpoints) carry
  // no body regardless of status code — parsing "" as JSON throws, so check
  // for empty text first rather than special-casing 204 alone.
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function register(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return request<AuthUser>("/auth/register", {
    method: "POST",
    body: { fullName, email, password },
  });
}

export function me(token: string): Promise<AuthUser> {
  return request<AuthUser>("/auth/me", { token });
}

export function getConcerts(token: string): Promise<Concert[]> {
  return request<Concert[]>("/concerts", { token });
}

export function createConcert(
  token: string,
  input: { name: string; description: string; totalSeats: number },
): Promise<Concert> {
  return request<Concert>("/concerts", { method: "POST", token, body: input });
}

export function deleteConcert(token: string, id: string): Promise<void> {
  return request<void>(`/concerts/${id}`, { method: "DELETE", token });
}

export function reserve(token: string, concertId: string): Promise<void> {
  return request<void>("/reservations", {
    method: "POST",
    token,
    body: { concertId },
  });
}

export function cancelReservation(token: string, concertId: string): Promise<void> {
  return request<void>(`/reservations/${concertId}`, { method: "DELETE", token });
}

export function getMyHistory(token: string): Promise<HistoryEntry[]> {
  return request<HistoryEntry[]>("/reservations/me", { token });
}

export function getAllHistory(token: string): Promise<HistoryEntry[]> {
  return request<HistoryEntry[]>("/reservations", { token });
}

export interface AdminStats {
  totalSeats: number;
  reserved: number;
  cancelled: number;
}

export function getAdminStats(token: string): Promise<AdminStats> {
  return request<AdminStats>("/admin/stats", { token });
}
