import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleHeader } from '@/components/common/RoleHeader';
import { useCart } from '@/features/customer/useCart';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();

  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <RoleHeader role="customer" location="Add your neighborhood" />
      </View>
      
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Your Basket Items</Text>
          <View style={styles.itemCountPill}>
            <Text style={styles.itemCountText}>{totalItems} items ({totalUnits} units)</Text>
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
            <Ionicons name="trash-outline" size={14} color="#138A43" />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {items.map(item => (
          <View key={item.product.id} style={styles.card}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => removeItem(item.product.id)}>
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.cardTop}>
              <View style={styles.imageBox}>
                {item.product.imageUrl ? (
                  <Image source={{ uri: item.product.imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }]}>
                    <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                  </View>
                )}
                {item.product.stock <= 5 && (
                  <View style={styles.lowStockBadge}>
                    <Text style={styles.lowStockText}>LOW STOCK</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.unitPrice}>Per unit: LKR {item.product.price}</Text>
                
                <View style={styles.priceRow}>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => updateQuantity(item.product.id, -1)}>
                      <Ionicons name="remove" size={16} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => updateQuantity(item.product.id, 1)}>
                      <Ionicons name="add" size={16} color="#111827" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.totalPrice}>LKR {item.product.price * item.quantity}</Text>
                </View>
              </View>
            </View>

            {item.substitute?.enabled && (
              <View style={[styles.subBox, item.substitute.type === 'manual' ? styles.subBoxYellow : styles.subBoxGray]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons 
                    name={item.substitute.type === 'manual' ? "notifications-outline" : "sync-circle-outline"} 
                    size={16} 
                    color={item.substitute.type === 'manual' ? "#92400E" : "#138A43"} 
                    style={{ marginTop: 2, marginRight: 6 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subTitle}>
                      <Text style={{ fontWeight: '700' }}>Substitute: </Text>
                      {item.substitute.title}
                    </Text>
                    <View style={styles.subDescRow}>
                      {item.substitute.type === 'auto' && (
                        <View style={[styles.subDot, { backgroundColor: item.substitute.descType === 'success' ? '#138A43' : '#6B7280' }]} />
                      )}
                      <Text style={[styles.subDesc, item.substitute.type === 'manual' && { color: '#92400E' }, item.substitute.descType === 'success' && { color: '#138A43' }]}>
                        {item.substitute.desc}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={[styles.subEdit, item.substitute.type === 'manual' && { color: '#92400E' }]}>
                      {item.substitute.type === 'manual' ? 'Modify' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}

        {items.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="cart-outline" size={48} color="#D1D5DB" />
            <Text style={{ color: '#6B7280', marginTop: 12 }}>Your basket is empty</Text>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F9FAFB', flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#F9FAFB' },
  body: { padding: 16 },
  
  listHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  listTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  itemCountPill: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  itemCountText: { fontSize: 11, fontWeight: '700', color: '#047857' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearText: { color: '#138A43', fontSize: 12, fontWeight: '700' },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 },
  
  cardTop: { flexDirection: 'row', gap: 16 },
  imageBox: { width: 70, height: 70, position: 'relative', borderRadius: 8, backgroundColor: '#F3F4F6' },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 8 },
  lowStockBadge: { position: 'absolute', bottom: -6, left: -4, right: -4, backgroundColor: '#F59E0B', borderRadius: 4, paddingVertical: 2, alignItems: 'center' },
  lowStockText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  
  itemDetails: { flex: 1, paddingRight: 20 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  unitPrice: { fontSize: 12, color: '#6B7280' },
  
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 2 },
  stepBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 1 },
  stepValue: { width: 32, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#111827' },
  totalPrice: { fontSize: 15, fontWeight: '800', color: '#138A43' },
  
  subBox: { marginTop: 16, padding: 12, borderRadius: 12 },
  subBoxGray: { backgroundColor: '#F3F4F6' },
  subBoxYellow: { backgroundColor: '#FEF3C7' },
  subTitle: { fontSize: 12, color: '#111827', marginBottom: 2 },
  subDescRow: { flexDirection: 'row', alignItems: 'center' },
  subDot: { width: 4, height: 4, borderRadius: 2, marginRight: 4 },
  subDesc: { fontSize: 11, color: '#6B7280' },
  subEdit: { fontSize: 12, fontWeight: '700', color: '#138A43' },
});
