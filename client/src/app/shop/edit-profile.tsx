import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { useAuth } from '@/features/auth/useAuth';
import { getMyShop, updateMyShop } from '@/features/shop/shopApi';
import type { ShopProfile } from '@/features/shop/shopTypes';
import { ShopBottomNav } from '@/components/shop/ShopBottomNav';

export default function ShopEditProfile() {
  const { user, setUser } = useAuth();
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [ownerName, setOwnerName] = useState(user?.name ?? '');
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyShop().then((result) => { setShop(result); setStoreName(result.name); setCategory(result.category ?? ''); setAddress(result.address); setPhone(result.phone ?? ''); }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load shop profile.')).finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    if (!ownerName.trim() || !storeName.trim() || !category.trim() || !address.trim() || !phone.trim()) { setError('Complete all profile fields before saving.'); return; }
    setError(''); setSaving(true);
    try {
      const result = await updateMyShop({ ownerName: ownerName.trim(), name: storeName.trim(), category: category.trim(), address: address.trim(), phone: phone.trim() });
      setShop(result);
      if (user) setUser({ ...user, name: ownerName.trim() });
      router.back();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not update shop profile.'); } finally { setSaving(false); }
  }

  if (loading) return <View style={styles.loading}><ActivityIndicator color="#138A43" size="large" /><Text style={styles.loadingText}>Loading shop profile...</Text></View>;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity><Text style={styles.title}>Edit Shop Profile</Text><View style={styles.headerSpace} /></View><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.heading}>Update your business details</Text><Text style={styles.description}>Keep your owner and store information accurate for your customers.</Text><Input autoCapitalize="words" label="OWNER NAME" onChangeText={setOwnerName} value={ownerName} /><Input editable={false} label="EMAIL ADDRESS" style={styles.lockedInput} value={user?.email ?? ''} /><Text style={styles.lockedHint}>Your verified email cannot be changed here.</Text><Input autoCapitalize="words" label="STORE NAME" onChangeText={setStoreName} value={storeName} /><Input autoCapitalize="words" label="BUSINESS CATEGORY" onChangeText={setCategory} value={category} /><Input label="STORE ADDRESS" onChangeText={setAddress} value={address} /><Input keyboardType="phone-pad" label="MOBILE NUMBER" onChangeText={setPhone} value={phone} />{error ? <ErrorMessage message={error} /> : null}<Button disabled={saving} label={saving ? 'Saving...' : 'Save Shop Profile'} onPress={saveProfile} /></ScrollView><ShopBottomNav /></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { backgroundColor: '#F7F9F8', flex: 1 }, header: { alignItems: 'center', backgroundColor: '#fff', borderBottomColor: '#E4E8EF', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 }, title: { color: '#172B24', fontSize: 17, fontWeight: '800' }, cancel: { color: '#667085', fontSize: 14 }, headerSpace: { width: 48 }, content: { gap: 14, padding: 24, paddingBottom: 34 }, heading: { color: '#172B24', fontSize: 23, fontWeight: '800' }, description: { color: '#667085', fontSize: 14, lineHeight: 21, marginTop: -5 }, lockedInput: { backgroundColor: '#F2F4F7', color: '#667085' }, lockedHint: { color: '#98A2B3', fontSize: 11, marginTop: -8 }, loading: { alignItems: 'center', backgroundColor: '#F7F9F8', flex: 1, justifyContent: 'center' }, loadingText: { color: '#667085', fontSize: 13, marginTop: 10 } });
