import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleHeader } from '@/components/common/RoleHeader';
import { getCustomerOrder, respondToOrderSubstitution } from '@/features/customer/customerApi';
import type { CustomerOrder, CustomerOrderItem } from '@/features/customer/customerTypes';

const money = (value: number) => `LKR ${value.toLocaleString('en-LK')}`;
export default function OrderSubstitution() {
  const { id, productId } = useLocalSearchParams<{ id: string; productId: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { if (id) getCustomerOrder(id).then(setOrder).catch((e) => setError(e instanceof Error ? e.message : 'Unable to load substitution')).finally(() => setBusy(false)); }, [id]);
  const item = order?.items?.find((line) => line.productId === productId) as CustomerOrderItem | undefined;
  const decide = async (decision: 'approved' | 'rejected') => {
    if (!id || !productId) return; setBusy(true); setError('');
    try { await respondToOrderSubstitution(id, productId, decision); router.replace({ pathname: '/customer/order-tracking', params: { id } }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save decision'); setBusy(false); }
  };
  if (busy && !order) return <ActivityIndicator color="#006B2C" size="large" style={styles.center} />;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><View style={styles.header}><RoleHeader role="customer" location="Substitution approval" /></View><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.alert}><Ionicons name="alert-circle" size={20} color="#855300" /><Text style={styles.alertText}>ACTION REQUIRED: REPLACEMENT SUGGESTION</Text></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {!item?.substitution || item.substitution.status !== 'pending' ? <View style={styles.card}><Text style={styles.title}>This request is no longer pending</Text><Pressable onPress={() => router.back()}><Text style={styles.link}>Return to order</Text></Pressable></View> : <>
      <Text style={styles.title}>Approve substitution for your order?</Text><Text style={styles.body}>{item.name} is unavailable. The shopkeeper suggested {item.substitution.suggestedName} instead.</Text>
      <View style={styles.compare}><ProductCard title="Original" name={item.name} image={item.imageUrl} price={item.unitPrice} muted /><ProductCard title="Suggested" name={item.substitution.suggestedName ?? 'Replacement'} image={item.substitution.suggestedImageUrl} price={item.substitution.suggestedUnitPrice ?? 0} /></View>
      <View style={styles.priceBox}><Text style={styles.body}>Price adjustment</Text><Text style={styles.price}>{(item.substitution.priceDifference ?? 0) >= 0 ? '+' : '-'}{money(Math.abs(item.substitution.priceDifference ?? 0))}</Text></View>
      {item.substitution.shopkeeperNote ? <View style={styles.note}><Text style={styles.noteTitle}>Shopkeeper’s note</Text><Text style={styles.body}>“{item.substitution.shopkeeperNote}”</Text></View> : null}
      <Pressable disabled={busy} onPress={() => void decide('approved')} style={styles.approve}><Ionicons name="checkmark-circle" size={21} color="#fff" /><Text style={styles.approveText}>{busy ? 'Saving…' : 'Approve Replacement'}</Text></Pressable>
      <Pressable disabled={busy} onPress={() => void decide('rejected')} style={styles.reject}><Text style={styles.rejectText}>Reject and Remove Item</Text></Pressable>
      <Text style={styles.foot}>Your order total is recalculated securely by the server.</Text>
    </>}
  </ScrollView></SafeAreaView>;
}

function ProductCard({ title, name, image, price, muted }: { title: string; name: string; image?: string; price: number; muted?: boolean }) {
  return <View style={[styles.product, muted && { opacity: 0.65 }]}><Text style={styles.tag}>{title}</Text>{image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Ionicons name="basket-outline" size={34} color="#98A2B3" /></View>}<Text style={styles.productName}>{name}</Text><Text style={styles.price}>{money(price)}</Text></View>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#FAF8FF' }, header: { paddingHorizontal: 16, paddingTop: 8 }, content: { padding: 16, gap: 16, paddingBottom: 40 }, center: { flex: 1, backgroundColor: '#FAF8FF' }, alert: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FFF0DA', borderRadius: 99, padding: 12 }, alertText: { color: '#684000', fontSize: 11, fontWeight: '800', flex: 1 }, title: { color: '#131B2E', fontSize: 24, lineHeight: 32, fontWeight: '800' }, body: { color: '#3E4A3D', fontSize: 13, lineHeight: 20 }, compare: { flexDirection: 'row', gap: 8 }, product: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 9, gap: 7 }, tag: { alignSelf: 'flex-start', color: '#006B2C', backgroundColor: '#DDF8E7', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, fontSize: 10, fontWeight: '800' }, image: { width: '100%', aspectRatio: 1, borderRadius: 9, resizeMode: 'contain' }, placeholder: { backgroundColor: '#F2F3FF', alignItems: 'center', justifyContent: 'center' }, productName: { color: '#131B2E', fontWeight: '800', fontSize: 14 }, price: { color: '#006B2C', fontWeight: '900', fontSize: 16 }, priceBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F2F3FF', borderRadius: 12, padding: 13 }, note: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 5 }, noteTitle: { color: '#131B2E', fontWeight: '800' }, approve: { backgroundColor: '#006B2C', borderRadius: 12, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, approveText: { color: '#fff', fontWeight: '800', fontSize: 15 }, reject: { borderColor: '#BA1A1A', borderWidth: 1, borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, rejectText: { color: '#BA1A1A', fontWeight: '800' }, foot: { color: '#6E7B6C', textAlign: 'center', fontSize: 11 }, error: { color: '#BA1A1A', backgroundColor: '#FFE5E2', padding: 10, borderRadius: 8 }, card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, gap: 12 }, link: { color: '#006B2C', fontWeight: '800' } });
