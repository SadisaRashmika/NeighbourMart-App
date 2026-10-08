import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, updateProfile } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';
import type { AuthUser } from '@/features/auth/authTypes';

function SectionTitle({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return <View style={styles.sectionTitle}><Ionicons color="#138A43" name={icon} size={15} /><Text style={styles.sectionTitleText}>{title}</Text></View>;
}

function MetricCard({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: string }) {
  return <View style={styles.metricCard}><View style={[styles.metricIcon, { backgroundColor: tone }]}><Ionicons color="#138A43" name={icon} size={16} /></View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

function SettingRow({ icon, label, value, action, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; action?: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress} style={styles.settingRow}>
      <View style={styles.rowIcon}><Ionicons color="#138A43" name={icon} size={16} /></View>
      <View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text>{value ? <Text style={styles.rowValue}>{value}</Text> : null}</View>
      {action ?? <Ionicons color="#98A2B3" name="chevron-forward" size={16} />}
    </TouchableOpacity>
  );
}

export default function CustomerSettings() {
  const { token, user: cachedUser, setToken, setUser } = useAuth();
  const [user, setCurrentUser] = useState<AuthUser | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [substitutions, setSubstitutions] = useState(true);
  const [deals, setDeals] = useState(false);
  const [isPreferenceModalVisible, setIsPreferenceModalVisible] = useState(false);
  const [preferenceMode, setPreferenceMode] = useState<'time' | 'instructions'>('time');
  const [timeDraft, setTimeDraft] = useState(new Date());
  const [instructionsDraft, setInstructionsDraft] = useState('');
  const [isNativeTimePickerVisible, setIsNativeTimePickerVisible] = useState(false);
  const [isSavingPreference, setIsSavingPreference] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      return;
    }

    getCurrentUser(token)
      .then(({ user: fetchedUser }) => {
        if (isMounted) {
          setCurrentUser(fetchedUser);
          setUser(fetchedUser);
        }
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError instanceof Error ? requestError.message : 'Could not load your profile.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, setUser]);

  function logout() {
    setToken(null);
    setUser(null);
    router.replace('/(auth)/login');
  }

  function parsePickupTime(value?: string) {
    const match = value?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return new Date();
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    const nextDate = new Date();
    nextDate.setHours(hour, minute, 0, 0);
    return nextDate;
  }

  function formatPickupTime(value: Date) {
    return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function openTimeEditor() {
    setTimeDraft(parsePickupTime(user?.pickupTime));
    if (Platform.OS === 'android') {
      setIsNativeTimePickerVisible(true);
    } else {
      setPreferenceMode('time');
      setIsPreferenceModalVisible(true);
    }
  }

  function openInstructionsEditor() {
    setInstructionsDraft(user?.pickupInstructions ?? '');
    setPreferenceMode('instructions');
    setIsPreferenceModalVisible(true);
  }

  function handleTimeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') setIsNativeTimePickerVisible(false);
    if (!selectedDate || event.type === 'dismissed') return;
    setTimeDraft(selectedDate);
    if (Platform.OS === 'android') void savePreferences({ pickupTime: formatPickupTime(selectedDate) });
  }

  async function savePreferences(patch: { pickupTime?: string; pickupInstructions?: string; allowCalls?: boolean }) {
    if (!token || !user) return;
    setIsSavingPreference(true);
    try {
      const result = await updateProfile(token, {
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl,
        phoneNumber: user.phoneNumber,
        pickupTime: patch.pickupTime ?? user.pickupTime,
        pickupInstructions: patch.pickupInstructions ?? user.pickupInstructions,
        allowCalls: patch.allowCalls ?? user.allowCalls,
      });
      setCurrentUser(result.user);
      setUser(result.user);
      setIsPreferenceModalVisible(false);
    } catch (requestError) {
      Alert.alert('Could not save preference', requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setIsSavingPreference(false);
    }
  }

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color="#138A43" size="large" /><Text style={styles.loadingText}>Loading your settings...</Text></View>;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Ionicons color="#172B24" name="arrow-back" size={21} /></TouchableOpacity><Text style={styles.headerTitle}>Settings</Text><TouchableOpacity><Ionicons color="#667085" name="help-circle-outline" size={21} /></TouchableOpacity></View>

      {error ? <TouchableOpacity onPress={() => Alert.alert('Profile unavailable', error)} style={styles.errorBanner}><Ionicons color="#B42318" name="warning-outline" size={17} /><Text style={styles.errorText}>Could not refresh profile data</Text></TouchableOpacity> : null}

      <View style={styles.profileCard}>
        <View style={styles.avatar}>{user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>}</View>
        <View style={styles.profileCopy}><Text style={styles.name}>{user?.name ?? 'Neighbour'}</Text><Text style={styles.email}>{user?.email ?? 'Email not available'}</Text><View style={styles.memberBadge}><Ionicons color="#9A6700" name="ribbon-outline" size={12} /><Text style={styles.memberText}>{user?.role === 'shop' ? 'Shop Owner' : 'Gold Saver Member'}</Text></View></View>
      </View>
      <View style={styles.card}><SettingRow icon="person-circle-outline" label="My Profile" value="View account details and manage your profile" onPress={() => router.push('/customer/profile')} /></View>

      <View style={styles.quickStats}><MetricCard icon="checkmark-done-outline" label="Pickups done" value="28" tone="#EAF7F0" /><MetricCard icon="wallet-outline" label="Saved this month" value="Rs. 1,400" tone="#EEF4FF" /><MetricCard icon="star-outline" label="Community rating" value="4.9 ★" tone="#FFF6D9" /></View>

      <SectionTitle icon="storefront-outline" title="Shop Pickup Preferences" />
      <View style={styles.card}><SettingRow icon="location-outline" label="Pickup location" value={user?.location ?? 'Add a shop pickup location'} action={<Text style={styles.change}>Change</Text>} onPress={() => router.push('/customer/edit-profile')} /><SettingRow icon="time-outline" label="Preferred pickup time" value={user?.pickupTime ?? 'Choose a time to collect your order'} action={<Text style={styles.change}>Choose</Text>} onPress={openTimeEditor} /><SettingRow icon="car-outline" label="Vehicle / pickup instructions" value={user?.pickupInstructions ?? 'Help the shop identify you at collection'} action={<Text style={styles.change}>Edit</Text>} onPress={openInstructionsEditor} /><SettingRow icon="call-outline" label="Allow shop to call me" value={user?.allowCalls ? 'Phone number visible to the shop' : 'Phone number hidden from the shop'} action={<Switch disabled={isSavingPreference} onValueChange={(allowCalls) => savePreferences({ allowCalls })} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={user?.allowCalls ?? false} />} /></View>

      <SectionTitle icon="repeat-outline" title="Order & Substitution Rules" />
      <View style={styles.card}><SettingRow icon="refresh-outline" label="Auto-replace with Organic/Best Match" action={<Switch onValueChange={() => undefined} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={false} />} /><SettingRow icon="close-circle-outline" label="Cancel missing items directly" action={<Switch onValueChange={() => undefined} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={false} />} /><SettingRow icon="leaf-outline" label="Bring My Own Tote Bags" action={<Switch onValueChange={() => undefined} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={true} />} /></View>

      <SectionTitle icon="language-outline" title="Language & Region" />
      <View style={styles.card}><SettingRow icon="language-outline" label="App Language" value="English" action={<Text style={styles.languagePill}>English</Text>} /><SettingRow icon="cash-outline" label="Currency Base" value="Sri Lankan Rupee" action={<Text style={styles.currencyPill}>LKR (Rs.)</Text>} /></View>

      <SectionTitle icon="card-outline" title="Payment & Billing" />
      <View style={styles.card}><SettingRow icon="card-outline" label="LankaQR Quick Pay" value="Ready at your pickup side" action={<Text style={styles.change}>Manage</Text>} /><SettingRow icon="shield-checkmark-outline" label="View Past Tax Invoices" /></View>

      <SectionTitle icon="lock-closed-outline" title="Account Security" />
      <View style={styles.card}><SettingRow icon="key-outline" label="Change Password" value="Verify with a code sent to your Gmail" onPress={() => router.push('/customer/change-password')} /></View>

      <SectionTitle icon="notifications-outline" title="Notifications & Alerts" />
      <View style={styles.card}><SettingRow icon="cube-outline" label="Order Ready for Pickup" value="Instant push alert & backup SMS confirmation" action={<Switch onValueChange={setNotifications} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={notifications} />} /><SettingRow icon="swap-horizontal-outline" label="Substitution Action Required" value="Choose soon for 5-minute approval window" action={<Switch onValueChange={setSubstitutions} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={substitutions} />} /><SettingRow icon="pricetag-outline" label="Deals from Silva&apos;s Hub" value="Fresh-day offers and discounts" action={<Switch onValueChange={setDeals} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={deals} />} /></View>

      <SectionTitle icon="headset-outline" title="Support" />
      <View style={styles.supportRow}><TouchableOpacity style={styles.supportButton}><Ionicons color="#138A43" name="call-outline" size={15} /><Text>011-478-4000</Text></TouchableOpacity><TouchableOpacity style={styles.supportButton}><Ionicons color="#138A43" name="chatbubble-ellipses-outline" size={15} /><Text>Live Chat</Text></TouchableOpacity></View>
      <TouchableOpacity onPress={logout} style={styles.logout}><Ionicons color="#B42318" name="log-out-outline" size={17} /><Text style={styles.logoutText}>Log Out of Account</Text></TouchableOpacity>
      <Text style={styles.version}>NeighbourMart v3.4.1 · Customer Build 4942{`\n`}Empowering Local Grocers Across Sri Lanka</Text>
      </ScrollView>
      {isNativeTimePickerVisible ? <DateTimePicker display="clock" mode="time" onChange={handleTimeChange} value={timeDraft} /> : null}
      <Modal animationType="fade" transparent visible={isPreferenceModalVisible} onRequestClose={() => setIsPreferenceModalVisible(false)}>
        <View style={styles.modalBackdrop}><View style={styles.modalCard}><Text style={styles.modalTitle}>{preferenceMode === 'time' ? 'Preferred pickup time' : 'Vehicle / pickup instructions'}</Text><Text style={styles.modalHint}>{preferenceMode === 'time' ? 'Choose when you plan to collect your order from the shop.' : 'Describe your vehicle so the shop can identify you when you collect your order.'}</Text>{preferenceMode === 'time' ? <DateTimePicker display="spinner" mode="time" onChange={handleTimeChange} textColor="#138A43" themeVariant="light" value={timeDraft} /> : <TextInput autoFocus multiline onChangeText={setInstructionsDraft} placeholder="For example, white Toyota Aqua, plate ABC-1234" placeholderTextColor="#98A2B3" style={styles.instructionsInput} value={instructionsDraft} />}{preferenceMode === 'time' ? <View style={styles.modalActions}><TouchableOpacity onPress={() => setIsPreferenceModalVisible(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={isSavingPreference} onPress={() => savePreferences({ pickupTime: formatPickupTime(timeDraft) })} style={styles.modalSave}><Text style={styles.modalSaveText}>{isSavingPreference ? 'Saving...' : 'Save time'}</Text></TouchableOpacity></View> : <View style={styles.modalActions}><TouchableOpacity onPress={() => setIsPreferenceModalVisible(false)} style={styles.modalCancel}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={isSavingPreference} onPress={() => savePreferences({ pickupInstructions: instructionsDraft.trim() })} style={styles.modalSave}><Text style={styles.modalSaveText}>{isSavingPreference ? 'Saving...' : 'Save instructions'}</Text></TouchableOpacity></View>}</View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 },
  content: { backgroundColor: '#F7F9F8', gap: 10, padding: 16, paddingBottom: 30 },
  loading: { alignItems: 'center', backgroundColor: '#F7F9F8', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#667085', fontSize: 13, marginTop: 10 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  headerTitle: { color: '#172B24', fontSize: 18, fontWeight: '800' },
  errorBanner: { alignItems: 'center', backgroundColor: '#FEF3F2', borderRadius: 10, flexDirection: 'row', gap: 7, padding: 10 },
  errorText: { color: '#B42318', fontSize: 12 },
  profileCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', gap: 10, padding: 12 },
  avatar: { alignItems: 'center', backgroundColor: '#D4F1DE', borderRadius: 27, height: 54, justifyContent: 'center', width: 54 },
  avatarImage: { borderRadius: 27, height: 54, width: 54 },
  avatarText: { color: '#13753F', fontSize: 23, fontWeight: '800' },
  profileCopy: { flex: 1 },
  name: { color: '#172B24', fontSize: 14, fontWeight: '800' },
  email: { color: '#667085', fontSize: 11, marginTop: 2 },
  memberBadge: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#FFF6D9', borderRadius: 10, flexDirection: 'row', gap: 4, marginTop: 5, paddingHorizontal: 7, paddingVertical: 3 },
  memberText: { color: '#9A6700', fontSize: 9, fontWeight: '700' },
  quickStats: { backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', gap: 8, padding: 9 },
  metricCard: { alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, flex: 1, minHeight: 84, paddingHorizontal: 4, paddingVertical: 9 },
  metricIcon: { alignItems: 'center', borderRadius: 15, height: 30, justifyContent: 'center', marginBottom: 5, width: 30 },
  metricLabel: { color: '#667085', fontSize: 9, fontWeight: '600', textAlign: 'center' },
  metricValue: { color: '#13753F', fontSize: 14, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  sectionTitle: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 7 },
  sectionTitleText: { color: '#344054', fontSize: 13, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12 },
  settingRow: { alignItems: 'center', borderBottomColor: '#F0F2F5', borderBottomWidth: 1, flexDirection: 'row', gap: 9, minHeight: 52, paddingVertical: 7 },
  rowIcon: { alignItems: 'center', backgroundColor: '#EAF7F0', borderRadius: 15, height: 29, justifyContent: 'center', width: 29 },
  rowCopy: { flex: 1 },
  rowLabel: { color: '#344054', fontSize: 12, fontWeight: '700' },
  rowValue: { color: '#98A2B3', fontSize: 10, marginTop: 2 },
  change: { color: '#138A43', fontSize: 10, fontWeight: '800' },
  languagePill: { backgroundColor: '#EAF7F0', borderRadius: 6, color: '#13753F', fontSize: 10, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 4 },
  currencyPill: { backgroundColor: '#D4F1DE', borderRadius: 6, color: '#13753F', fontSize: 10, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 4 },
  supportRow: { flexDirection: 'row', gap: 9 },
  supportButton: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'center', padding: 11 },
  logout: { alignItems: 'center', backgroundColor: '#FEE4E2', borderRadius: 10, flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: 4, padding: 12 },
  logoutText: { color: '#B42318', fontSize: 13, fontWeight: '800' },
  version: { color: '#98A2B3', fontSize: 9, lineHeight: 14, textAlign: 'center' },
  modalBackdrop: { alignItems: 'center', backgroundColor: 'rgba(16, 24, 40, 0.45)', flex: 1, justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%' },
  modalTitle: { color: '#172B24', fontSize: 17, fontWeight: '800' },
  modalHint: { color: '#667085', fontSize: 12, lineHeight: 18, marginTop: 6 },
  instructionsInput: { borderColor: '#D8DEE8', borderRadius: 10, borderWidth: 1, color: '#172B24', marginTop: 16, minHeight: 92, padding: 13, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 9, justifyContent: 'flex-end', marginTop: 18 },
  modalCancel: { borderColor: '#D8DEE8', borderRadius: 9, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  modalCancelText: { color: '#667085', fontSize: 12, fontWeight: '700' },
  modalSave: { backgroundColor: '#138A43', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 10 },
  modalSaveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
