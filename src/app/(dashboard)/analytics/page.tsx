import { getTasks } from "@/actions/task.actions";
import { getTimeLogs } from "@/actions/timelog.actions";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default async function AnalyticsPage() {
  const tasks = await getTasks();
  const logs = await getTimeLogs();

  // Basic Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "COMPLETED").length;
  const finishRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const postponedTasks = tasks.filter(t => t.postponeCount > 0).length;

  // Time Distribution
  const timeByCategory = logs.reduce((acc, log) => {
    const cat = log.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + (log.duration || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(timeByCategory).map(key => ({
    name: key,
    value: timeByCategory[key]
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Measure what matters. Improve your focus.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-muted-foreground text-sm">Finish Rate</h3>
          <p className="text-4xl font-bold mt-2 text-primary">{finishRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{completedTasks} of {totalTasks} tasks completed</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-muted-foreground text-sm">Total Focus Time</h3>
          <p className="text-4xl font-bold mt-2">
            {Math.round(logs.reduce((acc, log) => acc + (log.duration || 0), 0) / 60)}h
          </p>
          <p className="text-xs text-muted-foreground mt-1">Logged across {logs.length} sessions</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-muted-foreground text-sm">Postponement Rate</h3>
          <p className="text-4xl font-bold mt-2 text-destructive">
            {totalTasks > 0 ? Math.round((postponedTasks / totalTasks) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tasks delayed at least once</p>
        </div>
      </div>

      <AnalyticsDashboard chartData={chartData} />
    </div>
  );
}
