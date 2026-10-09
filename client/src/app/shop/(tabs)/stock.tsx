import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EmptyState } from '@/components/common/EmptyState';
import { StockItemCard } from '@/components/shop/StockItemCard';
import { ActionButton } from '@/components/shop/ShopUI';
import { T, shadow } from '@/components/shop/shopTheme';
import { stockState } from '@/features/shop/shopTypes';
import { useStock } from '@/features/shop/useStock';

type Filter = 'all' | 'low' | 'out';
const DOT: Record<Filter, string> = { all: T.green2, low: '#F59E0B', out: T.red };

export default function ShopStock() {
  const { items, loading, error, reload, patch, remove } = useStock();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const needs = useMemo(() => items.filter((i) => stockState(i) !== 'in'), [items]);
  const counts = { all: items.length, low: items.filter((i) => stockState(i) === 'low').length, out: items.filter((i) => stockState(i) === 'out').length };
  const shown = items.filter((i) => (filter === 'all' || stockState(i) === filter) && `${i.name} ${i.category}`.toLowerCase().includes(query.trim().toLowerCase()));

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Delete item', `Remove "${name}" from your stock?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(id) }]);
  const bulk = () =>
    Alert.alert('Quick bulk restock', `Add 10 units to ${needs.length} low / out-of-stock item(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restock all', onPress: () => needs.forEach((i) => patch(i.id, { stock: i.stock + 10 })) },
    ]);

  const header = (
    <View>
      <View style={[styles.search, shadow]}>
        <Ionicons color={T.mute} name="search" size={18} />
        <TextInput onChangeText={setQuery} placeholder="Search inventory or category" placeholderTextColor={T.mute} style={styles.searchInput} value={query} />
      </View>
      <View style={styles.chips}>
        {(['all', 'low', 'out'] as Filter[]).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipOn]}>
            {f !== 'all' && <View style={[styles.dot, { backgroundColor: DOT[f] }]} />}
            <Text style={[styles.chipText, filter === f && { color: '#fff' }]}>{f === 'all' ? 'All Items' : f === 'low' ? 'Low Stock' : 'Out of Stock'} {counts[f]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.bulk, shadow]}>
        <View style={styles.bulkIcon}><Ionicons color="#fff" name="flash-outline" size={22} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bulkTitle}>Quick Bulk Update</Text>
          <Text style={styles.bulkSub}>{needs.length ? `Restock ${needs.length} low / out items at once` : 'All items are well stocked'}</Text>
        </View>
        <TouchableOpacity disabled={!needs.length} onPress={bulk} style={[styles.review, !needs.length && { opacity: 0.5 }]}><Text style={styles.reviewText}>Review</Text></TouchableOpacity>
      </View>
      <ActionButton icon="add" label="Add New Item" onPress={() => router.push('/shop/product-form')} style={styles.add} />
      {error && <TouchableOpacity onPress={reload}><Text style={styles.error}>{error} - tap to retry</Text></TouchableOpacity>}
    </View>
  );

  if (loading) return <ActivityIndicator color={T.green2} size="large" style={{ backgroundColor: T.bg, flex: 1 }} />;
  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={shown}
      keyExtractor={(i) => i.id}
      ListEmptyComponent={<EmptyState description="Add your first product or change the filter." title="No items found" />}
      ListHeaderComponent={header}
      onRefresh={reload}
      refreshing={false}
      renderItem={({ item }) => (
        <StockItemCard
          item={item}
          onDelete={() => confirmDelete(item.id, item.name)}
          onEdit={() => router.push({ pathname: '/shop/product-form', params: { id: item.id, name: item.name, category: item.category, price: String(item.price), stock: String(item.stock) } })}
          onStep={(d) => patch(item.id, { stock: Math.max(0, item.stock + d) })}
          onToggle={(v) => patch(item.id, { available: v })}
        />
      )}
      style={{ backgroundColor: T.bg }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 40 },
  search: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', gap: 8, marginBottom: 12, paddingHorizontal: 14 },
  searchInput: { color: T.ink, flex: 1, paddingVertical: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { alignItems: 'center', backgroundColor: T.lav, borderRadius: 99, flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: T.green },
  chipText: { color: T.ink, fontSize: 12, fontWeight: '800' },
  dot: { borderRadius: 4, height: 8, width: 8 },
  bulk: { alignItems: 'center', backgroundColor: T.green, borderRadius: 20, flexDirection: 'row', gap: 12, marginBottom: 12, padding: 14 },
  bulkIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  bulkTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  bulkSub: { color: '#D7F5E3', fontSize: 12 },
  review: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  reviewText: { color: T.green, fontWeight: '800' },
  add: { backgroundColor: T.green, borderColor: T.green, marginBottom: 14, minHeight: 54 },
  error: { color: T.red, marginBottom: 8 },
});



