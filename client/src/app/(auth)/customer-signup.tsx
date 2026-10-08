import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { CommunityBanner } from '@/components/auth/CommunityBanner';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { registerCustomer } from '@/features/auth/authApi';

export default function CustomerSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function startRegistration() {
    setError('');
    if (!name.trim() || !email.trim() || !location.trim()) {
      setError('Name, email, and delivery area are required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerCustomer({ name: name.trim(), email: email.trim().toLowerCase(), location: location.trim() });
      router.push({
        pathname: '/(auth)/verify-email',
        params: { accountType: 'customer', email: result.email, developmentCode: result.developmentCode ?? '' },
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      header={(
        <View style={styles.navigationBar}>
          <Text style={styles.brand}>Neighbour<Text style={styles.brandAccent}>Mart</Text></Text>
          <Text style={styles.portalTag}>LOCAL MARKET</Text>
        </View>
      )}
    >
      <View style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.badge}><Ionicons color="#138A43" name="leaf-outline" size={14} /><Text style={styles.badgeText}>Join Our Community</Text></View>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join your neighborhood fresh market. Enjoy direct farm produce and 15-minute pickup.</Text>
      </View>
      <View style={styles.switcher}><TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.switchButton}><Text style={styles.switchText}>Sign In</Text></TouchableOpacity><View style={styles.activeSwitch}><Text style={styles.activeSwitchText}>Create Account</Text></View></View>
      <View style={styles.signupForm}>
        <Input autoCapitalize="words" label="FULL NAME" onChangeText={setName} placeholder="Your full name" style={styles.signupInput} value={name} />
        <Input autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="EMAIL ADDRESS" onChangeText={setEmail} placeholder="you@example.com" style={styles.signupInput} value={email} />
        <Input autoCapitalize="words" label="NEIGHBORHOOD / DELIVERY AREA" onChangeText={setLocation} placeholder="e.g. Colombo 03 / Kollupitiya" style={styles.signupInput} value={location} />
        <Text style={styles.helper}><Ionicons color="#138A43" name="mail-outline" size={15} /> We’ll send a verification code to your email.</Text>
        {error ? <ErrorMessage message={error} /> : null}
        <Button disabled={isLoading} label={isLoading ? 'Sending code...' : 'Create Account  →'} onPress={startRegistration} style={styles.signupButton} />
      </View>
      <Text style={styles.terms}>By continuing, you agree to our <Text style={styles.underlined}>Terms of Freshness</Text> & <Text style={styles.underlined}>Privacy Standards</Text>.</Text>
      <View style={styles.socialSection}><AuthDivider /><SocialButtons /></View>
      <CommunityBanner />
      <View style={styles.shopFooterCard}>
        <View style={styles.shopFooterInfo}>
          <View style={styles.shopIcon}><Ionicons color="#FFFFFF" name="storefront-outline" size={20} /></View>
          <View style={styles.shopFooterText}>
            <Text style={styles.shopFooterTitle}>Are you a shop owner?</Text>
            <Text numberOfLines={1} style={styles.shopFooterSubtitle}>Join our merchant network.</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/(auth)/shop-signup')} style={styles.shopFooterLink}>
          <Text style={styles.shopFooterLinkText}>Register</Text>
          <Ionicons color="#64748B" name="arrow-forward" size={12} />
        </TouchableOpacity>
      </View>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  navigationBar: { alignItems: 'center', backgroundColor: '#fff', borderBottomColor: '#F8FAFC', borderBottomWidth: 1, height: 71, justifyContent: 'center', paddingBottom: 12, paddingHorizontal: 20, paddingTop: 20 },
  brand: { color: '#101828', fontSize: 16, fontWeight: '800', letterSpacing: -0.4, lineHeight: 21 },
  brandAccent: { color: '#138A43' },
  portalTag: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 0.55, lineHeight: 15 },
  container: { alignSelf: 'center', backgroundColor: '#fff', gap: 11, maxWidth: 390, paddingBottom: 24, paddingHorizontal: 24, paddingTop: 20, width: '100%' },
  heroSection: { gap: 4, paddingBottom: 9 },
  badge: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F2FFF7', borderColor: '#D8F5E3', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 6, height: 26, paddingHorizontal: 10 },
  badgeText: { color: '#13753F', fontSize: 12, fontWeight: '700' },
  title: { color: '#101828', fontSize: 24, fontWeight: '800', letterSpacing: -0.6, lineHeight: 33, paddingTop: 6 },
  subtitle: { color: '#667085', fontSize: 14, lineHeight: 23 },
  switcher: { backgroundColor: '#F2F5FB', borderRadius: 16, flexDirection: 'row', height: 48, padding: 4 },
  activeSwitch: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, flex: 1, justifyContent: 'center' },
  activeSwitchText: { color: '#138A43', fontSize: 14, fontWeight: '800' },
  switchButton: { alignItems: 'center', borderRadius: 12, flex: 1, justifyContent: 'center' },
  switchText: { color: '#53627A', fontSize: 14, fontWeight: '600' },
  signupForm: { gap: 16, paddingTop: 13 },
  signupInput: { backgroundColor: '#F8FAFC', borderRadius: 16, minHeight: 46 },
  helper: { color: '#667085', fontSize: 12, marginTop: -8 },
  signupButton: { borderRadius: 16, height: 52 },
  terms: { color: '#98A2B3', fontSize: 11, lineHeight: 18, paddingHorizontal: 16, textAlign: 'center' },
  underlined: { color: '#667085', textDecorationLine: 'underline' },
  socialSection: { gap: 8, paddingVertical: 9 },
  shopFooterCard: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 66, padding: 14 },
  shopFooterInfo: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12 },
  shopIcon: { alignItems: 'center', backgroundColor: '#F59E0B', borderRadius: 12, height: 36, justifyContent: 'center', width: 36 },
  shopFooterText: { flex: 1, minWidth: 0 },
  shopFooterTitle: { color: '#0F172A', fontSize: 12, fontWeight: '700' },
  shopFooterSubtitle: { color: '#64748B', fontSize: 11, lineHeight: 16 },
  shopFooterLink: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 4, paddingHorizontal: 12, paddingVertical: 6 },
  shopFooterLinkText: { color: '#1E293B', fontSize: 12, fontWeight: '700' },
});
