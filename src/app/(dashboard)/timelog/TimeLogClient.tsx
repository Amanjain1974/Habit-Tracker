"use client";

import { useState, useMemo } from "react";
import { TimeLog } from "@prisma/client";
import { createTimeLog, deleteTimeLog } from "@/actions/timelog.actions";
import { format, isSameDay, parse, startOfDay, endOfDay, isBefore, isAfter, differenceInMinutes, addMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Trash2, PieChart } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export default function TimeLogClient({ initialLogs }: { initialLogs: TimeLog[] }) {
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [optimisticLogs, setOptimisticLogs] = useState<TimeLog[]>(initialLogs);

  // Sync state when props change
  useMemo(() => setOptimisticLogs(initialLogs), [initialLogs]);

  // Filter logs for selected date and sort them by start time
  const dayLogs = useMemo(() => {
    return optimisticLogs
      .filter(l => isSameDay(new Date(l.startTime), date))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [optimisticLogs, date]);

  // Compute Timeline with auto-filled gaps
  // Start from 6:00 AM to 12:00 AM (midnight)
  const timelineWithGaps = useMemo(() => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    // Configurable day range: 6:00 AM to Midnight
    const rangeStart = addMinutes(dayStart, 6 * 60); 
    let currentMarker = rangeStart;
    const blocks: any[] = [];

    dayLogs.forEach(log => {
      const logStart = new Date(log.startTime);
      const logEnd = log.endTime ? new Date(log.endTime) : new Date(logStart.getTime() + (log.duration || 60)*60000);
      
      // If there's a gap before this log
      if (isAfter(logStart, currentMarker)) {
        blocks.push({
          id: `gap-${currentMarker.getTime()}`,
          isGap: true,
          activity: "Wasted",
          category: "Waste",
          startTime: currentMarker,
          endTime: logStart,
          duration: differenceInMinutes(logStart, currentMarker)
        });
      }

      blocks.push({
        ...log,
        isGap: false,
        startTime: logStart,
        endTime: logEnd,
        duration: differenceInMinutes(logEnd, logStart)
      });
      
      if (isAfter(logEnd, currentMarker)) {
        currentMarker = logEnd;
      }
    });

    // If there's a gap after the last log until the end of the day range (midnight)
    // Only pad up to current time if today, else pad to midnight
    const now = new Date();
    const endBoundary = isSameDay(date, now) && isBefore(now, dayEnd) ? now : dayEnd;
    
    if (isBefore(currentMarker, endBoundary) && isAfter(endBoundary, rangeStart)) {
      blocks.push({
        id: `gap-end-${currentMarker.getTime()}`,
        isGap: true,
        activity: "Unlogged Time",
        category: "Waste",
        startTime: currentMarker,
        endTime: endBoundary,
        duration: differenceInMinutes(endBoundary, currentMarker)
      });
    }

    return blocks;
  }, [dayLogs, date]);

  // Summaries
  const totalLoggedMins = dayLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
  const totalWastedMins = timelineWithGaps.filter(b => b.isGap || ["Waste", "Social Media", "Entertainment"].includes(b.category || "")).reduce((acc, b) => acc + (b.duration || 0), 0);
  const totalProductiveMins = timelineWithGaps.filter(b => !b.isGap && !["Waste", "Social Media", "Entertainment"].includes(b.category || "")).reduce((acc, b) => acc + (b.duration || 0), 0);
  
  const totalTracked = totalWastedMins + totalProductiveMins;

  const handleAddLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const activity = formData.get("activity") as string;
    const category = formData.get("category") as string;
    const startStr = formData.get("startTime") as string;
    const endStr = formData.get("endTime") as string;

    const start = parse(startStr, "HH:mm", date);
    const end = parse(endStr, "HH:mm", date);

    if (isBefore(end, start)) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);
    
    const tempId = "temp-" + Date.now();
    const duration = differenceInMinutes(end, start);
    
    // Optimistic
    setOptimisticLogs([...optimisticLogs, {
      id: tempId,
      userId: "",
      activity,
      category,
      startTime: start,
      endTime: end,
      duration,
      notes: null,
      productivityRating: 0,
      createdAt: new Date()
    }]);

    try {
      await createTimeLog({
        activity,
        category,
        startTime: start,
        endTime: end,
      });
      // @ts-ignore
      e.target.reset();
      toast.success("Time logged");
    } catch (err) {
      toast.error("Failed to add log");
      setOptimisticLogs(initialLogs);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setOptimisticLogs(optimisticLogs.filter(l => l.id !== id));
    try {
      await deleteTimeLog(id);
    } catch (e) {
      toast.error("Failed to delete log");
      setOptimisticLogs(initialLogs);
    }
  };

  const formatHrsMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* Sidebar - Date Picker */}
      <div className="w-full md:w-80 shrink-0 bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col h-fit">
        <h2 className="font-semibold text-lg mb-4 font-serif">Select Date</h2>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && setDate(d)}
          className="rounded-md border mx-auto"
        />
        
        {/* Mini Summary */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2 text-foreground">
            <PieChart className="h-4 w-4" /> Daily Summary
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Productive</span>
              <span className="font-bold text-foreground">{formatHrsMins(totalProductiveMins)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wasted / Gaps</span>
              <span className="font-bold text-muted-foreground">{formatHrsMins(totalWastedMins)}</span>
            </div>
            
            {/* Battery Bar */}
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="bg-primary h-full" 
                style={{ width: `${totalTracked > 0 ? (totalProductiveMins/totalTracked)*100 : 0}%` }} 
                title="Productive"
              />
              <div 
                className="bg-amber-700/40 h-full" 
                style={{ width: `${totalTracked > 0 ? (totalWastedMins/totalTracked)*100 : 0}%` }} 
                title="Wasted"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editor / Timeline */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="font-semibold text-foreground">{format(date, "EEEE, MMMM do, yyyy")}</span>
          </div>
        </div>
        
        <div className="p-4 md:p-6 flex-1 overflow-y-auto">
          
          {/* Add Block Form */}
          <form onSubmit={handleAddLog} className="flex flex-col md:flex-row gap-3 mb-8 bg-background p-4 rounded-lg border border-border shadow-sm">
            <div className="flex-1">
              <input name="activity" placeholder="What did you do?" required className="w-full h-9 bg-transparent border-b border-border outline-none focus:border-primary text-sm px-1 transition-colors" />
            </div>
            <div className="w-full md:w-32">
              <select name="category" className="w-full h-9 bg-transparent border-b border-border outline-none focus:border-primary text-sm px-1 transition-colors text-muted-foreground">
                <option value="Deep Work">Deep Work</option>
                <option value="Study">Study</option>
                <option value="Gym">Health</option>
                <option value="Admin">Admin</option>
                <option value="Waste">Waste</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="time" name="startTime" required className="h-9 bg-transparent border-b border-border outline-none focus:border-primary text-sm px-1 w-24" />
              <span className="text-muted-foreground self-center">-</span>
              <input type="time" name="endTime" required className="h-9 bg-transparent border-b border-border outline-none focus:border-primary text-sm px-1 w-24" />
            </div>
            <Button type="submit" disabled={loading} size="sm" className="h-9">
              {loading ? "..." : "Log"}
            </Button>
          </form>

          {/* Vertical Timeline */}
          <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
            {timelineWithGaps.length === 0 ? (
              <p className="text-sm text-muted-foreground italic pt-4">No time logged or gaps computed yet.</p>
            ) : (
              timelineWithGaps.map(block => {
                const isWaste = block.isGap || ["Waste", "Social Media", "Entertainment"].includes(block.category);
                
                return (
                  <div key={block.id} className="relative flex items-start gap-4 group">
                    {/* Dot */}
                    <div className={`mt-1.5 w-3 h-3 rounded-full border-2 border-background shadow-sm shrink-0 z-10 ${
                      isWaste ? 'bg-amber-700/50' : 'bg-primary'
                    }`} />
                    
                    {/* Content */}
                    <div className={`flex-1 p-3 rounded-lg border text-sm transition-colors relative flex items-center justify-between ${
                      block.isGap 
                        ? 'bg-muted/30 border-dashed text-muted-foreground' 
                        : isWaste 
                          ? 'bg-amber-900/10 border-amber-900/20'
                          : 'bg-background hover:border-primary/50'
                    }`}>
                      <div>
                        <div className="font-semibold text-xs opacity-70 mb-1">
                          {format(block.startTime, "HH:mm")} - {format(block.endTime, "HH:mm")}
                        </div>
                        <div className="font-medium">{block.activity}</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono opacity-60">
                          {formatHrsMins(block.duration)}
                        </span>
                        
                        {!block.isGap && (
                          <button 
                            type="button"
                            onClick={() => handleDelete(block.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
        </div>
      </div>

    </div>
  );
}
