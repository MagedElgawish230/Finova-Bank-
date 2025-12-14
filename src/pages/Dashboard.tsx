import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ArrowUpRight, History, MessageSquare, Wallet } from "lucide-react";
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
  const [_session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "transfer" | "history" | "contact">("overview");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
      const { data: existingProfile, error: _fetchError } = await supabase
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
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Finovia Bank</h1>
              <p className="text-sm text-muted-foreground">Welcome, {profile.full_name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Balance Card */}
        <div className="mb-8">
          <Card className="overflow-hidden border-none shadow-xl relative min-h-[240px] flex flex-col justify-between group rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-accent opacity-100 transition-all duration-500" />

            {/* Mesh Gradient Overlay */}
            <div className="absolute top-[-50%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[60px]" />

            <CardHeader className="relative z-10 pb-2">
              <CardDescription className="text-white/80 font-medium flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--secondary),0.5)]"></div>
                Available Balance
              </CardDescription>
              <CardTitle className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-sm">
                {formatCurrency(profile.balance)}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                <div className="space-y-1">
                  <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Account Number</p>
                  <p className="text-white font-mono tracking-widest text-lg">
                    **** **** {profile.account_number.slice(-4)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            onClick={() => setActiveTab("overview")}
            className={`rounded-full px-6 ${activeTab === "overview" ? "shadow-md scale-105" : "hover:bg-muted/50"} transition-all`}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "transfer" ? "default" : "ghost"}
            onClick={() => setActiveTab("transfer")}
            className={`rounded-full px-6 ${activeTab === "transfer" ? "shadow-md scale-105" : "hover:bg-muted/50"} transition-all`}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Transfer
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className={`rounded-full px-6 ${activeTab === "history" ? "shadow-md scale-105" : "hover:bg-muted/50"} transition-all`}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button
            variant={activeTab === "contact" ? "default" : "ghost"}
            onClick={() => setActiveTab("contact")}
            className={`rounded-full px-6 ${activeTab === "contact" ? "shadow-md scale-105" : "hover:bg-muted/50"} transition-all`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in-up">
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass-card border-none hover:bg-card/50 cursor-pointer group" onClick={() => setActiveTab("transfer")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                    Send Money
                  </CardTitle>
                  <CardDescription>Transfer to another Finovia account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl hover-lift bg-blue-600 hover:bg-blue-700 text-white shadow-md">Make Transfer</Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-none hover:bg-card/50 cursor-pointer group" onClick={() => setActiveTab("history")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <History className="w-6 h-6" />
                    </div>
                    Recent Activity
                  </CardTitle>
                  <CardDescription>View your transaction history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl hover-lift bg-purple-600 hover:bg-purple-700 text-white shadow-md">View History</Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-none hover:bg-card/50 cursor-pointer group" onClick={() => setActiveTab("contact")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    Support
                  </CardTitle>
                  <CardDescription>Get help from our team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-xl hover-lift bg-green-600 hover:bg-green-700 text-white shadow-md">Contact Us</Button>
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
