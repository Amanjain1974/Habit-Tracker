"use client";

import { useState } from "react";
import { Goal, GoalMilestone } from "@prisma/client";
import { updateGoalProgress, deleteGoal, toggleMilestone, createMilestone } from "@/actions/goal.actions";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Clock, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import { toast } from "sonner";

type GoalWithRelations = Goal & {
  tasks: { id: string, status: string }[];
  habits: { id: string }[];
  milestones: GoalMilestone[];
};

export default function GoalListClient({ initialGoals }: { initialGoals: GoalWithRelations[] }) {
  const [activeTab, setActiveTab] = useState<"SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM">("SHORT_TERM");
  
  const filteredGoals = initialGoals.filter(g => g.level === activeTab);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-card border rounded-lg w-fit shadow-sm">
        {(["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-xl">
            No goals set for this timeframe.
          </div>
        ) : (
          filteredGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)
        )}
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: GoalWithRelations }) {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    
    setLoading(true);
    try {
      await createMilestone(goal.id, newMilestoneTitle);
      setNewMilestoneTitle("");
    } catch (err) {
      toast.error("Failed to add milestone");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (milestoneId: string, currentDone: boolean) => {
    try {
      await toggleMilestone(milestoneId, !currentDone);
    } catch (e) {
      toast.error("Failed to update milestone");
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this goal?")) {
      await deleteGoal(goal.id);
    }
  }

  const completedMilestones = goal.milestones.filter(m => m.done).length;
  const progressPercent = goal.milestones.length > 0 
    ? Math.round((completedMilestones / goal.milestones.length) * 100) 
    : 0;

  // Deadline logic
  let isAtRisk = false;
  let deadlineText = "";
  if (goal.targetDate) {
    const target = new Date(goal.targetDate);
    if (isPast(target)) {
      deadlineText = "Overdue";
      isAtRisk = true;
    } else {
      const daysLeft = differenceInDays(target, new Date());
      deadlineText = `${daysLeft} days left`;
      
      // If less than 20% time remains but progress is < 80% (rough heuristic)
      if (daysLeft < 14 && progressPercent < 50) {
        isAtRisk = true;
      }
    }
  }

  return (
    <div className="flex flex-col border border-border bg-card rounded-xl p-5 shadow-sm hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate font-serif">{goal.title}</h3>
          {goal.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>}
        </div>
        
        {/* Progress Ring */}
        <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-border" />
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
              strokeDasharray={2 * Math.PI * 20} 
              strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)} 
              className="text-primary transition-all duration-500" 
            />
          </svg>
          <span className="absolute text-[10px] font-bold">{progressPercent}%</span>
        </div>
      </div>

      {/* Deadline Badge */}
      {goal.targetDate && (
        <div className={`flex items-center gap-1.5 w-fit px-2 py-1 rounded-md text-xs font-semibold mb-4
          ${isAtRisk ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}
        `}>
          {isAtRisk ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {deadlineText}
        </div>
      )}

      {/* Milestones Checklist */}
      <div className="flex-1 space-y-2 mb-4">
        {goal.milestones.map(m => (
          <div key={m.id} className="flex items-start gap-3">
            <Checkbox 
              checked={m.done} 
              onCheckedChange={() => handleToggle(m.id, m.done)}
              className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className={`text-sm ${m.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {m.title}
            </span>
          </div>
        ))}
      </div>

      {/* Add Milestone */}
      <form onSubmit={handleAddMilestone} className="flex gap-2 mb-4 mt-auto">
        <input 
          value={newMilestoneTitle}
          onChange={(e) => setNewMilestoneTitle(e.target.value)}
          placeholder="Add milestone..."
          className="flex-1 bg-transparent border-b border-border text-sm px-1 py-1 outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
          disabled={loading}
        />
        <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 rounded-full shrink-0" disabled={!newMilestoneTitle.trim() || loading}>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </Button>
      </form>

      {/* Footer Stats & Delete */}
      <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex gap-4">
          <span>{goal.tasks.length} tasks</span>
          <span>{goal.habits.length} habits</span>
        </div>
        <button onClick={handleDelete} className="hover:text-destructive transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
