import { getTimeLogs } from "@/actions/timelog.actions";
import TimerClient from "./TimerClient";
import TimeLogHistory from "./TimeLogHistory";
import CreateLogModal from "./CreateLogModal";

export default async function TimeLogPage() {
  const logs = await getTimeLogs();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time & Focus</h1>
          <p className="text-muted-foreground mt-2">
            Track where your time goes.
          </p>
        </div>
        <CreateLogModal />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <TimerClient />
        <TimeLogHistory logs={logs} />
      </div>
    </div>
  );
}
