import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Brand } from '@/constants/onechat';
import { useStore } from '@/data/store';

export default function InboxScreen() {
  const router = useRouter();
  const { orderedContacts, lastMessage, search } = useStore();
  const [query, setQuery] = useState('');

  const hits = useMemo(() => search(query), [search, query]);
  const searching = query.trim().length > 0;

  const openChat = (id: string) =>
    router.push({ pathname: '/chat/[id]', params: { id } });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoMark}>1</Text>
        </View>
        <View>
          <Text style={styles.title}>OneChat</Text>
          <Text style={styles.subtitle}>Unified inbox</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search every conversation"
          placeholderTextColor={Brand.inkFaint}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {searching ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {searching ? (
        <FlatList
          data={hits}
          keyExtractor={(h) => h.message.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.empty}>No messages match “{query.trim()}”.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => openChat(item.contact.id)}
              android_ripple={{ color: '#00000010' }}
            >
              <Avatar initials={item.contact.initials} seed={item.contact.id} />
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.contact.name}
                  </Text>
                  <PlatformBadge platform={item.contact.platform} />
                </View>
                <Text style={styles.preview} numberOfLines={2}>
                  {item.message.text}
                </Text>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={orderedContacts}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const last = lastMessage(item.id);
            return (
              <Pressable
                style={styles.row}
                onPress={() => openChat(item.id)}
                android_ripple={{ color: '#00000010' }}
              >
                <Avatar initials={item.initials} seed={item.id} />
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <PlatformBadge platform={item.platform} />
                  </View>
                  <Text style={styles.preview} numberOfLines={1}>
                    {last
                      ? `${last.sender === 'me' ? 'You: ' : ''}${last.text}`
                      : 'No messages yet'}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { color: '#fff', fontSize: 20, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '800', color: Brand.ink },
  subtitle: { fontSize: 13, color: Brand.ok, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: Brand.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 15, color: Brand.ink },
  clear: { fontSize: 14, color: Brand.inkFaint, paddingHorizontal: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Brand.card,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  rowBody: { flex: 1, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: Brand.ink, flexShrink: 1 },
  preview: { fontSize: 13, color: Brand.inkSoft },
  empty: { textAlign: 'center', color: Brand.inkFaint, marginTop: 32, fontSize: 14 },
});
