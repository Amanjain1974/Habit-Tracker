"use client";

import { useState } from "react";
import { TimeLog } from "@prisma/client";
import { format, isSameDay, startOfDay, endOfDay, addMinutes } from "date-fns";
import { createTimeLog, deleteTimeLog } from "@/actions/timelog.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Trash2, PieChart as PieChartIcon } from "lucide-react";

export default function DailyTimelineClient({ initialLogs }: { initialLogs: TimeLog[] }) {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Filter logs for the selected date
  const todayLogs = initialLogs.filter(log => isSameDay(new Date(log.startTime), date));
  
  // Sort logs by start time
  todayLogs.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Calculate totals
  const totalLoggedMins = todayLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
  const productiveMins = todayLogs
    .filter(log => ["Deep Work", "Study", "Coding", "Gym", "Reading"].includes(log.category || ""))
    .reduce((acc, log) => acc + (log.duration || 0), 0);
  const wastedMins = todayLogs
    .filter(log => ["Social Media", "Entertainment", "Other", "Waste"].includes(log.category || ""))
    .reduce((acc, log) => acc + (log.duration || 0), 0);

  async function handleAddLog(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const activity = formData.get("activity") as string;
    const category = formData.get("category") as string;
    const startTimeStr = formData.get("startTime") as string; // "HH:MM"
    const endTimeStr = formData.get("endTime") as string; // "HH:MM"

    try {
      const [startH, startM] = startTimeStr.split(":").map(Number);
      const [endH, endM] = endTimeStr.split(":").map(Number);

      const start = new Date(date);
      start.setHours(startH, startM, 0, 0);

      const end = new Date(date);
      end.setHours(endH, endM, 0, 0);

      // Handle crossing midnight
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      const duration = Math.round((end.getTime() - start.getTime()) / 60000);

      await createTimeLog({
        activity,
        category,
        startTime: start,
        endTime: end,
        duration,
        productivityRating: ["Social Media", "Waste", "Entertainment"].includes(category) ? 1 : 4
      });

      // @ts-ignore
      e.target.reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Delete this log?")) {
      await deleteTimeLog(id);
    }
  }

  const formatHrsMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 24-HOUR TIMELINE LOG */}
      <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" /> 24-Hour Timeline ({format(date, "MMM d, yyyy")})
          </h2>
          <Input 
            type="date" 
            value={format(date, "yyyy-MM-dd")} 
            onChange={(e) => setDate(new Date(e.target.value))}
            className="w-auto h-8"
          />
        </div>

        {/* LOG FORM */}
        <form onSubmit={handleAddLog} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 bg-muted/30 p-4 rounded-lg border border-dashed">
          <div className="md:col-span-2">
            <Label className="text-xs">Activity</Label>
            <Input name="activity" placeholder="e.g. Gym, Instagram..." required className="h-8 text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <select name="category" className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="Deep Work">Deep Work</option>
              <option value="Study">Study</option>
              <option value="Gym">Gym / Health</option>
              <option value="Social Media">Social Media</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sleep">Sleep</option>
              <option value="Waste">Wasted Time</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">From</Label>
              <Input type="time" name="startTime" required className="h-8 text-sm mt-1 px-2" />
            </div>
            <div className="flex-1">
              <Label className="text-xs">To</Label>
              <Input type="time" name="endTime" required className="h-8 text-sm mt-1 px-2" />
            </div>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full h-8 text-xs">
              {loading ? "..." : "+ Add"}
            </Button>
          </div>
        </form>

        {/* TIMELINE RENDERER */}
        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-16 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {todayLogs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No activities logged for this day.</p>
          ) : (
            todayLogs.map(log => {
              const isWaste = ["Social Media", "Waste", "Entertainment"].includes(log.category || "");
              return (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                    isWaste ? 'bg-red-500 text-white' : 'bg-primary text-white'
                  }`}>
                    <Clock className="h-3 w-3" />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-background shadow-sm flex flex-col group-hover:border-primary/50 transition-colors relative">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        {format(new Date(log.startTime), "HH:mm")} - {log.endTime ? format(new Date(log.endTime), "HH:mm") : 'Now'}
                      </span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" onClick={() => handleDelete(log.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <h3 className="font-semibold">{log.activity}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isWaste ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                        {log.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">
                        {formatHrsMins(log.duration || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* DAILY SUMMARY */}
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5" /> Daily Summary
          </h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Time Tracked</p>
              <p className="text-3xl font-bold">{formatHrsMins(totalLoggedMins)}</p>
              <p className="text-xs text-muted-foreground mt-1">out of 24h</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Productive</span>
                <span className="text-green-500 font-bold">{formatHrsMins(productiveMins)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalLoggedMins > 0 ? (productiveMins/totalLoggedMins)*100 : 0}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Wasted Time</span>
                <span className="text-red-500 font-bold">{formatHrsMins(wastedMins)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalLoggedMins > 0 ? (wastedMins/totalLoggedMins)*100 : 0}%` }} />
              </div>
            </div>
            
            {wastedMins > 120 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600">
                <strong>Insight:</strong> You spent over 2 hours on unproductive activities today. Try time-blocking your schedule tomorrow to minimize idle time.
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
