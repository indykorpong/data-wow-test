import { HistoryTable } from "@/components/domain/HistoryTable";

export default function UserHistoryPage() {
  return (
    <div className="u-container">
      <h1 className="u-sr-only">History</h1>
      <HistoryTable />
    </div>
  );
}
