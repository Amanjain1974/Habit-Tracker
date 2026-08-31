import { getTimeLogs } from "@/actions/timelog.actions";
import TimerClient from "./TimerClient";
import DailyTimelineClient from "./DailyTimelineClient";

export default async function TimeLogPage() {
  const logs = await getTimeLogs();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Log</h1>
        <p className="text-muted-foreground mt-2">
          Track exactly where your 24 hours go. Spot the waste, maximize the productive.
        </p>
      </div>

      <DailyTimelineClient initialLogs={logs} />
      
      <div className="pt-8 border-t">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Focus Timer</h2>
        <TimerClient />
      </div>
    </div>
  );
}
