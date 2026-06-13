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
import { type Program } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProgramsAdminPage() {
  const { user, userAccess } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Partial<Program>>({
    name: "",
    description: "",
    type: "fitness",
    departmentId: "",
    locationIds: [],
    managerIds: [],
    instructorIds: [],
    waiverRequired: false,
  });

  const organizationId = userAccess?.organizationId || "default";

  useEffect(() => {
    fetchPrograms();
  }, [organizationId]);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "programs"), where("organizationId", "==", organizationId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Program);
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentProgram.name || !currentProgram.departmentId) {
      toast.error("Name and department are required");
      return;
    }

    try {
      const now = Timestamp.now();
      const baseData = {
        ...currentProgram,
        organizationId,
        updatedAt: now,
        updatedBy: user?.uid,
        schemaVersion: 1,
      };

      if (isEditing && currentProgram.id) {
        await updateDoc(doc(db, "programs", currentProgram.id), baseData);
        toast.success("Program updated");
      } else {
        await addDoc(collection(db, "programs"), {
          ...baseData,
          createdAt: now,
          createdBy: user?.uid,
          status: "active",
        });
        toast.success("Program created");
      }

      setIsEditing(false);
      setCurrentProgram({
        name: "",
        description: "",
        type: "fitness",
        departmentId: "",
        locationIds: [],
        managerIds: [],
        instructorIds: [],
        waiverRequired: false,
      });
      fetchPrograms();
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program");
    }
  };

  const handleDelete = async (program: Program) => {
    if (!confirm(`Are you sure you want to delete ${program.name}?`)) return;

    try {
      await deleteDoc(doc(db, "programs", program.id));
      toast.success("Program deleted");
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error("Failed to delete program");
    }
  };

  const programTypes = [
    "fitness", "sports", "yoga", "zumba", "boxing", "kickboxing_hiit",
    "core_blast", "personal_training", "weight_loss", "event", "league", "community", "camp",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">Manage fitness, sports, and community programs.</p>
        </div>
        <Button
          onClick={() => {
            setIsEditing(false);
            setCurrentProgram({
              name: "",
              description: "",
              type: "fitness",
              departmentId: "",
              locationIds: [],
              managerIds: [],
              instructorIds: [],
              waiverRequired: false,
            });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Program" : "Create Program"}</CardTitle>
          <CardDescription>Enter program details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={currentProgram.name}
                onChange={(e) => setCurrentProgram({ ...currentProgram, name: e.target.value })}
                placeholder="e.g., Yoga for Beginners"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Program Type</Label>
              <select
                id="type"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                value={currentProgram.type}
                onChange={(e) => setCurrentProgram({ ...currentProgram, type: e.target.value as Program["type"] })}
              >
                {programTypes.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={currentProgram.description || ""}
              onChange={(e) => setCurrentProgram({ ...currentProgram, description: e.target.value })}
              placeholder="Brief description of the program"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department ID</Label>
            <Input
              id="departmentId"
              value={currentProgram.departmentId}
              onChange={(e) => setCurrentProgram({ ...currentProgram, departmentId: e.target.value })}
              placeholder="Department document ID"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="waiverRequired"
              checked={currentProgram.waiverRequired}
              onChange={(e) => setCurrentProgram({ ...currentProgram, waiverRequired: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="waiverRequired" className="text-sm font-normal">Waiver required for registration</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{isEditing ? "Update" : "Create"}</Button>
            {isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>{programs.length} program(s) found.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : programs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No programs found.</p>
          ) : (
            <div className="space-y-2">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {program.type} | Status: {program.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentProgram(program);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(program)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
