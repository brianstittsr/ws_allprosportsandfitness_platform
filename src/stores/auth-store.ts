import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { type UserAccess } from "@/types";

interface AuthState {
  user: User | null;
  userAccess: UserAccess | null;
  isLoading: boolean;
  error: string | null;
  bypass: boolean;
  setUser: (user: User | null) => void;
  setUserAccess: (access: UserAccess | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  bypassLogin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userAccess: null,
      isLoading: true,
      error: null,
      bypass: false,
      setUser: (user) => set({ user }),
      setUserAccess: (userAccess) => set({ userAccess }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearAuth: () => set({ user: null, userAccess: null, error: null, bypass: false }),
      bypassLogin: () => set({
        bypass: true,
        isLoading: false,
        userAccess: {
          id: "bypass-user",
          userId: "bypass-user",
          organizationId: "default",
          status: "active" as const,
          roles: ["owner"],
          permissions: {
            viewFinancials: true,
            manageFinancials: true,
            approvePayments: true,
            sendClientMessages: true,
            sendStaffMessages: true,
            manageContacts: true,
            managePrograms: true,
            manageUsers: true,
            accessAdminPanel: true,
            useHermes: true,
          },
          displayName: "Development User",
          email: "dev@localhost",
          accountStatus: "active" as const,
          programIds: [],
          departmentIds: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: "system",
          updatedBy: "system",
          schemaVersion: 1,
        },
      }),
    }),
    {
      name: "nc-fitness-auth",
      partialize: (state) => ({
        userAccess: state.userAccess,
      }),
    }
  )
);
