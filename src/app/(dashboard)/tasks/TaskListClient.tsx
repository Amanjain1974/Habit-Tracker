"use client";

import { Task } from "@prisma/client";
import { updateTaskStatus, deleteTask } from "@/actions/task.actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, MoreHorizontal, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TaskListClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  const activeTasks = tasks.filter(t => t.status !== "COMPLETED");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  const handleUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
  
  const handleRemove = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-12">
      
      {/* ACTIVE TASKS */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 border-b border-border/50 pb-2">
          In Progress — {activeTasks.length}
        </h2>
        {activeTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center border border-dashed border-border/50 rounded-xl"
          >
            <h3 className="text-lg font-semibold text-foreground">Nothing planned yet.</h3>
            <p className="text-muted-foreground mt-1 text-sm">Choose one important thing to finish today.</p>
          </motion.div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {activeTasks.map(task => (
                <TaskRow key={task.id} task={task} onUpdate={handleUpdate} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* COMPLETED TASKS */}
      {completedTasks.length > 0 && (
        <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 border-b border-border/50 pb-2">
            Finished — {completedTasks.length}
          </h2>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {completedTasks.map(task => (
                <TaskRow key={task.id} task={task} isCompleted onUpdate={handleUpdate} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, isCompleted = false, onUpdate, onRemove }: { task: Task, isCompleted?: boolean, onUpdate: (t:Task) => void, onRemove: (id:string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    // Optimistic update
    onUpdate({ ...task, status: checked ? "COMPLETED" : "PENDING" });
    await updateTaskStatus(task.id, checked ? "COMPLETED" : "PENDING");
    setLoading(false);
  }

  const handleDelete = async () => {
    setLoading(true);
    onRemove(task.id);
    await deleteTask(task.id);
  }

  const isPostponed = task.postponeCount > 2;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.005, backgroundColor: "var(--color-muted)" }}
      transition={{ duration: 0.2 }}
      className={`group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-border/50 transition-colors ${isCompleted ? 'text-muted-foreground' : 'bg-card/50'}`}
    >
      <div className="relative">
        <Checkbox 
          className={`h-5 w-5 rounded-full transition-all duration-300 ${isCompleted ? 'data-[state=checked]:bg-[#34D399] data-[state=checked]:border-[#34D399]' : 'border-muted-foreground/30 hover:border-primary'}`}
          checked={isCompleted} 
          onCheckedChange={handleToggle}
          disabled={loading}
        />
        {/* Glow effect on completion */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div 
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-[#34D399]"
            />
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <span className={`font-semibold truncate transition-all duration-300 ${isCompleted ? 'line-through opacity-70' : ''}`}>{task.title}</span>
        
        {/* Badges / Metadata */}
        <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-muted-foreground shrink-0">
          {task.category && (
            <span className="px-2 py-0.5 bg-secondary border border-border/50 rounded-md">{task.category}</span>
          )}
          {task.estimatedDuration && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.estimatedDuration}m</span>
          )}
          {isPostponed && !isCompleted && (
            <span className="flex items-center gap-1 text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-md">
              <AlertCircle className="h-3 w-3" /> Postponed {task.postponeCount}x
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 border-border/50 bg-background/95 backdrop-blur-md">
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
