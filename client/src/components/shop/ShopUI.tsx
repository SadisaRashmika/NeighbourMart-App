import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { T } from './shopTheme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Pill({ text, fg, bg, icon }: { text: string; fg: string; bg: string; icon?: IconName }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      {icon && <Ionicons color={fg} name={icon} size={12} />}
      <Text style={{ color: fg, fontSize: 11, fontWeight: '800' }}>{text}</Text>
    </View>
  );
}

export function SectionTitle({ title, action, onAction, dot }: { title: string; action?: string; onAction?: () => void; dot?: string }) {
  return (
    <View style={s.sectionRow}>
      <View style={s.rowC}>
        {dot ? <View style={[s.dot, { backgroundColor: dot }]} /> : null}
        <Text style={s.section}>{title}</Text>
      </View>
      {action ? <TouchableOpacity onPress={onAction}><Text style={s.action}>{action} ›</Text></TouchableOpacity> : null}
    </View>
  );
}

export function Thumb({ emoji, imageUrl, size = 54 }: { emoji: string; imageUrl?: string; size?: number }) {
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={[s.thumb, { width: size, height: size }]} />;
  }
  return <View style={[s.thumb, { width: size, height: size }]}><Text style={{ fontSize: size * 0.5 }}>{emoji}</Text></View>;
}

type Tone = 'primary' | 'soft' | 'danger' | 'amber' | 'dark';
const TONES: Record<Tone, [string, string, string]> = {
  primary: [T.green2, '#fff', T.green2], soft: ['#fff', T.ink, T.line], danger: [T.red, '#fff', T.red],
  amber: [T.amberBg, T.amber, T.amberLine], dark: ['#4B5563', '#fff', '#4B5563'],
};
export function ActionButton({ label, onPress, icon, tone = 'primary', style, disabled }: {
  label: string; onPress: () => void; icon?: IconName; tone?: Tone; style?: StyleProp<ViewStyle>; disabled?: boolean;
}) {
  const [bg, fg, bd] = TONES[tone];
  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.85} disabled={disabled} onPress={onPress}
      style={[s.btn, { backgroundColor: bg, borderColor: bd, opacity: disabled ? 0.5 : 1 }, style]}>
      {icon && <Ionicons color={fg} name={icon} size={17} />}
      <Text style={{ color: fg, fontWeight: '800', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  pill: { alignItems: 'center', alignSelf: 'flex-start', borderRadius: 99, flexDirection: 'row', gap: 4, paddingHorizontal: 9, paddingVertical: 4 },
  sectionRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 18 },
  rowC: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  dot: { borderRadius: 5, height: 9, width: 9 },
  section: { color: T.ink, fontSize: 16, fontWeight: '800' },
  action: { color: T.green2, fontSize: 13, fontWeight: '800' },
  thumb: { alignItems: 'center', backgroundColor: '#F2F4F7', borderColor: T.line, borderRadius: 14, borderWidth: 1, justifyContent: 'center' },
  btn: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 46, paddingHorizontal: 14 },
});
