"use client";

import { useState } from "react";
import { createTask } from "@/actions/task.actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickAddMatrixTask() {
  const [title, setTitle] = useState("");
  const [column, setColumn] = useState(1); // Default to Do Now
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await createTask({ 
        title, 
        matrixColumn: column,
        status: "TODO"
      });
      toast.success("Task added to matrix");
      setTitle("");
    } catch (err) {
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4 bg-card border border-border p-3 rounded-lg shadow-sm">
      <input 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Quick add task..." 
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground w-full px-2"
        disabled={loading}
      />
      
      <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        {[
          { id: 1, label: "Do", bg: "bg-destructive/10 text-destructive border-destructive/20" },
          { id: 2, label: "Schedule", bg: "bg-primary/10 text-primary border-primary/20" },
          { id: 3, label: "Delegate", bg: "bg-warning/10 text-warning border-warning/20" },
          { id: 4, label: "Eliminate", bg: "bg-muted text-muted-foreground border-border" }
        ].map(col => (
          <button
            key={col.id}
            type="button"
            onClick={() => setColumn(col.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-md border whitespace-nowrap transition-all ${
              column === col.id ? `${col.bg} shadow-sm ring-1 ring-current` : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted'
            }`}
          >
            {col.label}
          </button>
        ))}
      </div>
      
      <Button type="submit" size="sm" disabled={!title.trim() || loading} className="w-full md:w-auto">
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>
    </form>
  );
}
