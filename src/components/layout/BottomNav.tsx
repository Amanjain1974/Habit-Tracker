"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, CalendarDays, Clock, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Grid2X2, Target, BarChart3, MessageSquare, FileText, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const mobileNavItems = [
  { title: "Today", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Habits", href: "/habits", icon: CalendarDays },
  { title: "Focus", href: "/timelog", icon: Clock },
];

const extraNavItems = [
  { title: "Matrix", href: "/priority", icon: Grid2X2 },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Coach", href: "/review", icon: MessageSquare },
  { title: "Notes", href: "/notes", icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md z-50 pb-safe">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
                <span className="text-[10px] font-medium">{item.title}</span>
              </Link>
            );
          })}
          
          {/* MORE MENU */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors">
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-4 pt-6 pb-8 border-t-0">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="text-xl font-bold tracking-tight">Menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-4">
                {extraNavItems.map(item => (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors text-center"
                  >
                    <div className="h-12 w-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{item.title}</span>
                  </Link>
                ))}
                
                <Link 
                  href="/settings" 
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                    <Settings className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Settings</span>
                </Link>
                
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Logout</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
