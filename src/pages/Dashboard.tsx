import { useEffect, useState } from "react";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile",
      });
    } else {
      setProfile(data);
    }
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your account...</p>
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
              <h1 className="text-xl font-bold">SecureBank</h1>
              <p className="text-sm text-muted-foreground">Welcome, {profile.full_name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Balance Card */}
        <div className="mb-8">
          <Card className="shadow-elevated" style={{ background: "var(--gradient-primary)" }}>
            <CardHeader>
              <CardDescription className="text-white/80">Available Balance</CardDescription>
              <CardTitle className="text-4xl font-bold text-white">
                {formatCurrency(profile.balance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-white/90">
                <p className="text-sm">Account: {profile.account_number}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "transfer" ? "default" : "outline"}
            onClick={() => setActiveTab("transfer")}
            className="flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Transfer
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            History
          </Button>
          <Button
            variant={activeTab === "contact" ? "default" : "outline"}
            onClick={() => setActiveTab("contact")}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Contact
          </Button>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-destructive" />
                    Send Money
                  </CardTitle>
                  <CardDescription>Transfer to another account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab("transfer")} className="w-full">
                    Make Transfer
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>View your transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab("history")} className="w-full">
                    View History
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-secondary" />
                    Support
                  </CardTitle>
                  <CardDescription>Get help from our team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab("contact")} className="w-full">
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "transfer" && (
            <TransferForm profile={profile} onSuccess={fetchProfile} />
          )}

          {activeTab === "history" && <TransactionHistory userId={user?.id || ""} />}

          {activeTab === "contact" && <ContactForm userId={user?.id || ""} />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
