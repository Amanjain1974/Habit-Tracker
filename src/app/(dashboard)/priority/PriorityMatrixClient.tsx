"use client";

import { useState } from "react";
import { Task } from "@prisma/client";
import { updateTaskColumn } from "@/actions/task.actions";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";

const COLUMNS = [
  { id: 1, title: "Do Now", subtitle: "Important & Urgent", border: "border-red-500/50", bg: "bg-red-500/10" },
  { id: 2, title: "Schedule", subtitle: "Important, Not Urgent", border: "border-blue-500/50", bg: "bg-blue-500/10" },
  { id: 3, title: "Delegate", subtitle: "Urgent, Not Important", border: "border-orange-500/50", bg: "bg-orange-500/10" },
  { id: 4, title: "Eliminate", subtitle: "Not Important, Not Urgent", border: "border-gray-500/50", bg: "bg-gray-500/10" },
];

export default function PriorityMatrixClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);

        if (prev[activeIndex].matrixColumn !== prev[overIndex].matrixColumn) {
          const newTasks = [...prev];
          newTasks[activeIndex].matrixColumn = prev[overIndex].matrixColumn;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const newTasks = [...prev];
        newTasks[activeIndex].matrixColumn = Number(overId);
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id;
    
    // Find where the task ended up
    const finalTask = tasks.find(t => t.id === activeId);
    if (finalTask) {
      // Check if it actually moved columns (optimistic update was applied in handleDragOver)
      const originalTask = initialTasks.find(t => t.id === activeId);
      if (originalTask && originalTask.matrixColumn !== finalTask.matrixColumn) {
        // Sync with backend
        try {
          await updateTaskColumn(finalTask.id, finalTask.matrixColumn);
        } catch (e) {
          // Revert if failed
          setTasks(initialTasks);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full min-h-[600px]">
        {COLUMNS.map((col) => (
          <Column key={col.id} column={col} tasks={tasks.filter(t => t.matrixColumn === col.id)} />
        ))}
      </div>

      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }) }}>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
