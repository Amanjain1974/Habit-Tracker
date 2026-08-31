import { getTasks } from "@/actions/task.actions";
import TaskListClient from "./TaskListClient";
import CreateTaskModal from "./CreateTaskModal";

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2">Manage your to-do list and focus on what matters.</p>
        </div>
        <CreateTaskModal />
      </div>

      <TaskListClient initialTasks={tasks} />
    </div>
  );
}
