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
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Contact Support</CardTitle>
        <CardDescription>Have questions? We're here to help!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 animate-fade-in-up animation-delay-200">
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </Label>
              <div className="relative group">
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in-up animation-delay-400">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              placeholder="How can we help?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us more about your inquiry..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : (
              <>
                Send Message <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
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
  );
};

export default ContactForm;
