"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Trash2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Idea {
  id: string;
  text: string;
  done: boolean;
}

export function IdeasWidget() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("momentum_ideas");
    if (saved) {
      try {
        setIdeas(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("momentum_ideas", JSON.stringify(ideas));
    }
  }, [ideas, mounted]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    setIdeas([{ id: Date.now().toString(), text: newIdea, done: false }, ...ideas]);
    setNewIdea("");
  };

  const toggleIdea = (id: string) => {
    setIdeas(ideas.map(idea => idea.id === id ? { ...idea, done: !idea.done } : idea));
  };

  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  if (!mounted) return null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[400px]">
      <div className="bg-primary/5 border-b border-border p-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="font-semibold font-serif">Scratchpad / Ideas</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {ideas.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 italic">Jot down app ideas, books, or courses here.</p>
        ) : (
          ideas.map(idea => (
            <div key={idea.id} className="flex items-start gap-2 group hover:bg-muted/50 p-1.5 rounded-md transition-colors -mx-1.5">
              <button 
                onClick={() => toggleIdea(idea.id)}
                className={`mt-0.5 shrink-0 h-4 w-4 rounded-sm border flex items-center justify-center transition-colors ${
                  idea.done ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40 hover:border-primary'
                }`}
              >
                {idea.done && <Check className="h-3 w-3" />}
              </button>
              <span className={`flex-1 text-sm ${idea.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {idea.text}
              </span>
              <button 
                onClick={() => deleteIdea(idea.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive text-muted-foreground transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="p-3 border-t border-border bg-muted/10 flex gap-2">
        <input 
          value={newIdea}
          onChange={e => setNewIdea(e.target.value)}
          placeholder="New idea..."
          className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-muted-foreground" disabled={!newIdea.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
