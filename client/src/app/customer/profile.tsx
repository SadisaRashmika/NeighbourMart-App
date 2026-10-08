import { router } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteProfile } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value || 'Not added'}</Text></View>;
}

export default function CustomerProfile() {
  const { token, user, setToken, setUser } = useAuth();

  async function removeAccount() {
    if (!token) return;
    try {
      await deleteProfile(token);
      setToken(null);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (requestError) {
      Alert.alert('Could not delete account', requestError instanceof Error ? requestError.message : 'Please try again.');
    }
  }

  function confirmDelete() {
    Alert.alert('Delete account?', 'This permanently removes your account and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete account', style: 'destructive', onPress: removeAccount },
    ]);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()}><Text style={styles.back}>Back</Text></TouchableOpacity><Text style={styles.title}>My Profile</Text><View style={styles.headerSpace} /></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}><View style={styles.avatar}>{user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>}</View><Text style={styles.name}>{user?.name ?? 'Neighbour'}</Text><Text style={styles.email}>{user?.email ?? 'Email not available'}</Text></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Account details</Text><DetailRow label="Full name" value={user?.name ?? ''} /><DetailRow label="Email address" value={user?.email ?? ''} /><DetailRow label="Phone number" value={user?.phoneNumber ?? ''} /><DetailRow label="Pickup location" value={user?.location ?? ''} /></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Shop pickup preferences</Text><DetailRow label="Preferred pickup time" value={user?.pickupTime ?? ''} /><DetailRow label="Vehicle / pickup instructions" value={user?.pickupInstructions ?? ''} /><DetailRow label="Shop calls" value={user?.allowCalls ? 'Allowed' : 'Not allowed'} /></View>
        <TouchableOpacity onPress={() => router.push('/customer/edit-profile')} style={styles.editButton}><Text style={styles.editButtonText}>Edit Profile</Text></TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton}><Text style={styles.deleteButtonText}>Delete Profile</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 },
  header: { alignItems: 'center', backgroundColor: '#fff', borderBottomColor: '#E4E8EF', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  title: { color: '#172B24', fontSize: 17, fontWeight: '800' },
  back: { color: '#667085', fontSize: 14 },
  headerSpace: { width: 42 },
  content: { gap: 14, padding: 20, paddingBottom: 34 },
  identity: { alignItems: 'center', paddingVertical: 8 },
  avatar: { alignItems: 'center', backgroundColor: '#D4F1DE', borderRadius: 44, height: 88, justifyContent: 'center', overflow: 'hidden', width: 88 },
  avatarImage: { height: 88, width: 88 },
  avatarText: { color: '#13753F', fontSize: 36, fontWeight: '800' },
  name: { color: '#172B24', fontSize: 19, fontWeight: '800', marginTop: 10 },
  email: { color: '#667085', fontSize: 12, marginTop: 3 },
  card: { backgroundColor: '#fff', borderRadius: 13, paddingHorizontal: 15, paddingVertical: 5 },
  cardTitle: { color: '#344054', fontSize: 13, fontWeight: '800', paddingBottom: 4, paddingTop: 11 },
  detailRow: { borderTopColor: '#F0F2F5', borderTopWidth: 1, gap: 3, paddingVertical: 10 },
  detailLabel: { color: '#98A2B3', fontSize: 11, fontWeight: '700' },
  detailValue: { color: '#344054', fontSize: 13 },
  editButton: { alignItems: 'center', backgroundColor: '#138A43', borderRadius: 10, padding: 13 },
  editButtonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  deleteButton: { alignItems: 'center', borderColor: '#F2B8B5', borderRadius: 10, borderWidth: 1, padding: 12 },
  deleteButtonText: { color: '#B42318', fontSize: 13, fontWeight: '800' },
});
