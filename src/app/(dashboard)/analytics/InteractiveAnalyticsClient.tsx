"use client";

import { useState, useMemo } from "react";
import { Task, TimeLog, Habit } from "@prisma/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, eachWeekOfInterval, addMonths, startOfWeek, endOfWeek, subDays, formatISO } from "date-fns";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HabitWithLogs = Habit & { logs: { date: Date, completed: boolean }[] };

const COLORS = ['#15803D', '#0284C7', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function InteractiveAnalyticsClient({
  initialTasks,
  initialLogs,
  initialHabits
}: {
  initialTasks: Task[];
  initialLogs: TimeLog[];
  initialHabits: HabitWithLogs[];
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  // WAVY AREA GRAPH: Daily Habit Completion
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) });
    return days.map(day => {
      const activeHabits = initialHabits.length;
      if (activeHabits === 0) return { date: format(day, "MMM dd"), dayNum: format(day, "d"), habitScore: 0 };
      
      const completed = initialHabits.filter(h => 
        h.logs.some(l => isSameDay(new Date(l.date), day) && l.completed)
      ).length;
      
      return {
        date: format(day, "MMM dd"),
        dayNum: format(day, "d"),
        habitScore: Math.round((completed / activeHabits) * 100),
        fullDate: day
      };
    });
  }, [selectedMonth, initialHabits]);

  // GITHUB STYLE HEATMAP DATA
  // Generate last 90 days
  const heatmapData = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 90);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const activeHabits = initialHabits.length;
      let score = 0;
      if (activeHabits > 0) {
        const completed = initialHabits.filter(h => 
          h.logs.some(l => isSameDay(new Date(l.date), day) && l.completed)
        ).length;
        score = completed / activeHabits;
      }
      return {
        date: format(day, "yyyy-MM-dd"),
        score
      };
    });
  }, [initialHabits]);

  // CATEGORY DONUT DATA (Time Logs)
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    initialLogs.forEach(log => {
      const cat = log.category || "Uncategorized";
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + (log.duration || 0));
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [initialLogs]);

  // OVERVIEW MONTHLY METRICS
  const monthHabitsPossible = initialHabits.length * dailyData.length;
  const monthHabitsCompleted = dailyData.reduce((acc, curr) => acc + (curr.habitScore * initialHabits.length / 100), 0);
  const completionPercent = monthHabitsPossible > 0 ? Math.round((monthHabitsCompleted / monthHabitsPossible) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <h2 className="font-bold text-lg font-serif">Analytics: {format(selectedMonth, "MMMM yyyy")}</h2>
        <input 
          type="month" 
          value={format(selectedMonth, "yyyy-MM")}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          className="border rounded p-1.5 text-sm bg-background"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* WAVY AREA CHART (Main Graph) */}
        <Card className="lg:col-span-3 shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Daily Habit Completion</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#15803D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="dayNum" tickLine={false} axisLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} />
                <YAxis tickLine={false} axisLine={false} tick={{fontSize: 10, fill: 'hsl(var(--muted-foreground))'}} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value}%`, 'Completion']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="habitScore" 
                  stroke="#15803D" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  activeDot={{ r: 6, fill: '#15803D', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* OVERALL DONUT */}
        <Card className="shadow-sm border-border bg-card flex flex-col justify-center items-center relative">
          <CardHeader className="w-full text-center pb-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Month Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{value: completionPercent}, {value: 100 - completionPercent}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#15803D" />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-3xl font-bold text-foreground">{completionPercent}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIME CATEGORY DONUT */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Time Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No time logs found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    dataKey="value"
                    nameKey="name"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val: number) => [`${Math.round(val/60)}h ${val%60}m`, 'Time']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* GITHUB STYLE HEATMAP (LAST 90 DAYS) */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">90-Day Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1 p-2 bg-background rounded-lg border">
              {heatmapData.map((day, i) => {
                // Determine color intensity based on score
                let bgClass = "bg-muted";
                if (day.score > 0) bgClass = "bg-[#15803D]/20";
                if (day.score >= 0.4) bgClass = "bg-[#15803D]/50";
                if (day.score >= 0.7) bgClass = "bg-[#15803D]/80";
                if (day.score === 1) bgClass = "bg-[#15803D]";
                
                return (
                  <div 
                    key={i} 
                    title={`${day.date}: ${Math.round(day.score * 100)}%`}
                    className={`w-3 h-3 rounded-sm ${bgClass} transition-colors hover:ring-1 hover:ring-foreground cursor-pointer`}
                  />
                )
              })}
            </div>
            <div className="flex justify-end items-center gap-1 mt-3 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="w-2 h-2 rounded-sm bg-muted" />
              <div className="w-2 h-2 rounded-sm bg-[#15803D]/20" />
              <div className="w-2 h-2 rounded-sm bg-[#15803D]/50" />
              <div className="w-2 h-2 rounded-sm bg-[#15803D]/80" />
              <div className="w-2 h-2 rounded-sm bg-[#15803D]" />
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
