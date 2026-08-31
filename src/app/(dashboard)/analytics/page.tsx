import { getTasks } from "@/actions/task.actions";
import { getTimeLogs } from "@/actions/timelog.actions";
import { getHabits } from "@/actions/habit.actions";
import InteractiveAnalyticsClient from "./InteractiveAnalyticsClient";

export default async function AnalyticsPage() {
  const tasks = await getTasks();
  const logs = await getTimeLogs();
  const habits = await getHabits();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Deep dive into your productivity patterns, time logs, and daily progress.
        </p>
      </div>

      <InteractiveAnalyticsClient initialTasks={tasks} initialLogs={logs} initialHabits={habits} />
    </div>
  );
}
