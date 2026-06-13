"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { type Integration } from "@/types";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function IntegrationsAdminPage() {
  const { userAccess } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchData(); }, [organizationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.integrations), where("organizationId", "==", organizationId));
      const snap = await getDocs(q);
      setIntegrations(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Integration));
    } catch { toast.error("Failed to load integrations"); }
    finally { setIsLoading(false); }
  };

  const statusIcon = (status: string) => {
    if (status === "active") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "error") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  const stats = [
    { label: "Total", value: integrations.length },
    { label: "Active", value: integrations.filter((i) => i.status === "active").length },
    { label: "Pending", value: integrations.filter((i) => i.status === "pending").length },
    { label: "Errors", value: integrations.filter((i) => i.status === "error" || (i.errorCount || 0) > 0).length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">View connected platforms and services.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Connected Integrations</CardTitle><CardDescription>{integrations.length} configured.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : integrations.length === 0 ? <p className="text-sm text-muted-foreground">No integrations found. Configure integrations in Settings.</p> : (
            <div className="space-y-2">
              {integrations.map((i) => (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {statusIcon(i.status)}
                    <div>
                      <p className="font-medium text-sm">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.provider} | {i.type} | {i.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {i.lastSyncAt && <p className="text-xs text-muted-foreground">Last sync: {new Date(i.lastSyncAt.seconds * 1000).toLocaleDateString()}</p>}
                    {(i.errorCount || 0) > 0 && <p className="text-xs text-red-500">{i.errorCount} errors</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
