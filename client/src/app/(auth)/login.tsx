import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { CommunityBanner } from '@/components/auth/CommunityBanner';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { login } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';

export default function Login() {
  const { setToken, setUser } = useAuth();
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
      setToken(result.token);
      setUser(result.user);
      router.replace(result.user.role === 'shop' ? '/shop/dashboard' : '/customer/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to log in right now.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <AuthHeader />
      <View style={styles.badge}><Ionicons color="#138A43" name="pricetag-outline" size={14} /><Text style={styles.badgeText}>Fresh & Local</Text></View>
      <Text style={styles.title}>Welcome Neighbor!</Text>
      <Text style={styles.subtitle}>Fresh local harvest & doorstep pickup from verified neighborhood grocers.</Text>

      <View style={styles.switcher}>
        <View style={styles.activeSwitch}><Text style={styles.activeSwitchText}>Sign In</Text></View>
        <TouchableOpacity onPress={() => router.push('/(auth)/customer-signup')} style={styles.switchButton}><Text style={styles.switchText}>Create Account</Text></TouchableOpacity>
      </View>

      <Input autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="EMAIL ADDRESS" onChangeText={setEmail} placeholder="you@example.com" value={email} />
      <Input autoCapitalize="none" autoComplete="password" label="PASSWORD" onChangeText={setPassword} placeholder="Enter your password" secureTextEntry value={password} />
      <View style={styles.options}>
        <TouchableOpacity onPress={() => setRemember((value) => !value)} style={styles.remember}>
          <View style={[styles.checkbox, remember && styles.checkboxActive]}>{remember ? <Ionicons color="#fff" name="checkmark" size={12} /> : null}</View>
          <Text style={styles.optionText}>Remember me</Text>
        </TouchableOpacity>
        <TouchableOpacity><Text style={styles.link}>Forgot Password?</Text></TouchableOpacity>
      </View>
      {error ? <ErrorMessage message={error} /> : null}
      <Button disabled={isLoading} label={isLoading ? 'Logging in...' : 'Log In  →'} onPress={handleLogin} />
      <Text style={styles.terms}>By continuing, you agree to our <Text style={styles.underlined}>Terms of Freshness</Text> & <Text style={styles.underlined}>Privacy Standards</Text>.</Text>
      <AuthDivider />
      <SocialButtons />
      <CommunityBanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flexGrow: 1, gap: 16, padding: 24, paddingBottom: 40 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#F2FFF7', borderColor: '#D8F5E3', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 11, paddingVertical: 7 },
  badgeText: { color: '#13753F', fontSize: 12, fontWeight: '700' },
  title: { color: '#101828', fontSize: 27, fontWeight: '800', marginTop: 2 },
  subtitle: { color: '#667085', fontSize: 14, lineHeight: 21, marginTop: -8 },
  switcher: { backgroundColor: '#F2F5FB', borderRadius: 13, flexDirection: 'row', padding: 4 },
  activeSwitch: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, flex: 1, justifyContent: 'center', minHeight: 42 },
  activeSwitchText: { color: '#138A43', fontSize: 14, fontWeight: '800' },
  switchButton: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 42 },
  switchText: { color: '#53627A', fontSize: 14, fontWeight: '600' },
  options: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
  remember: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  checkbox: { alignItems: 'center', borderColor: '#D0D5DD', borderRadius: 4, borderWidth: 1, height: 18, justifyContent: 'center', width: 18 },
  checkboxActive: { backgroundColor: '#138A43', borderColor: '#138A43' },
  optionText: { color: '#475467', fontSize: 13 },
  link: { color: '#13753F', fontSize: 13, fontWeight: '700' },
  terms: { color: '#98A2B3', fontSize: 11, lineHeight: 17, textAlign: 'center' },
  underlined: { color: '#667085', textDecorationLine: 'underline' },
});
