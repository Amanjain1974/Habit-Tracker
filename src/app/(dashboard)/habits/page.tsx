import { getHabits } from "@/actions/habit.actions";
import HabitCalendarClient from "./HabitCalendarClient";
import CreateHabitModal from "./CreateHabitModal";

export default async function HabitsPage() {
  const habits = await getHabits();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Consistency is your advantage. Track your daily routines.
          </p>
        </div>
        <CreateHabitModal />
      </div>

      <HabitCalendarClient initialHabits={habits} />
    </div>
  );
}
