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
        params: { email: result.email, developmentCode: result.developmentCode ?? '' },
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create your account.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen>
      <View style={styles.container}>
      <View style={styles.badge}><Ionicons color="#138A43" name="leaf-outline" size={14} /><Text style={styles.badgeText}>Join Our Community</Text></View>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Join your neighborhood fresh market. Enjoy direct farm produce and 15-minute pickup.</Text>
      <View style={styles.switcher}><TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.switchButton}><Text style={styles.switchText}>Sign In</Text></TouchableOpacity><View style={styles.activeSwitch}><Text style={styles.activeSwitchText}>Create Account</Text></View></View>
      <Input autoCapitalize="words" label="FULL NAME" onChangeText={setName} placeholder="Your full name" value={name} />
      <Input autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="EMAIL ADDRESS" onChangeText={setEmail} placeholder="you@example.com" value={email} />
      <Input autoCapitalize="words" label="NEIGHBORHOOD / DELIVERY AREA" onChangeText={setLocation} placeholder="e.g. Colombo 03 / Kollupitiya" value={location} />
      <Text style={styles.helper}><Ionicons color="#138A43" name="mail-outline" size={15} /> We’ll send a verification code to your email.</Text>
      {error ? <ErrorMessage message={error} /> : null}
      <Button disabled={isLoading} label={isLoading ? 'Sending code...' : 'Create Account  →'} onPress={startRegistration} />
      <Text style={styles.terms}>By continuing, you agree to our <Text style={styles.underlined}>Terms of Freshness</Text> & <Text style={styles.underlined}>Privacy Standards</Text>.</Text>
      <AuthDivider /><SocialButtons /><CommunityBanner />
      </View>
    </AuthScreen>
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
  helper: { alignItems: 'center', color: '#667085', flexDirection: 'row', fontSize: 12, gap: 5, marginTop: -8 },
  terms: { color: '#98A2B3', fontSize: 11, lineHeight: 17, textAlign: 'center' },
  underlined: { color: '#667085', textDecorationLine: 'underline' },
});
