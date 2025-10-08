import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

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
  const { toast } = useToast();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transferAmount = parseFloat(amount);

      if (transferAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (transferAmount > profile.balance) {
        throw new Error("Insufficient balance");
      }

      if (toAccount === profile.account_number) {
        throw new Error("Cannot transfer to your own account");
      }

      // Find recipient
      const { data: recipient, error: recipientError } = await supabase
        .from("profiles")
        .select("id")
        .eq("account_number", toAccount)
        .single();

      if (recipientError || !recipient) {
        throw new Error("Recipient account not found");
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
          description: description || "Money transfer",
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Transfer Successful!",
        description: `Successfully transferred $${transferAmount.toFixed(2)} to account ${toAccount}`,
      });

      setToAccount("");
      setAmount("");
      setDescription("");
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Money</CardTitle>
        <CardDescription>Send money to another Online Bank account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="toAccount">Recipient Account Number</Label>
            <Input
              id="toAccount"
              type="text"
              placeholder="Enter 10-digit account number"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              maxLength={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
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
  );
};

export default TransferForm;
