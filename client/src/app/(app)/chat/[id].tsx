import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import type { Message } from '@/data/types';
import { suggestFix } from '@/lib/smartReplace';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getContact, threadMessages, send, attach, undoLast } = useStore();
  const listRef = useRef<FlatList<Message>>(null);
  const [draft, setDraft] = useState('');

  const contact = getContact(id);
  const messages = threadMessages(id);

  if (!contact) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.missing}>Conversation not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back to inbox</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  // Send-guard: the study's #1 finding was messaging the wrong person.
  // Always confirm recipient + platform before sending.
  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    Alert.alert(
      'Confirm recipient',
      `Send to ${contact.name} via ${contact.platform}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            send(contact.id, text);
            setDraft('');
            scrollToEnd();
          },
        },
      ],
    );
  };

  // Smart-replace WITH consent — never rewrite silently.
  const onFix = () => {
    const result = suggestFix(draft);
    if (!result.changed) {
      Alert.alert('Nothing to fix', 'Your text looks good as written.');
      return;
    }
    Alert.alert(
      'Suggested rewrite',
      `From:\n${result.original}\n\nTo:\n${result.suggestion}`,
      [
        { text: 'Keep mine', style: 'cancel' },
        { text: 'Apply', onPress: () => setDraft(result.suggestion) },
      ],
    );
  };

  const onAttach = () => {
    attach(contact.id, 'project3-deck.pdf');
    scrollToEnd();
  };

  const onUndo = () => {
    const ok = undoLast(contact.id);
    Alert.alert(
      ok ? 'Removed' : 'Nothing to undo',
      ok ? 'Your last sent message was removed.' : 'No sent message in this thread.',
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Big recipient header — the anti-wrong-person signifier */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Avatar initials={contact.initials} seed={contact.id} size={52} />
        <View style={styles.headerBody}>
          <Text style={styles.headerName} numberOfLines={1}>
            {contact.name}
          </Text>
          <PlatformBadge platform={contact.platform} />
        </View>
      </View>
      <Text style={styles.guard}>
        You are messaging {contact.name} on {contact.platform}
      </Text>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.sender === 'me';
            return (
              <View style={[styles.bubbleRow, mine ? styles.right : styles.left]}>
                <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMe]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.time, mine && styles.timeMe]}>
                    {item.time.slice(11)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          <Pressable style={styles.iconBtn} onPress={onAttach} hitSlop={6}>
            <Text style={styles.iconBtnText}>＋</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={onUndo} hitSlop={6}>
            <Text style={styles.undoText}>↶</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={Brand.inkFaint}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable style={styles.fixBtn} onPress={onFix} hitSlop={6}>
            <Text style={styles.fixText}>Fix</Text>
          </Pressable>
          <Pressable style={styles.sendBtn} onPress={onSend} hitSlop={6}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.bg },
  flex: { flex: 1 },
  missing: { textAlign: 'center', marginTop: 40, color: Brand.ink, fontSize: 16 },
  link: { textAlign: 'center', marginTop: 12, color: Brand.blue, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
  },
  back: { paddingHorizontal: 4 },
  backText: { fontSize: 34, color: Brand.blue, lineHeight: 36 },
  headerBody: { flex: 1, gap: 4 },
  headerName: { fontSize: 24, fontWeight: '800', color: Brand.ink },
  guard: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FEF3F2',
    color: Brand.warn,
    fontSize: 12,
    fontWeight: '600',
    borderRadius: 8,
    overflow: 'hidden',
  },
  messages: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  bubbleRow: { flexDirection: 'row' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  bubbleMe: { backgroundColor: Brand.blue, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Brand.bubbleThem, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: Brand.ink },
  bubbleTextMe: { color: '#fff' },
  time: { fontSize: 10, color: Brand.inkFaint, marginTop: 4, alignSelf: 'flex-end' },
  timeMe: { color: '#FFFFFFAA' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Brand.card,
    borderTopWidth: 1,
    borderTopColor: Brand.line,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Brand.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20, color: Brand.blue, fontWeight: '700' },
  undoText: { fontSize: 20, color: Brand.inkSoft },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: Brand.bg,
    borderRadius: 10,
    fontSize: 15,
    color: Brand.ink,
  },
  fixBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixText: { color: Brand.inkSoft, fontWeight: '700' },
  sendBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Brand.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '700' },
});
