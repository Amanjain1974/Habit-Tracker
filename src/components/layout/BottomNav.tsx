"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Grid2X2,
  Menu
} from "lucide-react";

// For mobile, we only show the 4 most important tabs + a menu button
const mobileItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Matrix", href: "/priority", icon: Grid2X2 },
  { title: "Habits", href: "/habits", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-card border-t pb-safe">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full py-2 space-y-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        );
      })}
      {/* We can add a drawer/sheet here for the remaining menu items in the future */}
      <button className="flex flex-col items-center justify-center w-full py-2 space-y-1 text-muted-foreground">
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-medium">Menu</span>
      </button>
    </nav>
  );
}
