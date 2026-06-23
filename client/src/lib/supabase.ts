/**
 * Supabase client for OneChat (Sprint 1).
 *
 * Reads the project URL + anon key from public env vars (safe to ship — the
 * anon key is gated by row-level security). If they are missing the app still
 * boots: `isSupabaseConfigured` is false and the sign-in screen shows setup
 * instructions instead of crashing.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True once both env vars are set (i.e. a real Supabase project is wired up). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Placeholder values keep createClient from throwing before the project exists.
// Real network calls only happen behind an `isSupabaseConfigured` check.
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // RN/Expo has no URL-based session to detect (that's a web-OAuth concern).
      detectSessionInUrl: false,
    },
  },
);

// Refresh the auth token while the app is foregrounded (Supabase Expo guidance).
// Native only — on web the SDK manages this via timers already.
if (isSupabaseConfigured && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
