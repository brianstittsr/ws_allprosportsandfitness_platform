"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type CommunicationJob, type CommunicationTemplate } from "@/types";
import { Mail, MessageSquare, Send, Users } from "lucide-react";

export default function CommunicationsAdminPage() {
  const { userAccess } = useAuth();
  const [jobs, setJobs] = useState<CommunicationJob[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchData(); }, [organizationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const jobsQ = query(collection(db, COLLECTIONS.communicationJobs), where("organizationId", "==", organizationId));
      const jobsSnap = await getDocs(jobsQ);
      setJobs(jobsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CommunicationJob));

      const tmplQ = query(collection(db, COLLECTIONS.communicationTemplates), where("organizationId", "==", organizationId));
      const tmplSnap = await getDocs(tmplQ);
      setTemplates(tmplSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CommunicationTemplate));
    } catch { toast.error("Failed to load communications"); }
    finally { setIsLoading(false); }
  };

  const channelIcon = (channel: string) => {
    if (channel === "email") return <Mail className="h-4 w-4" />;
    if (channel === "sms") return <MessageSquare className="h-4 w-4" />;
    return <Send className="h-4 w-4" />;
  };

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Send },
    { label: "Templates", value: templates.length, icon: Mail },
    { label: "Sent", value: jobs.reduce((sum, j) => sum + (j.sentCount || 0), 0), icon: Users },
    { label: "Failed", value: jobs.reduce((sum, j) => sum + (j.failedCount || 0), 0), icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
        <p className="text-muted-foreground">Manage messages, campaigns, and templates.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Communication Jobs</CardTitle><CardDescription>Recent campaigns and sends.</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : jobs.length === 0 ? <p className="text-sm text-muted-foreground">No jobs found.</p> : (
              <div className="space-y-2">
                {jobs.slice(0, 10).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {channelIcon(job.channel)}
                      <div>
                        <p className="font-medium text-sm">{job.name}</p>
                        <p className="text-xs text-muted-foreground">{job.channel} | {job.status} | {job.sentCount}/{job.recipientCount} sent</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{job.scheduledAt ? new Date(job.scheduledAt.seconds * 1000).toLocaleDateString() : "Draft"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Templates</CardTitle><CardDescription>Saved message templates.</CardDescription></CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : templates.length === 0 ? <p className="text-sm text-muted-foreground">No templates found.</p> : (
              <div className="space-y-2">
                {templates.map((tmpl) => (
                  <div key={tmpl.id} className="p-3 rounded-md border hover:bg-muted/50 transition-colors">
                    <p className="font-medium text-sm">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tmpl.subject || "No subject"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
