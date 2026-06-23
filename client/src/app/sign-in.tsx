import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/onechat';
import { useAuth } from '@/data/auth';

type Mode = 'signIn' | 'signUp';

export default function SignInScreen() {
  const { signIn, signUp, configured } = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError('Enter your email and a password.');
      return;
    }
    setBusy(true);
    const result = mode === 'signIn'
      ? await signIn(email, password)
      : await signUp(email, password);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setNotice('Account created. Check your email to confirm, then sign in.');
      setMode('signIn');
    }
    // On success the auth listener updates the session and the route guard
    // swaps us into the app automatically — nothing to navigate here.
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logo}>
            <Text style={styles.logoMark}>1</Text>
          </View>
          <Text style={styles.title}>OneChat</Text>
          <Text style={styles.tagline}>One place for all your messages.</Text>

          {!configured ? (
            <View style={styles.setupCard}>
              <Text style={styles.setupTitle}>Finish setup</Text>
              <Text style={styles.setupBody}>
                Create a Supabase project, then add its URL and anon key to a{' '}
                <Text style={styles.code}>client/.env</Text> file as{' '}
                <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_URL</Text> and{' '}
                <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>, then
                restart the dev server. See{' '}
                <Text style={styles.code}>client/.env.example</Text>.
              </Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Brand.inkFaint}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                editable={!busy}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Brand.inkFaint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!busy}
                onSubmitEditing={submit}
                returnKeyType="go"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}

              <Pressable
                style={[styles.button, busy && styles.buttonDisabled]}
                onPress={submit}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {mode === 'signIn' ? 'Sign in' : 'Create account'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setMode(mode === 'signIn' ? 'signUp' : 'signIn');
                  setError(null);
                  setNotice(null);
                }}
                hitSlop={8}
                disabled={busy}
              >
                <Text style={styles.switchText}>
                  {mode === 'signIn'
                    ? "No account? Create one"
                    : 'Have an account? Sign in'}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.bg },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoMark: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Brand.ink,
    textAlign: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 15,
    color: Brand.inkSoft,
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    height: 48,
    backgroundColor: Brand.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.line,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Brand.ink,
  },
  button: {
    height: 48,
    backgroundColor: Brand.blue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: {
    color: Brand.blue,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  error: { color: Brand.warn, fontSize: 14, textAlign: 'center' },
  notice: { color: Brand.ok, fontSize: 14, textAlign: 'center' },
  setupCard: {
    backgroundColor: Brand.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: 16,
    gap: 8,
  },
  setupTitle: { fontSize: 16, fontWeight: '700', color: Brand.ink },
  setupBody: { fontSize: 14, color: Brand.inkSoft, lineHeight: 20 },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: Brand.ink,
  },
});
