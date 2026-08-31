"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTimeLog } from "@/actions/timelog.actions";
import { Play, Pause, Square, SkipForward } from "lucide-react";

export default function TimerClient() {
  const [activity, setActivity] = useState("");
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
    const durationMins = 25 - Math.floor(timeLeft / 60);
    if (durationMins > 0 && sessionStartTime) {
      try {
        await createTimeLog({
          activity: activity || "Deep Work Session",
          category: "Deep Work",
          duration: durationMins,
          startTime: sessionStartTime,
          productivityRating: 5
        });
      } catch(e) {
        console.error(e);
      }
    }
    resetTimer(25);
  };

  const stopTimer = () => handleSessionComplete();
  const skipTimer = () => resetTimer(5); // Skip to 5m break

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      
      {/* Activity Input */}
      <div className="w-full max-w-md mb-12">
        <Input 
          value={activity} 
          onChange={e => setActivity(e.target.value)}
          placeholder="What are you focusing on?"
          className="text-center text-xl border-none shadow-none bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 h-14 font-medium"
        />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mt-2" />
      </div>

      {/* Timer Display */}
      <div className="text-[120px] leading-none font-extrabold tracking-tighter tabular-nums mb-16 text-foreground">
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={stopTimer} 
          disabled={!sessionStartTime}
          className="h-12 w-12 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground"
        >
          <Square className="h-4 w-4" fill="currentColor" />
        </Button>

        <Button 
          onClick={toggleTimer}
          className="h-20 w-20 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-xl hover:scale-105 transition-all duration-200"
        >
          {isActive ? <Pause className="h-8 w-8" fill="currentColor" /> : <Play className="h-8 w-8 ml-2" fill="currentColor" />}
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={skipTimer}
          className="h-12 w-12 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick modes */}
      <div className="flex items-center gap-4 mt-16 text-sm font-medium text-muted-foreground">
        <button onClick={() => resetTimer(25)} className="hover:text-foreground transition-colors">25:00</button>
        <span className="opacity-20">•</span>
        <button onClick={() => resetTimer(5)} className="hover:text-foreground transition-colors">05:00</button>
        <span className="opacity-20">•</span>
        <button onClick={() => resetTimer(50)} className="hover:text-foreground transition-colors">50:00</button>
      </div>
      
    </div>
  );
}
