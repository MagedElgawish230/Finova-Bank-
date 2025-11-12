import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Shield, ArrowUpRight } from "lucide-react";

interface TransferFormProps {
  profile: {
    id: string;
    account_number: string;
    balance: number;
  };
  onSuccess: () => void;
}

const TransferForm = ({ profile, onSuccess }: TransferFormProps) => {
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const validateTransfer = () => {
    if (!toAccount.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter recipient account number.",
      });
      return false;
    }

    if (toAccount.length !== 10 || !/^\d{10}$/.test(toAccount)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Account number must be exactly 10 digits.",
      });
      return false;
    }

    if (toAccount === profile.account_number) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Cannot transfer to your own account.",
      });
      return false;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid amount greater than $0.",
      });
      return false;
    }

    if (transferAmount > profile.balance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You only have $${profile.balance.toFixed(2)} available.`,
      });
      return false;
    }

    if (transferAmount < 0.01) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Minimum transfer amount is $0.01.",
      });
      return false;
    }

    return true;
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTransfer()) return;
    
    setShowConfirmDialog(true);
  };

  const confirmTransfer = async () => {
    setLoading(true);

    try {
      const transferAmount = parseFloat(amount);

      // Find recipient
      const { data: recipient, error: recipientError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("account_number", toAccount)
        .single();

      if (recipientError || !recipient) {
        throw new Error("Recipient account not found. Please verify the account number.");
      }

      // Update sender balance
      const { error: senderError } = await supabase
        .from("profiles")
        .update({ balance: profile.balance - transferAmount })
        .eq("id", profile.id);

      if (senderError) throw senderError;

      // Update recipient balance
      const { data: recipientProfile, error: recipientProfileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", recipient.id)
        .single();

      if (recipientProfileError) throw recipientProfileError;

      const { error: recipientUpdateError } = await supabase
        .from("profiles")
        .update({ balance: (recipientProfile.balance || 0) + transferAmount })
        .eq("id", recipient.id);

      if (recipientUpdateError) throw recipientUpdateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          from_user_id: profile.id,
          to_user_id: recipient.id,
          from_account_number: profile.account_number,
          to_account_number: toAccount,
          amount: transferAmount,
          transaction_type: "transfer",
          status: "completed",
          description: description.trim() || "Money transfer",
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Transfer Successful!",
        description: `Successfully transferred $${transferAmount.toFixed(2)} to ${recipient.full_name} (${toAccount})`,
      });

      setToAccount("");
      setAmount("");
      setDescription("");
      setShowConfirmDialog(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // SQLi Vulnerability example: Use fetch API to hit a vulnerable endpoint
  const doSqlInjection = async () => {
    // Example: custom vulnerable fetch
    // This endpoint could be a test one you add to your backend: /api/vuln-sqli?account=' + toAccount
    const res = await fetch(`/api/vuln-sqli?account=${toAccount}`);
    const data = await res.text();
    setDescription(data); // Display returned data as description!
  };

  return (
    <>
      <Card className="animate-3d-slide-up card-3d perspective-container">
      <CardHeader>
        <CardTitle className="text-3d-glow animate-3d-pulse">Transfer Money</CardTitle>
        <CardDescription className="animate-3d-slide-in-left animation-delay-3d-200">Send money to another Finovia Bank account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="space-y-2 animate-3d-slide-in-left animation-delay-3d-200">
            <Label htmlFor="toAccount" className="text-sm font-semibold flex items-center gap-2 hover-3d-tilt">
              <ArrowUpRight className="w-4 h-4 text-primary animate-3d-float" />
              Recipient Account Number
            </Label>
            <div className="relative group">
              <Input
                id="toAccount"
                type="text"
                placeholder="Enter 10-digit account number"
                value={toAccount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setToAccount(value);
                }}
                maxLength={10}
                className="input-3d transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                required
              />
              <div className="absolute right-3 top-3 text-xs text-muted-foreground animate-3d-pulse">
                {toAccount.length}/10
              </div>
            </div>
            <p className="text-xs text-muted-foreground animate-3d-slide-in-left animation-delay-3d-300">
              Enter the 10-digit account number of the recipient
            </p>
          </div>

          <div className="space-y-2 animate-3d-slide-in-right animation-delay-3d-400">
            <Label htmlFor="amount" className="text-sm font-semibold flex items-center gap-2 hover-3d-tilt">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-3d-float animation-delay-3d-200">
                <span className="text-white text-xs font-bold">$</span>
              </div>
              Transfer Amount
            </Label>
            <div className="relative group">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setAmount(value);
                }
              }}
              className="input-3d"
              required
            />
            </div>
            <p className="text-sm text-muted-foreground animate-3d-slide-in-left animation-delay-3d-500">
              Available balance: ${profile.balance.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2 animate-3d-zoom-in animation-delay-3d-600">
            <Label htmlFor="description" className="hover-3d-tilt">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this transfer for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-3d"
            />
          </div>

          <Button type="submit" className="w-full btn-3d hover-3d-lift animate-3d-bounce animation-delay-3d-800" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-3d-spin mr-2">⏳</div>
                Processing...
              </>
            ) : (
              <>
                Transfer <ArrowRight className="w-4 h-4 ml-2 animate-3d-float" />
              </>
            )}
          </Button>
          <Button type="button" onClick={doSqlInjection} className="w-full btn-3d hover-3d-lift mb-2 bg-red-600/80">
            Try Vulnerable SQLi (Demo)
          </Button>
        </form>
      </CardContent>
    </Card>

    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent className="card-3d perspective-container">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-3d-glow animate-3d-pulse">
            <Shield className="w-5 h-5 text-primary animate-3d-float" />
            Confirm Transfer
          </AlertDialogTitle>
          <AlertDialogDescription className="animate-3d-slide-in-left">
            Please review your transfer details before confirming:
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 animate-3d-zoom-in animation-delay-3d-200">
              <div className="hover-3d-tilt"><strong>To Account:</strong> {toAccount}</div>
              <div className="hover-3d-tilt"><strong>Amount:</strong> ${parseFloat(amount || "0").toFixed(2)}</div>
              <div className="hover-3d-tilt"><strong>Description:</strong> {description || "Money transfer"}</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground animate-3d-slide-in-left animation-delay-3d-400">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} className="btn-3d hover-3d-lift">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmTransfer} disabled={loading} className="btn-3d hover-3d-lift">
            {loading ? (
              <>
                <div className="animate-3d-spin mr-2">⏳</div>
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2 animate-3d-float" />
                Confirm Transfer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default TransferForm;
