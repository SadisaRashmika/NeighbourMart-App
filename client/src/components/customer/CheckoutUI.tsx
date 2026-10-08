import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const currency = (value: number) => `LKR ${value.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function CheckoutPage({ title, children }: PropsWithChildren<{ title: string }>) {
  return <SafeAreaView style={ui.safe} edges={['top', 'left', 'right']}><ScrollView contentContainerStyle={ui.page} keyboardShouldPersistTaps="handled"><Text style={ui.brand}>🛒 NeighbourMart</Text><Text style={ui.title}>{title}</Text>{children}</ScrollView></SafeAreaView>;
}
export function Card({ children }: PropsWithChildren) { return <View style={ui.card}>{children}</View>; }
export function Notice({ message }: { message: string }) { return message ? <Text accessibilityRole="alert" style={ui.notice}>{message}</Text> : null; }
export const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F5FF' }, page: { padding: 20, gap: 16, paddingBottom: 40 },
  brand: { color: '#087B37', fontWeight: '700', fontSize: 15 }, title: { fontSize: 25, color: '#18251D', fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, gap: 12 },
  heading: { fontSize: 17, fontWeight: '700', color: '#18251D' }, text: { color: '#475449', fontSize: 14, lineHeight: 21 },
  price: { color: '#087B37', fontWeight: '700', fontSize: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  notice: { backgroundColor: '#FFF0D9', color: '#74410A', padding: 14, borderRadius: 12, lineHeight: 21 },
  link: { color: '#087B37', fontWeight: '600', paddingVertical: 10 },
  selected: { borderWidth: 2, borderColor: '#087B37', backgroundColor: '#E8F6ED', borderRadius: 12, padding: 14, gap: 5 },
  choice: { borderWidth: 1, borderColor: '#D5DBD7', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, gap: 5 },
});
