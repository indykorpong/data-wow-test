import { HistoryTable } from "@/components/domain/HistoryTable";

export default function AdminHistoryPage() {
  return (
    <div className="u-container">
      {/* The Figma History frame shows only the table — no stat cards, no tabs —
          which is why this route sits outside the admin (home) layout. */}
      <h1 className="u-sr-only">History</h1>
      <HistoryTable />
    </div>
  );
}
