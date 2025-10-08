import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Mail, Lock, ArrowLeft } from "lucide-react";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your full name.",
      });
      return false;
    }

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // Get the created user from the signup response
      const { data: { user: createdUser } } = await supabase.auth.getUser();
      
      if (createdUser) {
        // Create profile immediately after successful signup
        try {
          const generateAccountNumber = () => {
            return Math.floor(Math.random() * 9000000000) + 1000000000; // 10-digit number
          };

          let accountNumber = generateAccountNumber().toString();
          let attempts = 0;
          const maxAttempts = 5;

          // Try to find a unique account number
          while (attempts < maxAttempts) {
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("account_number")
              .eq("account_number", accountNumber)
              .single();

            if (!existingProfile) {
              break; // Account number is unique
            }
            
            accountNumber = generateAccountNumber().toString();
            attempts++;
          }

          // Create profile
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: createdUser.id,
              full_name: fullName.trim(),
              email: email,
              account_number: accountNumber,
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            // Don't show error to user, profile might be created by trigger
          }
        } catch (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't show error to user, profile might be created by trigger
        }
      }

      toast({
        title: "Account Created!",
        description: "Please check your email and click the confirmation link to activate your account.",
      });
      navigate("/auth");
    } catch (error: any) {
      let errorMessage = error.message || "An unexpected error occurred. Please try again.";

      if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      }

      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Online Bank</h1>
          <p className="text-white/80">Create your secure banking account</p>
        </div>

        <Card className="shadow-elevated animate-fade-in-up animation-delay-200">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Start your secure banking journey with Online Bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm space-y-2">
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="text-primary hover:underline flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Already have an account? Sign in
                </button>
                <p className="text-xs text-muted-foreground">
                  After signing up, check your email for a confirmation link.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
