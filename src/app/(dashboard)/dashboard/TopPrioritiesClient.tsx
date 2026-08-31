"use client";

import { Task } from "@prisma/client";
import { updateTaskStatus } from "@/actions/task.actions";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export default function TopPrioritiesClient({ initialPriorities }: { initialPriorities: Task[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (task: Task) => {
    setLoadingId(task.id);
    await updateTaskStatus(task.id, "COMPLETED");
    setLoadingId(null);
  }

  if (initialPriorities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No top priorities active. Great job!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {initialPriorities.map((task, index) => (
        <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg bg-background hover:border-red-500/50 transition-colors">
          <div className="font-bold text-2xl text-muted-foreground w-6 text-center">
            {index + 1}
          </div>
          <Checkbox 
            className="h-6 w-6 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" 
            checked={false} 
            onCheckedChange={() => handleToggle(task)}
            disabled={loadingId === task.id}
          />
          <div className="flex-1">
            <p className="font-semibold text-lg">{task.title}</p>
            {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}
