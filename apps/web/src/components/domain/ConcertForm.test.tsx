import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConcertForm } from "./ConcertForm";
import { ApiError } from "@/lib/api";
import { useConcerts } from "@/store/ConcertsContext";
import { useToast } from "@/store/ToastContext";

jest.mock("@/store/ConcertsContext", () => ({
  useConcerts: jest.fn(),
}));
jest.mock("@/store/ToastContext", () => ({
  useToast: jest.fn(),
}));

const mockUseConcerts = useConcerts as jest.Mock;
const mockUseToast = useToast as jest.Mock;

describe("ConcertForm", () => {
  let createConcert: jest.Mock;
  let showToast: jest.Mock;

  beforeEach(() => {
    createConcert = jest.fn().mockResolvedValue(undefined);
    showToast = jest.fn();
    mockUseConcerts.mockReturnValue({ createConcert });
    mockUseToast.mockReturnValue({ showToast });
  });

  it("shows validation errors for all required fields and does not submit", async () => {
    const user = userEvent.setup();
    render(<ConcertForm />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Concert name is required.")).toBeInTheDocument();
    expect(screen.getByText("Total of seat is required.")).toBeInTheDocument();
    expect(screen.getByText("Description is required.")).toBeInTheDocument();
    expect(createConcert).not.toHaveBeenCalled();
  });

  it("rejects a total seats of zero", async () => {
    const user = userEvent.setup();
    render(<ConcertForm />);

    await user.type(screen.getByLabelText("Concert Name"), "Rock Night");
    await user.type(screen.getByLabelText("Total of seat"), "0");
    await user.type(screen.getByLabelText("Description"), "Loud music");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Enter a whole number greater than zero."),
    ).toBeInTheDocument();
    expect(createConcert).not.toHaveBeenCalled();
  });

  it("submits trimmed values, shows a success toast and resets the form", async () => {
    const user = userEvent.setup();
    render(<ConcertForm />);

    await user.type(screen.getByLabelText("Concert Name"), "  Rock Night  ");
    await user.type(screen.getByLabelText("Total of seat"), "150");
    await user.type(screen.getByLabelText("Description"), "  Loud music  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(createConcert).toHaveBeenCalledWith({
      name: "Rock Night",
      description: "Loud music",
      totalSeats: 150,
    });
    expect(await screen.findByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith("Create successfully");
    expect(screen.getByLabelText("Concert Name")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
  });

  it("shows the API error message in an error toast when creation fails", async () => {
    createConcert.mockRejectedValue(new ApiError("Name already taken"));
    const user = userEvent.setup();
    render(<ConcertForm />);

    await user.type(screen.getByLabelText("Concert Name"), "Rock Night");
    await user.type(screen.getByLabelText("Total of seat"), "150");
    await user.type(screen.getByLabelText("Description"), "Loud music");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith("Name already taken", "error");
  });
});
