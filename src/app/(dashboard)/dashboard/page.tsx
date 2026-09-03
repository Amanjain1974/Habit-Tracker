import { getTasks } from "@/actions/task.actions";
import { getHabits } from "@/actions/habit.actions";
import { getTimeLogs } from "@/actions/timelog.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CheckCircle2, Flame, Target } from "lucide-react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import TopPrioritiesClient from "./TopPrioritiesClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const [tasks, habits, logs] = await Promise.all([
    getTasks(),
    getHabits(),
    getTimeLogs()
  ]);

  const today = new Date();

  // Task Stats
  const activeTasks = tasks.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED" && t.completedAt && isSameDay(new Date(t.completedAt), today));
  const finishRate = activeTasks.length + completedTasks.length > 0 
    ? Math.round((completedTasks.length / (activeTasks.length + completedTasks.length)) * 100) 
    : 0;
  
  // Top Priorities
  const topPriorities = activeTasks.filter(t => t.matrixColumn === 1).slice(0, 3);
  if (topPriorities.length < 3) {
    const col2 = activeTasks.filter(t => t.matrixColumn === 2);
    topPriorities.push(...col2.slice(0, 3 - topPriorities.length));
  }

  // Habit Stats
  const todayHabitsCompleted = habits.filter(h => 
    h.logs.some(log => isSameDay(new Date(log.date), today) && log.completed)
  ).length;
  const habitPercentage = habits.length > 0 ? Math.round((todayHabitsCompleted / habits.length) * 100) : 0;

  // Time Stats
  const todayLogs = logs.filter(log => isSameDay(new Date(log.startTime), today));
  const focusTimeMins = todayLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
  const focusTimeHours = Math.floor(focusTimeMins / 60);
  const focusTimeRemainingMins = focusTimeMins % 60;

  const firstName = session?.user?.name?.split(" ")[0] || "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Overall Productivity Score (Mocked for hero visualization)
  const productivityScore = Math.min(100, Math.round((finishRate + habitPercentage + (focusTimeMins > 120 ? 100 : (focusTimeMins/120)*100)) / 3)) || 0;

  return (
    <div className="space-y-12 pb-12 max-w-5xl mx-auto overflow-x-hidden">
      
      {/* HEADER */}
      <div className="py-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          {activeTasks.length} active tasks • {habitPercentage}% habit consistency
        </p>
      </div>

      {/* TOP PRIORITIES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
            Top Priorities
          </h2>
          <Link href="/priority" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Matrix →
          </Link>
        </div>
        <div>
          <TopPrioritiesClient initialPriorities={topPriorities} />
        </div>
      </div>

      {/* SECONDARY METRICS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Habit Card */}
        <div className="rounded-xl p-6 bg-card border border-border flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground tracking-wide uppercase mb-1">Consistency</h3>
            <p className="text-2xl font-bold">{habitPercentage}%</p>
          </div>
          <div className="mt-6 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${habitPercentage}%` }} />
          </div>
        </div>

        {/* Focus Card */}
        <div className="rounded-xl p-6 bg-card border border-border flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground tracking-wide uppercase mb-1">Deep Work</h3>
            <p className="text-2xl font-bold">{focusTimeHours}<span className="text-base text-muted-foreground font-medium">h</span> {focusTimeRemainingMins}<span className="text-base text-muted-foreground font-medium">m</span></p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${focusTimeMins > 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            <span className="text-xs font-medium text-muted-foreground">{focusTimeMins > 0 ? 'Active Focus Today' : 'Awaiting Session'}</span>
          </div>
        </div>

        {/* Coach Insight */}
        <div className="rounded-xl p-6 bg-card border border-border flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground tracking-wide uppercase mb-2">Coach Insight</h3>
            <p className="text-sm font-medium text-foreground/80 leading-relaxed">
              {finishRate > 80 ? "Outstanding momentum. Rest is productive too." 
                : "Try breaking your top priority into a 25-minute focus session."}
            </p>
          </div>
          <Link href="/review" className="mt-4 text-xs font-bold text-primary hover:underline">
            View full analysis →
          </Link>
        </div>
      </div>
    </div>
  );
}
