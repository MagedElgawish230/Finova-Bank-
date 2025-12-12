import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowUpRight, ArrowDownLeft, History, MessageSquare, Wallet } from "lucide-react";
import TransferForm from "@/components/TransferForm";
import TransactionHistory from "@/components/TransactionHistory";
import ContactForm from "@/components/ContactForm";

interface Profile {
  id: string;
  full_name: string;
  account_number: string;
  balance: number;
  email: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "transfer" | "history" | "contact">("overview");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const checkAuth = async () => {
      // Give more time for session to be established after login
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!mounted) return;

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          setIsCheckingAuth(false);
          // Only redirect on auth state change if session is lost, not on initial load
          if (!session && event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') {
            navigate("/auth");
          }
        }
      );

      subscription = sub;

      // Try multiple times to get session (in case it's still being established)
      let session = null;
      let attempts = 0;
      while (!session && attempts < 5) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        session = currentSession;
        if (!session) {
          await new Promise(resolve => setTimeout(resolve, 300));
          attempts++;
        }
      }

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);

      if (!session) {
        // Give one more chance - wait a bit longer
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (!finalSession) {
          console.warn("No session found in Dashboard, redirecting to auth");
          navigate("/auth");
        } else {
          setSession(finalSession);
          setUser(finalSession?.user ?? null);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile);
        return;
      }

      // If no profile exists, create one
      console.log("No profile found, creating new profile...");

      // Generate a simple account number
      const accountNumber = Date.now().toString().slice(-10); // Use timestamp for uniqueness

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email || '',
          account_number: accountNumber,
          balance: 1000.00, // Give new users $1000 starting balance
        })
        .select()
        .single();

      if (createError) {
        console.error("Profile creation error:", createError);

        // If profile already exists (race condition), try to fetch it
        if (createError.code === '23505') {
          console.log("Profile already exists, fetching...");
          const { data: existingData, error: refetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (refetchError) {
            console.error("Error re-fetching profile:", refetchError);
            toast({
              variant: "destructive",
              title: "Error",
              description: `Failed to load profile: ${refetchError.message}`,
            });
          } else {
            setProfile(existingData);
            toast({
              title: "Welcome!",
              description: "Your account is ready.",
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to create profile: ${createError.message}`,
          });
        }
      } else {
        setProfile(newProfile);
        toast({
          title: "Welcome!",
          description: "Your account has been created with $1000 starting balance.",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchProfile();

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Profile updated via realtime:", payload);
            setProfile(payload.new as Profile);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isCheckingAuth || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <h2 className="text-lg font-semibold">Loading your account...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Finovia Bank</h1>
              <p className="text-sm text-muted-foreground">Welcome, {profile.full_name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="btn-3d hover-3d-lift">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="mb-8">
          <Card className="shadow-elevated relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
            {/* Animated Background Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full bg-3d-element"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full bg-3d-element"></div>
            <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full bg-3d-element"></div>
            <div className="absolute bottom-1/4 right-1/3 w-14 h-14 bg-white/10 rounded-full bg-3d-element"></div>

            <CardHeader className="relative z-10">
              <CardDescription className="text-white/80 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Available Balance
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-white">
                {formatCurrency(profile.balance)}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center gap-2 text-white/90">
                <p className="text-sm">Account: {profile.account_number}</p>
                <div className="ml-auto">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="btn-3d hover-3d-lift flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "transfer" ? "default" : "outline"}
            onClick={() => setActiveTab("transfer")}
            className="btn-3d hover-3d-lift flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Transfer
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="btn-3d hover-3d-lift flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            History
          </Button>
          <Button
            variant={activeTab === "contact" ? "default" : "outline"}
            onClick={() => setActiveTab("contact")}
            className="btn-3d hover-3d-lift flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Contact
          </Button>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover-3d-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-destructive" />
                    Send Money
                  </CardTitle>
                  <CardDescription>Transfer to another account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab("transfer")} className="w-full btn-3d hover-3d-scale">
                    Make Transfer
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-3d-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>View your transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab("history")} className="w-full btn-3d hover-3d-scale">
                    View History
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-3d-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-secondary" />
                    Support
                  </CardTitle>
                  <CardDescription>Get help from our team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab("contact")} className="w-full btn-3d hover-3d-scale">
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "transfer" && (
            <TransferForm profile={profile} onSuccess={fetchProfile} />
          )}

          {activeTab === "history" && <TransactionHistory userId={user?.id || ""} onTransactionsRefresh={fetchProfile} />}

          {activeTab === "contact" && <ContactForm userId={user?.id || ""} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
