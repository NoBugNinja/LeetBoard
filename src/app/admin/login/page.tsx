"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/30 flex flex-col justify-center items-center p-6">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      
      <Card className="w-full max-w-md bg-background/60 backdrop-blur-xl border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/25 w-fit mb-4">
            <Code2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Login</CardTitle>
          <CardDescription>Sign in with your authorized Google account to manage the club.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full font-medium" 
            size="lg" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
          >
            {isLoading ? "Redirecting..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
