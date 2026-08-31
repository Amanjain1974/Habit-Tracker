import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Settings - FINISH IT",
  description: "Customize your FINISH IT experience",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Customize FINISH IT to work the way you do.</p>
      </div>

      <SettingsClient user={session?.user} />
    </div>
  );
}
