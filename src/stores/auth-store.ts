import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User } from "firebase/auth";
import { type UserAccess } from "@/types";

interface AuthState {
  user: User | null;
  userAccess: UserAccess | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setUserAccess: (access: UserAccess | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userAccess: null,
      isLoading: true,
      error: null,
      setUser: (user) => set({ user }),
      setUserAccess: (userAccess) => set({ userAccess }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearAuth: () => set({ user: null, userAccess: null, error: null }),
    }),
    {
      name: "nc-fitness-auth",
      partialize: (state) => ({
        userAccess: state.userAccess,
      }),
    }
  )
);
