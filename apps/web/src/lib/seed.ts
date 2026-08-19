import type { ConcertsState } from "./types";

/**
 * Sample data lifted from the Figma frames so the screens match the design on
 * first paint. State is in-memory only, so this is also what a refresh returns
 * to.
 *
 * Note: the design's stat cards read 500 / 120 / 12, but its Overview lists two
 * concerts of 500 and 200 seats. Those mockup numbers are not consistent with
 * each other, so the cards here are computed from real state instead of being
 * hardcoded — "Total of seats" therefore reads 700 on first load.
 */

/** The signed-in identity. There is no auth this task; the role is what varies. */
export const CURRENT_USER = "Somchai Prasert";

const LOREM_LONG =
  "Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a. Proin dolor morbi id ornare aenean non. Fusce dignissim turpis sed non est orci sed in. Blandit ut purus nunc sed donec commodo morbi diam scelerisque.";

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet consectetur. Elit purus nam gravida porttitor nibh urna sit ornare a.";

export const initialConcertsState: ConcertsState = {
  concerts: [
    {
      id: "concert-1",
      name: "Concert Name 1",
      description: LOREM_LONG,
      totalSeats: 500,
    },
    {
      id: "concert-2",
      name: "Concert Name 2",
      description: LOREM_SHORT,
      totalSeats: 200,
    },
  ],
  // Consistent with the history below: concert 1 and 2 were reserved, then 2
  // was cancelled — so only concert 1 is still held.
  reservedConcertIds: ["concert-1"],
  // Fixed timestamps, not `Date.now()` — a seed evaluated during render must
  // produce identical markup on the server and the client.
  history: [
    {
      id: "history-1",
      dateTime: "2024-08-12T10:24:00.000Z",
      username: CURRENT_USER,
      concertName: "Concert Name 1",
      action: "reserve",
    },
    {
      id: "history-2",
      dateTime: "2024-08-12T14:05:00.000Z",
      username: CURRENT_USER,
      concertName: "Concert Name 2",
      action: "reserve",
    },
    {
      id: "history-3",
      dateTime: "2024-08-13T09:41:00.000Z",
      username: CURRENT_USER,
      concertName: "Concert Name 2",
      action: "cancel",
    },
  ],
};
