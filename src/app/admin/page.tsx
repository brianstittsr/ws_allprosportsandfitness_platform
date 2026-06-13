"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, MapPin, Dumbbell, Shield, Activity } from "lucide-react";

const stats = [
  { label: "Total Contacts", value: "0", icon: Users, description: "Active and former clients" },
  { label: "Programs", value: "0", icon: Dumbbell, description: "Active programs and leagues" },
  { label: "Departments", value: "0", icon: Building2, description: "Business units" },
  { label: "Locations", value: "0", icon: MapPin, description: "Training facilities" },
  { label: "Staff Members", value: "0", icon: Shield, description: "Coaches, instructors, admin" },
  { label: "System Health", value: "OK", icon: Activity, description: "All systems operational" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform actions and changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Use the sidebar to navigate to specific management areas.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
