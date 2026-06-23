import { Stack } from 'expo-router';

import { StoreProvider } from '@/data/store';

/**
 * Layout for the authenticated app. The unified-inbox screens still run on the
 * in-memory seed store (Sprint 2 swaps StoreProvider for a Supabase-backed one).
 */
export default function AppLayout() {
  return (
    <StoreProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="chat/[id]" />
      </Stack>
    </StoreProvider>
  );
}
