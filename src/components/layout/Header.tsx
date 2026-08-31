"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Simple title mapping
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Today";
    if (pathname === "/tasks") return "Tasks";
    if (pathname === "/priority") return "Priority Matrix";
    if (pathname === "/habits") return "Habits";
    if (pathname === "/goals") return "Goals";
    if (pathname === "/timelog") return "Focus Mode";
    if (pathname === "/analytics") return "Analytics";
    if (pathname === "/review") return "Daily Review";
    if (pathname === "/notes") return "Quick Notes";
    if (pathname === "/settings") return "Settings";
    return "";
  };

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
      
      {/* Mobile Title / Context */}
      <div className="flex items-center gap-2">
        <h1 className="md:hidden text-lg font-bold tracking-tight text-primary">FINISH IT</h1>
        <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
          <span className="opacity-50">Workspace</span>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Productivity Score / Gamification */}
        <div className="hidden sm:flex items-center gap-2 bg-secondary/50 text-secondary-foreground border px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all hover:bg-secondary">
          <span className="text-primary font-bold">LVL 5</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="text-muted-foreground">87 Score</span>
        </div>

        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        
        {/* Quick Add (Primary Action) */}
        <Button size="sm" className="h-8 gap-1 ml-1 rounded-md hidden sm:flex shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New</span>
        </Button>
      </div>
    </header>
  );
}
