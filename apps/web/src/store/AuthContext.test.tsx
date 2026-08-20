import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import * as api from "@/lib/api";
import type { LoginResponse } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

jest.mock("@/lib/api", () => ({
  me: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

const user: AuthUser = {
  id: "user-1",
  email: "user@example.com",
  fullName: "Test User",
  role: "USER",
};

const TOKEN_KEY = "auth_token";

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.resetAllMocks();
  });

  it("settles to unauthenticated when there is no stored token", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));
    expect(result.current.user).toBeNull();
    expect(mockApi.me).not.toHaveBeenCalled();
  });

  it("hydrates from a stored token via api.me", async () => {
    window.localStorage.setItem(TOKEN_KEY, "stored-token");
    mockApi.me.mockResolvedValue(user);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe("stored-token");
    expect(mockApi.me).toHaveBeenCalledWith("stored-token");
  });

  it("clears a stored token that api.me rejects", async () => {
    window.localStorage.setItem(TOKEN_KEY, "stale-token");
    mockApi.me.mockRejectedValue(new Error("unauthorized"));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("login stores the token and marks the session authenticated", async () => {
    const response: LoginResponse = { accessToken: "new-token", user };
    mockApi.login.mockResolvedValue(response);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    await act(async () => {
      await result.current.login("user@example.com", "password");
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.user).toEqual(user);
    expect(window.localStorage.getItem(TOKEN_KEY)).toBe("new-token");
  });

  it("logout clears the session and stored token", async () => {
    window.localStorage.setItem(TOKEN_KEY, "stored-token");
    mockApi.me.mockResolvedValue(user);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    act(() => {
      result.current.logout();
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("throws when useAuth is used outside an AuthProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used inside <AuthProvider>",
    );

    spy.mockRestore();
  });
});
