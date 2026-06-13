"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { type AuditLog, type AuditCategory } from "@/types";
import { BarChart3, Shield, FileText, AlertTriangle } from "lucide-react";

const categories: AuditCategory[] = [
  "authentication", "authorization", "contact", "staff", "compensation",
  "financial", "payment", "communication", "hermes", "telegram", "webhook",
  "import", "export", "admin", "integration", "scheduled_job", "system_error",
];

export default function AuditAdminPage() {
  const { userAccess } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterAction, setFilterAction] = useState("");
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchData(); }, [organizationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let q = query(
        collection(db, "auditLogs"),
        where("organizationId", "==", organizationId),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snap = await getDocs(q);
      setLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AuditLog));
    } catch { toast.error("Failed to load audit logs"); }
    finally { setIsLoading(false); }
  };

  const filtered = logs.filter((l) => {
    if (filterCategory && l.category !== filterCategory) return false;
    if (filterAction && !l.action.toLowerCase().includes(filterAction.toLowerCase())) return false;
    return true;
  });

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = logs.filter((l) => l.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Track platform activity and changes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{logs.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Auth Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{logs.filter((l) => l.category === "authentication").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{logs.filter((l) => l.category === "admin").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{logs.filter((l) => l.category === "system_error").length}</div></CardContent>
        </Card>
      </div>

      {topCategories.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Top Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat === filterCategory ? "" : cat)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${filterCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-input hover:bg-muted"}`}
                >
                  {cat} ({count})
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>{filtered.length} entries.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Filter by action..." value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="w-48" />
            {filterCategory && (
              <button onClick={() => setFilterCategory("")} className="text-xs text-muted-foreground hover:text-foreground underline">
                Clear filter
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? <p className="text-sm text-muted-foreground">No audit logs found.</p> : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {filtered.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">{log.category}</span>
                      <span className="text-sm font-medium">{log.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.userEmail || log.userId} | {log.resourceType}: {log.resourceId}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleString() : ""}
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
