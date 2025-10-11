import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Home, User, Mail } from "lucide-react";

interface ContactFormProps {
  userId: string;
}

const ContactForm = ({ userId }: ContactFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your name.",
      });
      return false;
    }

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your email address.",
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

    if (!subject.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a subject.",
      });
      return false;
    }

    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your message.",
      });
      return false;
    }

    if (message.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Message must be at least 10 characters long.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.from("contact_messages").insert({
        user_id: userId,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-3d-slide-up card-3d perspective-container">
      <CardHeader>
        <CardTitle className="text-3d-glow animate-3d-pulse">Contact Support</CardTitle>
        <CardDescription className="animate-3d-slide-in-left animation-delay-3d-200">Have questions? We're here to help!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 animate-3d-slide-in-left animation-delay-3d-200">
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2 hover-3d-tilt">
                <User className="w-4 h-4 text-primary animate-3d-float" />
                Full Name
              </Label>
              <div className="relative group">
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-3d transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-3d-slide-in-right animation-delay-3d-400">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 hover-3d-tilt">
                <Mail className="w-4 h-4 text-primary animate-3d-float animation-delay-3d-200" />
                Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-3d transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 animate-3d-zoom-in animation-delay-3d-600">
            <Label htmlFor="subject" className="hover-3d-tilt">Subject</Label>
            <Input
              id="subject"
              type="text"
              placeholder="How can we help?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-3d"
              required
            />
          </div>

          <div className="space-y-2 animate-3d-zoom-in animation-delay-3d-800">
            <Label htmlFor="message" className="hover-3d-tilt">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us more about your inquiry..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="input-3d"
              required
            />
          </div>

          <Button type="submit" className="w-full btn-3d animate-3d-bounce animation-delay-3d-1000" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-3d-spin mr-2">⏳</div>
                Sending...
              </>
            ) : (
              <>
                Send Message <Send className="w-4 h-4 ml-2 animate-3d-float" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t mt-4 animate-3d-slide-up animation-delay-3d-1200">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full btn-3d hover-3d-lift" 
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2 animate-3d-float" />
            Return to Homepage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
