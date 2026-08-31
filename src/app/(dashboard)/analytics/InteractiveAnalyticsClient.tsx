"use client";

import { useState } from "react";
import { Task, TimeLog, Habit, HabitLog } from "@prisma/client";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getWeekOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HabitWithLogs = Habit & { logs: HabitLog[] };

const COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#f43f5e', '#64748b', '#eab308', '#06b6d4'];

export default function InteractiveAnalyticsClient({ 
  initialTasks, 
  initialLogs, 
  initialHabits 
}: { 
  initialTasks: Task[], 
  initialLogs: TimeLog[], 
  initialHabits: HabitWithLogs[] 
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string | "ALL">("ALL");

  // 1. Generate Daily Data for Wavy Chart (Habit Completion % per day + Focus Mins)
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dailyData = daysInMonth.map(day => {
    // Habit completion % for this day
    const habitsDue = initialHabits.length;
    const habitsDone = initialHabits.filter(h => h.logs.some(l => isSameDay(new Date(l.date), day) && l.completed)).length;
    const habitPercent = habitsDue > 0 ? (habitsDone / habitsDue) * 100 : 0;

    // Time logged for this day
    const logsForDay = initialLogs.filter(l => isSameDay(new Date(l.startTime), day));
    const focusMins = logsForDay.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    return {
      date: format(day, "MMM dd"),
      dayNum: format(day, "d"),
      habitScore: Math.round(habitPercent),
      focusMins
    };
  });

  // 2. Monthly Overview Donut Chart (Based on Tasks & Habits)
  const totalTasks = initialTasks.length;
  const completedTasks = initialTasks.filter(t => t.status === "COMPLETED").length;
  
  const donutData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Left', value: Math.max(0, totalTasks - completedTasks) }
  ];

  const completionPercent = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0.0";

  // 3. Interactive Time Log Breakdown
  const categories = Array.from(new Set(initialLogs.map(l => l.category || "Uncategorized")));
  
  const filteredLogs = selectedCategory === "ALL" 
    ? initialLogs 
    : initialLogs.filter(l => (l.category || "Uncategorized") === selectedCategory);

  // Group filtered logs by Activity (Specific task)
  const activityDataMap = filteredLogs.reduce((acc, log) => {
    const act = log.activity || "Unknown";
    acc[act] = (acc[act] || 0) + (log.duration || 0);
    return acc;
  }, {} as Record<string, number>);

  const activityChartData = Object.keys(activityDataMap)
    .map(key => ({ name: key, duration: activityDataMap[key] }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10); // Top 10

  // 4. Weekly Global Progress Table (Like the spreadsheet)
  const weeks = [1, 2, 3, 4, 5];
  const weeklyStats = weeks.map(w => {
    const weekDays = daysInMonth.filter(d => getWeekOfMonth(d, { weekStartsOn: 1 }) === w);
    if (weekDays.length === 0) return null;
    
    // Calculate total habits completed in this week vs goal
    let weekCompleted = 0;
    let weekGoal = weekDays.length * initialHabits.length;
    
    weekDays.forEach(day => {
      weekCompleted += initialHabits.filter(h => h.logs.some(l => isSameDay(new Date(l.date), day) && l.completed)).length;
    });

    return {
      week: w,
      completed: weekCompleted,
      goal: weekGoal,
      left: Math.max(0, weekGoal - weekCompleted),
      percent: weekGoal > 0 ? Math.round((weekCompleted / weekGoal) * 100) : 0
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="font-bold text-lg">Overall Progress: {format(selectedMonth, "MMMM yyyy")}</h2>
        <input 
          type="month" 
          value={format(selectedMonth, "yyyy-MM")}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          className="border rounded p-1 text-sm bg-background"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* WAVY AREA CHART (Main Graph) */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">Daily Habit Completion % (Wavy Graph)</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="dayNum" tickLine={false} axisLine={false} tick={{fontSize: 10}} />
                <YAxis tickLine={false} axisLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value}%`, 'Completion']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="habitScore" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* DONUT OVERVIEW (Right Sidebar) */}
        <Card className="shadow-sm flex flex-col justify-center items-center relative">
          <CardHeader className="w-full text-center pb-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Overview Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f1f5f9" />
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-3xl font-bold text-primary">{completionPercent}%</span>
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* INTERACTIVE TIME LOG CHART */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Specific Task Time Distribution</CardTitle>
            <select 
              className="text-sm border rounded p-1 bg-background"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </CardHeader>
          <CardContent className="h-[300px]">
            {activityChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No logs found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityChartData} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `${v}m`} />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 11}} width={100} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(val) => [`${val} mins`, 'Duration']} />
                  <Bar dataKey="duration" radius={[0, 4, 4, 0]}>
                    {activityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* WEEKLY GLOBAL PROGRESS TABLE (Spreadsheet style) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground">Global Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center border-collapse">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="p-2 border font-medium text-left">Metric</th>
                    {weeklyStats.map(w => (
                      <th key={w?.week} className="p-2 border font-medium">WEEK {w?.week}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-semibold text-left">COMPLETED</td>
                    {weeklyStats.map(w => (
                      <td key={w?.week} className="p-2 border text-primary font-bold">{w?.completed}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold text-left text-muted-foreground">POSSIBLE (Habits × Days)</td>
                    {weeklyStats.map(w => (
                      <td key={w?.week} className="p-2 border text-muted-foreground">{w?.goal}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold text-left text-muted-foreground">LEFT</td>
                    {weeklyStats.map(w => (
                      <td key={w?.week} className="p-2 border text-muted-foreground">{w?.left}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold text-left">WEEKLY %</td>
                    {weeklyStats.map(w => (
                      <td key={w?.week} className="p-2 border font-bold">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{w?.percent}%</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
