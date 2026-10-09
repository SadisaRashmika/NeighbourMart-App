import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { RoleHeader } from '@/components/common/RoleHeader';
import { ShopOrderCard } from '@/components/shop/ShopOrderCard';
import { ActionButton, Thumb } from '@/components/shop/ShopUI';
import { T, emojiFor, money } from '@/components/shop/shopTheme';
import { createShopOrder, getStockItems } from '@/features/shop/shopApi';
import type { OrderStatus, StockItem } from '@/features/shop/shopTypes';
import { useShopOrders } from '@/features/shop/useShopOrders';

const TABS: { key: OrderStatus; label: string }[] = [
  { key: 'new', label: 'New' }, { key: 'preparing', label: 'Preparing' }, { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' },
];

export default function ShopOrders() {
  const { orders, loading, error, reload, setStatus, remove } = useShopOrders();
  const [tab, setTab] = useState<OrderStatus>('new');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<StockItem[]>([]);
  const [customer, setCustomer] = useState('');
  const [qty, setQty] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState('');

  const shown = orders.filter((o) => o.status === tab);
  const count = (st: OrderStatus) => orders.filter((o) => o.status === st).length;
  const live = count('new') + count('preparing');
  const total = products.reduce((a, p) => a + (qty[p.id] ?? 0) * p.price, 0);

  async function openForm() {
    setCustomer(''); setQty({}); setFormError('');
    try { setProducts((await getStockItems()).filter((p) => p.available && p.stock > 0)); setOpen(true); }
    catch (e) { Alert.alert('Could not load products', e instanceof Error ? e.message : ''); }
  }
  async function submit() {
    const items = Object.entries(qty).filter(([, q]) => q > 0).map(([productId, quantity]) => ({ productId, quantity }));
    if (!customer.trim()) return setFormError('Enter the customer name.');
    if (!items.length) return setFormError('Add at least one item.');
    try { await createShopOrder(customer.trim(), items); setOpen(false); setTab('new'); reload(); }
    catch (e) { setFormError(e instanceof Error ? e.message : 'Could not create order'); }
  }
  const confirm = (title: string, msg: string, action: () => void) =>
    Alert.alert(title, msg, [{ text: 'Keep', style: 'cancel' }, { text: 'Yes', style: 'destructive', onPress: action }]);

  const header = (
    <View style={styles.screen}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 12 }}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.chip, tab === t.key && styles.chipOn, { flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={[styles.chipText, tab === t.key && { color: '#fff' }]}>{t.label}</Text>
            <View style={[styles.badge, tab === t.key && { backgroundColor: '#fff' }]}><Text style={styles.badgeText}>{count(t.key)}</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ActionButton icon="add" label="New Counter Order" onPress={openForm} style={styles.add} />
      {error && <TouchableOpacity onPress={reload}><Text style={styles.error}>{error} - tap to retry</Text></TouchableOpacity>}
    </View>
  );

  if (loading) return <ActivityIndicator color={T.green2} size="large" style={{ backgroundColor: T.bg, flex: 1 }} />;
  
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><RoleHeader location="Order desk" role="shop" /></View>
      <FlatList
        contentContainerStyle={styles.list}
        data={shown}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={<EmptyState description="Orders in this stage will appear here." title="No orders" />}
        ListHeaderComponent={header}
        onRefresh={reload}
        refreshing={false}
        renderItem={({ item }) => (
          <ShopOrderCard
            order={item}
            onAdvance={(next) => setStatus(item.id, next)}
            onCancel={() => confirm('Cancel order', `Cancel ${item.orderNumber} for ${item.customerName}?`, () => setStatus(item.id, 'cancelled'))}
            onDelete={() => confirm('Delete order', 'This removes it permanently.', () => remove(item.id))}
          />
        )}
      />
      <Modal animationType="slide" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>New counter order</Text>
              <TouchableOpacity onPress={() => setOpen(false)}><Ionicons color={T.ink} name="close" size={24} /></TouchableOpacity>
            </View>
            <View style={styles.inputWrap}>
              <Ionicons color={T.mute} name="person-outline" size={18} />
              <TextInput onChangeText={setCustomer} placeholder="Customer name" placeholderTextColor={T.mute} style={styles.input} value={customer} />
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {products.length === 0 && <Text style={styles.mute}>No available products. Add stock first.</Text>}
              {products.map((p) => (
                <View key={p.id} style={styles.line}>
                  <Thumb emoji={emojiFor(p.category, p.name)} size={44} />
                  <View style={{ flex: 1 }}><Text style={styles.bold}>{p.name}</Text><Text style={styles.mute}>{money(p.price)} - {p.stock} left</Text></View>
                  <TouchableOpacity onPress={() => setQty({ ...qty, [p.id]: Math.max(0, (qty[p.id] ?? 0) - 1) })} style={styles.step}><Ionicons name="remove" size={16} /></TouchableOpacity>
                  <Text style={styles.q}>{qty[p.id] ?? 0}</Text>
                  <TouchableOpacity onPress={() => setQty({ ...qty, [p.id]: Math.min(p.stock, (qty[p.id] ?? 0) + 1) })} style={styles.step}><Ionicons name="add" size={16} /></TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={styles.totalRow}><Text style={styles.mute}>Order total</Text><Text style={styles.total}>{money(total)}</Text></View>
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <ActionButton icon="checkmark-circle-outline" label="Create order" onPress={submit} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F4F5FB', flex: 1 },
  header: { backgroundColor: '#F4F5FB', paddingHorizontal: 16, paddingTop: 8 },
  screen: { backgroundColor: '#F4F5FB', flex: 1, padding: 14 },
  chip: { backgroundColor: '#E8EAF9', borderRadius: 99, marginRight: 8, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: '#0B6B3A' },
  chipText: { fontSize: 12, fontWeight: '700' },
  badge: { backgroundColor: '#D1D5DB', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  badgeText: { color: '#374151', fontSize: 10, fontWeight: '700' },
  add: { marginBottom: 12 },
  error: { color: '#E11D48', marginBottom: 8 },
  list: { padding: 14, paddingBottom: 40 },
  backdrop: { backgroundColor: '#0006', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 12, padding: 18, paddingBottom: 30 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderColor: '#E5E7EB', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12 },
  input: { flex: 1, padding: 12, color: '#111827' },
  line: { alignItems: 'center', borderBottomColor: '#F2F4F7', borderBottomWidth: 1, flexDirection: 'row', gap: 8, paddingVertical: 8 },
  bold: { fontWeight: '800', color: '#111827' },
  mute: { color: '#667085', fontSize: 12 },
  step: { backgroundColor: '#F2F4F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  q: { fontWeight: '800', minWidth: 20, textAlign: 'center', color: '#111827' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  total: { color: '#0B6B3A', fontSize: 16, fontWeight: '800' },
});
