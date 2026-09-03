import { getHabits } from "@/actions/habit.actions";
import HabitGridClient from "./HabitGridClient";
import CreateHabitModal from "./CreateHabitModal";

export default async function HabitsPage() {
  const habits = await getHabits();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Consistency is your advantage. Track your daily routines.
          </p>
        </div>
        <CreateHabitModal />
      </div>

      <HabitGridClient initialHabits={habits} />
    </div>
  );
}
