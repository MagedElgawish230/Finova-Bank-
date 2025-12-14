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
  const [showXss, setShowXss] = useState(false);

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
    <Card className="max-w-xl mx-auto border-none shadow-xl glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <Mail className="w-6 h-6" />
          </div>
          Contact Support
        </CardTitle>
        <CardDescription>Have questions? We're here to help!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 transition-all focus:scale-[1.01] bg-white/50 border-white/20 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 transition-all focus:scale-[1.01] bg-white/50 border-white/20 focus:bg-white"
                required
              />
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
              className="h-11 bg-white/50 border-white/20 focus:bg-white"
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
              className="resize-none bg-white/50 border-white/20 focus:bg-white"
              required
            />
          </div>

          <Button type="submit" className="w-full h-11 text-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? (
              <>
                Sending...
              </>
            ) : (
              <>
                Send Message <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {showXss && (
          <div style={{ background: '#fee', padding: 12, margin: '16px 0' }}>
            <b>XSS Vulnerable Preview (after send):</b>
            <div dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )}

        <div className="pt-4 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 hover:bg-secondary/5 border-secondary/20"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Homepage
          </Button>
        </div>
        <Button
          type="button"
          onClick={() => setShowXss(!showXss)}
          className="w-full mt-4 bg-yellow-400/80 hover:bg-yellow-400 text-black h-9 text-xs"
        >
          Toggle XSS Vulnerable Preview
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
