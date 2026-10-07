"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wind } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const mobile = formData.get("mobile") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, mobile }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* Left Panel (Marketing/Brand) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-muted/30 border-r border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-2 text-primary">
          <Wind className="h-6 w-6" />
          <span className="font-bold tracking-widest uppercase text-sm">Momentum</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-serif font-bold text-foreground leading-tight mb-6">
            Build your personal<br/>operating system.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join Momentum to take control of your habits, focus your time, and reach your goals.
          </p>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Momentum App. Personal use only.
        </div>
      </div>

      {/* Right Panel (Auth Form) */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 md:p-16">
        
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center gap-2 text-primary mb-10">
          <Wind className="h-6 w-6" />
          <span className="font-bold tracking-widest uppercase text-sm">Momentum</span>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground">
              Enter your details below to get started.
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
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="John Doe"
                  className="h-11 px-4 bg-muted/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  className="h-11 px-4 bg-muted/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input 
                  id="mobile" 
                  name="mobile" 
                  type="tel" 
                  placeholder="+1234567890"
                  className="h-11 px-4 bg-muted/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="h-11 px-4 bg-muted/20"
                />
              </div>
            </div>

            <Button className="w-full h-12 text-base font-medium" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
