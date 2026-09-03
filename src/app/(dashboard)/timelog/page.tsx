import { getTimeLogs } from "@/actions/timelog.actions";
import TimeLogClient from "./TimeLogClient";

export default async function TimeLogPage() {
  const logs = await getTimeLogs();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-tight">Time Log</h1>
        <p className="text-muted-foreground mt-2">
          Track exactly where your 24 hours go. Spot the waste, maximize the productive.
        </p>
      </div>

      <TimeLogClient initialLogs={logs} />
    </div>
  );
}
