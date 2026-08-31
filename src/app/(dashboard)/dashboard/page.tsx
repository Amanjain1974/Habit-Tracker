import { getTasks } from "@/actions/task.actions";
import { getHabits } from "@/actions/habit.actions";
import { getTimeLogs } from "@/actions/timelog.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CheckCircle2, Flame, Target } from "lucide-react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import TopPrioritiesClient from "./TopPrioritiesClient";
import HeroClient from "./HeroClient";

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
    <div className="space-y-12 pb-12 max-w-6xl mx-auto overflow-x-hidden">
      
      {/* 3D HERO SECTION */}
      <HeroClient 
        greeting={greeting} 
        firstName={firstName} 
        activeTaskCount={activeTasks.length} 
        finishRate={finishRate} 
      />

      {/* TOP PRIORITIES */}
      <div className="animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Flame className="h-5 w-5 text-primary" /> Finish These First
          </h2>
          <Link href="/priority" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Command Center →
          </Link>
        </div>
        <div className="p-1">
          <TopPrioritiesClient initialPriorities={topPriorities} />
        </div>
      </div>

      {/* SECONDARY METRICS */}
      <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up stagger-3">
        {/* Habit Card */}
        <div className="rounded-2xl p-6 bg-card border border-border/50 hover-tilt flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground tracking-wide uppercase mb-1">Consistency</h3>
            <p className="text-3xl font-bold">{habitPercentage}%</p>
          </div>
          <div className="mt-6 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-[#22D3EE] h-full rounded-full" style={{ width: `${habitPercentage}%`, transition: 'width 1s ease-out' }} />
          </div>
        </div>

        {/* Focus Card */}
        <div className="rounded-2xl p-6 bg-card border border-border/50 hover-tilt flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground tracking-wide uppercase mb-1">Deep Work</h3>
            <p className="text-3xl font-bold">{focusTimeHours}<span className="text-lg text-muted-foreground font-medium">h</span> {focusTimeRemainingMins}<span className="text-lg text-muted-foreground font-medium">m</span></p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${focusTimeMins > 0 ? 'bg-success animate-pulse-glow' : 'bg-muted-foreground'}`} />
            <span className="text-xs font-medium text-muted-foreground">{focusTimeMins > 0 ? 'Active Focus Today' : 'Awaiting Session'}</span>
          </div>
        </div>

        {/* Coach Insight */}
        <div className="rounded-2xl p-6 bg-primary/5 border border-primary/20 hover-tilt flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div>
            <h3 className="font-semibold text-sm text-primary tracking-wide uppercase mb-2">Coach Insight</h3>
            <p className="text-sm font-medium leading-relaxed">
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
