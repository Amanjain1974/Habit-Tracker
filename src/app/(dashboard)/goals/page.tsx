import { getGoals } from "@/actions/goal.actions";
import GoalListClient from "./GoalListClient";
import CreateGoalModal from "./CreateGoalModal";

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-2">
            Break down your vision into actionable milestones.
          </p>
        </div>
        <CreateGoalModal />
      </div>

      <GoalListClient initialGoals={goals} />
    </div>
  );
}
