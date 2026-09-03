import { getJournalEntries } from "@/actions/journal.actions";
import JournalClient from "./JournalClient";

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-tight">Journal</h1>
        <p className="text-muted-foreground mt-2">
          Clear your mind. Record your daily reflections and insights.
        </p>
      </div>

      <JournalClient initialEntries={entries} />
    </div>
  );
}
