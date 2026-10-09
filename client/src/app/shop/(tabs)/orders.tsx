import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { RoleHeader } from '@/components/common/RoleHeader';
import { ShopOrderCard } from '@/components/shop/ShopOrderCard';
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
  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><RoleHeader location="Order desk" role="shop" /></View>
      <View style={styles.screen}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 12 }}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.chip, tab === t.key && styles.chipOn]}>
            <Text style={[styles.chipText, tab === t.key && { color: '#fff' }]}>{t.label} {count(t.key)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button label="+ New Counter Order" onPress={openForm} style={{ marginBottom: 12 }} />
      {error && <TouchableOpacity onPress={reload}><Text style={styles.error}>{error} - tap to retry</Text></TouchableOpacity>}
      {loading ? <ActivityIndicator color="#138A43" size="large" style={{ marginTop: 32 }} /> : (
        <FlatList
          data={shown}
          keyExtractor={(o) => o.id}
          ListEmptyComponent={<EmptyState description="Orders in this stage will appear here." title="No orders" />}
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
      )}
      <Modal animationType="slide" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.title}>New counter order</Text>
            <TextInput onChangeText={setCustomer} placeholder="Customer name" style={styles.input} value={customer} />
            <ScrollView style={{ maxHeight: 280 }}>
              {products.map((p) => (
                <View key={p.id} style={styles.line}>
                  <View style={{ flex: 1 }}><Text style={{ fontWeight: '700' }}>{p.name}</Text><Text style={styles.mute}>LKR {p.price} - {p.stock} left</Text></View>
                  <TouchableOpacity onPress={() => setQty({ ...qty, [p.id]: Math.max(0, (qty[p.id] ?? 0) - 1) })} style={styles.step}><Text>-</Text></TouchableOpacity>
                  <Text style={styles.q}>{qty[p.id] ?? 0}</Text>
                  <TouchableOpacity onPress={() => setQty({ ...qty, [p.id]: Math.min(p.stock, (qty[p.id] ?? 0) + 1) })} style={styles.step}><Text>+</Text></TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.total}>Total: LKR {total.toLocaleString('en-US')}</Text>
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <Button label="Create order" onPress={submit} />
            <TouchableOpacity onPress={() => setOpen(false)} style={{ alignItems: 'center', padding: 12 }}><Text>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
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
  error: { color: '#E11D48', marginBottom: 8 },
  backdrop: { backgroundColor: '#0006', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 8, padding: 18 },
  title: { fontSize: 18, fontWeight: '800' },
  input: { backgroundColor: '#FAFAFA', borderColor: '#E5E7EB', borderRadius: 10, borderWidth: 1, padding: 10 },
  line: { alignItems: 'center', borderBottomColor: '#F2F4F7', borderBottomWidth: 1, flexDirection: 'row', gap: 8, paddingVertical: 8 },
  mute: { color: '#667085', fontSize: 12 },
  step: { backgroundColor: '#F2F4F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  q: { fontWeight: '800', minWidth: 20, textAlign: 'center' },
  total: { color: '#0B6B3A', fontSize: 16, fontWeight: '800', marginTop: 4 },
});
