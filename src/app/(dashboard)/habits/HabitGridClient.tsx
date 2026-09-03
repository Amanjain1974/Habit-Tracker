"use client";

import { useState, useMemo } from "react";
import { Habit, HabitLog } from "@prisma/client";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Flame, Trophy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { toggleHabitLog } from "@/actions/habit.actions";

type HabitWithLogs = Habit & { logs: HabitLog[] };

export default function HabitGridClient({ initialHabits }: { initialHabits: HabitWithLogs[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<HabitWithLogs[]>(initialHabits);
  
  // Calculate Grid Dates
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Group days into weeks (assuming week starts on Monday or Sunday depending on standard, let's use standard ISO or simple slice)
  // For spreadsheet styling, often they just group 7 days at a time from the 1st.
  // "columns = days grouped into weeks (Week 1–5)"
  const weeks = [];
  for (let i = 0; i < daysInMonth.length; i += 7) {
    weeks.push(daysInMonth.slice(i, i + 7));
  }

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleToggle = async (habitId: string, date: Date, currentCompleted: boolean) => {
    // Optimistic UI Update
    const previousHabits = [...habits];
    
    setHabits(current => current.map(h => {
      if (h.id !== habitId) return h;
      
      const existingLogIndex = h.logs.findIndex(l => isSameDay(new Date(l.date), date));
      const newLogs = [...h.logs];
      
      if (existingLogIndex >= 0) {
        newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], completed: !currentCompleted };
      } else {
        newLogs.push({
          id: "temp-" + Date.now(),
          habitId,
          date,
          completed: true,
          createdAt: new Date()
        });
      }
      return { ...h, logs: newLogs };
    }));

    try {
      // Server Action
      await toggleHabitLog(habitId, date.toISOString());
    } catch (e) {
      toast.error("Failed to update habit.");
      setHabits(previousHabits); // Rollback
    }
  };

  // Helper: Get completion rate for a week
  const getWeekProgress = (habit: HabitWithLogs, weekDays: Date[]) => {
    const completed = weekDays.filter(d => 
      habit.logs.some(l => isSameDay(new Date(l.date), d) && l.completed)
    ).length;
    return Math.round((completed / weekDays.length) * 100);
  };

  // Helper: Get overall month progress for a habit
  const getMonthProgress = (habit: HabitWithLogs) => {
    const completed = daysInMonth.filter(d => 
      habit.logs.some(l => isSameDay(new Date(l.date), d) && l.completed)
    ).length;
    return Math.round((completed / daysInMonth.length) * 100);
  };

  // Helper: Overall Donut metric
  const totalPossible = habits.length * daysInMonth.length;
  const totalCompleted = habits.reduce((acc, h) => {
    return acc + daysInMonth.filter(d => h.logs.some(l => isSameDay(new Date(l.date), d) && l.completed)).length;
  }, 0);
  const monthPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
          <h2 className="text-xl font-bold font-serif w-48 text-center">{format(currentDate, "MMMM / yyyy")}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRight className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Overall</span>
              <span className="font-bold">{monthPercentage}% Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid Wrapper - Allows horizontal scroll on mobile */}
      <div className="w-full overflow-x-auto pb-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="min-w-[900px] p-6">
          
          {/* Header Row */}
          <div className="flex mb-4">
            <div className="w-48 shrink-0 font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-end pb-2">
              Habits
            </div>
            <div className="flex-1 flex gap-6">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex-1 flex flex-col items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Week {wIndex + 1}
                  </span>
                  <div className="flex gap-1.5 w-full justify-center">
                    {week.map((day) => (
                      <div key={day.toISOString()} className="flex flex-col items-center gap-1 w-8">
                        <span className={`text-[10px] font-bold ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(day, "E").charAt(0)}
                        </span>
                        <span className={`text-xs ${isToday(day) ? 'bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center font-bold' : 'text-foreground'}`}>
                          {format(day, "d")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-24 shrink-0 font-semibold text-xs text-muted-foreground uppercase tracking-wider flex items-end justify-center pb-2">
              Progress
            </div>
          </div>

          {/* Habit Rows */}
          {habits.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-medium border-t border-border/50">
              No habits defined. Add your first habit to start tracking.
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map(habit => {
                const monthProg = getMonthProgress(habit);
                // Calculate current streak
                let streak = 0;
                let checkDate = new Date(); // Start from today
                while (true) {
                  const hasLog = habit.logs.find(l => isSameDay(new Date(l.date), checkDate) && l.completed);
                  if (hasLog) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                  } else {
                    // if today is not checked, but yesterday was, we might still have an active streak. 
                    if (isToday(checkDate) && streak === 0) {
                      checkDate.setDate(checkDate.getDate() - 1);
                      const hasYesterdayLog = habit.logs.find(l => isSameDay(new Date(l.date), checkDate) && l.completed);
                      if (hasYesterdayLog) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                        continue;
                      }
                    }
                    break;
                  }
                }

                return (
                  <div key={habit.id} className="flex group items-center py-2 border-t border-border/30 hover:bg-muted/30 transition-colors rounded-lg -mx-2 px-2">
                    {/* Habit Info */}
                    <div className="w-48 shrink-0 flex items-center gap-3">
                      <div className="flex-1 truncate">
                        <p className="font-semibold text-sm truncate">{habit.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {streak >= 3 && <Flame className="h-3 w-3 text-warning fill-warning" />}
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checkboxes per week */}
                    <div className="flex-1 flex gap-6">
                      {weeks.map((week, wIndex) => {
                        const weekProg = getWeekProgress(habit, week);
                        return (
                          <div key={wIndex} className="flex-1 flex flex-col gap-1 items-center justify-center">
                            <div className="flex gap-1.5 w-full justify-center">
                              {week.map(day => {
                                const isChecked = habit.logs.some(l => isSameDay(new Date(l.date), day) && l.completed);
                                return (
                                  <div key={day.toISOString()} className="w-8 flex justify-center">
                                    <button
                                      onClick={() => handleToggle(habit.id, day, isChecked)}
                                      className={`h-5 w-5 rounded transition-all duration-200 border flex items-center justify-center ${
                                        isChecked 
                                          ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-sm' 
                                          : 'bg-background border-border hover:border-primary/50'
                                      }`}
                                    >
                                      {isChecked && (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Tiny weekly progress bar */}
                            <div className="w-[80%] h-1 bg-border rounded-full mt-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="h-full bg-primary" style={{ width: `${weekProg}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Monthly Progress Donut / Text */}
                    <div className="w-24 shrink-0 flex items-center justify-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground">{monthProg}%</span>
                      <svg className="w-6 h-6 transform -rotate-90">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-border" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 10} 
                          strokeDashoffset={2 * Math.PI * 10 * (1 - monthProg / 100)} 
                          className="text-primary transition-all duration-500" 
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
