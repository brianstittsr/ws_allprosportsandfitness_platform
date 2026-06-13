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
import { type Staff } from "@/types";
import BulkImportWizard from "@/components/bulk-import-wizard";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";

export default function StaffAdminPage() {
  const { user, userAccess } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Staff>>({
    contactId: "", departmentIds: [], programIds: [], jobTitle: "", jobDuties: [], employmentType: "full_time", startDate: Timestamp.now(),
    permissions: { canManageContacts: false, canManagePrograms: false, canViewFinancials: false, canManageFinancials: false, canApprovePayouts: false, canAccessAdmin: false, canUseHermes: false },
    communicationPermissions: { canEmailClients: false, canSmsClients: false, canEmailStaff: false, canSendBulkMessages: false, requiresApprovalForBulk: true },
    isActive: true,
  });
  const [showWizard, setShowWizard] = useState(false);
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchStaff(); }, [organizationId]);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.staff), where("organizationId", "==", organizationId));
      const snapshot = await getDocs(q);
      setStaff(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Staff));
    } catch { toast.error("Failed to load staff"); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!current.contactId || !current.jobTitle) { toast.error("Contact and job title are required"); return; }
    try {
      const now = Timestamp.now();
      const base = { ...current, organizationId, updatedAt: now, updatedBy: user?.uid, schemaVersion: 1 };
      if (isEditing && current.id) { await updateDoc(doc(db, COLLECTIONS.staff, current.id), base); toast.success("Staff updated"); }
      else { await addDoc(collection(db, COLLECTIONS.staff), { ...base, createdAt: now, createdBy: user?.uid, status: "active" }); toast.success("Staff created"); }
      setIsEditing(false); setCurrent({ contactId: "", departmentIds: [], programIds: [], jobTitle: "", jobDuties: [], employmentType: "full_time", startDate: Timestamp.now(), permissions: { canManageContacts: false, canManagePrograms: false, canViewFinancials: false, canManageFinancials: false, canApprovePayouts: false, canAccessAdmin: false, canUseHermes: false }, communicationPermissions: { canEmailClients: false, canSmsClients: false, canEmailStaff: false, canSendBulkMessages: false, requiresApprovalForBulk: true }, isActive: true });
      fetchStaff();
    } catch { toast.error("Failed to save staff"); }
  };

  const handleDelete = async (s: Staff) => {
    if (!confirm(`Delete staff record?`)) return;
    try { await deleteDoc(doc(db, COLLECTIONS.staff, s.id)); toast.success("Deleted"); fetchStaff(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleStaffImport = async (rows: Record<string, string>[], options: { mergeDuplicates: boolean; defaultStatus?: string }) => {
    const idToken = await user?.getIdToken();
    const csvText = [Object.keys(rows[0] || {}).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const response = await fetch("/api/staff/import", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", data: [csvText], organizationId, mergeDuplicates: options.mergeDuplicates }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Import failed");
    fetchStaff();
    return result.data;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">Manage staff, coaches, and instructors.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWizard(!showWizard)}>
            <Upload className="h-4 w-4 mr-2" />Import
          </Button>
          <Button onClick={() => { setIsEditing(false); setCurrent({ contactId: "", departmentIds: [], programIds: [], jobTitle: "", jobDuties: [], employmentType: "full_time", startDate: Timestamp.now(), permissions: { canManageContacts: false, canManagePrograms: false, canViewFinancials: false, canManageFinancials: false, canApprovePayouts: false, canAccessAdmin: false, canUseHermes: false }, communicationPermissions: { canEmailClients: false, canSmsClients: false, canEmailStaff: false, canSendBulkMessages: false, requiresApprovalForBulk: true }, isActive: true }); }}>
            <Plus className="h-4 w-4 mr-2" />New Staff
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{isEditing ? "Edit Staff" : "Create Staff"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Contact ID</Label><Input value={current.contactId} onChange={(e) => setCurrent({ ...current, contactId: e.target.value })} placeholder="Contact document ID" /></div>
            <div className="space-y-2"><Label>Job Title</Label><Input value={current.jobTitle} onChange={(e) => setCurrent({ ...current, jobTitle: e.target.value })} placeholder="e.g., Yoga Instructor" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={current.employmentType} onChange={(e) => setCurrent({ ...current, employmentType: e.target.value as Staff["employmentType"] })}>
                {["full_time", "part_time", "contractor", "volunteer"].map((t) => (<option key={t} value={t}>{t.replace("_", " ")}</option>))}
              </select>
            </div>
            <div className="space-y-2"><Label>Supervisor ID</Label><Input value={current.supervisorId || ""} onChange={(e) => setCurrent({ ...current, supervisorId: e.target.value })} placeholder="Supervisor staff ID" /></div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={current.isActive} onChange={(e) => setCurrent({ ...current, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300" /><Label className="text-sm font-normal">Active</Label></div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
            {isEditing && <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      {showWizard && (
        <BulkImportWizard
          title="Staff"
          description="Import staff, coaches, and instructors from CSV."
          requiredFields={["firstName", "lastName", "email", "jobTitle"]}
          optionalFields={[
            { key: "phone", label: "Phone" },
            { key: "employmentType", label: "Employment Type" },
            { key: "departmentIds", label: "Department IDs" },
            { key: "programIds", label: "Program IDs" },
            { key: "supervisorId", label: "Supervisor ID" },
            { key: "isActive", label: "Is Active" },
          ]}
          templateHeaders="firstName,lastName,email,phone,jobTitle,employmentType,departmentIds,programIds,supervisorId,isActive"
          templateRow="Jane,Doe,jane@example.com,5551234567,Yoga Instructor,full_time,dept1;dept2,prog1;prog2,supervisor123,true"
          onImport={handleStaffImport}
          onClose={() => { setShowWizard(false); fetchStaff(); }}
        />
      )}

      <Card>
        <CardHeader><CardTitle>All Staff</CardTitle><CardDescription>{staff.length} found.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : staff.length === 0 ? <p className="text-sm text-muted-foreground">No staff found.</p> : (
            <div className="space-y-2">
              {staff.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div><p className="font-medium">{s.jobTitle}</p><p className="text-xs text-muted-foreground">{s.employmentType} | {s.isActive ? "Active" : "Inactive"} | {s.status}</p></div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrent(s); setIsEditing(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
