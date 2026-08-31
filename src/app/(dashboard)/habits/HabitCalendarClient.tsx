"use client";

import { useState } from "react";
import { Habit, HabitLog } from "@prisma/client";
import { toggleHabitLog, deleteHabit } from "@/actions/habit.actions";
import { startOfWeek, addDays, format, isSameDay, startOfDay } from "date-fns";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type HabitWithLogs = Habit & { logs: HabitLog[] };

export default function HabitCalendarClient({ initialHabits }: { initialHabits: HabitWithLogs[] }) {
  // Generate the current week (Monday to Sunday)
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/4">Habit</th>
                {weekDays.map(day => (
                  <th key={day.toString()} className="px-2 py-4 text-center font-semibold min-w-[60px]">
                    <div className="flex flex-col items-center gap-1">
                      <span>{format(day, 'EEE')}</span>
                      <span className="text-foreground text-base">{format(day, 'd')}</span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialHabits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    No habits created yet. Start tracking today!
                  </td>
                </tr>
              ) : (
                initialHabits.map(habit => (
                  <HabitRow key={habit.id} habit={habit} weekDays={weekDays} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function HabitRow({ habit, weekDays }: { habit: HabitWithLogs, weekDays: Date[] }) {
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

  // Calculate some simple stats for the row
  const completedThisWeek = weekDays.filter(day => 
    habit.logs.some(log => isSameDay(new Date(log.date), day) && log.completed)
  ).length;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-base">{habit.title}</div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {completedThisWeek}/7 this week
          </span>
          {habit.targetCount && <span>Target: {habit.targetCount}</span>}
        </div>
      </td>
      
      {weekDays.map(day => {
        // Find if log exists and is completed
        const isCompleted = habit.logs.some(log => isSameDay(new Date(log.date), day) && log.completed);
        const dateStr = day.toISOString();
        const isLoading = loadingDate === dateStr;
        
        // Disable future days
        const isFuture = startOfDay(day) > startOfDay(new Date());

        return (
          <td key={day.toString()} className="px-2 py-4 text-center">
            <button
              disabled={isLoading || isFuture}
              onClick={() => handleToggle(day)}
              className={`
                h-10 w-10 mx-auto rounded-full flex items-center justify-center transition-all
                ${isFuture ? 'opacity-30 cursor-not-allowed bg-muted' : 'cursor-pointer hover:scale-110 active:scale-95'}
                ${isCompleted 
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30' 
                  : !isFuture ? 'bg-muted/50 hover:bg-muted text-muted-foreground' : ''}
              `}
            >
              {isLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                !isFuture && <X className="h-4 w-4 opacity-30" />
              )}
            </button>
          </td>
        )
      })}

      <td className="px-4 py-4 text-right">
        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive opacity-50 hover:opacity-100">
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}
