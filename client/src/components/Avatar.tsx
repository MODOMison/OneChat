import { StyleSheet, Text, View } from 'react-native';

import { avatarColor } from '@/constants/onechat';

export function Avatar({
  initials,
  seed,
  size = 46,
}: {
  initials: string;
  seed: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColor(seed) },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '700' },
});
