"use client";

import { Task } from "@prisma/client";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  column: {
    id: number;
    title: string;
    subtitle: string;
    border: string;
    bg: string;
  };
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id.toString(),
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className={`flex flex-col rounded-xl border ${column.bg} border-transparent hover:border-border transition-colors h-full`}>
      <div className="p-4 flex flex-col gap-1 border-b bg-background/50 rounded-t-xl">
        <h3 className="font-bold text-base">{column.title}</h3>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{column.subtitle}</p>
        <div className="text-xs font-semibold mt-2">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
      </div>
      
      <div 
        ref={setNodeRef} 
        className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[150px]"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-lg py-8">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
