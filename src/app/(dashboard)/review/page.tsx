import { getTasks } from "@/actions/task.actions";
import { getHabits } from "@/actions/habit.actions";
import { getTimeLogs } from "@/actions/timelog.actions";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { isSameDay, subDays } from "date-fns";

export default async function ReviewPage() {
  const [tasks, habits, logs] = await Promise.all([getTasks(), getHabits(), getTimeLogs()]);
  const today = new Date();

  // Daily Stats
  const completedToday = tasks.filter(t => t.status === "COMPLETED" && t.completedAt && isSameDay(new Date(t.completedAt), today)).length;
  const postponedToday = tasks.filter(t => t.status === "POSTPONED").length;
  
  const todayLogs = logs.filter(log => isSameDay(new Date(log.startTime), today));
  const focusTime = Math.round(todayLogs.reduce((acc, log) => acc + (log.duration || 0), 0) / 60);

  const habitsCompletedToday = habits.filter(h => 
    h.logs.some(log => isSameDay(new Date(log.date), today) && log.completed)
  ).length;

  // Productivity Coach Logic
  let coachInsight = "You are on track. Keep up the good work.";
  let coachType = "success"; // success, warning, info

  const activeCount = tasks.filter(t => t.status !== "COMPLETED").length;
  
  if (activeCount > 15) {
    coachInsight = `You have ${activeCount} active tasks. Finish at least 3 before adding more to prevent burnout.`;
    coachType = "warning";
  } else if (postponedToday > 3) {
    coachInsight = "You've postponed several tasks today. Consider breaking them into smaller steps or re-evaluating their importance.";
    coachType = "warning";
  } else if (focusTime === 0 && completedToday > 0) {
    coachInsight = "You're finishing tasks, but not logging deep work time. Try a 25-minute focus session tomorrow.";
    coachType = "info";
  } else if (habitsCompletedToday === habits.length && habits.length > 0) {
    coachInsight = "Perfect habit consistency today! This is how long-term goals are achieved.";
    coachType = "success";
  } else if (completedToday > 5) {
    coachInsight = `Excellent work finishing ${completedToday} tasks today. You've earned a rest.`;
    coachType = "success";
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Review</h1>
        <p className="text-muted-foreground mt-2">
          Reflect on what you accomplished and plan for tomorrow.
        </p>
      </div>

      <div className={`p-6 rounded-xl border flex gap-4 items-start ${
        coachType === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
        coachType === 'success' ? 'bg-green-500/10 border-green-500/30' :
        'bg-blue-500/10 border-blue-500/30'
      }`}>
        <div className={`p-3 rounded-full ${
          coachType === 'warning' ? 'bg-orange-500/20 text-orange-500' :
          coachType === 'success' ? 'bg-green-500/20 text-green-500' :
          'bg-blue-500/20 text-blue-500'
        }`}>
          {coachType === 'warning' ? <AlertTriangle className="h-6 w-6" /> :
           coachType === 'success' ? <CheckCircle2 className="h-6 w-6" /> :
           <Lightbulb className="h-6 w-6" />}
        </div>
        <div>
          <h2 className="text-lg font-bold">Productivity Coach</h2>
          <p className="mt-1">{coachInsight}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-xl p-6 bg-card text-center">
          <p className="text-4xl font-bold text-primary">{completedToday}</p>
          <p className="text-sm font-medium text-muted-foreground mt-2">Tasks Finished</p>
        </div>
        <div className="border rounded-xl p-6 bg-card text-center">
          <p className="text-4xl font-bold text-primary">{focusTime}h</p>
          <p className="text-sm font-medium text-muted-foreground mt-2">Deep Work Time</p>
        </div>
        <div className="border rounded-xl p-6 bg-card text-center">
          <p className="text-4xl font-bold text-primary">{habitsCompletedToday}/{habits.length}</p>
          <p className="text-sm font-medium text-muted-foreground mt-2">Habits Done</p>
        </div>
        <div className="border rounded-xl p-6 bg-card text-center">
          <p className="text-4xl font-bold text-destructive">{postponedToday}</p>
          <p className="text-sm font-medium text-muted-foreground mt-2">Tasks Postponed</p>
        </div>
      </div>
    </div>
  );
}
