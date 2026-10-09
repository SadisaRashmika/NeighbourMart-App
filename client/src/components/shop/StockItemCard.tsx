import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { stockState, type StockItem } from '@/features/shop/shopTypes';
import { Pill, Thumb } from './ShopUI';
import { T, emojiFor, money, shadow } from './shopTheme';

type Props = { item: StockItem; onStep: (delta: number) => void; onToggle: (value: boolean) => void; onEdit: () => void; onDelete: () => void };

const LOOK = {
  in: { label: 'In Stock', fg: T.green2, bg: T.mint, border: T.line },
  low: { label: 'Low Stock', fg: T.amber, bg: T.amberBg, border: T.amberLine },
  out: { label: 'Out of Stock', fg: T.red, bg: T.redBg, border: '#FBB6C2' },
};

export function StockItemCard({ item, onStep, onToggle, onEdit, onDelete }: Props) {
  const state = stockState(item);
  const look = LOOK[state];
  return (
    <View style={[styles.card, shadow, { borderColor: look.border }]}>
      <View style={styles.row}>
        <Thumb emoji={emojiFor(item.category, item.name)} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{money(item.price)} <Text style={styles.unit}>/ unit</Text></Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Pill bg={look.bg} fg={look.fg} text={look.label} />
          <View style={styles.row}>
            <TouchableOpacity accessibilityLabel={`Edit ${item.name}`} onPress={onEdit} style={styles.icon}>
              <Ionicons color={T.slate} name="create-outline" size={17} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel={`Delete ${item.name}`} onPress={onDelete} style={styles.icon}>
              <Ionicons color={T.red} name="trash-outline" size={17} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {state === 'low' && (
        <View style={styles.warn}><Ionicons color={T.amber} name="warning-outline" size={14} /><Text style={styles.warnText}>Only {item.stock} remaining</Text></View>
      )}
      {state === 'out' && <Text style={styles.outText}>! 0 units on shelf</Text>}

      <View style={styles.divider} />
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <View style={styles.stepper}>
          <TouchableOpacity accessibilityLabel="Decrease quantity" disabled={item.stock === 0} onPress={() => onStep(-1)} style={styles.stepBtn}>
            <Ionicons color={item.stock === 0 ? '#C0C5D0' : T.ink} name="remove" size={18} />
          </TouchableOpacity>
          <Text style={styles.qty}>{item.stock}</Text>
          <TouchableOpacity accessibilityLabel="Increase quantity" onPress={() => onStep(1)} style={styles.stepBtn}>
            <Ionicons color={T.ink} name="add" size={18} />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.unit}>Available</Text>
          <Switch onValueChange={onToggle} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: T.green2 }} value={item.available} />
        </View>
      </View>

      {state === 'out' && (
        <TouchableOpacity onPress={() => onStep(10)} style={styles.restock}>
          <Ionicons color="#fff" name="cube-outline" size={17} />
          <Text style={styles.restockText}>Restock / Quick Add 10 units</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: T.card, borderRadius: 18, borderWidth: 1, gap: 10, marginBottom: 12, padding: 14 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  category: { color: T.mute, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  name: { color: T.ink, fontSize: 16, fontWeight: '800' },
  price: { color: T.slate, fontSize: 13, fontWeight: '700' },
  unit: { color: T.mute, fontSize: 12, fontWeight: '400' },
  icon: { backgroundColor: '#F2F4F7', borderRadius: 10, padding: 8 },
  warn: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  warnText: { color: T.amber, fontSize: 12, fontWeight: '700' },
  outText: { color: T.red, fontSize: 12, fontWeight: '800' },
  divider: { backgroundColor: T.line, height: 1 },
  stepper: { alignItems: 'center', backgroundColor: '#F7F8FC', borderColor: T.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', padding: 4 },
  stepBtn: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, height: 34, justifyContent: 'center', width: 34 },
  qty: { color: T.ink, fontSize: 16, fontWeight: '800', minWidth: 44, textAlign: 'center' },
  restock: { alignItems: 'center', backgroundColor: T.red, borderRadius: 14, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48 },
  restockText: { color: '#fff', fontWeight: '800' },
});
