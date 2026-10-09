import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/useAuth';
import { useCart } from '@/features/customer/useCart';
import type { Product, SubstitutePreference } from '@/features/customer/customerTypes';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  
  const id = params.id as string;
  const name = (params.name as string) || 'Product Details';
  const price = Number(params.price) || 0;
  const stock = Number(params.stock) || 0;
  const category = (params.category as string) || 'Category';
  const imageUrl = params.imageUrl as string;
  const shopName = (params.shopName as string) || 'Local Grocery';

  const [quantity, setQuantity] = useState(1);
  const [subEnabled, setSubEnabled] = useState(false);
  const [substituteDesc, setSubstituteDesc] = useState('');

  const handleAddToCart = () => {
    const product: Product = { id, name, price, stock, category, available: true, imageUrl };
    const substitute: SubstitutePreference | undefined = subEnabled ? {
      enabled: true,
      type: 'auto',
      title: 'Any similar item',
      desc: substituteDesc || 'Merchant will choose equivalent quality',
      descType: 'neutral'
    } : undefined;
    
    addItem(product, quantity, substitute, shopName);
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Image source={require('../../../../../assets/images/brand-logo.png.jpg')} style={{ width: 24, height: 24, borderRadius: 6, marginRight: 8 }} />
        <Text numberOfLines={1} style={[styles.headerTitle, { flex: 1 }]}>Product Detail</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="help-circle-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
        <View style={styles.profile}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.profileImage} />
          ) : (
            <Ionicons color="#fff" name="person" size={14} />
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topMetaRow}>
          <View style={styles.shopPill}>
            <Ionicons name="storefront" size={12} color="#138A43" />
            <Text style={styles.shopPillText}>{shopName}</Text>
          </View>
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="heart-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn}>
              <Ionicons name="share-social-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="image-outline" size={48} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{category}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.branchText}>{shopName}</Text>
        </View>

        <Text style={styles.title}>{name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.pricePrefix}>LKR</Text>
          <Text style={styles.price}>{price}</Text>
          <View style={{ flex: 1 }} />
          <View style={styles.stockPill}>
            <View style={styles.stockDot} />
            <Text style={styles.stockText}>{stock} units left</Text>
          </View>
        </View>

        <View style={styles.quantityBox}>
          <View style={styles.qTopRow}>
            <Text style={styles.qLabel}>Select Quantity</Text>
            <Text style={styles.qSubtotal}>Subtotal: <Text style={{ color: '#138A43' }}>LKR {price * quantity}</Text></Text>
          </View>
          <View style={styles.qBottomRow}>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Ionicons name="remove" size={20} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{quantity}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setQuantity(quantity + 1)}>
                <Ionicons name="add" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.subBox}>
          <View style={styles.subHeaderRow}>
            <View style={styles.subIconBox}>
              <Ionicons name="swap-horizontal" size={16} color="#B45309" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.subTitle}>Substitution Preferences</Text>
              <Text style={styles.subDesc}>If item is out of stock when packing</Text>
            </View>
            <Switch value={subEnabled} onValueChange={setSubEnabled} trackColor={{ false: '#D1D5DB', true: '#138A43' }} />
          </View>
          {subEnabled && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.inputLabel}>Preferred replacement</Text>
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>Any similar item</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </View>
              <Text style={styles.inputLabel}>Special packing note for shopkeeper</Text>
              <View style={styles.textAreaBox}>
                <TextInput 
                  style={styles.textArea} 
                  placeholder="e.g. Please check expiry date is at least 3 days ahead"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={substituteDesc}
                  onChangeText={setSubstituteDesc}
                />
                <Ionicons name="document-text-outline" size={16} color="#9CA3AF" style={{ position: 'absolute', right: 12, top: 12 }} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.trustBox}>
          <View style={styles.trustIconBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#138A43" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Neighbourhood Trust Promise</Text>
            <Text style={styles.trustDesc}>Pre-ordered directly from your neighborhood grocery. Chilled and carefully packed 15 mins before your curbside pickup.</Text>
          </View>
        </View>
        
        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="cart-outline" size={18} color="#fff" />
            <Text style={styles.addToCartText}>Add {quantity} Items to Cart</Text>
          </View>
          <Text style={styles.addToCartPrice}>LKR {price * quantity}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F9FAFB' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  headerIcon: { marginRight: 16 },
  profile: { alignItems: 'center', backgroundColor: '#138A43', borderRadius: 18, height: 32, justifyContent: 'center', width: 32, marginLeft: 8 },
  profileImage: { borderRadius: 16, height: 32, width: 32 },
  
  content: { padding: 16 },
  
  topMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  shopPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  shopPillText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  actionIcons: { flexDirection: 'row', gap: 8 },
  circleBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  
  imageContainer: { width: '100%', height: 300, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  categoryText: { color: '#138A43', fontSize: 12, fontWeight: '700' },
  dotSeparator: { color: '#D1D5DB', fontSize: 12 },
  branchText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12, lineHeight: 30 },
  
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  pricePrefix: { fontSize: 14, fontWeight: '700', color: '#4B5563', marginRight: 4 },
  price: { fontSize: 28, fontWeight: '900', color: '#111827' },
  stockPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  stockDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  stockText: { fontSize: 11, fontWeight: '700', color: '#047857' },
  
  quantityBox: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  qTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  qLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  qSubtotal: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  qBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden' },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  stepValue: { width: 40, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111827' },
  
  subBox: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  subHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  subIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  subTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  subDesc: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 6, marginTop: 12 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  dropdownText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  textAreaBox: { backgroundColor: '#F3F4F6', borderRadius: 10, position: 'relative' },
  textArea: { padding: 12, paddingTop: 12, fontSize: 13, color: '#111827', minHeight: 60, textAlignVertical: 'top' },
  
  trustBox: { flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 16, borderRadius: 16, marginBottom: 20 },
  trustIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  trustTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  trustDesc: { fontSize: 11, color: '#4B5563', lineHeight: 16 },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  addToCartBtn: { backgroundColor: '#138A43', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  addToCartText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  addToCartPrice: { color: '#fff', fontSize: 14, fontWeight: '800' }
});
