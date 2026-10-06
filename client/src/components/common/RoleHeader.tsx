import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/features/auth/useAuth';

type RoleHeaderProps = {
  role: 'customer' | 'shop';
  location?: string;
};

export function RoleHeader({ role, location = 'Your neighborhood' }: RoleHeaderProps) {
  const isCustomer = role === 'customer';
  const { user } = useAuth();
  const displayLocation = isCustomer ? user?.location ?? location : location;

  return (
    <>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}><Ionicons color="#fff" name="leaf" size={14} /></View>
          <Text style={styles.brand}>Neighbour<Text style={styles.brandAccent}>Mart</Text></Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity accessibilityLabel="Search"><Ionicons color="#172B24" name="search-outline" size={20} /></TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Notifications"><Ionicons color="#172B24" name="notifications-outline" size={20} /></TouchableOpacity>
          <View style={styles.profile}>{isCustomer && user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.profileImage} /> : <Ionicons color="#fff" name={isCustomer ? 'person' : 'storefront'} size={16} />}</View>
        </View>
      </View>
      <View style={styles.locationRow}>
        <Ionicons color="#138A43" name="location" size={13} />
        <Text style={styles.location} numberOfLines={1}>{displayLocation}</Text>
        <Text style={styles.homeLabel}>· {isCustomer ? 'Home' : 'Shop portal'}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  logoMark: { alignItems: 'center', backgroundColor: '#138A43', borderRadius: 6, height: 25, justifyContent: 'center', width: 25 },
  brand: { color: '#172B24', fontSize: 16, fontWeight: '800' },
  brandAccent: { color: '#138A43' },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  profile: { alignItems: 'center', backgroundColor: '#138A43', borderRadius: 18, height: 32, justifyContent: 'center', width: 32 },
  profileImage: { borderRadius: 16, height: 32, width: 32 },
  locationRow: { alignItems: 'center', flexDirection: 'row', gap: 4, marginBottom: 16 },
  location: { color: '#344054', fontSize: 12, fontWeight: '700' },
  homeLabel: { color: '#98A2B3', fontSize: 12 },
});
