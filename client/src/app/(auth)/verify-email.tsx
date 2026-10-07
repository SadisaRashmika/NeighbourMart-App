import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { verifyEmail } from '@/features/auth/authApi';

export default function VerifyEmail() {
  const params = useLocalSearchParams<{ email?: string; developmentCode?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const developmentCode = typeof params.developmentCode === 'string' ? params.developmentCode : '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function confirmCode() {
    setError('');
    if (code.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmail({ email, code });
      router.replace({ pathname: '/(auth)/set-password', params: { email, verificationToken: result.verificationToken } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'That verification code is not valid.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen>
      <View style={styles.container}>
      <View style={styles.badge}><Ionicons color="#138A43" name="mail-outline" size={14} /><Text style={styles.badgeText}>Check Your Inbox</Text></View>
      <Text style={styles.title}>Confirm Your Email</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {email}. Enter it here to verify your Gmail address.</Text>
      <Input autoCapitalize="none" keyboardType="number-pad" label="VERIFICATION CODE" maxLength={6} onChangeText={setCode} placeholder="000000" value={code} />
      {developmentCode ? <Text style={styles.devCode}>Development code: {developmentCode}</Text> : null}
      {error ? <ErrorMessage message={error} /> : null}
      <Button disabled={isLoading} label={isLoading ? 'Checking code...' : 'Confirm Email  →'} onPress={confirmCode} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/customer-signup')}><Text style={styles.link}>Change email address</Text></TouchableOpacity>
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
  devCode: { color: '#13753F', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  link: { color: '#13753F', fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
