import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";

interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  from_account_number: string;
  to_account_number: string;
  amount: number;
  transaction_type: string;
  status: string;
  description: string;
  created_at: string;
}

interface TransactionHistoryProps {
  userId: string;
}

const TransactionHistory = ({ userId }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Transaction fetch error:", error);
        setTransactions([]);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent banking activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-card animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="w-20 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent banking activity</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
            className="transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet. Start by making your first transfer!
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isSent = transaction.from_user_id === userId;
              const isReceived = transaction.to_user_id === userId;

              return (
                <div
                  key={transaction.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSent ? "bg-destructive/10" : "bg-secondary/10"
                    }`}
                  >
                    {isSent ? (
                      <ArrowUpRight className="w-5 h-5 text-destructive" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold">
                          {isSent ? "Sent to" : "Received from"} {isSent ? transaction.to_account_number : transaction.from_account_number}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isSent ? "text-destructive" : "text-secondary"}`}>
                          {isSent ? "-" : "+"}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
