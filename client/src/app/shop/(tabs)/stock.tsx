import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { RoleHeader } from '@/components/common/RoleHeader';
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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><RoleHeader location="Shop inventory" role="shop" /></View>
      <View style={styles.screen}>
      <TextInput onChangeText={setQuery} placeholder="Search inventory or category" style={styles.search} value={query} />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F4F5FB', flex: 1 },
  header: { backgroundColor: '#F4F5FB', paddingHorizontal: 16, paddingTop: 8 },
  screen: { backgroundColor: '#F4F5FB', flex: 1, padding: 14 },
  search: { backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: 12, borderWidth: 1, marginBottom: 10, padding: 12 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#E8EAF9', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: '#0B6B3A' },
  chipText: { color: '#101828', fontSize: 12, fontWeight: '700' },
  error: { color: '#E11D48', marginBottom: 8 },
});
