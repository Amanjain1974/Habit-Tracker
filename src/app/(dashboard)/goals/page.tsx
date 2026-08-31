import { getGoals } from "@/actions/goal.actions";
import GoalListClient from "./GoalListClient";
import CreateGoalModal from "./CreateGoalModal";

export default async function GoalsPage() {
  const goals = await getGoals();

  const longTerm = goals.filter(g => g.level === "LONG_TERM");
  const mediumTerm = goals.filter(g => g.level === "MEDIUM_TERM");
  const shortTerm = goals.filter(g => g.level === "SHORT_TERM");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-2">
            Break down your vision into actionable milestones.
          </p>
        </div>
        <CreateGoalModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GoalListClient title="Long-Term Goals" goals={longTerm} color="bg-blue-500/10 border-blue-500/20" />
        <GoalListClient title="Medium-Term Goals" goals={mediumTerm} color="bg-purple-500/10 border-purple-500/20" />
        <GoalListClient title="Short-Term Goals" goals={shortTerm} color="bg-orange-500/10 border-orange-500/20" />
      </div>
    </div>
  );
}
