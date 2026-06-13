"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { type FinancialTransaction } from "@/types";
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";

export default function FinancialsAdminPage() {
  const { userAccess } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchData(); }, [organizationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "financialTransactions"), where("organizationId", "==", organizationId));
      const snap = await getDocs(q);
      setTransactions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FinancialTransaction));
    } catch { toast.error("Failed to load financials"); }
    finally { setIsLoading(false); }
  };

  const totalRevenue = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const net = totalRevenue - totalExpenses;
  const pendingCount = transactions.filter((t) => t.paymentStatus === "pending").length;

  const stats = [
    { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Expenses", value: `$${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-red-500" },
    { label: "Net", value: `$${net.toLocaleString()}`, icon: DollarSign, color: net >= 0 ? "text-blue-500" : "text-orange-500" },
    { label: "Pending", value: pendingCount, icon: CreditCard, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
        <p className="text-muted-foreground">Track transactions, revenue, and expenses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Transactions</CardTitle><CardDescription>{transactions.length} records.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : transactions.length === 0 ? <p className="text-sm text-muted-foreground">No transactions found.</p> : (
            <div className="space-y-2">
              {transactions.slice(0, 20).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{t.transactionType} — {t.category}</p>
                    <p className="text-xs text-muted-foreground">{t.sourceSystem} | {t.paymentStatus} | Period: {t.financialPeriodId}</p>
                  </div>
                  <p className={`font-semibold ${t.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {t.amount >= 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
