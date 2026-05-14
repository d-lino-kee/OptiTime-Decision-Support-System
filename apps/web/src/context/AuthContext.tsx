"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { setTokenGetter } from "@/lib/api";

export type AppUser = {
  firebaseUid: string;
  email: string;
  displayName: string;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const toAppUser = (fb: FirebaseUser): AppUser => ({
    firebaseUid: fb.uid,
    email: fb.email ?? "",
    displayName: fb.displayName ?? fb.email ?? fb.uid,
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    setTokenGetter(async () => {
      const fb = auth.currentUser;
      if (!fb) return null;
      return fb.getIdToken();
    });

    const unsub = onAuthStateChanged(auth, (fb) => {
      setUser(fb ? toAppUser(fb) : null);
      setLoading(false);
    });

    return unsub;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(cred.user, { displayName });
    // Trigger find-or-create on backend
    const token = await cred.user.getIdToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/v1"}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
