import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Good Morning, {session?.user?.name?.split(" ")[0]} 👋 Let's finish what matters today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight">Tasks</h3>
          <p className="text-sm text-muted-foreground mt-2">8 / 10 completed</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight">Habits</h3>
          <p className="text-sm text-muted-foreground mt-2">6 / 8 completed</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight">Focus Time</h3>
          <p className="text-sm text-muted-foreground mt-2">3h 25m</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight">Finish Rate</h3>
          <p className="text-sm text-muted-foreground mt-2 text-primary font-bold">80%</p>
        </div>
      </div>
    </div>
  );
}
