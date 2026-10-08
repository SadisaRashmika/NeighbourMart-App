import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/useAuth';
import { getMyShop, updateMyShop } from '@/features/shop/shopApi';
import type { ShopProfile } from '@/features/shop/shopTypes';

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.row}><View style={styles.rowIcon}><Ionicons color="#138A43" name={icon} size={17} /></View><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value || 'Not provided'}</Text></View></View>;
}

export default function ShopSettings() {
  const { user, logout } = useAuth();
  const [shop, setShop] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingToggle, setSavingToggle] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editField, setEditField] = useState<'hours' | 'buffer' | 'cap' | 'expiry' | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    let mounted = true;
    getMyShop().then((result) => { if (mounted) setShop(result); }).catch((requestError) => { if (mounted) setError(requestError instanceof Error ? requestError.message : 'Could not load shop settings.'); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  async function toggleOrders(value: boolean) {
    if (!shop) return;
    setSavingToggle('acceptingOrders');
    try { setShop(await updateMyShop({ acceptingOrders: value })); } catch (requestError) { Alert.alert('Could not update shop', requestError instanceof Error ? requestError.message : 'Please try again.'); } finally { setSavingToggle(null); }
  }

  function openEditor(field: 'hours' | 'buffer' | 'cap' | 'expiry') {
    if (!shop) return;
    setEditField(field);
    setEditValue(field === 'hours' ? `${shop.openingTime}-${shop.closingTime}` : field === 'buffer' ? String(shop.pickupBufferMinutes) : field === 'cap' ? String(shop.activeOrdersCap) : String(shop.pickupExpiryMinutes));
  }

  async function saveOperationSetting() {
    if (!shop || !editField) return;
    const patch = editField === 'hours' ? (() => { const [openingTime, closingTime] = editValue.split('-').map((value) => value.trim()); return { openingTime, closingTime }; })() : editField === 'buffer' ? { pickupBufferMinutes: Number(editValue) } : editField === 'cap' ? { activeOrdersCap: Number(editValue) } : { pickupExpiryMinutes: Number(editValue) };
    setSaving(true);
    try { setShop(await updateMyShop(patch)); setEditField(null); } catch (requestError) { Alert.alert('Invalid setting', requestError instanceof Error ? requestError.message : 'Please check the value and try again.'); } finally { setSaving(false); }
  }

  async function toggleRule(field: 'autoSuggestSubstitutions' | 'autoCancelExpiredPickups' | 'acceptsCounterCash', value: boolean) {
    if (!shop) return;
    setSavingToggle(field);
    try { setShop(await updateMyShop({ [field]: value })); } catch (requestError) { Alert.alert('Could not update rule', requestError instanceof Error ? requestError.message : 'Please try again.'); } finally { setSavingToggle(null); }
  }

  async function handleLogout() { await logout(); router.replace('/(auth)/login'); }

  if (loading) return <View style={styles.loading}><ActivityIndicator color="#138A43" size="large" /><Text style={styles.loadingText}>Loading shop settings...</Text></View>;

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Ionicons color="#172B24" name="arrow-back" size={21} /></TouchableOpacity><Text style={styles.headerTitle}>Shop Settings</Text><Ionicons color="#667085" name="storefront-outline" size={21} /></View>
    {error ? <View style={styles.error}><Ionicons color="#B42318" name="warning-outline" size={17} /><Text style={styles.errorText}>{error}</Text></View> : null}
    <View style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>{(shop?.name ?? user?.name ?? 'S').charAt(0).toUpperCase()}</Text></View><View style={styles.profileCopy}><Text style={styles.name}>{shop?.name ?? 'Your shop'}</Text><Text style={styles.email}>{user?.email ?? 'Email unavailable'}</Text><Text style={styles.badge}>SHOP OWNER</Text></View><TouchableOpacity accessibilityLabel="Edit shop profile" hitSlop={10} onPress={() => router.push('/shop/edit-profile')}><Ionicons color="#667085" name="pencil" size={17} /></TouchableOpacity></View>
    <Text style={styles.sectionTitle}>Business Profile</Text><View style={styles.card}><Row icon="storefront-outline" label="Store name" value={shop?.name ?? ''} /><Row icon="pricetag-outline" label="Category" value={shop?.category ?? ''} /><Row icon="location-outline" label="Store address" value={shop?.address ?? ''} /><Row icon="call-outline" label="Mobile number" value={shop?.phone ?? ''} /></View>
    <Text style={styles.sectionTitle}>Store Operations</Text><View style={styles.card}><View style={styles.row}><View style={styles.rowIcon}><Ionicons color="#138A43" name="bag-check-outline" size={17} /></View><View style={styles.rowCopy}><Text style={styles.rowLabel}>Accepting orders</Text><Text style={styles.rowValue}>{shop?.acceptingOrders ? 'Customers can place orders' : 'Orders are paused'}</Text></View><Switch disabled={savingToggle === 'acceptingOrders'} onValueChange={toggleOrders} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={Boolean(shop?.acceptingOrders)} /></View></View>
    <Text style={styles.sectionTitle}>Operating & Curbside Slots</Text><View style={styles.card}><View style={styles.operationRow}><Row icon="time-outline" label="Today's store hours" value={`${shop?.openingTime} – ${shop?.closingTime}`} /><TouchableOpacity onPress={() => openEditor('hours')} style={styles.editButton}><Text style={styles.editText}>Edit</Text></TouchableOpacity></View><View style={styles.operationRow}><Row icon="timer-outline" label="Curbside pickup buffer" value={`${shop?.pickupBufferMinutes} minutes minimum prep time`} /><TouchableOpacity onPress={() => openEditor('buffer')} style={styles.editButton}><Text style={styles.editText}>Edit</Text></TouchableOpacity></View><View style={styles.operationRow}><Row icon="bag-check-outline" label="Active orders cap" value={`${shop?.activeOrdersCap} orders`} /><TouchableOpacity onPress={() => openEditor('cap')} style={styles.editButton}><Text style={styles.editText}>Edit</Text></TouchableOpacity></View></View>
    <Text style={styles.sectionTitle}>Order & Substitution Rules</Text><View style={styles.card}><View style={styles.ruleRow}><View style={styles.rowCopy}><Text style={styles.rowLabel}>Auto-suggest substitutions</Text><Text style={styles.rowValue}>Offer alternatives when products are unavailable</Text></View><Switch disabled={savingToggle === 'autoSuggestSubstitutions'} onValueChange={(value) => toggleRule('autoSuggestSubstitutions', value)} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={Boolean(shop?.autoSuggestSubstitutions)} /></View><View style={styles.ruleRow}><View style={styles.rowCopy}><Text style={styles.rowLabel}>Auto-cancel expired pickups</Text><Text style={styles.rowValue}>Cancel uncollected eligible orders automatically</Text></View><Switch disabled={savingToggle === 'autoCancelExpiredPickups'} onValueChange={(value) => toggleRule('autoCancelExpiredPickups', value)} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={Boolean(shop?.autoCancelExpiredPickups)} /></View><View style={styles.ruleRow}><View style={styles.rowCopy}><Text style={styles.rowLabel}>Pickup expiry duration</Text><Text style={styles.rowValue}>{shop?.pickupExpiryMinutes} minutes</Text></View><TouchableOpacity onPress={() => openEditor('expiry')} style={styles.editButton}><Text style={styles.editText}>Change</Text></TouchableOpacity></View></View>
    <Text style={styles.sectionTitle}>Payments & Settlement</Text><View style={styles.card}><View style={styles.ruleRow}><View style={styles.rowCopy}><Text style={styles.rowLabel}>Counter Cash Settlement</Text><Text style={styles.rowValue}>Accept cash at vehicle handoff</Text></View><Switch disabled={savingToggle === 'acceptsCounterCash'} onValueChange={(value) => toggleRule('acceptsCounterCash', value)} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={Boolean(shop?.acceptsCounterCash)} /></View></View>
    <Text style={styles.sectionTitle}>Account</Text><View style={styles.card}><TouchableOpacity onPress={() => router.push('/customer/change-password')} style={styles.action}><Ionicons color="#138A43" name="key-outline" size={17} /><Text style={styles.actionText}>Change password</Text><Ionicons color="#98A2B3" name="chevron-forward" size={17} /></TouchableOpacity></View>
    <TouchableOpacity onPress={handleLogout} style={styles.logout}><Ionicons color="#B42318" name="log-out-outline" size={17} /><Text style={styles.logoutText}>Log Out of Account</Text></TouchableOpacity>
  </ScrollView><Modal animationType="fade" transparent visible={Boolean(editField)} onRequestClose={() => setEditField(null)}><View style={styles.modalBackdrop}><View style={styles.modalCard}><Text style={styles.modalTitle}>{editField === 'hours' ? 'Edit store hours' : editField === 'buffer' ? 'Edit pickup buffer' : editField === 'cap' ? 'Edit active orders cap' : 'Edit pickup expiry'}</Text><Text style={styles.modalHint}>{editField === 'hours' ? 'Use HH:mm-HH:mm, for example 07:30-21:00.' : editField === 'buffer' ? 'Enter minutes from 0 to 240.' : editField === 'cap' ? 'Enter a limit from 1 to 1000 orders.' : 'Enter minutes from 5 to 240.'}</Text><TextInput autoFocus keyboardType={editField === 'hours' ? 'default' : 'number-pad'} onChangeText={setEditValue} style={styles.modalInput} value={editValue} /><View style={styles.modalActions}><TouchableOpacity onPress={() => setEditField(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={saving} onPress={saveOperationSetting} style={styles.modalSave}><Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity></View></View></View></Modal></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 }, content: { gap: 12, padding: 16, paddingBottom: 32 }, loading: { alignItems: 'center', backgroundColor: '#F7F9F8', flex: 1, justifyContent: 'center' }, loadingText: { color: '#667085', fontSize: 13, marginTop: 10 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }, headerTitle: { color: '#172B24', fontSize: 18, fontWeight: '800' }, error: { alignItems: 'center', backgroundColor: '#FEF3F2', borderRadius: 10, flexDirection: 'row', gap: 7, padding: 10 }, errorText: { color: '#B42318', flex: 1, fontSize: 12 }, profileCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', gap: 11, padding: 14 }, avatar: { alignItems: 'center', backgroundColor: '#D4F1DE', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 }, avatarText: { color: '#13753F', fontSize: 23, fontWeight: '800' }, profileCopy: { flex: 1 }, name: { color: '#172B24', fontSize: 16, fontWeight: '800' }, email: { color: '#667085', fontSize: 11, marginTop: 3 }, badge: { alignSelf: 'flex-start', backgroundColor: '#EAF7F0', borderRadius: 8, color: '#13753F', fontSize: 9, fontWeight: '800', marginTop: 6, paddingHorizontal: 7, paddingVertical: 3 }, sectionTitle: { color: '#344054', fontSize: 13, fontWeight: '800', marginTop: 5 }, card: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12 }, row: { alignItems: 'center', borderBottomColor: '#F0F2F5', borderBottomWidth: 1, flexDirection: 'row', flex: 1, gap: 9, minHeight: 58, paddingVertical: 8 }, operationRow: { alignItems: 'center', flexDirection: 'row', width: '100%' }, ruleRow: { alignItems: 'center', borderBottomColor: '#F0F2F5', borderBottomWidth: 1, flexDirection: 'row', minHeight: 64, paddingVertical: 8 }, rowIcon: { alignItems: 'center', backgroundColor: '#EAF7F0', borderRadius: 15, height: 30, justifyContent: 'center', width: 30 }, rowCopy: { flex: 1 }, rowLabel: { color: '#344054', fontSize: 12, fontWeight: '700' }, rowValue: { color: '#667085', fontSize: 11, marginTop: 3 }, editButton: { alignItems: 'center', backgroundColor: '#EEF4FF', borderRadius: 6, marginLeft: 8, paddingVertical: 6, width: 45 }, editText: { color: '#13753F', fontSize: 11, fontWeight: '800' }, action: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 54 }, actionText: { color: '#344054', flex: 1, fontSize: 12, fontWeight: '700' }, logout: { alignItems: 'center', backgroundColor: '#FEE4E2', borderRadius: 10, flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: 4, padding: 12 }, logoutText: { color: '#B42318', fontSize: 13, fontWeight: '800' }, modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', flex: 1, justifyContent: 'center', padding: 24 }, modalCard: { backgroundColor: '#fff', borderRadius: 16, gap: 10, padding: 20, width: '100%' }, modalTitle: { color: '#172B24', fontSize: 18, fontWeight: '800' }, modalHint: { color: '#667085', fontSize: 12, lineHeight: 18 }, modalInput: { borderColor: '#D8DEE8', borderRadius: 10, borderWidth: 1, color: '#111827', padding: 12 }, modalActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', gap: 18, marginTop: 4 }, cancelText: { color: '#667085', fontWeight: '700' }, modalSave: { backgroundColor: '#138A43', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9 }, modalSaveText: { color: '#fff', fontWeight: '800' },
});
