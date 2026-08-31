"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTimeLog } from "@/actions/timelog.actions";
import { Play, Pause, Square, SkipForward } from "lucide-react";
import { motion } from "framer-motion";

export default function TimerClient() {
  const [activity, setActivity] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalTime, setTotalTime] = useState(25 * 60);

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
    setTotalTime(minutes * 60);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    const durationMins = Math.floor((totalTime - timeLeft) / 60);
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
  const skipTimer = () => resetTimer(5);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / totalTime;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-[600px] px-4 transition-colors duration-1000 ${isActive ? 'bg-[#09090B]' : 'bg-transparent'}`}>
      
      {/* Ambient background that dims and glows when active */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Activity Input */}
        <div className="w-full mb-12">
          <Input 
            value={activity} 
            onChange={e => setActivity(e.target.value)}
            placeholder="What are you focusing on?"
            className="text-center text-lg border-none shadow-none bg-transparent placeholder:text-muted-foreground/50 focus-visible:ring-0 h-12 font-medium"
          />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent mt-1" />
        </div>

        {/* Circular SVG Timer */}
        <div className="relative flex items-center justify-center mb-16">
          <svg className="w-72 h-72 transform -rotate-90">
            {/* Background ring */}
            <circle 
              cx="144" 
              cy="144" 
              r={radius} 
              className="stroke-border/50 fill-none" 
              strokeWidth="6" 
            />
            {/* Animated progress ring */}
            <motion.circle 
              cx="144" 
              cy="144" 
              r={radius} 
              className="stroke-[#22D3EE] fill-none drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
              strokeWidth="6" 
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black tracking-tighter tabular-nums drop-shadow-md">
              {formatTime(timeLeft)}
            </span>
            {isActive && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] uppercase tracking-widest font-bold text-[#22D3EE] mt-2"
              >
                Focusing
              </motion.span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={stopTimer} 
            disabled={!sessionStartTime}
            className="h-12 w-12 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all hover:scale-110"
          >
            <Square className="h-4 w-4" fill="currentColor" />
          </Button>

          <Button 
            onClick={toggleTimer}
            className="h-16 w-16 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {isActive ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 ml-1" fill="currentColor" />}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipTimer}
            className="h-12 w-12 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all hover:scale-110"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick modes */}
        <div className="flex items-center gap-6 mt-12 text-xs font-semibold text-muted-foreground/50 tracking-wider">
          <button onClick={() => resetTimer(25)} className={`hover:text-foreground transition-colors ${totalTime === 25*60 ? 'text-foreground' : ''}`}>25:00</button>
          <button onClick={() => resetTimer(5)} className={`hover:text-foreground transition-colors ${totalTime === 5*60 ? 'text-foreground' : ''}`}>05:00</button>
          <button onClick={() => resetTimer(50)} className={`hover:text-foreground transition-colors ${totalTime === 50*60 ? 'text-foreground' : ''}`}>50:00</button>
        </div>
      </div>
    </div>
  );
}
