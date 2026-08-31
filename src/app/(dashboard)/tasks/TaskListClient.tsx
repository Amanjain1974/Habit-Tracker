"use client";

import { useState } from "react";
import { Task } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { updateTaskStatus, deleteTask } from "@/actions/task.actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function TaskListClient({ initialTasks }: { initialTasks: Task[] }) {
  // Using optimistic UI or just relying on server revalidation. 
  // For simplicity, we rely on server revalidation, so this acts as a dumb renderer.
  // Wait, if it relies on server reval, we don't need local state for tasks if we just mutate and Next.js revalidates.

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (task: Task) => {
    setLoadingId(task.id);
    const newStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    await updateTaskStatus(task.id, newStatus);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure?")) {
      setLoadingId(id);
      await deleteTask(id);
      setLoadingId(null);
    }
  }

  const activeTasks = initialTasks.filter(t => t.status !== "COMPLETED");
  const completedTasks = initialTasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Tasks</h2>
        {activeTasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active tasks. Time to relax or plan ahead!</p>
        ) : (
          <div className="space-y-2">
            {activeTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={() => handleToggle(task)} 
                onDelete={() => handleDelete(task.id)}
                loading={loadingId === task.id}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Completed</h2>
        <div className="space-y-2 opacity-70">
          {completedTasks.map(task => (
             <TaskItem 
               key={task.id} 
               task={task} 
               onToggle={() => handleToggle(task)} 
               onDelete={() => handleDelete(task.id)}
               loading={loadingId === task.id}
             />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, loading }: { task: Task, onToggle: () => void, onDelete: () => void, loading: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <Checkbox 
          checked={task.status === "COMPLETED"} 
          onCheckedChange={onToggle} 
          disabled={loading}
        />
        <div className={task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}>
          <p className="font-medium">{task.title}</p>
          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete} disabled={loading} className="text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
