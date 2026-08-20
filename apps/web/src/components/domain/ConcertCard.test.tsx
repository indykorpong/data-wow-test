import { render, screen } from "@testing-library/react";
import { ConcertCard } from "./ConcertCard";
import type { Concert } from "@/lib/types";

const concert: Concert = {
  id: "concert-1",
  name: "Rock Night",
  description: "A loud evening of guitars.",
  totalSeats: 1200,
  reservedSeats: 400,
  isReservedByMe: false,
};

describe("ConcertCard", () => {
  it("renders the concert name, description and formatted seat count", () => {
    render(<ConcertCard concert={concert} />);

    expect(screen.getByRole("heading", { name: "Rock Night" })).toBeInTheDocument();
    expect(screen.getByText("A loud evening of guitars.")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("renders the action slot when provided", () => {
    render(<ConcertCard concert={concert} action={<button>Reserve</button>} />);

    expect(screen.getByRole("button", { name: "Reserve" })).toBeInTheDocument();
  });

  it("omits the action slot when not provided", () => {
    render(<ConcertCard concert={concert} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
