"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Grid2X2, 
  CalendarDays, 
  Target, 
  Clock, 
  BarChart3,
  LogOut,
  Settings,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Moon
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const primaryNavItems = [
  { title: "Today", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Matrix", href: "/priority", icon: Grid2X2 },
  { title: "Habits", href: "/habits", icon: CalendarDays },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Focus", href: "/timelog", icon: Clock },
];

const secondaryNavItems = [
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Coach", href: "/review", icon: MessageSquare },
  { title: "Notes", href: "/notes", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-collapse on smaller desktop screens
    if (window.innerWidth < 1024) setCollapsed(true);
  }, []);

  if (!mounted) return <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar border-sidebar-border min-h-screen px-3 py-4 transition-all duration-300"></aside>;

  return (
    <aside 
      className={`hidden md:flex flex-col border-r bg-sidebar border-sidebar-border min-h-screen transition-all duration-300 ease-in-out relative
        ${collapsed ? 'w-[72px] px-2' : 'w-64 px-4'} py-6`}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 bg-background border border-border rounded-full p-1 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors z-10 shadow-sm"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      <div className={`flex items-center mb-8 transition-all ${collapsed ? 'justify-center' : 'px-2'}`}>
        <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
          F
        </div>
        {!collapsed && <h1 className="text-lg font-bold tracking-tight text-foreground ml-3 truncate">FINISH IT</h1>}
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-8 scrollbar-none">
        
        {/* PRIMARY NAV */}
        <nav className="space-y-1">
          {!collapsed && <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</div>}
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded-lg text-sm font-medium transition-all duration-200 
                  ${collapsed ? 'justify-center py-3' : 'px-3 py-2 gap-3'}
                  ${isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} ${isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground'}`} />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* SECONDARY NAV */}
        <nav className="space-y-1">
          {!collapsed && <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Insights</div>}
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded-lg text-sm font-medium transition-all duration-200
                  ${collapsed ? 'justify-center py-3' : 'px-3 py-2 gap-3'}
                  ${isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground'}`} />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-1 pt-6 border-t border-sidebar-border">
        <Link
          href="/settings"
          className={`group flex items-center rounded-lg text-sm font-medium transition-colors
            ${collapsed ? 'justify-center py-3' : 'px-3 py-2 gap-3'}
            text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground`} />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>
        
        {/* User Profile / Theme bottom section */}
        <div className={`mt-2 flex items-center border border-border/50 rounded-lg bg-background p-2 transition-all ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">Score: 87</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
