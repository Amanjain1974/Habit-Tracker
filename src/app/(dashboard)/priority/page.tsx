import { getTasks } from "@/actions/task.actions";
import PriorityMatrixClient from "./PriorityMatrixClient";
import QuickAddMatrixTask from "./QuickAddMatrixTask";

export default async function PriorityPage() {
  const allTasks = await getTasks();
  const activeTasks = allTasks.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED");

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Priority Matrix</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop tasks to organize by urgency and importance. Do what matters first.
          </p>
        </div>
        <div className="w-full xl:w-auto">
          <QuickAddMatrixTask />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <PriorityMatrixClient initialTasks={activeTasks} />
      </div>
    </div>
  );
}
