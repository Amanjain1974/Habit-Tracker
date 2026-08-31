"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className={`flex items-center gap-3 p-2 rounded-lg opacity-50 ${collapsed ? 'justify-center' : ''}`}>
      <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
      {!collapsed && <div className="h-4 w-16 bg-muted rounded animate-pulse" />}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-sm font-medium transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground outline-none ${collapsed ? 'justify-center' : ''}`}
        >
          {theme === "dark" ? <Moon className="h-4 w-4 shrink-0" /> : theme === "light" ? <Sun className="h-4 w-4 shrink-0" /> : <Laptop className="h-4 w-4 shrink-0" />}
          {!collapsed && <span className="truncate">Theme</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={collapsed ? "center" : "end"} className="w-40 bg-background/95 backdrop-blur-md border-border/50">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2">
          <Sun className="h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2">
          <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2">
          <Laptop className="h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
