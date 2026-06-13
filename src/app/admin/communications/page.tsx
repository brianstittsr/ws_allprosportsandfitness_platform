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
import { Mail, MessageSquare, Send, Users, Globe } from "lucide-react";

export default function CommunicationsAdminPage() {
  const { user, userAccess } = useAuth();
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
    if (channel === "facebook") return <Globe className="h-4 w-4" />;
    return <Send className="h-4 w-4" />;
  };

  const [fbPostContent, setFbPostContent] = useState("");
  const [fbPosting, setFbPosting] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupPrivacy, setGroupPrivacy] = useState("CLOSED");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [fbGroups, setFbGroups] = useState<Array<{ id: string; name: string; status: string; facebookGroupId?: string }>>([]);

  useEffect(() => { fetchFacebookGroups(); }, [organizationId]);

  const fetchFacebookGroups = async () => {
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch(`/api/facebook/groups?organizationId=${organizationId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const result = await response.json();
      if (response.ok) setFbGroups(result.data || []);
    } catch { /* ignore */ }
  };

  const handleCreateFacebookGroup = async () => {
    if (!groupName.trim()) { toast.error("Group name is required"); return; }
    setCreatingGroup(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/facebook/groups", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, description: groupDescription, privacy: groupPrivacy, organizationId }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.data.message);
        setGroupName(""); setGroupDescription(""); setGroupPrivacy("CLOSED");
        fetchFacebookGroups();
      } else {
        toast.error(result.error || "Failed to create group");
      }
    } catch { toast.error("Group creation request failed"); }
    finally { setCreatingGroup(false); }
  };

  const handlePublishToFacebook = async () => {
    if (!fbPostContent.trim()) { toast.error("Post content is required"); return; }
    setFbPosting(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/facebook/publish", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: fbPostContent, organizationId }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Published to Facebook successfully");
        setFbPostContent("");
        fetchData();
      } else {
        toast.error(result.error || "Failed to publish to Facebook");
      }
    } catch { toast.error("Publish request failed"); }
    finally { setFbPosting(false); }
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

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Push to Facebook</CardTitle>
            <CardDescription>Publish a post directly to your connected Facebook Page.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="What's on your mind? Write your Facebook post here..."
            value={fbPostContent}
            onChange={(e) => setFbPostContent(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{fbPostContent.length}/2000 characters</p>
            <Button onClick={handlePublishToFacebook} disabled={fbPosting || !fbPostContent.trim()}>
              <Globe className="h-4 w-4 mr-2" />{fbPosting ? "Publishing..." : "Publish to Facebook"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Create Facebook Group</CardTitle>
              <CardDescription>Create a new group for your community or team.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                placeholder="Group name (e.g., NC Fitness Club Members)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                placeholder="Group description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={groupPrivacy}
                onChange={(e) => setGroupPrivacy(e.target.value)}
              >
                <option value="CLOSED">Closed (visible, membership by approval)</option>
                <option value="OPEN">Open (visible, anyone can join)</option>
                <option value="SECRET">Secret (hidden, invite only)</option>
              </select>
            </div>
            <Button onClick={handleCreateFacebookGroup} disabled={creatingGroup || !groupName.trim()}>
              <Globe className="h-4 w-4 mr-2" />{creatingGroup ? "Creating..." : "Create Group"}
            </Button>

            {fbGroups.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-2">Recently Created Groups</p>
                <div className="space-y-1">
                  {fbGroups.slice(0, 5).map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[200px]">{g.name}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${g.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{g.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
