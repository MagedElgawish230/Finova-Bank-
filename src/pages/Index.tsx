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
              Finovia Banking Made Simple,<br />
              <span className="text-transparent bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text">
                Secure, and Smart
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 animate-fade-in-up animation-delay-200 max-w-3xl mx-auto leading-relaxed">
              Experience the future of online banking with Finovia Bank. Fast transfers, real-time tracking, and enterprise-grade security that puts you in control.
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
              Why Choose Finovia Bank?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
              Finovia Banking That Works for You
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Built for modern banking needs with cutting-edge technology that puts you in control of your financial future
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group animate-fade-in-up animation-delay-200 border-2 hover:border-primary/20">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 shadow-lg">
                  <Lock className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">Finovia Bank-Level Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Multi-factor authentication and end-to-end encryption keep your money safe 24/7 with military-grade protection.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn more →
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group animate-fade-in-up animation-delay-400 border-2 hover:border-secondary/20">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-6 group-hover:from-secondary/30 group-hover:to-secondary/20 transition-all duration-300 shadow-lg">
                  <Zap className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors duration-300">Instant Transfers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Send money instantly to any Finovia Bank account with real-time confirmation and zero fees.
                </p>
                <div className="mt-4 flex items-center text-sm text-secondary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn more →
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group animate-fade-in-up animation-delay-600 border-2 hover:border-accent/20">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">Smart Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track every transaction with detailed history, smart categorization, and spending insights.
                </p>
                <div className="mt-4 flex items-center text-sm text-accent font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn more →
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group animate-fade-in-up animation-delay-800 border-2 hover:border-primary/20">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 shadow-lg">
                  <CreditCard className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">Easy Management</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Manage your account effortlessly with our intuitive dashboard and mobile-first design.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn more →
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group animate-fade-in-up animation-delay-1000 border-2 hover:border-secondary/20">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-6 group-hover:from-secondary/30 group-hover:to-secondary/20 transition-all duration-300 shadow-lg">
                  <Globe className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors duration-300">24/7 Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our dedicated support team is always ready to help you with any questions or concerns.
                </p>
                <div className="mt-4 flex items-center text-sm text-secondary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn more →
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:scale-105 group animate-fade-in-up animation-delay-1200 border-2 hover:border-accent/20">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300 shadow-lg">
                  <Shield className="w-8 h-8 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">FDIC Insured</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your deposits are protected up to $250,000 by FDIC insurance for complete peace of mind.
                </p>
                <div className="mt-4 flex items-center text-sm text-accent font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn more →
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.05),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in-up">
                <Shield className="w-4 h-4" />
                About Finovia Bank
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Your Trusted Financial Partner
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
                Founded on the principles of security, innovation, and customer-first service, Finovia Bank has been revolutionizing digital banking since 2020.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Story */}
              <div className="animate-fade-in-up animation-delay-600">
                <h3 className="text-3xl font-bold mb-6 text-foreground">Our Story</h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Finovia Bank was born from a simple vision: to make banking accessible, secure, and effortless for everyone. 
                    We believe that managing your finances shouldn't be complicated or stressful.
                  </p>
                  <p>
                    Our team of financial experts, security specialists, and technology innovators work tirelessly to 
                    create a banking experience that puts you in control of your financial future.
                  </p>
                  <p>
                    Today, we're proud to serve over 50,000 customers worldwide, processing millions of secure 
                    transactions every month with zero security incidents.
                  </p>
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                    <div className="text-sm text-muted-foreground">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary mb-2">$2B+</div>
                    <div className="text-sm text-muted-foreground">Assets Protected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Values */}
              <div className="animate-fade-in-up animation-delay-800">
                <h3 className="text-3xl font-bold mb-8 text-foreground">Our Values</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-card border-2 hover:border-primary/20 transition-all duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Security First</h4>
                      <p className="text-muted-foreground">Your financial data is protected with Finovia bank-level encryption and multi-factor authentication.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-card border-2 hover:border-secondary/20 transition-all duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Innovation</h4>
                      <p className="text-muted-foreground">We continuously improve our platform with cutting-edge technology and user feedback.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-card border-2 hover:border-accent/20 transition-all duration-300 hover:scale-105">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">Accessibility</h4>
                      <p className="text-muted-foreground">Finovia Banking should be available to everyone, everywhere, at any time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="mt-20 text-center animate-fade-in-up animation-delay-1000">
              <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-2xl border border-primary/10">
                <h3 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  "To democratize financial services by providing secure, accessible, and innovative Finovia banking solutions 
                  that empower individuals and businesses to achieve their financial goals with confidence and ease."
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-primary font-semibold">
                  <span>— Finovia Bank Leadership Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{ background: "var(--gradient-success)" }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-bounce animation-delay-200"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-bounce animation-delay-400"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-bounce animation-delay-600"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 animate-fade-in-up">
              <Shield className="w-4 h-4" />
              Join 50,000+ Happy Customers
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 animate-fade-in-up animation-delay-200 leading-tight">
              Ready to start your<br />
              <span className="text-transparent bg-gradient-to-r from-yellow-200 to-white bg-clip-text">
                secure Finovia banking journey?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Join thousands of satisfied customers who trust Finovia Bank for their financial needs. Start your journey today with $1000 free!
            </p>
            <div className="flex justify-center animate-fade-in-up animation-delay-600">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-secondary hover:bg-white/90 transition-all duration-300 hover:scale-110 hover:shadow-2xl text-lg px-8 py-4 shadow-lg">
                  🎉 Open Your Account Today
                </Button>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="mt-16 animate-fade-in-up animation-delay-800">
              <p className="text-white/70 mb-6 text-sm uppercase tracking-wider font-semibold">Trusted by leading companies</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/80 font-medium">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/80 font-medium">Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/80 font-medium">Global Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Finovia Bank. All rights reserved.</p>
            <p className="text-sm mt-2">Finovia Banking services powered by Lovable Cloud</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
