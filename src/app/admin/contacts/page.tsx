"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { type Contact, type ContactType } from "@/types";
import BulkImportWizard from "@/components/bulk-import-wizard";
import { Plus, Pencil, Trash2, Upload, Download, RefreshCw, Activity } from "lucide-react";

const contactTypes: ContactType[] = [
  "prospect", "active_client", "former_client", "staff", "coach", "instructor",
  "athlete", "parent", "guardian", "sponsor", "vendor", "community_partner", "investor",
];

export default function ContactsAdminPage() {
  const { user, userAccess } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Contact>>({
    firstName: "", lastName: "", email: "", preferredLanguage: "en", contactTypes: [], programIds: [],
    emailConsent: false, smsConsent: false, optOutStatus: false, tags: [], customFields: {}, externalIds: {},
  });
  const [syncLoading, setSyncLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchContacts(); }, [organizationId]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.contacts), where("organizationId", "==", organizationId));
      const snapshot = await getDocs(q);
      setContacts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Contact));
    } catch { toast.error("Failed to load contacts"); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!current.firstName || !current.lastName || !current.email) { toast.error("First name, last name, and email are required"); return; }
    try {
      const now = Timestamp.now();
      const base = { ...current, organizationId, updatedAt: now, updatedBy: user?.uid, schemaVersion: 1 };
      if (isEditing && current.id) { await updateDoc(doc(db, "contacts", current.id), base); toast.success("Contact updated"); }
      else { await addDoc(collection(db, COLLECTIONS.contacts), { ...base, createdAt: now, createdBy: user?.uid, status: "active", currentStatus: "new_lead" }); toast.success("Contact created"); }
      setIsEditing(false); setCurrent({ firstName: "", lastName: "", email: "", preferredLanguage: "en", contactTypes: [], programIds: [], emailConsent: false, smsConsent: false, optOutStatus: false, tags: [], customFields: {}, externalIds: {} });
      fetchContacts();
    } catch { toast.error("Failed to save contact"); }
  };

  const handleDelete = async (c: Contact) => {
    if (!confirm(`Delete ${c.firstName} ${c.lastName}?`)) return;
    try { await deleteDoc(doc(db, COLLECTIONS.contacts, c.id)); toast.success("Deleted"); fetchContacts(); }
    catch { toast.error("Failed to delete"); }
  };

  const toggleContactType = (type: ContactType) => {
    const types = current.contactTypes || [];
    if (types.includes(type)) { setCurrent({ ...current, contactTypes: types.filter((t) => t !== type) }); }
    else { setCurrent({ ...current, contactTypes: [...types, type] }); }
  };

  const handleSyncHighLevel = async () => {
    setSyncLoading(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/contacts/sync-highlevel", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, mergeDuplicates: true, defaultStatus: "new_lead", limit: 100 }),
      });
      const result = await response.json();
      if (response.ok) {
        if (result.data?.status === "queued") toast.success(result.data.message);
        else toast.success(`GoHighLevel sync: ${result.data.created} created, ${result.data.updated} updated, ${result.data.skipped} skipped (${result.data.totalFetched} fetched)`);
        fetchContacts();
      } else toast.error(result.error || "Sync failed");
    } catch { toast.error("Sync request failed"); }
    finally { setSyncLoading(false); }
  };

  const handleContactsImport = async (rows: Record<string, string>[], options: { mergeDuplicates: boolean; defaultStatus?: string }) => {
    const idToken = await user?.getIdToken();
    const csvText = [
      Object.keys(rows[0] || {}).join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");
    const response = await fetch("/api/contacts/import", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", data: [csvText], organizationId, mergeDuplicates: options.mergeDuplicates, defaultStatus: options.defaultStatus || "new_lead" }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Import failed");
    fetchContacts();
    return result.data;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage clients, leads, staff, and partners.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWizard(!showWizard)}>
            <Upload className="h-4 w-4 mr-2" />Import
          </Button>
          <Button variant="outline" onClick={handleSyncHighLevel} disabled={syncLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? "animate-spin" : ""}`} />{syncLoading ? "Syncing GHL..." : "Sync GHL"}
          </Button>
          <Button onClick={() => { setIsEditing(false); setCurrent({ firstName: "", lastName: "", email: "", preferredLanguage: "en", contactTypes: [], programIds: [], emailConsent: false, smsConsent: false, optOutStatus: false, tags: [], customFields: {}, externalIds: {} }); }}>
            <Plus className="h-4 w-4 mr-2" />New Contact
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{isEditing ? "Edit Contact" : "Create Contact"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>First Name</Label><Input value={current.firstName} onChange={(e) => setCurrent({ ...current, firstName: e.target.value })} placeholder="First name" /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input value={current.lastName} onChange={(e) => setCurrent({ ...current, lastName: e.target.value })} placeholder="Last name" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={current.email} onChange={(e) => setCurrent({ ...current, email: e.target.value })} placeholder="Email address" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={current.phone || ""} onChange={(e) => setCurrent({ ...current, phone: e.target.value })} placeholder="Phone number" /></div>
          </div>
          <div className="space-y-2"><Label>Contact Types</Label><div className="flex flex-wrap gap-2">{contactTypes.map((type) => (<button key={type} onClick={() => toggleContactType(type)} className={`px-2 py-1 text-xs rounded-full border transition-colors ${(current.contactTypes || []).includes(type) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-input hover:bg-muted"}`}>{type.replace("_", " ")}</button>))}</div></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2"><input type="checkbox" checked={current.emailConsent} onChange={(e) => setCurrent({ ...current, emailConsent: e.target.checked })} className="h-4 w-4 rounded border-gray-300" /><Label className="text-sm font-normal">Email consent</Label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={current.smsConsent} onChange={(e) => setCurrent({ ...current, smsConsent: e.target.checked })} className="h-4 w-4 rounded border-gray-300" /><Label className="text-sm font-normal">SMS consent</Label></div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
            {isEditing && <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      {showWizard && (
        <BulkImportWizard
          title="Contacts"
          description="Import clients, leads, and partners from CSV."
          requiredFields={["firstName", "lastName", "email"]}
          optionalFields={[
            { key: "phone", label: "Phone" },
            { key: "contactTypes", label: "Contact Types" },
            { key: "leadSource", label: "Lead Source" },
            { key: "tags", label: "Tags" },
            { key: "emailConsent", label: "Email Consent" },
            { key: "smsConsent", label: "SMS Consent" },
          ]}
          templateHeaders="firstName,lastName,email,phone,contactTypes,leadSource,tags,emailConsent,smsConsent"
          templateRow="Jane,Doe,jane@example.com,5551234567,prospect;active_client,website,summer2024,true,true"
          onImport={handleContactsImport}
          onClose={() => { setShowWizard(false); fetchContacts(); }}
        />
      )}

      <Card>
        <CardHeader><CardTitle>All Contacts</CardTitle><CardDescription>{contacts.length} found.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : contacts.length === 0 ? <p className="text-sm text-muted-foreground">No contacts found.</p> : (
            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground">{c.email} | {c.contactTypes.join(", ")} | {c.currentStatus}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrent(c); setIsEditing(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
