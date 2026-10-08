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
  const params = useLocalSearchParams<{ accountType?: string; email?: string; developmentCode?: string }>();
  const accountType = params.accountType === 'shop' ? 'shop' : 'customer';
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
      router.replace({ pathname: '/(auth)/set-password', params: { accountType, email, verificationToken: result.verificationToken } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'That verification code is not valid.');
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
        <View style={styles.badge}><Ionicons color="#138A43" name="mail-outline" size={14} /><Text style={styles.badgeText}>Check Your Inbox</Text></View>
        <Text style={styles.title}>Confirm Your Email</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to {email}. Enter it here to verify your Gmail address.</Text>
      </View>
      <View style={styles.verificationForm}>
        <Input autoCapitalize="none" keyboardType="number-pad" label="VERIFICATION CODE" maxLength={6} onChangeText={setCode} placeholder="000000" style={styles.codeInput} value={code} />
        {developmentCode ? <Text style={styles.devCode}>Development code: {developmentCode}</Text> : null}
        {error ? <ErrorMessage message={error} /> : null}
        <Button disabled={isLoading} label={isLoading ? 'Checking code...' : 'Confirm Email  →'} onPress={confirmCode} style={styles.confirmButton} />
        <TouchableOpacity onPress={() => router.replace(accountType === 'shop' ? '/(auth)/shop-signup' : '/(auth)/customer-signup')} style={styles.changeEmailButton}><Text style={styles.link}>Change email address</Text></TouchableOpacity>
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
  verificationForm: { gap: 16, paddingTop: 13 },
  codeInput: { backgroundColor: '#F8FAFC', borderRadius: 16, minHeight: 46 },
  devCode: { color: '#13753F', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  confirmButton: { borderRadius: 16, height: 52 },
  changeEmailButton: { alignItems: 'center', minHeight: 32, justifyContent: 'center' },
  link: { color: '#13753F', fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
