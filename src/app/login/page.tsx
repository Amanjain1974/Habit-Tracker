"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wind } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* Left Panel (Marketing/Brand) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-muted/30 border-r border-border relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-2 text-primary">
          <Wind className="h-6 w-6" />
          <span className="font-bold tracking-widest uppercase text-sm">Momentum</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-serif font-bold text-foreground leading-tight mb-6">
            Small habits.<br/>Compound returns.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Replace the chaos of spreadsheets with a calm, fast, and rewarding system to track what actually matters.
          </p>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Momentum App. Personal use only.
        </div>
      </div>

      {/* Right Panel (Auth Form) */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 md:p-24">
        
        {/* Mobile Header (Visible only on small screens) */}
        <div className="flex lg:hidden items-center gap-2 text-primary mb-12">
          <Wind className="h-6 w-6" />
          <span className="font-bold tracking-widest uppercase text-sm">Momentum</span>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  className="h-12 px-4 bg-muted/20"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="h-12 px-4 bg-muted/20"
                />
              </div>
            </div>

            <Button className="w-full h-12 text-base font-medium" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline transition-all">
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
