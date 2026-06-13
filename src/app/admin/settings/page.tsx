"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { type Integration } from "@/types";
import { Activity, MessageSquare, CreditCard, Send, Bot, GitBranch, Mail, Bell, RefreshCw } from "lucide-react";

const integrationIcons: Record<string, React.ElementType> = {
  highlevel: Activity,
  telegram: MessageSquare,
  stripe: CreditCard,
  sendgrid: Mail,
  slack: Bell,
  github: GitBranch,
  sms: Send,
  default: Activity,
};

export default function SettingsAdminPage() {
  const { user, userAccess } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<Record<string, string>>({});
  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>({
    name: "", provider: "", type: "crm", status: "pending", config: {}, errorCount: 0,
  });
  const [showAdd, setShowAdd] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<{ username: string; first_name: string; id: number } | null>(null);
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchIntegrations(); }, [organizationId]);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "integrations"), where("organizationId", "==", organizationId));
      const snapshot = await getDocs(q);
      setIntegrations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Integration));
    } catch { toast.error("Failed to load integrations"); }
    finally { setIsLoading(false); }
  };

  const handleSaveConfig = async (integration: Integration) => {
    try {
      const now = Timestamp.now();
      await updateDoc(doc(db, "integrations", integration.id), {
        config: editConfig,
        updatedAt: now,
        updatedBy: user?.uid,
      });
      toast.success(`${integration.name} configuration updated`);
      setIsEditing(null);
      fetchIntegrations();
    } catch { toast.error("Failed to update configuration"); }
  };

  const handleToggleStatus = async (integration: Integration) => {
    const newStatus = integration.status === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "integrations", integration.id), {
        status: newStatus,
        updatedAt: Timestamp.now(),
        updatedBy: user?.uid,
      });
      toast.success(`${integration.name} is now ${newStatus}`);
      fetchIntegrations();
    } catch { toast.error("Failed to toggle status"); }
  };

  const fetchTelegramInfo = async () => {
    setTelegramLoading(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/telegram/setup", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await response.json();
      if (data.data?.bot) {
        setTelegramInfo(data.data.bot);
        setTelegramWebhookUrl(data.data.webhookUrl || "");
      }
    } catch { /* ignore */ }
    finally { setTelegramLoading(false); }
  };

  const handleSetTelegramWebhook = async () => {
    setTelegramLoading(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/telegram/setup", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: telegramWebhookUrl }),
      });
      if (response.ok) { toast.success("Telegram webhook set successfully"); fetchTelegramInfo(); }
      else { toast.error("Failed to set webhook"); }
    } catch { toast.error("Failed to set webhook"); }
    finally { setTelegramLoading(false); }
  };

  const handleDeleteTelegramWebhook = async () => {
    setTelegramLoading(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/telegram/setup", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.ok) { toast.success("Telegram webhook deleted"); setTelegramInfo(null); }
      else { toast.error("Failed to delete webhook"); }
    } catch { toast.error("Failed to delete webhook"); }
    finally { setTelegramLoading(false); }
  };

  const handleAddIntegration = async () => {
    if (!newIntegration.name || !newIntegration.provider) { toast.error("Name and provider are required"); return; }
    try {
      await addDoc(collection(db, "integrations"), {
        ...newIntegration,
        organizationId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user?.uid,
        updatedBy: user?.uid,
        status: "pending",
        config: {},
        errorCount: 0,
        schemaVersion: 1,
      });
      toast.success("Integration added");
      setShowAdd(false);
      setNewIntegration({ name: "", provider: "", type: "crm", status: "pending", config: {}, errorCount: 0 });
      fetchIntegrations();
    } catch { toast.error("Failed to add integration"); }
  };

  const providerOptions = [
    { value: "highlevel", label: "GoHighLevel (CRM)" },
    { value: "telegram", label: "Telegram (Bot)" },
    { value: "stripe", label: "Stripe (Payments)" },
    { value: "sendgrid", label: "SendGrid (Email)" },
    { value: "slack", label: "Slack (Notifications)" },
    { value: "github", label: "GitHub (Code Updates)" },
    { value: "twilio", label: "Twilio (SMS)" },
  ];

  const typeOptions = [
    { value: "crm", label: "CRM" },
    { value: "payment", label: "Payment" },
    { value: "communication", label: "Communication" },
    { value: "calendar", label: "Calendar" },
    { value: "analytics", label: "Analytics" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Integrations</h1>
          <p className="text-muted-foreground">Configure all external service integrations in one place.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "Add Integration"}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle>Add New Integration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={newIntegration.name} onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })} placeholder="e.g., Production HighLevel" /></div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={newIntegration.provider} onChange={(e) => setNewIntegration({ ...newIntegration, provider: e.target.value })}>
                  <option value="">Select provider</option>
                  {providerOptions.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={newIntegration.type} onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value as Integration["type"] })}>
                {typeOptions.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <Button onClick={handleAddIntegration}>Add Integration</Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p className="text-sm text-muted-foreground">Loading integrations...</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => {
            const Icon = integrationIcons[integration.provider] || integrationIcons.default;
            return (
              <Card key={integration.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription>{integration.provider} | {integration.type}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${integration.status === "active" ? "bg-green-100 text-green-800" : integration.status === "error" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                      {integration.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {integration.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {integration.lastSyncAt.toDate().toLocaleString()} | Status: {integration.lastSyncStatus || "unknown"}
                    </p>
                  )}
                  {integration.lastErrorMessage && (
                    <p className="text-xs text-red-600">Error: {integration.lastErrorMessage}</p>
                  )}

                  {isEditing === integration.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2"><Label>Webhook URL</Label><Input value={editConfig.webhookUrl || ""} onChange={(e) => setEditConfig({ ...editConfig, webhookUrl: e.target.value })} placeholder="https://..." /></div>
                      <div className="space-y-2"><Label>API Key Reference</Label><Input value={editConfig.apiKeyRef || ""} onChange={(e) => setEditConfig({ ...editConfig, apiKeyRef: e.target.value })} placeholder="Environment variable name or stored ref" /></div>
                      <div className="space-y-2"><Label>Location / Account ID</Label><Input value={editConfig.locationId || ""} onChange={(e) => setEditConfig({ ...editConfig, locationId: e.target.value })} placeholder="Location or account ID" /></div>
                      <div className="space-y-2"><Label>Additional Config (JSON)</Label><Input value={editConfig.extra || ""} onChange={(e) => setEditConfig({ ...editConfig, extra: e.target.value })} placeholder='{"key":"value"}' /></div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveConfig(integration)}>Save Config</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground space-y-1">
                        {Object.entries(integration.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span className="font-mono text-xs">{value.includes("_") ? "***" + value.slice(-4) : value}</span>
                          </div>
                        ))}
                        {Object.keys(integration.config).length === 0 && <p>No configuration set.</p>}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => { setIsEditing(integration.id); setEditConfig(integration.config); }}>Configure</Button>
                        <Button size="sm" variant={integration.status === "active" ? "destructive" : "default"} onClick={() => handleToggleStatus(integration)}>
                          {integration.status === "active" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && integrations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No integrations configured yet. Click "Add Integration" to get started.</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Telegram Bot Configuration</CardTitle>
                <CardDescription>Manage Telegram webhook and bot settings.</CardDescription>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={fetchTelegramInfo} disabled={telegramLoading}>
              <RefreshCw className="h-3 w-3 mr-1" />
              {telegramLoading ? "Loading..." : "Check Status"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {telegramInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Bot Name:</span> <span className="font-medium">{telegramInfo.first_name}</span></div>
                  <div><span className="text-muted-foreground">Username:</span> <span className="font-medium">@{telegramInfo.username}</span></div>
                  <div><span className="text-muted-foreground">Bot ID:</span> <span className="font-medium">{telegramInfo.id}</span></div>
                  <div><span className="text-muted-foreground">Webhook:</span> <span className="font-medium">{telegramWebhookUrl ? "Configured" : "Not set"}</span></div>
                </div>
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    value={telegramWebhookUrl}
                    onChange={(e) => setTelegramWebhookUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app/api/telegram/webhook"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use /api/telegram/webhook for code updates or /api/telegram/highlevel for GoHighLevel commands.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSetTelegramWebhook}>Set Webhook</Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteTelegramWebhook}>Delete Webhook</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Telegram bot token is configured in environment variables.</p>
                <p>Click "Check Status" to verify the bot and webhook configuration.</p>
                <p className="text-xs">
                  Ensure <code>TELEGRAM_BOT_TOKEN</code> is set in your environment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
