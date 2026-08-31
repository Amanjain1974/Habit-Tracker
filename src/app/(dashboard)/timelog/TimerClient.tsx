"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTimeLog } from "@/actions/timelog.actions";
import { Play, Pause, Square, RefreshCcw } from "lucide-react";
import { format } from "date-fns";

export default function TimerClient() {
  const [activity, setActivity] = useState("");
  const [category, setCategory] = useState("Deep Work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const resetTimer = (minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    // Save to DB
    const durationMins = 25 - Math.floor(timeLeft / 60); // Roughly
    if (durationMins > 0 && sessionStartTime) {
      try {
        await createTimeLog({
          activity: activity || "Focus Session",
          category,
          duration: durationMins,
          startTime: sessionStartTime,
          productivityRating: 5 // Default for completed focus session
        });
        alert("Session saved!");
      } catch(e) {
        console.error(e);
      }
    }
    resetTimer(25);
  };

  const stopTimer = () => {
    handleSessionComplete();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm max-w-md mx-auto text-center flex flex-col items-center">
      <h2 className="font-semibold text-lg mb-6">Focus Mode</h2>
      
      <div className="w-full space-y-4 mb-8 text-left">
        <div>
          <Label htmlFor="activity">What are you finishing?</Label>
          <Input 
            id="activity" 
            value={activity} 
            onChange={e => setActivity(e.target.value)}
            placeholder="e.g. Study React, Write Code"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select 
            id="category" 
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Deep Work">Deep Work</option>
            <option value="Study">Study</option>
            <option value="Coding">Coding</option>
            <option value="Reading">Reading</option>
          </select>
        </div>
      </div>

      <div className="text-6xl font-bold tracking-tighter tabular-nums mb-8 text-primary">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-4">
        <Button size="icon" variant="outline" onClick={() => resetTimer(25)}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
        <Button size="lg" className="rounded-full h-14 w-14" onClick={toggleTimer}>
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
        </Button>
        <Button size="icon" variant="outline" onClick={stopTimer} disabled={!sessionStartTime}>
          <Square className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="ghost" size="sm" onClick={() => resetTimer(25)}>25m Focus</Button>
        <Button variant="ghost" size="sm" onClick={() => resetTimer(5)}>5m Break</Button>
        <Button variant="ghost" size="sm" onClick={() => resetTimer(50)}>50m Focus</Button>
      </div>
    </div>
  );
}
