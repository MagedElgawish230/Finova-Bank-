import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Zap, CreditCard, BarChart3, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-primary/5 via-purple-50/20 to-background dark:from-primary/10 dark:via-purple-900/10 dark:to-background pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-accent/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 mb-6 hover-lift shadow-lg">
              <Shield className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-5xl md:text-8xl font-bold tracking-tight animate-fade-in-up leading-tight">
              Banking Made <br />
              <span className="text-gradient">
                Simple & Secure
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Experience the future of finance with Finovia. Fast transfers, real-time tracking, and enterprise-grade security wrapped in a beautiful interface.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up animation-delay-400">
              <Link to="/signup">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all duration-300 bg-primary hover:bg-primary/90">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-2 hover:bg-background/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-20 animate-fade-in-up animation-delay-600">
              <p className="text-muted-foreground/60 text-sm font-bold uppercase tracking-[0.2em] mb-8">Trusted by thousands globally</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <span className="font-bold text-lg">FDIC Insured</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary" />
                  <span className="font-bold text-lg">Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <span className="font-bold text-lg">Instant Transfers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-none hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">Smart Cards</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Virtual and physical cards with advanced controls and real-time notifications for every transaction.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Understand your spending habits with beautiful, intuitive charts and categorized breakdowns.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold">Global Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access your funds from anywhere in the world with competitive exchange rates and no hidden fees.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
