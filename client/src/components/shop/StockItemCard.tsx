import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { stockState, type StockItem } from '@/features/shop/shopTypes';

type Props = {
  item: StockItem;
  onStep: (delta: number) => void;
  onToggle: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

const LOOK = {
  in: { label: 'In Stock', fg: '#138A43', bg: '#E3F6EA', border: '#E5E7EB' },
  low: { label: 'Low Stock', fg: '#B45309', bg: '#FEF3C7', border: '#F5D58A' },
  out: { label: 'Out of Stock', fg: '#E11D48', bg: '#FFE4E6', border: '#FBB6C2' },
};

export function StockItemCard({ item, onStep, onToggle, onEdit, onDelete }: Props) {
  const look = LOOK[stockState(item)];
  return (
    <View style={[styles.card, { borderColor: look.border }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>LKR {item.price.toLocaleString('en-US')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Text style={[styles.badge, { color: look.fg, backgroundColor: look.bg }]}>{look.label}</Text>
          <View style={styles.row}>
            <TouchableOpacity accessibilityLabel={`Edit ${item.name}`} onPress={onEdit} style={styles.icon}>
              <Ionicons color="#475467" name="create-outline" size={18} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel={`Delete ${item.name}`} onPress={onDelete} style={styles.icon}>
              <Ionicons color="#E11D48" name="trash-outline" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={[styles.row, { justifyContent: 'space-between', marginTop: 12 }]}>
        <View style={styles.row}>
          <TouchableOpacity accessibilityLabel="Decrease quantity" disabled={item.stock === 0} onPress={() => onStep(-1)} style={styles.step}>
            <Ionicons name="remove" size={18} />
          </TouchableOpacity>
          <Text style={styles.qty}>{item.stock}</Text>
          <TouchableOpacity accessibilityLabel="Increase quantity" onPress={() => onStep(1)} style={styles.step}>
            <Ionicons name="add" size={18} />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.category}>Available </Text>
          <Switch onValueChange={onToggle} trackColor={{ true: '#138A43' }} value={item.available} />
        </View>
      </View>
      {item.stock === 0 && (
        <TouchableOpacity onPress={() => onStep(10)} style={styles.restock}>
          <Text style={styles.restockText}>Restock / Quick Add 10 units</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 14 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  category: { color: '#667085', fontSize: 12 },
  name: { color: '#101828', fontSize: 16, fontWeight: '800', marginVertical: 2 },
  price: { color: '#475467', fontSize: 13 },
  badge: { borderRadius: 99, fontSize: 11, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
  icon: { backgroundColor: '#F2F4F7', borderRadius: 10, padding: 8 },
  step: { backgroundColor: '#F2F4F7', borderRadius: 10, padding: 8 },
  qty: { fontSize: 16, fontWeight: '800', minWidth: 32, textAlign: 'center' },
  restock: { alignItems: 'center', backgroundColor: '#E11D48', borderRadius: 12, marginTop: 12, padding: 12 },
  restockText: { color: '#fff', fontWeight: '700' },
});
