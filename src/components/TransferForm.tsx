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

  return (
    <>
      <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Transfer Money</CardTitle>
        <CardDescription>Send money to another Finovia Bank account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-6">
          <div className="space-y-2 animate-fade-in-up animation-delay-200">
            <Label htmlFor="toAccount" className="text-sm font-semibold flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-primary" />
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
                className="transition-all duration-300 focus:scale-105 focus:shadow-lg border-2 hover:border-primary/50 focus:border-primary"
                required
              />
              <div className="absolute right-3 top-3 text-xs text-muted-foreground">
                {toAccount.length}/10
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the 10-digit account number of the recipient
            </p>
          </div>

          <div className="space-y-2 animate-fade-in-up animation-delay-400">
            <Label htmlFor="amount" className="text-sm font-semibold flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
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
              required
            />
            </div>
            <p className="text-sm text-muted-foreground">
              Available balance: ${profile.balance.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this transfer for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : (
              <>
                Transfer <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Confirm Transfer
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please review your transfer details before confirming:
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
              <div><strong>To Account:</strong> {toAccount}</div>
              <div><strong>Amount:</strong> ${parseFloat(amount || "0").toFixed(2)}</div>
              <div><strong>Description:</strong> {description || "Money transfer"}</div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmTransfer} disabled={loading}>
            {loading ? "Processing..." : "Confirm Transfer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default TransferForm;
