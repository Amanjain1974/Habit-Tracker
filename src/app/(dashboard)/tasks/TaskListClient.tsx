"use client";

import { Task } from "@prisma/client";
import { updateTaskStatus, deleteTask } from "@/actions/task.actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, MoreHorizontal, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TaskListClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  const activeTasks = tasks.filter(t => t.status !== "COMPLETED");
  const completedTasks = tasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="space-y-12">
      
      {/* ACTIVE TASKS */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">In Progress — {activeTasks.length}</h2>
        {activeTasks.length === 0 ? (
          <div className="py-12 text-center border border-dashed rounded-xl">
            <h3 className="text-lg font-medium">Nothing planned yet.</h3>
            <p className="text-muted-foreground mt-1">Choose one important thing to finish today.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activeTasks.map(task => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TASKS */}
      {completedTasks.length > 0 && (
        <div className="opacity-70">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Finished — {completedTasks.length}</h2>
          <div className="space-y-1">
            {completedTasks.map(task => (
              <TaskRow key={task.id} task={task} isCompleted />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, isCompleted = false }: { task: Task, isCompleted?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    await updateTaskStatus(task.id, checked ? "COMPLETED" : "PENDING");
    setLoading(false);
  }

  const handleDelete = async () => {
    setLoading(true);
    await deleteTask(task.id);
    setDeleted(true);
  }

  if (deleted) return null;

  const isPostponed = task.postponeCount > 2;

  return (
    <div className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
      <Checkbox 
        className={`h-5 w-5 rounded-full transition-all ${isCompleted ? 'data-[state=checked]:bg-primary data-[state=checked]:border-primary' : 'border-muted-foreground/30 hover:border-primary'}`}
        checked={isCompleted} 
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <span className="font-medium truncate">{task.title}</span>
        
        {/* Badges / Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          {task.category && (
            <span className="px-2 py-0.5 bg-secondary rounded-full">{task.category}</span>
          )}
          {task.estimatedDuration && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.estimatedDuration}m</span>
          )}
          {isPostponed && !isCompleted && (
            <span className="flex items-center gap-1 text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full" title={`Postponed ${task.postponeCount} times`}>
              <AlertCircle className="h-3 w-3" /> Blocking?
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
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
