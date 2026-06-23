import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/data/auth';
import { Brand } from '@/constants/onechat';

function RootNavigator() {
  const { session, loading } = useAuth();

  // Hold a blank brand-colored screen until the session check resolves so we
  // never flash the inbox at a logged-out user (or sign-in at a logged-in one).
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: Brand.bg }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
