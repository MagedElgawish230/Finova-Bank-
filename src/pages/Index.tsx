import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Zap, CreditCard, BarChart3, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-blue-500/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce animation-delay-200"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary/20 rounded-full animate-bounce animation-delay-400"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent/20 rounded-full animate-bounce animation-delay-600"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-primary/20 rounded-full animate-bounce animation-delay-800"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary mb-8 animate-pulse shadow-2xl">
              <Shield className="w-12 h-12 text-secondary-foreground animate-bounce" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 bg-gradient-to-r from-white via-blue-100 to-green-100 bg-clip-text text-transparent animate-fade-in-up leading-tight">
              Banking Made Simple,<br />
              <span className="text-transparent bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text">
                Secure, and Smart
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 animate-fade-in-up animation-delay-200 max-w-3xl mx-auto leading-relaxed">
              Experience the future of online banking with Online Bank. Fast transfers, real-time tracking, and enterprise-grade security that puts you in control.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up animation-delay-400">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto transition-all duration-300 hover:scale-110 hover:shadow-2xl shadow-lg text-lg px-8 py-4">
                  🚀 Get Started Free
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl text-lg px-8 py-4">
                  🔐 Sign In
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 animate-fade-in-up animation-delay-600">
              <p className="text-white/70 mb-6 text-sm uppercase tracking-wider font-semibold">Trusted by thousands</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-white/80 font-medium">FDIC Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80 font-medium">Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80 font-medium">Instant Transfers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in-up">
              <Zap className="w-4 h-4" />
              Why Choose Online Bank?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
              Banking That Works for You
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Built for modern banking needs with cutting-edge technology that puts you in control of your financial future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Lock className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Bank-Level Security</h3>
                <p className="text-muted-foreground">
                  Multi-factor authentication and end-to-end encryption keep your money safe 24/7.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors duration-300">
                  <Zap className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors duration-300">Instant Transfers</h3>
                <p className="text-muted-foreground">
                  Send money instantly to any Online Bank account with real-time confirmation.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                  <BarChart3 className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors duration-300">Transaction History</h3>
                <p className="text-muted-foreground">
                  Track every transaction with detailed history and smart categorization.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <CreditCard className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">Easy Account Management</h3>
                <p className="text-muted-foreground">
                  Manage your account effortlessly with our intuitive dashboard interface.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors duration-300">
                  <Globe className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors duration-300">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Our dedicated support team is always ready to help you with any questions.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                  <Shield className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors duration-300">FDIC Insured</h3>
                <p className="text-muted-foreground">
                  Your deposits are protected up to $250,000 by FDIC insurance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: "var(--gradient-success)" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start your secure banking journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Online Bank for their financial needs.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-secondary hover:bg-white/90">
              Open Your Account Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Online Bank. All rights reserved.</p>
            <p className="text-sm mt-2">Banking services powered by Lovable Cloud</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
