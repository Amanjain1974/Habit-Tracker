"use client";

import { useState, useEffect } from "react";
import { JournalEntry } from "@prisma/client";
import { saveJournalEntry } from "@/actions/journal.actions";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export default function JournalClient({ initialEntries }: { initialEntries: JournalEntry[] }) {
  const [date, setDate] = useState<Date>(new Date());
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load entry for selected date
  useEffect(() => {
    const entry = initialEntries.find(e => isSameDay(new Date(e.date), date));
    setContent(entry?.content || "");
  }, [date, initialEntries]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveJournalEntry(date, content);
      toast.success("Journal saved");
    } catch (e) {
      toast.error("Failed to save journal");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
      
      {/* Sidebar - Date Picker */}
      <div className="w-full md:w-80 shrink-0 bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col">
        <h2 className="font-semibold text-lg mb-4 font-serif">Select Date</h2>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && setDate(d)}
          className="rounded-md border mx-auto"
        />
        
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Past Entries</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
            {initialEntries.map(entry => (
              <button
                key={entry.id}
                onClick={() => setDate(new Date(entry.date))}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  isSameDay(new Date(entry.date), date) 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {format(new Date(entry.date), "MMM d, yyyy")}
              </button>
            ))}
            {initialEntries.length === 0 && (
              <p className="text-sm text-muted-foreground italic px-2">No entries yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-5 w-5" />
            <span className="font-semibold text-foreground">{format(date, "EEEE, MMMM do, yyyy")}</span>
          </div>
          <Button onClick={handleSave} disabled={isSaving || !content.trim()} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today? Write your daily reflection..."
          className="flex-1 w-full p-6 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed font-sans"
        />
      </div>

    </div>
  );
}
