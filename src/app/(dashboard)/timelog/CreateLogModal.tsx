"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTimeLog } from "@/actions/timelog.actions";

export default function CreateLogModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const activity = formData.get("activity") as string;
    const category = formData.get("category") as string;
    const duration = parseInt(formData.get("duration") as string);
    const productivity = parseInt(formData.get("productivity") as string);
    
    try {
      // For manual logs, we assume it just finished now
      const startTime = new Date(Date.now() - duration * 60000);
      
      await createTimeLog({ 
        activity, 
        category,
        duration,
        productivityRating: productivity,
        startTime
      });
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Manual Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Log Time</DialogTitle>
            <DialogDescription>
              Manually add a completed session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activity">Activity</Label>
              <Input id="activity" name="activity" required placeholder="What did you do?" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category" 
                name="category" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Deep Work">Deep Work</option>
                <option value="Study">Study</option>
                <option value="Coding">Coding</option>
                <option value="Gym">Gym</option>
                <option value="Reading">Reading</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" name="duration" type="number" required placeholder="60" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productivity">Productivity (1-5)</Label>
              <Input id="productivity" name="productivity" type="number" min="1" max="5" defaultValue="4" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
