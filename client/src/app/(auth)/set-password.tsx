import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { setPassword } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';

export default function SetPassword() {
  const params = useLocalSearchParams<{ email?: string; verificationToken?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const verificationToken = typeof params.verificationToken === 'string' ? params.verificationToken : '';
  const { setToken, setUser } = useAuth();
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function finishRegistration() {
    setError('');
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await setPassword({ email, password, verificationToken });
      setToken(result.token);
      setUser(result.user);
      router.replace('/customer/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to finish your account.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <AuthHeader />
      <View style={styles.badge}><Ionicons color="#138A43" name="lock-closed-outline" size={14} /><Text style={styles.badgeText}>Email Confirmed</Text></View>
      <Text style={styles.title}>Set Your Password</Text>
      <Text style={styles.subtitle}>Your email is verified. Create a password to securely access your NeighbourMart account.</Text>
      <Input autoCapitalize="none" label="PASSWORD" onChangeText={setPasswordValue} placeholder="At least 8 characters" secureTextEntry value={password} />
      <Input autoCapitalize="none" label="CONFIRM PASSWORD" onChangeText={setConfirmPassword} placeholder="Repeat your password" secureTextEntry value={confirmPassword} />
      {error ? <ErrorMessage message={error} /> : null}
      <Button disabled={isLoading} label={isLoading ? 'Creating account...' : 'Finish Account  →'} onPress={finishRegistration} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flexGrow: 1, gap: 16, padding: 24, paddingBottom: 40 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#F2FFF7', borderColor: '#D8F5E3', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 11, paddingVertical: 7 },
  badgeText: { color: '#13753F', fontSize: 12, fontWeight: '700' },
  title: { color: '#101828', fontSize: 27, fontWeight: '800', marginTop: 2 },
  subtitle: { color: '#667085', fontSize: 14, lineHeight: 21, marginTop: -8 },
});
