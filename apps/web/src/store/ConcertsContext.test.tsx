import { act, renderHook, waitFor } from "@testing-library/react";
import { ConcertsProvider, useConcerts } from "./ConcertsContext";
import * as api from "@/lib/api";
import { useAuth } from "@/store/AuthContext";
import type { AuthUser, Concert } from "@/lib/types";

jest.mock("@/lib/api", () => ({
  getConcerts: jest.fn(),
  getMyHistory: jest.fn(),
  getAllHistory: jest.fn(),
  getAdminStats: jest.fn(),
  createConcert: jest.fn(),
  deleteConcert: jest.fn(),
  reserve: jest.fn(),
  cancelReservation: jest.fn(),
}));
jest.mock("@/store/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuth = useAuth as jest.Mock;

const concerts: Concert[] = [
  {
    id: "concert-1",
    name: "Rock Night",
    description: "Loud",
    totalSeats: 100,
    reservedSeats: 10,
    isReservedByMe: false,
  },
];

const adminUser: AuthUser = {
  id: "admin-1",
  email: "admin@example.com",
  fullName: "Admin",
  role: "ADMIN",
};

const regularUser: AuthUser = {
  id: "user-1",
  email: "user@example.com",
  fullName: "User",
  role: "USER",
};

describe("ConcertsContext", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockApi.getConcerts.mockResolvedValue(concerts);
    mockApi.getMyHistory.mockResolvedValue([]);
    mockApi.getAllHistory.mockResolvedValue([]);
    mockApi.getAdminStats.mockResolvedValue({ totalSeats: 0, reserved: 0, cancelled: 0 });
  });

  it("stays empty and makes no API calls when unauthenticated", async () => {
    mockUseAuth.mockReturnValue({ user: null, token: null });

    const { result } = renderHook(() => useConcerts(), { wrapper: ConcertsProvider });

    await waitFor(() => expect(result.current.state.loading).toBe(true));
    expect(result.current.state.concerts).toEqual([]);
    expect(mockApi.getConcerts).not.toHaveBeenCalled();
  });

  it("fetches concerts and personal history for a regular user, without admin stats", async () => {
    mockUseAuth.mockReturnValue({ user: regularUser, token: "token" });

    const { result } = renderHook(() => useConcerts(), { wrapper: ConcertsProvider });

    await waitFor(() => expect(result.current.state.loading).toBe(false));
    expect(result.current.state.concerts).toEqual(concerts);
    expect(mockApi.getMyHistory).toHaveBeenCalledWith("token");
    expect(mockApi.getAllHistory).not.toHaveBeenCalled();
    expect(mockApi.getAdminStats).not.toHaveBeenCalled();
  });

  it("fetches all-user history and admin stats for an admin", async () => {
    mockUseAuth.mockReturnValue({ user: adminUser, token: "token" });

    const { result } = renderHook(() => useConcerts(), { wrapper: ConcertsProvider });

    await waitFor(() => expect(result.current.state.loading).toBe(false));
    expect(mockApi.getAllHistory).toHaveBeenCalledWith("token");
    expect(mockApi.getMyHistory).not.toHaveBeenCalled();
    expect(mockApi.getAdminStats).toHaveBeenCalledWith("token");
  });

  it("reserve calls the API then refreshes concerts", async () => {
    mockUseAuth.mockReturnValue({ user: regularUser, token: "token" });
    mockApi.reserve.mockResolvedValue(undefined);

    const { result } = renderHook(() => useConcerts(), { wrapper: ConcertsProvider });
    await waitFor(() => expect(result.current.state.loading).toBe(false));
    mockApi.getConcerts.mockClear();

    await act(async () => {
      await result.current.reserve("concert-1");
    });

    expect(mockApi.reserve).toHaveBeenCalledWith("token", "concert-1");
    expect(mockApi.getConcerts).toHaveBeenCalledTimes(1);
  });

  it("createConcert calls the API then refreshes concerts", async () => {
    mockUseAuth.mockReturnValue({ user: adminUser, token: "token" });
    const input = { name: "New Show", description: "Fresh", totalSeats: 50 };
    mockApi.createConcert.mockResolvedValue({ ...input, id: "concert-2", reservedSeats: 0, isReservedByMe: false });

    const { result } = renderHook(() => useConcerts(), { wrapper: ConcertsProvider });
    await waitFor(() => expect(result.current.state.loading).toBe(false));
    mockApi.getConcerts.mockClear();

    await act(async () => {
      await result.current.createConcert(input);
    });

    expect(mockApi.createConcert).toHaveBeenCalledWith("token", input);
    expect(mockApi.getConcerts).toHaveBeenCalledTimes(1);
  });
});
