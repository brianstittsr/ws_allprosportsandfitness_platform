"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Dumbbell,
  MessageSquare,
  DollarSign,
  Settings,
  Shield,
  LogOut,
  Activity,
  BarChart3,
} from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Roles", icon: Users },
  { href: "/admin/programs", label: "Programs", icon: Dumbbell },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/contacts", label: "Contacts", icon: Users },
  { href: "/admin/staff", label: "Staff", icon: Shield },
  { href: "/admin/communications", label: "Communications", icon: MessageSquare },
  { href: "/admin/financials", label: "Financials", icon: DollarSign },
  { href: "/admin/integrations", label: "Integrations", icon: Activity },
  { href: "/admin/audit", label: "Audit Logs", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, userAccess, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !userAccess?.permissions.accessAdminPanel)) {
      router.push("/login");
    }
  }, [user, userAccess, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !userAccess?.permissions.accessAdminPanel) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/40 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">NC Fitness Club</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4 px-3">
            <p className="text-sm font-medium">{userAccess?.displayName || user?.email}</p>
            <p className="text-xs text-muted-foreground">{userAccess?.roles.join(", ")}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              signOut(auth);
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
