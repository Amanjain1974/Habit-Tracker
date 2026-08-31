import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "@prisma/client";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  column: { id: number; title: string; subtitle: string; border: string; bg: string };
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div className={`flex flex-col rounded-xl border ${column.border} bg-card shadow-sm h-full`}>
      <div className={`p-4 border-b ${column.border} ${column.bg} rounded-t-xl`}>
        <h3 className="font-semibold text-lg">{column.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{column.subtitle}</p>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[150px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
