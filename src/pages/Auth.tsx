import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Mail, ArrowRight, Home } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address.",
      });
      return false;
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Authenticate with Supabase (normal flow only - no vuln-login fallback)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.session) {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Session not established. Please try again.");
        }
      }
      
      // Show success toast
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error: any) {
      let errorMessage = error.message || "An unexpected error occurred. Please try again.";
      
      // Handle specific Supabase errors
      if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message?.includes("Invalid login credentials") || error.message?.includes("Invalid email or password")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-hero)" }}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-blue-500/10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce animation-delay-200"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-secondary/20 rounded-full animate-bounce animation-delay-400"></div>
      <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-accent/20 rounded-full animate-bounce animation-delay-600"></div>
      <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-primary/20 rounded-full animate-bounce animation-delay-800"></div>
      
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6 animate-pulse shadow-2xl">
            <Shield className="w-10 h-10 text-secondary-foreground animate-bounce" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white via-blue-100 to-green-100 bg-clip-text text-transparent">Finovia Bank</h1>
          <p className="text-white/80 text-lg">Your trusted online banking partner</p>
        </div>

        <Card className="shadow-elevated animate-fade-in-up animation-delay-200">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Finovia Bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2 animate-fade-in-up animation-delay-400">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 animate-fade-in-up animation-delay-600">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-primary hover:underline"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>

            <div className="pt-4 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/")}
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
