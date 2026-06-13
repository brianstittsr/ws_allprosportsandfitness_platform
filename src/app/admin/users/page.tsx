"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { type UserAccess, type UserRole } from "@/types";
import { Plus, Pencil, Shield, UserCheck, UserX } from "lucide-react";

const allRoles: UserRole[] = [
  "owner", "platform_administrator", "system_administrator", "operations_coordinator",
  "finance_and_bookkeeping", "marketing_manager", "sales_representative",
  "collections_representative", "program_manager", "instructor_or_coach",
  "sports_operations", "content_creator", "secretary_and_outreach",
  "investor_read_only", "staff_read_only",
];

const permissionKeys = [
  { key: "viewFinancials", label: "View Financials" },
  { key: "manageFinancials", label: "Manage Financials" },
  { key: "approvePayments", label: "Approve Payments" },
  { key: "sendClientMessages", label: "Send Client Messages" },
  { key: "sendStaffMessages", label: "Send Staff Messages" },
  { key: "manageContacts", label: "Manage Contacts" },
  { key: "managePrograms", label: "Manage Programs" },
  { key: "manageUsers", label: "Manage Users" },
  { key: "accessAdminPanel", label: "Access Admin Panel" },
  { key: "useHermes", label: "Use Hermes" },
];

export default function UsersAdminPage() {
  const { user, userAccess } = useAuth();
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<UserAccess>>({
    displayName: "", email: "", roles: [], programIds: [], departmentIds: [],
    permissions: { viewFinancials: false, manageFinancials: false, approvePayments: false, sendClientMessages: false, sendStaffMessages: false, manageContacts: false, managePrograms: false, manageUsers: false, accessAdminPanel: false, useHermes: false } as UserAccess["permissions"],
    accountStatus: "active",
  });
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchUsers(); }, [organizationId]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.userAccess), where("organizationId", "==", organizationId));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as UserAccess));
    } catch { toast.error("Failed to load users"); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!current.displayName || !current.email) { toast.error("Name and email are required"); return; }
    try {
      const now = Timestamp.now();
      const base = { ...current, organizationId, updatedAt: now, updatedBy: user?.uid, schemaVersion: 1 };
      if (isEditing && current.id) { await updateDoc(doc(db, COLLECTIONS.userAccess, current.id), base); toast.success("User updated"); }
      else { await addDoc(collection(db, COLLECTIONS.userAccess), { ...base, createdAt: now, createdBy: user?.uid, status: "active" }); toast.success("User created"); }
      setIsEditing(false); setCurrent({ displayName: "", email: "", roles: [], programIds: [], departmentIds: [], permissions: { viewFinancials: false, manageFinancials: false, approvePayments: false, sendClientMessages: false, sendStaffMessages: false, manageContacts: false, managePrograms: false, manageUsers: false, accessAdminPanel: false, useHermes: false }, accountStatus: "active" });
      fetchUsers();
    } catch { toast.error("Failed to save user"); }
  };

  const toggleRole = (role: UserRole) => {
    const roles = current.roles || [];
    if (roles.includes(role)) setCurrent({ ...current, roles: roles.filter((r) => r !== role) });
    else setCurrent({ ...current, roles: [...roles, role] });
  };

  const togglePermission = (key: keyof UserAccess["permissions"]) => {
    const perms = current.permissions || { viewFinancials: false, manageFinancials: false, approvePayments: false, sendClientMessages: false, sendStaffMessages: false, manageContacts: false, managePrograms: false, manageUsers: false, accessAdminPanel: false, useHermes: false };
    setCurrent({ ...current, permissions: { ...perms, [key]: !perms[key] } });
  };

  const getStatusIcon = (status: string) => {
    if (status === "active") return <UserCheck className="h-4 w-4 text-emerald-500" />;
    return <UserX className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
          <p className="text-muted-foreground">Manage staff access and permissions.</p>
        </div>
        <Button onClick={() => { setIsEditing(false); setCurrent({ displayName: "", email: "", roles: [], programIds: [], departmentIds: [], permissions: { viewFinancials: false, manageFinancials: false, approvePayments: false, sendClientMessages: false, sendStaffMessages: false, manageContacts: false, managePrograms: false, manageUsers: false, accessAdminPanel: false, useHermes: false }, accountStatus: "active" }); }}>
          <Plus className="h-4 w-4 mr-2" />New User
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{isEditing ? "Edit User" : "Create User"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Display Name</Label><Input value={current.displayName} onChange={(e) => setCurrent({ ...current, displayName: e.target.value })} placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={current.email} onChange={(e) => setCurrent({ ...current, email: e.target.value })} placeholder="Email address" /></div>
          </div>
          <div className="space-y-2"><Label>Account Status</Label>
            <select value={current.accountStatus} onChange={(e) => setCurrent({ ...current, accountStatus: e.target.value as "active" | "disabled" | "invited" })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="invited">Invited</option>
            </select>
          </div>
          <div className="space-y-2"><Label>Roles</Label><div className="flex flex-wrap gap-2">{allRoles.map((role) => (<button key={role} onClick={() => toggleRole(role)} className={`px-2 py-1 text-xs rounded-full border transition-colors ${(current.roles || []).includes(role) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-input hover:bg-muted"}`}>{role.replace(/_/g, " ")}</button>))}</div></div>
          <div className="space-y-2"><Label>Permissions</Label><div className="grid grid-cols-2 gap-2">{permissionKeys.map((p) => (<div key={p.key} className="flex items-center gap-2"><input type="checkbox" checked={!!current.permissions?.[p.key as keyof typeof current.permissions]} onChange={() => togglePermission(p.key as keyof typeof current.permissions)} className="h-4 w-4 rounded border-gray-300" /><Label className="text-sm font-normal">{p.label}</Label></div>))}</div></div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
            {isEditing && <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Users</CardTitle><CardDescription>{users.length} found.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : users.length === 0 ? <p className="text-sm text-muted-foreground">No users found.</p> : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(u.accountStatus)}
                    <div>
                      <p className="font-medium">{u.displayName}</p>
                      <p className="text-xs text-muted-foreground">{u.email} | {u.roles.join(", ")}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setCurrent(u); setIsEditing(true); }}><Pencil className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
