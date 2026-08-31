"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Title */}
        <h1 className="md:hidden text-xl font-bold tracking-tight text-primary">FINISH IT</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
          <span>Level 5</span>
          <span className="w-1 h-1 rounded-full bg-primary" />
          <span>840 XP</span>
        </div>
        {session?.user && (
          <div className="text-sm font-medium text-muted-foreground hidden sm:block">
            {session.user.name || session.user.email}
          </div>
        )}
        {/* Placeholder for User Profile / Avatar / Theme Toggle */}
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {session?.user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
