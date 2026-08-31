import { getTasks, updateTaskStatus } from "@/actions/task.actions";
import { getHabits, toggleHabitLog } from "@/actions/habit.actions";
import { getTimeLogs } from "@/actions/timelog.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CheckCircle2, Circle, Flame, Target } from "lucide-react";
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
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");
  const finishRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  // Top 3 Priorities (Important & Urgent -> Column 1, or just top 3 active)
  const topPriorities = activeTasks.filter(t => t.matrixColumn === 1).slice(0, 3);
  if (topPriorities.length < 3) {
    const col2 = activeTasks.filter(t => t.matrixColumn === 2);
    topPriorities.push(...col2.slice(0, 3 - topPriorities.length));
  }

  // Habit Stats (Completed today)
  const todayHabitsCompleted = habits.filter(h => 
    h.logs.some(log => isSameDay(new Date(log.date), today) && log.completed)
  ).length;
  
  const habitPercentage = habits.length > 0 ? Math.round((todayHabitsCompleted / habits.length) * 100) : 0;

  // Time Stats
  const todayLogs = logs.filter(log => isSameDay(new Date(log.startTime), today));
  const focusTimeMins = todayLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
  const focusTimeHours = Math.floor(focusTimeMins / 60);
  const focusTimeRemainingMins = focusTimeMins % 60;

  // Context-Aware Motivational Message
  let message = "Let's finish what matters today.";
  if (finishRate === 100 && tasks.length > 0) message = "Everything planned is finished. That's consistency.";
  else if (habitPercentage === 100 && habits.length > 0) message = "Your habits are becoming your identity.";
  else if (topPriorities.length === 0 && activeTasks.length > 0) message = "No immediate priorities set. Review your matrix.";
  else if (activeTasks.length > 10) message = "You have many active tasks. Try focusing on just 3 today.";

  return (
    <div className="space-y-8">
      {/* GREETING */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Good {new Date().getHours() < 12 ? 'Morning' : 'Day'}, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-lg italic">"{message}"</p>
      </div>

      {/* TODAY'S PROGRESS SUMMARY */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground">Today's Finish Rate</h3>
          <p className="text-4xl font-bold mt-2 text-primary">{finishRate}%</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground">Active Tasks</h3>
          <p className="text-4xl font-bold mt-2">{activeTasks.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground">Habits Completed</h3>
          <p className="text-4xl font-bold mt-2">{todayHabitsCompleted} <span className="text-lg font-normal text-muted-foreground">/ {habits.length}</span></p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-semibold text-sm text-muted-foreground">Time Logged</h3>
          <p className="text-4xl font-bold mt-2">{focusTimeHours}h {focusTimeRemainingMins}m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TOP 3 PRIORITIES */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-6 border-red-500/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 text-red-500" /> Top Priorities
            </h2>
            <Link href="/priority" className="text-sm text-primary hover:underline">View Matrix</Link>
          </div>
          <TopPrioritiesClient initialPriorities={topPriorities} />
        </div>

        {/* SIDE SNIPPETS */}
        <div className="space-y-8">
          {/* HABIT PROGRESS */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Today's Habits
            </h2>
            <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
              <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${habitPercentage}%` }}></div>
            </div>
            <p className="text-sm text-center font-medium">{habitPercentage}% Completed</p>
            <div className="mt-4 text-center">
              <Link href="/habits" className="text-sm text-primary hover:underline">Update Habits</Link>
            </div>
          </div>

          {/* GOAL SNIPPET */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" /> Goal Focus
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Remember, finishing small tasks consistently builds toward your long-term goals.
            </p>
            <div className="text-center">
              <Link href="/goals" className="text-sm text-primary hover:underline">Review Goals</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
