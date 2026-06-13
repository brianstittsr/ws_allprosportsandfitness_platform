"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/auth-store";
import { type UserAccess } from "@/types";

export function useAuth() {
  const { user, userAccess, isLoading, setUser, setUserAccess, setLoading } = useAuthStore();

  useEffect(() => {
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
  }, [setUser, setUserAccess, setLoading]);

  return { user, userAccess, isLoading };
}
