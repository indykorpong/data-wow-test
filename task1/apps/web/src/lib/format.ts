/**
 * Fixed locale AND fixed time zone. Both matter: these strings are produced
 * during the server render as well as the client render, and `Intl` would
 * otherwise pick up the machine's locale on one side and the browser's on the
 * other, producing a hydration mismatch.
 */
const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}
