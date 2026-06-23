/**
 * Auth context for OneChat (Sprint 1).
 *
 * Wraps the app, exposes the current Supabase session plus email+password
 * sign-in / sign-up / sign-out, and drives the route guard in the root layout.
 */
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthResult {
  /** A human-readable error message, or undefined on success. */
  error?: string;
  /** True when sign-up created a user but a confirmation email is pending. */
  needsConfirmation?: boolean;
}

interface AuthValue {
  session: Session | null;
  /** True until the initial session check resolves (avoids a wrong-screen flash). */
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message };
  };

  const signUp: AuthValue['signUp'] = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) return { error: error.message };
    // When email confirmation is on, a user is returned but no session yet.
    return { needsConfirmation: !data.session };
  };

  const signOut: AuthValue['signOut'] = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthValue = {
    session,
    loading,
    configured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
