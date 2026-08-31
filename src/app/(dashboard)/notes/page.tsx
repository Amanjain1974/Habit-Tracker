"use client";

import { useState, useEffect } from "react";

export default function NotesPage() {
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("finish_it_notes");
    if (saved) setNote(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    setIsSaved(false);
  };

  useEffect(() => {
    if (!isSaved) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("finish_it_notes", note);
        setIsSaved(true);
      }, 1000); // Auto-save after 1 second of typing
      return () => clearTimeout(timeoutId);
    }
  }, [note, isSaved]);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8 opacity-50 focus-within:opacity-100 transition-opacity">
        <h1 className="text-xl font-bold tracking-tight">Scratchpad</h1>
        <span className="text-xs font-medium text-muted-foreground">
          {isSaved ? "Saved to browser" : "Saving..."}
        </span>
      </div>

      <textarea
        value={note}
        onChange={handleChange}
        placeholder="Start typing..."
        className="flex-1 w-full bg-transparent resize-none outline-none border-none focus:ring-0 text-lg md:text-xl leading-relaxed text-foreground placeholder:text-muted-foreground/30 font-medium"
      />
    </div>
  );
}
