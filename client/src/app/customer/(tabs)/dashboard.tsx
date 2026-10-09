import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleHeader } from '@/components/common/RoleHeader';
import { PickupReminderCard } from '@/components/customer/PickupReminderCard';
import { getShops, getProducts } from '@/features/customer/customerApi';
import type { Shop, Product } from '@/features/customer/customerTypes';

export default function CustomerDashboard() {
  const [isShopDataVisible, setShopDataVisible] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchShop, setSearchShop] = useState('');
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (isShopDataVisible && shops.length === 0) {
      setLoadingShops(true);
      getShops().then(setShops).catch(console.error).finally(() => setLoadingShops(false));
    }
  }, [isShopDataVisible]);

  useEffect(() => {
    if (selectedShop) {
      setLoadingProducts(true);
      getProducts(selectedShop.id).then(setProducts).catch(console.error).finally(() => setLoadingProducts(false));
    }
  }, [selectedShop]);

  const filteredShops = shops.filter(s => 
    s.name.toLowerCase().includes(searchShop.toLowerCase()) || 
    s.address.toLowerCase().includes(searchShop.toLowerCase())
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <RoleHeader role="customer" location="Add your neighborhood" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.topCardsRow}>
          <TouchableOpacity style={styles.squareShopCard} onPress={() => setShopDataVisible(true)}>
            <ImageBackground source={require('../../../../assets/images/img4.jpg')} style={styles.bgImage} imageStyle={styles.bgImageStyle}>
              <View style={styles.overlay}>
                <View style={styles.textPill}>
                  <Text style={styles.squareTitle}>{selectedShop ? 'Selected Shop' : 'Shop Data'}</Text>
                  <Text style={styles.squareSubtitle} numberOfLines={1}>{selectedShop ? selectedShop.name : 'Tap to select'}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
          <PickupReminderCard />
        </View>

        <Modal visible={isShopDataVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShopDataVisible(false)}>
          <View style={styles.modalScreen}>
             <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShopDataVisible(false)}>
                  <Text style={styles.cancel}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select a Shop</Text>
                <View style={{ width: 40 }} />
             </View>
             
             <View style={{ padding: 16 }}>
               <View style={styles.searchBox}>
                 <Ionicons color="#98A2B3" name="search-outline" size={18} />
                 <TextInput
                   placeholder="Search shop name or location..."
                   style={styles.searchText}
                   value={searchShop}
                   onChangeText={setSearchShop}
                 />
               </View>
             </View>

             <ScrollView style={{ paddingHorizontal: 16, flex: 1 }}>
                {loadingShops ? (
                  <ActivityIndicator style={{ marginTop: 20 }} color="#138A43" />
                ) : filteredShops.map(shop => (
                  <TouchableOpacity 
                    key={shop.id} 
                    style={[styles.shopCard, selectedShop?.id === shop.id && { borderColor: '#138A43', backgroundColor: '#EAF7F0' }]}
                    onPress={() => {
                      setSelectedShop(shop);
                      setShopDataVisible(false);
                    }}
                  >
                    <View style={styles.shopHeader}>
                      <View style={[styles.readyDot, { backgroundColor: shop.acceptingOrders ? '#138A43' : '#E11D48' }]} />
                      <Text style={[styles.readyText, { color: shop.acceptingOrders ? '#13753F' : '#E11D48' }]}>{shop.acceptingOrders ? 'Accepting Orders' : 'Closed'}</Text>
                    </View>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.shopMeta}>{shop.address} {shop.category ? `· ${shop.category}` : ''}</Text>
                  </TouchableOpacity>
                ))}
                {!loadingShops && filteredShops.length === 0 && (
                  <Text style={{ textAlign: 'center', color: '#667085', marginTop: 20 }}>No shops found.</Text>
                )}
             </ScrollView>
          </View>
        </Modal>

        <View style={styles.searchBox}>
        <Ionicons color="#98A2B3" name="search-outline" size={18} />
        <Text style={styles.searchText}>Search fresh vegetables, dhal, milk...</Text>
        <Ionicons color="#98A2B3" name="mic-outline" size={17} />
        </View>

        <View style={styles.quickRow}>
        <View style={styles.quickChip}><View style={styles.greenDot} /><Text>In Stock only</Text></View>
        <View style={styles.quickChip}><Ionicons color="#AA7A00" name="pricetag-outline" size={13} /><Text>Special Offers</Text></View>
        <View style={styles.quickChip}><Ionicons color="#667085" name="flash-outline" size={13} /><Text>Fast Pack</Text></View>
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Categories</Text><Text style={styles.viewAll}>View all</Text></View>
        <View style={styles.categoryRow}>
        {['All', 'Vegetables', 'Dairy'].map((category, index) => <TouchableOpacity key={category} style={[styles.category, index === 0 && styles.categoryActive]}><Text style={[styles.categoryText, index === 0 && styles.categoryActiveText]}>{category}</Text></TouchableOpacity>)}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{selectedShop ? `${selectedShop.name} Products` : 'Curated for You'}</Text>
            <Text style={styles.sectionMeta}>{selectedShop ? 'Available in stock' : 'Based on your shop inventory'}</Text>
          </View>
          <Text style={styles.sort}><Ionicons color="#667085" name="swap-vertical-outline" size={13} /> Sort</Text>
        </View>

        {loadingProducts ? (
          <ActivityIndicator color="#138A43" style={{ marginTop: 20 }} />
        ) : products.length > 0 ? (
          <View style={{ gap: 12 }}>
            {products.map(p => (
              <View key={p.id} style={styles.productCard}>
                {p.imageUrl ? (
                   <Image source={{ uri: p.imageUrl }} style={styles.productImage} />
                ) : (
                   <View style={styles.productImagePlaceholder}><Ionicons name="image-outline" size={24} color="#98A2B3" /></View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productCategory}>{p.category}</Text>
                  <Text style={styles.productPrice}>LKR {p.price}</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyProducts}>
            <Ionicons color="#8ACFA2" name="basket-outline" size={34} />
            <Text style={styles.emptyTitle}>{selectedShop ? 'No products available' : 'Products will appear here'}</Text>
            <Text style={styles.emptyText}>{selectedShop ? 'This shop has not listed any items.' : 'Please select a shop to view products.'}</Text>
          </View>
        )}

        <View style={styles.guarantee}><View style={styles.guaranteeIcon}><Ionicons color="#138A43" name="car-outline" size={20} /></View><View><Text style={styles.guaranteeTitle}>Curbside Pick-up Guarantee</Text><Text style={styles.guaranteeText}>Order packed neatly in biodegradable carry bags ready when you pull up to Silva&apos;s!</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 },
  fixedHeader: { backgroundColor: '#F7F9F8', paddingHorizontal: 16, paddingTop: 8 },
  content: { gap: 14, padding: 16, paddingBottom: 34 },
  
  topCardsRow: { flexDirection: 'row', gap: 12 },
  squareShopCard: { flex: 1, aspectRatio: 1, minHeight: 110, borderRadius: 14, borderWidth: 2, borderColor: '#138A43', overflow: 'hidden' },
  bgImage: { flex: 1, width: '100%', height: '100%', justifyContent: 'center' },
  bgImageStyle: { borderRadius: 14 },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 10 },
  textPill: { paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', width: '100%' },
  squareTitle: { color: '#172B24', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  squareSubtitle: { color: '#138A43', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  
  modalScreen: { backgroundColor: '#F7F9F8', flex: 1 },
  modalHeader: { alignItems: 'center', backgroundColor: '#fff', borderBottomColor: '#E4E8EF', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  cancel: { color: '#667085', fontSize: 14 },
  modalTitle: { color: '#172B24', fontSize: 16, fontWeight: '800' },

  shopCard: { backgroundColor: '#F0F6FF', borderColor: '#D9E9FF', borderRadius: 14, borderWidth: 1, padding: 14 },
  shopHeader: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  readyDot: { backgroundColor: '#138A43', borderRadius: 4, height: 8, width: 8 },
  readyText: { color: '#13753F', fontSize: 11, fontWeight: '800' },
  distance: { color: '#98A2B3', fontSize: 11 },
  shopName: { color: '#172B24', fontSize: 17, fontWeight: '800', marginTop: 9 },
  shopMeta: { color: '#667085', fontSize: 12, marginTop: 3 },
  pickup: { color: '#13753F', fontSize: 12, fontWeight: '700', marginTop: 8 },
  searchBox: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#E2E8F0', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 9, paddingHorizontal: 12, paddingVertical: 12 },
  searchText: { color: '#98A2B3', flex: 1, fontSize: 12 },
  quickRow: { flexDirection: 'row', gap: 7 },
  quickChip: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#E4E8EF', borderRadius: 15, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 4, justifyContent: 'center', paddingHorizontal: 5, paddingVertical: 8 },
  quickChipText: { color: '#475467', fontSize: 10 },
  greenDot: { backgroundColor: '#138A43', borderRadius: 4, height: 7, width: 7 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  sectionTitle: { color: '#172B24', fontSize: 15, fontWeight: '800' },
  sectionMeta: { color: '#98A2B3', fontSize: 10, marginTop: 2 },
  viewAll: { color: '#138A43', fontSize: 11, fontWeight: '800' },
  categoryRow: { flexDirection: 'row', gap: 8 },
  category: { backgroundColor: '#fff', borderColor: '#E4E8EF', borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  categoryActive: { backgroundColor: '#138A43', borderColor: '#138A43' },
  categoryText: { color: '#475467', fontSize: 12 },
  categoryActiveText: { color: '#fff', fontWeight: '700' },
  sort: { color: '#667085', fontSize: 11 },
  emptyProducts: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#E4E8EF', borderRadius: 14, borderWidth: 1, padding: 30 },
  emptyTitle: { color: '#344054', fontSize: 14, fontWeight: '800', marginTop: 8 },
  emptyText: { color: '#98A2B3', fontSize: 12, marginTop: 4, textAlign: 'center' },
  guarantee: { alignItems: 'center', backgroundColor: '#EAF7F0', borderRadius: 12, flexDirection: 'row', gap: 10, padding: 12 },
  guaranteeIcon: { alignItems: 'center', backgroundColor: '#D4F1DE', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  guaranteeTitle: { color: '#17603A', fontSize: 12, fontWeight: '800' },
  guaranteeText: { color: '#667085', fontSize: 10, lineHeight: 15, marginTop: 2, maxWidth: 260 },
  productCard: { backgroundColor: '#fff', borderColor: '#E4E8EF', borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  productImage: { width: 50, height: 50, borderRadius: 10 },
  productImagePlaceholder: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#F2F4F7', alignItems: 'center', justifyContent: 'center' },
  productName: { color: '#172B24', fontSize: 14, fontWeight: '800' },
  productCategory: { color: '#667085', fontSize: 11, marginTop: 2 },
  productPrice: { color: '#138A43', fontSize: 13, fontWeight: '700', marginTop: 4 },
  addButton: { backgroundColor: '#138A43', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
