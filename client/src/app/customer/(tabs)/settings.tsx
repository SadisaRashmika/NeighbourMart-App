import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser } from '@/features/auth/authApi';
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
  const { token, user: cachedUser, setUser, logout: clearSession } = useAuth();
  const [user, setCurrentUser] = useState<AuthUser | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [substitutions, setSubstitutions] = useState(true);
  const [deals, setDeals] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setIsLoading(false);
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

  async function logout() {
    await clearSession();
    router.replace('/(auth)/login');
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
        <TouchableOpacity accessibilityLabel="Edit profile" onPress={() => router.push('/customer/edit-profile')}><Ionicons color="#667085" name="pencil" size={17} /></TouchableOpacity>
      </View>

      <View style={styles.quickStats}><MetricCard icon="checkmark-done-outline" label="Pickups done" value="28" tone="#EAF7F0" /><MetricCard icon="wallet-outline" label="Saved this month" value="Rs. 1,400" tone="#EEF4FF" /><MetricCard icon="star-outline" label="Community rating" value="4.9 ★" tone="#FFF6D9" /></View>

      <SectionTitle icon="car-outline" title="Curbside & Pickup Defaults" />
      <View style={styles.card}><SettingRow icon="location-outline" label="Pickup location" value={user?.location ?? 'Add your delivery area'} action={<Text style={styles.change}>Change</Text>} /><SettingRow icon="time-outline" label="Preferred curbside window" value="5:00 PM - 6:00 PM" /><SettingRow icon="bag-check-outline" label="Pickup instructions" value="Leave order in the car boot" /></View>

      <SectionTitle icon="repeat-outline" title="Order & Substitution Rules" />
      <View style={styles.card}><SettingRow icon="checkmark-circle-outline" label="Always ask me via SMS / Call" action={<Switch onValueChange={() => undefined} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={true} />} /><SettingRow icon="refresh-outline" label="Auto-replace with Organic/Best Match" action={<Switch onValueChange={() => undefined} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={false} />} /><SettingRow icon="close-circle-outline" label="Cancel missing items directly" action={<Switch onValueChange={() => undefined} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={false} />} /><SettingRow icon="leaf-outline" label="Bring My Own Tote Bags" action={<Switch onValueChange={() => undefined} thumbColor="#fff" trackColor={{ false: '#D0D5DD', true: '#138A43' }} value={true} />} /></View>

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
});
