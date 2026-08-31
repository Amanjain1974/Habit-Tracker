"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Palette, Bell, Target, Clock, CalendarDays, ShieldAlert, Command as CommandIcon, Check, LogOut, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "productivity", label: "Productivity", icon: Target },
  { id: "focus", label: "Focus", icon: Clock },
  { id: "habits", label: "Habits", icon: CalendarDays },
  { id: "privacy", label: "Data & Privacy", icon: ShieldAlert },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: CommandIcon },
];

export default function SettingsClient({ user }: { user: any }) {
  const [activeSection, setActiveSection] = useState("account");
  
  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 min-h-[600px]">
      
      {/* Settings Navigation */}
      <nav className="w-full md:w-64 shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-4 md:pb-0 scrollbar-none border-b md:border-b-0 md:border-r border-border/50 md:pr-6">
        {SETTINGS_SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === section.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {activeSection === section.id && (
              <motion.div 
                layoutId="activeSettingsTab"
                className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <section.icon className={`h-4 w-4 ${activeSection === section.id ? "text-primary" : "opacity-70"}`} />
            {section.label}
          </button>
        ))}
      </nav>

      {/* Settings Content area */}
      <div className="flex-1 w-full max-w-2xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeSection === "account" && <AccountSettings user={user} />}
            {activeSection === "appearance" && <AppearanceSettings />}
            {activeSection === "notifications" && (
              <PlaceholderSettings 
                title="Notifications" 
                description="Configure when and how you receive alerts." 
                items={[
                  { label: "Task Reminders", desc: "Get notified when important tasks are due." },
                  { label: "Habit Reminders", desc: "Daily nudges to keep your streak alive." },
                  { label: "Daily Planning", desc: "Morning reminder to plan your day." },
                  { label: "Weekly Review", desc: "End of week reminder to review progress." }
                ]}
              />
            )}
            {activeSection === "productivity" && (
              <PlaceholderSettings 
                title="Productivity Preferences" 
                description="Configure matrix behavior and default task settings." 
                items={[
                  { label: "Show Productivity Score", desc: "Display your score on the main dashboard." },
                  { label: "Limit Top Priorities", desc: "Restrict to exactly 3 top priorities." },
                  { label: "Auto-roll Unfinished Tasks", desc: "Automatically move unfinished tasks to the next day." }
                ]}
              />
            )}
            {activeSection === "focus" && (
              <PlaceholderSettings 
                title="Focus Mode" 
                description="Configure default focus durations and break intervals." 
                items={[
                  { label: "Auto Start Breaks", desc: "Automatically start break timer after focus." },
                  { label: "Auto Start Focus", desc: "Automatically start focus timer after break." },
                  { label: "Ambient Sounds", desc: "Play subtle white noise during focus sessions." }
                ]}
              />
            )}
            {activeSection === "habits" && (
              <PlaceholderSettings 
                title="Habit Preferences" 
                description="Configure default views and milestone tracking." 
                items={[
                  { label: "Show Streak Milestones", desc: "Celebrate 7, 14, 30, 60, and 100 day streaks." },
                  { label: "Default to Calendar View", desc: "Open habits in the visual grid view." }
                ]}
              />
            )}
            {activeSection === "privacy" && <PrivacySettings />}
            {activeSection === "shortcuts" && <ShortcutsSettings />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

// -- Subcomponents --

function AccountSettings({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information.</p>
      </div>
      
      <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold shadow-inner">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{user?.name || "User"}</h3>
            <p className="text-muted-foreground text-sm">{user?.email || "No email provided"}</p>
          </div>
        </div>

        <div className="h-px bg-border/50 w-full" />
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input defaultValue={user?.name || ""} disabled className="max-w-md bg-muted/30" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Managed via NextAuth Provider</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how FINISH IT looks.</p>
      </div>
      
      <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-4">Theme Preference</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button 
              onClick={() => { setTheme("light"); toast("Theme changed to Light"); }}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
            >
              <div className="h-16 w-full rounded-md bg-[#F7F7F8] border border-border/50 p-2 flex flex-col gap-2">
                <div className="h-2 w-1/2 bg-[#E4E4E7] rounded" />
                <div className="h-4 w-3/4 bg-[#18181B] rounded" />
              </div>
              <span className="text-sm font-medium flex items-center gap-2">
                Light {theme === 'light' && <Check className="h-3 w-3 text-primary" />}
              </span>
            </button>

            <button 
              onClick={() => { setTheme("dark"); toast("Theme changed to Dark"); }}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
            >
              <div className="h-16 w-full rounded-md bg-[#09090B] border border-white/10 p-2 flex flex-col gap-2">
                <div className="h-2 w-1/2 bg-[#27272A] rounded" />
                <div className="h-4 w-3/4 bg-[#7C3AED] rounded" />
              </div>
              <span className="text-sm font-medium flex items-center gap-2">
                Dark {theme === 'dark' && <Check className="h-3 w-3 text-primary" />}
              </span>
            </button>

            <button 
              onClick={() => { setTheme("system"); toast("Theme changed to System default"); }}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
            >
              <div className="h-16 w-full rounded-md bg-gradient-to-br from-[#F7F7F8] to-[#09090B] border border-border/50 p-2 flex flex-col gap-2 opacity-80" />
              <span className="text-sm font-medium flex items-center gap-2">
                System {theme === 'system' && <Check className="h-3 w-3 text-primary" />}
              </span>
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Data & Privacy</h2>
        <p className="text-sm text-muted-foreground">Manage your data and account security.</p>
      </div>

      <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-1">Export Data</h3>
          <p className="text-xs text-muted-foreground mb-4">Download a JSON file containing all your tasks, habits, and focus logs.</p>
          <Button variant="outline" className="border-border/50" onClick={() => toast("Your data is being prepared for export. This may take a moment.")}>Export My Data</Button>
        </div>
      </div>
      
      <div className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4" /> Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Destructive actions related to your account.</p>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out of all devices
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto justify-start"
              onClick={() => {
                if(window.confirm("Are you sure? Deleting your account cannot be undone.")) {
                  toast.error("Account deletion requested. Please check your email to confirm.");
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutsSettings() {
  const shortcuts = [
    { action: "Command Palette / Quick Add", keys: ["⌘ / Ctrl", "K"] },
    { action: "Navigate to Dashboard", keys: ["G", "D"] },
    { action: "Navigate to Tasks", keys: ["G", "T"] },
    { action: "Start Focus Mode", keys: ["G", "F"] },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Keyboard Shortcuts</h2>
        <p className="text-sm text-muted-foreground">Navigate FINISH IT faster.</p>
      </div>

      <div className="p-1 rounded-2xl border border-border/50 bg-card overflow-hidden">
        {shortcuts.map((shortcut, i) => (
          <div key={i} className={`flex items-center justify-between p-4 ${i !== shortcuts.length - 1 ? 'border-b border-border/50' : ''}`}>
            <span className="text-sm font-medium">{shortcut.action}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((k, j) => (
                <span key={j} className="px-2 py-1 bg-muted rounded-md text-[10px] font-bold text-muted-foreground border border-border/50 shadow-sm">
                  {k}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderSettings({ title, description, items }: { title: string, description: string, items: { label: string, desc: string }[] }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="p-1 rounded-2xl border border-border/50 bg-card overflow-hidden">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center justify-between p-4 ${i !== items.length - 1 ? 'border-b border-border/50' : ''}`}>
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Checkbox 
              defaultChecked={i === 0 || i === 2}
              onCheckedChange={() => toast("Settings saved.")}
              className="h-5 w-5 rounded-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  )
}
