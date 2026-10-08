import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoleHeader } from '@/components/common/RoleHeader';
import { PickupReminderCard } from '@/components/customer/PickupReminderCard';

export default function CustomerDashboard() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.fixedHeader}>
        <RoleHeader role="customer" location="Add your neighborhood" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <PickupReminderCard />
        <View style={styles.shopCard}>
        <View style={styles.shopHeader}>
          <View style={styles.readyDot} />
          <Text style={styles.readyText}>Pickup Ready</Text>
          <Text style={styles.distance}>0.8 km away</Text>
        </View>
        <Text style={styles.shopName}>Silva&apos;s Corner Grocery</Text>
        <Text style={styles.shopMeta}>Peradeniya Rd, Kandy · Open for pickup</Text>
        <Text style={styles.pickup}><Ionicons color="#138A43" name="time-outline" size={14} /> 5:00 PM Pickup</Text>
        </View>

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

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Curated for You</Text><Text style={styles.sectionMeta}>Based on your shop inventory</Text></View><Text style={styles.sort}><Ionicons color="#667085" name="swap-vertical-outline" size={13} /> Sort</Text></View>
        <View style={styles.emptyProducts}><Ionicons color="#8ACFA2" name="basket-outline" size={34} /><Text style={styles.emptyTitle}>Products will appear here</Text><Text style={styles.emptyText}>Your teammates can connect product data to this dashboard.</Text></View>

        <View style={styles.guarantee}><View style={styles.guaranteeIcon}><Ionicons color="#138A43" name="car-outline" size={20} /></View><View><Text style={styles.guaranteeTitle}>Curbside Pick-up Guarantee</Text><Text style={styles.guaranteeText}>Order packed neatly in biodegradable carry bags ready when you pull up to Silva&apos;s!</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 },
  fixedHeader: { backgroundColor: '#F7F9F8', paddingHorizontal: 16, paddingTop: 8 },
  content: { gap: 14, padding: 16, paddingBottom: 34 },
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
});
