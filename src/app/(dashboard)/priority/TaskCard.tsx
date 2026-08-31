import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@prisma/client";
import { GripVertical } from "lucide-react";

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
        className="border-2 border-primary/50 bg-primary/10 rounded-lg p-3 h-[60px] opacity-30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col gap-2 p-3 bg-background border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-default"
    >
      <div className="flex items-start gap-2">
        <button 
          {...attributes} 
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
