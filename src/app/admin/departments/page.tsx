"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { type Department } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

const departmentTypes = [
  "operations", "finance", "marketing", "sales", "collections",
  "programs", "sports_operations", "community_outreach", "events", "facilities",
];

export default function DepartmentsAdminPage() {
  const { user, userAccess } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Department>>({ name: "", type: "operations", managerIds: [], locationIds: [] });
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchDepartments(); }, [organizationId]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "departments"), where("organizationId", "==", organizationId));
      const snapshot = await getDocs(q);
      setDepartments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Department));
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!current.name) { toast.error("Name is required"); return; }
    try {
      const now = Timestamp.now();
      const base = { ...current, organizationId, updatedAt: now, updatedBy: user?.uid, schemaVersion: 1 };
      if (isEditing && current.id) {
        await updateDoc(doc(db, "departments", current.id), base);
        toast.success("Department updated");
      } else {
        await addDoc(collection(db, "departments"), { ...base, createdAt: now, createdBy: user?.uid, status: "active" });
        toast.success("Department created");
      }
      setIsEditing(false); setCurrent({ name: "", type: "operations", managerIds: [], locationIds: [] });
      fetchDepartments();
    } catch { toast.error("Failed to save department"); }
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Delete ${dept.name}?`)) return;
    try { await deleteDoc(doc(db, "departments", dept.id)); toast.success("Deleted"); fetchDepartments(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage business units and departments.</p>
        </div>
        <Button onClick={() => { setIsEditing(false); setCurrent({ name: "", type: "operations", managerIds: [], locationIds: [] }); }}>
          <Plus className="h-4 w-4 mr-2" />New Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Department" : "Create Department"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={current.name} onChange={(e) => setCurrent({ ...current, name: e.target.value })} placeholder="Department name" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={current.type} onChange={(e) => setCurrent({ ...current, type: e.target.value as Department["type"] })}>
                {departmentTypes.map((t) => (<option key={t} value={t}>{t.replace("_", " ")}</option>))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={current.description || ""} onChange={(e) => setCurrent({ ...current, description: e.target.value })} placeholder="Optional description" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
            {isEditing && <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Departments</CardTitle><CardDescription>{departments.length} found.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : departments.length === 0 ? <p className="text-sm text-muted-foreground">No departments found.</p> : (
            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div><p className="font-medium">{dept.name}</p><p className="text-xs text-muted-foreground">{dept.type} | {dept.status}</p></div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrent(dept); setIsEditing(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dept)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
