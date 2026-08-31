"use client";

import { Task } from "@prisma/client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock, GripVertical } from "lucide-react";

export function TaskCard({ task }: { task: Task }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="opacity-40 border-2 border-primary border-dashed rounded-lg h-20 w-full" 
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col bg-background border rounded-lg p-3 shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-sm mb-2"
    >
      <div className="flex items-start gap-2">
        <div 
          {...attributes} 
          {...listeners} 
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-tight">{task.title}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {task.category && <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">{task.category}</span>}
            {task.estimatedDuration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {task.estimatedDuration}m</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
