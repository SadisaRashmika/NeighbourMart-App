import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { StockItemCard } from '@/components/shop/StockItemCard';
import { useStock } from '@/features/shop/useStock';
import { stockState } from '@/features/shop/shopTypes';

type Filter = 'all' | 'low' | 'out';

export default function ShopStock() {
  const { items, loading, error, reload, patch, remove } = useStock();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => ({
    all: items.length,
    low: items.filter((i) => stockState(i) === 'low').length,
    out: items.filter((i) => stockState(i) === 'out').length,
  }), [items]);

  const shown = items.filter((i) =>
    (filter === 'all' || stockState(i) === filter) &&
    `${i.name} ${i.category}`.toLowerCase().includes(query.trim().toLowerCase()));

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Delete item', `Remove "${name}" from your stock?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);

  return (
    <View style={styles.screen}>
      <TextInput onChangeText={setQuery} placeholder="Search inventory or category" style={styles.search} value={query} />
      <View style={styles.chips}>
        {(['all', 'low', 'out'] as Filter[]).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipOn]}>
            <Text style={[styles.chipText, filter === f && { color: '#fff' }]}>
              {f === 'all' ? 'All Items' : f === 'low' ? 'Low Stock' : 'Out of Stock'} {counts[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button label="+ Add New Item" onPress={() => router.push('/shop/product-form')} style={{ marginBottom: 12 }} />
      {error && (
        <TouchableOpacity onPress={reload}><Text style={styles.error}>{error} - tap to retry</Text></TouchableOpacity>
      )}
      {loading ? <ActivityIndicator color="#138A43" style={{ marginTop: 32 }} size="large" /> : (
        <FlatList
          data={shown}
          keyExtractor={(i) => i.id}
          ListEmptyComponent={<EmptyState description="Add your first product or change the filter." title="No items found" />}
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F4F5FB', flex: 1, padding: 14 },
  search: { backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: 12, borderWidth: 1, marginBottom: 10, padding: 12 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#E8EAF9', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: '#0B6B3A' },
  chipText: { color: '#101828', fontSize: 12, fontWeight: '700' },
  error: { color: '#E11D48', marginBottom: 8 },
});
