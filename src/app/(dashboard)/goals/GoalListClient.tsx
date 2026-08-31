"use client";

import { Goal } from "@prisma/client";
import { updateGoalProgress, deleteGoal } from "@/actions/goal.actions";
import { Button } from "@/components/ui/button";
import { Trash2, Target } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider"; // Will be added by shadcn

type GoalWithRelations = Goal & {
  tasks: { id: string, status: string }[];
  habits: { id: string }[];
};

export default function GoalListClient({ 
  title, 
  goals,
  color
}: { 
  title: string, 
  goals: GoalWithRelations[],
  color: string
}) {
  return (
    <div className={`rounded-xl border bg-card p-4 flex flex-col h-full shadow-sm`}>
      <div className={`p-3 rounded-lg mb-4 ${color}`}>
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Target className="h-5 w-5" /> {title}
        </h2>
      </div>
      
      <div className="space-y-4 flex-1">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No goals set in this timeframe.</p>
        ) : (
          goals.map(goal => (
            <GoalItem key={goal.id} goal={goal} />
          ))
        )}
      </div>
    </div>
  );
}

function GoalItem({ goal }: { goal: GoalWithRelations }) {
  const [progress, setProgress] = useState(goal.progress);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProgressChange = async (value: number[]) => {
    const newVal = value[0];
    setProgress(newVal);
  };

  const handleProgressCommit = async (value: number[]) => {
    const newVal = value[0];
    if (newVal !== goal.progress) {
      setIsUpdating(true);
      await updateGoalProgress(goal.id, newVal);
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this goal?")) {
      await deleteGoal(goal.id);
    }
  }

  const completedTasks = goal.tasks.filter(t => t.status === "COMPLETED").length;

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-medium leading-tight">{goal.title}</h3>
          {goal.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Slider 
          value={[progress]} 
          max={100} 
          step={5} 
          onValueChange={handleProgressChange}
          onValueCommit={handleProgressCommit}
          disabled={isUpdating}
          className="my-4"
        />
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
        <span>{goal.tasks.length} Tasks ({completedTasks} done)</span>
        <span>{goal.habits.length} Habits</span>
      </div>
    </div>
  )
}
