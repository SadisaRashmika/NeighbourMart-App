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
import { login } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';

export default function Login() {
  const { establishSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email: email.trim().toLowerCase(), password });
      await establishSession(result, remember);
      router.replace(result.user.role === 'shop' ? '/shop/dashboard' : '/customer/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to log in right now.');
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
        <View style={styles.badge}><Ionicons color="#138A43" name="pricetag-outline" size={14} /><Text style={styles.badgeText}>Fresh & Local</Text></View>
        <Text style={styles.title}>Welcome Neighbor!</Text>
        <Text style={styles.subtitle}>Fresh local harvest & doorstep pickup from verified neighborhood grocers.</Text>
      </View>

      <View style={styles.switcher}>
        <View style={styles.activeSwitch}><Text style={styles.activeSwitchText}>Sign In</Text></View>
        <TouchableOpacity onPress={() => router.push('/(auth)/customer-signup')} style={styles.switchButton}><Text style={styles.switchText}>Create Account</Text></TouchableOpacity>
      </View>

      <View style={styles.loginForm}>
        <Input autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="EMAIL ADDRESS" onChangeText={setEmail} placeholder="you@example.com" style={styles.loginInput} value={email} />
        <Input autoCapitalize="none" autoComplete="password" label="PASSWORD" onChangeText={setPassword} placeholder="Enter your password" secureTextEntry style={styles.loginInput} value={password} />
        <View style={styles.options}>
          <TouchableOpacity onPress={() => setRemember((value) => !value)} style={styles.remember}>
            <View style={[styles.checkbox, remember && styles.checkboxActive]}>{remember ? <Ionicons color="#fff" name="checkmark" size={12} /> : null}</View>
            <Text style={styles.optionText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Forgot Password?</Text></TouchableOpacity>
        </View>
        {error ? <ErrorMessage message={error} /> : null}
        <Button disabled={isLoading} label={isLoading ? 'Logging in...' : 'Log In  →'} onPress={handleLogin} style={styles.loginButton} />
      </View>
      <Text style={styles.terms}>By continuing, you agree to our <Text style={styles.underlined}>Terms of Freshness</Text> & <Text style={styles.underlined}>Privacy Standards</Text>.</Text>
      <View style={styles.socialSection}>
        <AuthDivider />
        <SocialButtons />
      </View>
      <CommunityBanner />
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
  loginForm: { gap: 16, paddingTop: 13 },
  loginInput: { backgroundColor: '#F8FAFC', borderRadius: 16, minHeight: 46 },
  options: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 20 },
  remember: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  checkbox: { alignItems: 'center', borderColor: '#D0D5DD', borderRadius: 4, borderWidth: 1, height: 18, justifyContent: 'center', width: 18 },
  checkboxActive: { backgroundColor: '#138A43', borderColor: '#138A43' },
  optionText: { color: '#475467', fontSize: 12, fontWeight: '500' },
  link: { color: '#13753F', fontSize: 12, fontWeight: '700' },
  loginButton: { borderRadius: 16, height: 52 },
  terms: { color: '#98A2B3', fontSize: 11, lineHeight: 18, paddingHorizontal: 16, textAlign: 'center' },
  underlined: { color: '#667085', textDecorationLine: 'underline' },
  socialSection: { gap: 8, paddingVertical: 9 },
});
