import { getTasks } from "@/actions/task.actions";
import PriorityMatrixClient from "./PriorityMatrixClient";

export default async function PriorityPage() {
  // Only get Active Tasks for the matrix
  const allTasks = await getTasks();
  const activeTasks = allTasks.filter(t => t.status !== "COMPLETED" && t.status !== "CANCELLED");

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Priority Matrix</h1>
        <p className="text-muted-foreground mt-1">
          Drag and drop tasks to organize by urgency and importance. Do what matters first.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <PriorityMatrixClient initialTasks={activeTasks} />
      </div>
    </div>
  );
}
