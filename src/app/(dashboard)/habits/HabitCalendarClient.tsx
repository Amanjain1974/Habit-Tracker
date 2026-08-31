"use client";

import { useState } from "react";
import { Habit, HabitLog } from "@prisma/client";
import { toggleHabitLog, deleteHabit } from "@/actions/habit.actions";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  startOfDay,
  getWeekOfMonth,
  addMonths,
  subMonths
} from "date-fns";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type HabitWithLogs = Habit & { logs: HabitLog[] };

export default function HabitCalendarClient({ initialHabits }: { initialHabits: HabitWithLogs[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate days for the selected month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group days by week for the header
  const weeks: { weekNum: number; days: Date[] }[] = [];
  daysInMonth.forEach(day => {
    const weekNum = getWeekOfMonth(day, { weekStartsOn: 1 });
    let weekObj = weeks.find(w => w.weekNum === weekNum);
    if (!weekObj) {
      weekObj = { weekNum, days: [] };
      weeks.push(weekObj);
    }
    weekObj.days.push(day);
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] text-muted-foreground uppercase bg-blue-500/5">
              {/* TOP HEADER ROW: Week grouping & Overall Progress */}
              <tr>
                <th className="px-4 py-2 border-r border-b font-bold w-[250px] min-w-[200px]" rowSpan={2}>
                  DAILY HABITS
                </th>
                <th className="px-2 py-2 border-r border-b font-bold text-center" rowSpan={2}>
                  GOALS
                </th>
                
                {/* WEEKS */}
                {weeks.map(week => (
                  <th 
                    key={week.weekNum} 
                    colSpan={week.days.length} 
                    className="py-1 border-r border-b text-center font-bold"
                  >
                    WEEK {week.weekNum}
                  </th>
                ))}
                
                <th className="px-2 py-1 border-b text-center font-bold" colSpan={4}>
                  OVERALL PROGRESS
                </th>
              </tr>

              {/* SECOND HEADER ROW: Days of the week and dates */}
              <tr>
                {daysInMonth.map(day => (
                  <th key={day.toString()} className="border-r border-b px-1 py-1 text-center min-w-[32px]">
                    <div className="flex flex-col items-center">
                      <span>{format(day, 'EE').charAt(0)}</span>
                      <span className="text-foreground">{format(day, 'd')}</span>
                    </div>
                  </th>
                ))}
                
                <th className="px-2 py-1 border-r border-b text-center rotate-180" style={{ writingMode: 'vertical-rl' }}>COMPLETED</th>
                <th className="px-2 py-1 border-r border-b text-center rotate-180" style={{ writingMode: 'vertical-rl' }}>LEFT</th>
                <th className="px-2 py-1 border-r border-b text-center rotate-180" style={{ writingMode: 'vertical-rl' }}>%</th>
                <th className="px-2 py-1 border-b text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {initialHabits.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth.length + 6} className="px-6 py-8 text-center text-muted-foreground">
                    No habits created yet. Start tracking today!
                  </td>
                </tr>
              ) : (
                initialHabits.map((habit, idx) => (
                  <HabitRow 
                    key={habit.id} 
                    habit={habit} 
                    daysInMonth={daysInMonth} 
                    index={idx + 1}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HabitRow({ habit, daysInMonth, index }: { habit: HabitWithLogs, daysInMonth: Date[], index: number }) {
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  
  const handleToggle = async (date: Date) => {
    const dateStr = date.toISOString();
    setLoadingDate(dateStr);
    await toggleHabitLog(habit.id, dateStr);
    setLoadingDate(null);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this habit? All history will be lost.")) {
      await deleteHabit(habit.id);
    }
  }

  // Calculate Stats
  const target = habit.targetCount || 30; // Default to 30 if not set like spreadsheet
  
  // Total completed ever (or just this month based on preference, but spreadsheet shows overall)
  // We'll calculate completed THIS MONTH to match the visual grid, or overall if requested.
  // The spreadsheet shows 2 completed out of 30, meaning overall tracking for that goal.
  const completedTotal = habit.logs.filter(l => l.completed).length; 
  const left = Math.max(0, target - completedTotal);
  const percentage = target > 0 ? Math.round((completedTotal / target) * 100) : 0;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-2 border-r font-medium text-sm flex gap-2 items-center">
        <span className="text-muted-foreground w-4 text-xs">{index}</span>
        <span className="truncate max-w-[180px]">{habit.title}</span>
      </td>
      <td className="px-2 py-2 border-r text-center font-bold text-xs bg-blue-500/5">
        {target}
      </td>
      
      {daysInMonth.map(day => {
        const isCompleted = habit.logs.some(log => isSameDay(new Date(log.date), day) && log.completed);
        const dateStr = day.toISOString();
        const isLoading = loadingDate === dateStr;
        const isFuture = startOfDay(day) > startOfDay(new Date());

        return (
          <td key={day.toString()} className="border-r px-0.5 py-1 text-center">
            <button
              disabled={isLoading || isFuture}
              onClick={() => handleToggle(day)}
              className={`
                h-5 w-5 mx-auto rounded-[3px] border flex items-center justify-center transition-all
                ${isFuture ? 'opacity-30 cursor-not-allowed bg-muted/50 border-muted' : 'cursor-pointer hover:border-primary'}
                ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-transparent border-input'}
              `}
            >
              {isLoading && <div className="h-2 w-2 rounded-full border border-current border-t-transparent animate-spin" />}
              {isCompleted && !isLoading && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          </td>
        )
      })}

      <td className="px-2 py-2 border-r text-center font-medium text-xs bg-blue-500/5">{completedTotal}</td>
      <td className="px-2 py-2 border-r text-center font-medium text-xs bg-blue-500/5">{left}</td>
      <td className="px-2 py-2 border-r text-center font-medium text-xs bg-blue-500/5">{percentage}%</td>
      <td className="px-2 py-1 text-center">
        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-6 w-6 text-destructive opacity-50 hover:opacity-100">
          <Trash2 className="h-3 w-3" />
        </Button>
      </td>
    </tr>
  )
}
