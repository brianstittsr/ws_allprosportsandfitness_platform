"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import { type UserAccess } from "@/types";

export function useAuth() {
  const { user, userAccess, isLoading, bypass, setUser, setUserAccess, setLoading } = useAuthStore();

  useEffect(() => {
    if (bypass) {
      setLoading(false);
      return;
    }
    if (!isFirebaseConfigured) {
      console.warn("Firebase client SDK not configured — auth state will not be tracked");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const accessDoc = await getDoc(doc(db, "userAccess", firebaseUser.uid));
          if (accessDoc.exists()) {
            setUserAccess(accessDoc.data() as UserAccess);
          }
        } catch (error) {
          console.error("Error fetching user access:", error);
        }
      } else {
        setUserAccess(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserAccess, setLoading, bypass]);

  return { user, userAccess, isLoading, bypass };
}
