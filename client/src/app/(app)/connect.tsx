import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformBadge } from '@/components/PlatformBadge';
import { Brand, type ChatPlatform } from '@/constants/onechat';

type Status = 'soon' | 'planned';

interface AppRow {
  platform: ChatPlatform;
  status: Status;
  note: string;
}

/**
 * The "incorporate apps" hub. v1 targets (Telegram → Gmail → SMS) are the ones
 * with legitimate personal APIs; the rest are planned. You connect your OWN
 * accounts only — authorized use, no ToS-violating scrapers.
 */
const APPS: AppRow[] = [
  { platform: 'Telegram', status: 'soon', note: 'Your own account via Telegram’s official API.' },
  { platform: 'Gmail', status: 'soon', note: 'Read & send your email over Gmail OAuth.' },
  { platform: 'SMS', status: 'soon', note: 'Android text messages (default-SMS-app flow).' },
  { platform: 'Discord', status: 'planned', note: 'Server/bot mode only — DM reading breaks ToS.' },
  { platform: 'WhatsApp', status: 'planned', note: 'No safe official personal API yet.' },
  { platform: 'iMessage', status: 'planned', note: 'Needs an always-on Mac bridge.' },
];

export default function ConnectScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  const onConnect = (row: AppRow) => {
    if (row.status === 'planned') {
      Alert.alert(`${row.platform}`, `Planned for a later release.\n\n${row.note}`);
      return;
    }
    Alert.alert(
      `Connect ${row.platform}`,
      `${row.note}\n\nThis links your own ${row.platform} account (authorized use). ` +
        `It goes live once OneChat’s ${row.platform} connector + your API keys are set up.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Mark as connected',
          onPress: () => setConnected((c) => ({ ...c, [row.platform]: true })),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>Connect your apps</Text>
          <Text style={styles.subtitle}>One inbox for every account</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.intro}>
          Pool your messaging accounts into OneChat. You connect your own accounts —
          authorized use only.
        </Text>

        {APPS.map((row) => {
          const isConnected = connected[row.platform];
          return (
            <View key={row.platform} style={styles.row}>
              <View style={styles.rowTop}>
                <PlatformBadge platform={row.platform} />
                {isConnected ? (
                  <Text style={styles.connected}>● Connected</Text>
                ) : (
                  <Text style={row.status === 'soon' ? styles.soon : styles.planned}>
                    {row.status === 'soon' ? 'Ready to connect' : 'Planned'}
                  </Text>
                )}
              </View>
              <Text style={styles.note}>{row.note}</Text>
              <Pressable
                style={[
                  styles.connectBtn,
                  (row.status === 'planned' || isConnected) && styles.connectBtnMuted,
                ]}
                onPress={() => onConnect(row)}
                disabled={isConnected}
              >
                <Text
                  style={[
                    styles.connectText,
                    (row.status === 'planned' || isConnected) && styles.connectTextMuted,
                  ]}
                >
                  {isConnected ? 'Connected' : row.status === 'soon' ? 'Connect' : 'Notify me'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
  },
  back: { paddingHorizontal: 4 },
  backText: { fontSize: 34, color: Brand.blue, lineHeight: 36 },
  title: { fontSize: 22, fontWeight: '800', color: Brand.ink },
  subtitle: { fontSize: 13, color: Brand.ok, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  intro: { fontSize: 13, color: Brand.inkSoft, lineHeight: 19, marginBottom: 4 },
  row: {
    backgroundColor: Brand.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: 14,
    gap: 8,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  connected: { color: Brand.ok, fontWeight: '700', fontSize: 13 },
  soon: { color: Brand.blue, fontWeight: '700', fontSize: 13 },
  planned: { color: Brand.inkFaint, fontWeight: '600', fontSize: 13 },
  note: { fontSize: 13, color: Brand.inkSoft, lineHeight: 18 },
  connectBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtnMuted: { backgroundColor: Brand.bubbleThem },
  connectText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  connectTextMuted: { color: Brand.inkSoft },
});
