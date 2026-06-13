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
import { type Location } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function LocationsAdminPage() {
  const { user, userAccess } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Location>>({
    name: "", address: { street: "", city: "", state: "", zip: "", country: "US" }, operatingHours: {},
  });
  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => { fetchLocations(); }, [organizationId]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.locations), where("organizationId", "==", organizationId));
      const snapshot = await getDocs(q);
      setLocations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Location));
    } catch { toast.error("Failed to load locations"); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!current.name || !current.address?.street) { toast.error("Name and address are required"); return; }
    try {
      const now = Timestamp.now();
      const base = { ...current, organizationId, updatedAt: now, updatedBy: user?.uid, schemaVersion: 1 };
      if (isEditing && current.id) { await updateDoc(doc(db, COLLECTIONS.locations, current.id), base); toast.success("Location updated"); }
      else { await addDoc(collection(db, COLLECTIONS.locations), { ...base, createdAt: now, createdBy: user?.uid, status: "active" }); toast.success("Location created"); }
      setIsEditing(false); setCurrent({ name: "", address: { street: "", city: "", state: "", zip: "", country: "US" }, operatingHours: {} });
      fetchLocations();
    } catch { toast.error("Failed to save location"); }
  };

  const handleDelete = async (loc: Location) => {
    if (!confirm(`Delete ${loc.name}?`)) return;
    try { await deleteDoc(doc(db, COLLECTIONS.locations, loc.id)); toast.success("Deleted"); fetchLocations(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Manage training facilities and venues.</p>
        </div>
        <Button onClick={() => { setIsEditing(false); setCurrent({ name: "", address: { street: "", city: "", state: "", zip: "", country: "US" }, operatingHours: {} }); }}>
          <Plus className="h-4 w-4 mr-2" />New Location
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{isEditing ? "Edit Location" : "Create Location"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={current.name} onChange={(e) => setCurrent({ ...current, name: e.target.value })} placeholder="Facility name" /></div>
          <div className="space-y-2"><Label>Street</Label><Input value={current.address?.street} onChange={(e) => setCurrent({ ...current, address: { ...current.address, street: e.target.value } as Location["address"] })} placeholder="Street address" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>City</Label><Input value={current.address?.city} onChange={(e) => setCurrent({ ...current, address: { ...current.address, city: e.target.value } as Location["address"] })} placeholder="City" /></div>
            <div className="space-y-2"><Label>State</Label><Input value={current.address?.state} onChange={(e) => setCurrent({ ...current, address: { ...current.address, state: e.target.value } as Location["address"] })} placeholder="State" /></div>
            <div className="space-y-2"><Label>ZIP</Label><Input value={current.address?.zip} onChange={(e) => setCurrent({ ...current, address: { ...current.address, zip: e.target.value } as Location["address"] })} placeholder="ZIP" /></div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={current.phone || ""} onChange={(e) => setCurrent({ ...current, phone: e.target.value })} placeholder="Contact phone" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
            {isEditing && <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Locations</CardTitle><CardDescription>{locations.length} found.</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : locations.length === 0 ? <p className="text-sm text-muted-foreground">No locations found.</p> : (
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.address.street}, {loc.address.city}, {loc.address.state} {loc.address.zip}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrent(loc); setIsEditing(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(loc)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
