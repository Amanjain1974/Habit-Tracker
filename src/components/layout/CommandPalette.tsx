"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckSquare, Clock, Grid2X2, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-50 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl glass-panel"
        >
          <Command 
            className="flex h-full w-full flex-col bg-transparent"
            loop
          >
            <Command.Input 
              className="w-full border-b border-white/5 bg-transparent p-5 text-base outline-none placeholder:text-muted-foreground" 
              placeholder="What do you want to do?" 
              autoFocus
            />
            
            <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-none">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No commands found.
              </Command.Empty>
              
              <Command.Group heading="Create" className="px-2 py-3 text-xs font-medium text-muted-foreground">
                <Command.Item 
                  onSelect={() => { router.push("/tasks"); setOpen(false); }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <CheckSquare className="h-4 w-4" /> Create Task
                </Command.Item>
                <Command.Item 
                  onSelect={() => { router.push("/habits"); setOpen(false); }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <CalendarDays className="h-4 w-4" /> Create Habit
                </Command.Item>
                <Command.Item 
                  onSelect={() => { router.push("/goals"); setOpen(false); }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <Target className="h-4 w-4" /> Create Goal
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Action" className="px-2 py-3 text-xs font-medium text-muted-foreground">
                <Command.Item 
                  onSelect={() => { router.push("/timelog"); setOpen(false); }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground aria-selected:bg-[#22D3EE]/10 aria-selected:text-[#22D3EE] transition-colors"
                >
                  <Clock className="h-4 w-4" /> Start Focus Session
                </Command.Item>
                <Command.Item 
                  onSelect={() => { router.push("/priority"); setOpen(false); }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm text-foreground aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <Grid2X2 className="h-4 w-4" /> Priority Matrix
                </Command.Item>
              </Command.Group>

            </Command.List>
          </Command>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
