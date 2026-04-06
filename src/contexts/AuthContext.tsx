import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../lib/firebase';
import type { User } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthStatus =
  | 'loading'          // checking Firebase session on app boot
  | 'unauthenticated'  // no Firebase session
  | 'not-admin'        // Firebase session exists but userType ≠ admin
  | 'authenticated';   // Firebase session + userType === admin ✓

interface AuthContextValue {
  status: AuthStatus;
  adminUser: User | null;
  /** Sign in with email + password. Throws a string error message on failure. */
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus]       = useState<AuthStatus>('loading');
  const [adminUser, setAdminUser] = useState<User | null>(null);

  // ── Resolve a Firebase user → check userType in Firestore ──────────────────
  const resolveUser = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const snap = await getDoc(doc(firestore, 'users', fbUser.uid));

      if (!snap.exists()) {
        // Account exists in Auth but not in Firestore
        await firebaseSignOut(auth);
        setAdminUser(null);
        setStatus('not-admin');
        return;
      }

      const data = snap.data() as User;

      if (data.userType !== 'admin') {
        // Valid account but not an admin — sign them out immediately
        await firebaseSignOut(auth);
        setAdminUser(null);
        setStatus('not-admin');
        return;
      }

      setAdminUser({ ...data, id: fbUser.uid });
      setStatus('authenticated');
    } catch {
      setAdminUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  // ── Listen to Firebase Auth state changes ──────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setAdminUser(null);
        setStatus('unauthenticated');
        return;
      }
      await resolveUser(fbUser);
    });
    return unsub;
  }, [resolveUser]);

  // ── signIn ─────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    setStatus('loading');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await resolveUser(cred.user);
    } catch (err: any) {
      setStatus('unauthenticated');
      // Map Firebase error codes to readable messages
      const code: string = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        throw new Error('Incorrect email or password.');
      }
      if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      if (code === 'auth/user-disabled') {
        throw new Error('This account has been disabled.');
      }
      throw new Error('Sign-in failed. Please try again.');
    }
  }, [resolveUser]);

  // ── signOut ────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setAdminUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ status, adminUser, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
