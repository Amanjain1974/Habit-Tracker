import { getTasks } from "@/actions/task.actions";
import { getHabits } from "@/actions/habit.actions";
import { getTimeLogs } from "@/actions/timelog.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { format, isSameDay } from "date-fns";
import TopPrioritiesClient from "./TopPrioritiesClient";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

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
  
  // Top 3 Priorities (Important & Urgent -> Column 1)
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

  const totalPlannedToday = activeTasks.length + completedTasks.length;
  const completionPercentage = totalPlannedToday > 0 ? Math.round((completedTasks.length / totalPlannedToday) * 100) : 0;

  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";

  const firstName = session?.user?.name?.split(" ")[0] || "User";

  return (
    <div className="max-w-4xl mx-auto space-y-12 pt-4">
      
      {/* HEADER SECTION - Minimal and focused */}
      <div className="space-y-6 border-b pb-8">
        <div>
          <p className="text-muted-foreground font-medium mb-1">{format(today, "EEEE, MMMM do")}</p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="text-xl text-muted-foreground mt-2">What's worth finishing today?</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-sm">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Today's Progress</span>
              <span className="text-primary">{completedTasks.length} / {totalPlannedToday}</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TOP PRIORITIES - The most important section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Finish These First
          </h2>
          <Link href="/priority" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 group transition-colors">
            Matrix <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <TopPrioritiesClient initialPriorities={topPriorities} />
      </div>

      {/* SECONDARY INSIGHTS - Clean, text-heavy, NOT boxed in heavy cards */}
      <div className="grid md:grid-cols-2 gap-12 pt-8 border-t">
        {/* HABITS */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Daily Routines</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold">{habitPercentage}%</span>
              <span className="text-muted-foreground font-medium mb-1">{todayHabitsCompleted} of {habits.length} habits done</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-foreground rounded-full transition-all duration-1000" style={{ width: `${habitPercentage}%` }} />
            </div>
            <Link href="/habits" className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
              Review habits →
            </Link>
          </div>
        </div>

        {/* FOCUS */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Deep Work</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold">{focusTimeHours}<span className="text-2xl text-muted-foreground">h</span> {focusTimeRemainingMins}<span className="text-2xl text-muted-foreground">m</span></span>
              <span className="text-muted-foreground font-medium mb-1">focused today</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {focusTimeMins === 0 
                ? "You haven't logged any deep work yet. Start a 25-minute Pomodoro session to build momentum."
                : "Great job dedicating time to deep work. Quality over quantity."}
            </p>
            <Link href="/timelog" className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
              Start timer →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
