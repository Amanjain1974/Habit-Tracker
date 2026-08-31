"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function NotesPage() {
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("finish_it_notes");
    if (saved) setNote(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem("finish_it_notes", note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Notes</h1>
          <p className="text-muted-foreground mt-2">
            Jot down thoughts, ideas, or brain dumps here.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaved}>
          {isSaved ? "Saved!" : "Save Notes"}
        </Button>
      </div>

      <div className="flex-1">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Start typing your notes here..."
          className="w-full h-full min-h-[500px] p-6 rounded-xl border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
        />
      </div>
    </div>
  );
}
