import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { setPassword } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';

export default function SetPassword() {
  const params = useLocalSearchParams<{ accountType?: string; email?: string; verificationToken?: string }>();
  const accountType = params.accountType === 'shop' ? 'shop' : 'customer';
  const email = typeof params.email === 'string' ? params.email : '';
  const verificationToken = typeof params.verificationToken === 'string' ? params.verificationToken : '';
  const { establishSession } = useAuth();
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const passwordError = passwordTouched && password.length < 8 ? 'Password must be at least 8 characters.' : '';
  const confirmPasswordError = confirmPasswordTouched && confirmPassword !== password ? 'Passwords do not match.' : '';

  async function finishRegistration() {
    setError('');
    if (password.length < 8) {
      setPasswordTouched(true);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordTouched(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await setPassword({ email, password, verificationToken });
      await establishSession(result, true);
      router.replace(result.user.role === 'shop' ? '/shop/dashboard' : '/customer/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to finish your account.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      header={(
        <View style={styles.navigationBar}>
          <Text style={styles.brand}>Neighbour<Text style={styles.brandAccent}>Mart</Text></Text>
          <Text style={styles.portalTag}>{accountType === 'shop' ? 'SHOP OWNER PORTAL' : 'LOCAL MARKET'}</Text>
        </View>
      )}
    >
      <View style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.badge}><Ionicons color="#138A43" name="lock-closed-outline" size={14} /><Text style={styles.badgeText}>Email Confirmed</Text></View>
        <Text style={styles.title}>Set Your Password</Text>
        <Text style={styles.subtitle}>Your email is verified. Create a password to securely access your NeighbourMart account.</Text>
      </View>
      <View style={styles.passwordForm}>
        <Input autoCapitalize="none" error={passwordError} label="PASSWORD" onBlur={() => setPasswordTouched(true)} onChangeText={(value) => { setPasswordValue(value); setPasswordTouched(true); }} placeholder="At least 8 characters" rightElement={<Pressable accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'} onPress={() => setPasswordVisible((value) => !value)} style={styles.visibilityButton}><Ionicons color="#667085" name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} /></Pressable>} secureTextEntry={!passwordVisible} style={styles.passwordInput} value={password} />
        <Input autoCapitalize="none" error={confirmPasswordError} label="CONFIRM PASSWORD" onBlur={() => setConfirmPasswordTouched(true)} onChangeText={(value) => { setConfirmPassword(value); setConfirmPasswordTouched(true); }} placeholder="Repeat your password" rightElement={<Pressable accessibilityLabel={confirmPasswordVisible ? 'Hide password' : 'Show password'} onPress={() => setConfirmPasswordVisible((value) => !value)} style={styles.visibilityButton}><Ionicons color="#667085" name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} /></Pressable>} secureTextEntry={!confirmPasswordVisible} style={styles.passwordInput} value={confirmPassword} />
        {error ? <ErrorMessage message={error} /> : null}
        <Button disabled={isLoading} label={isLoading ? 'Creating account...' : 'Finish Account  →'} onPress={finishRegistration} style={styles.finishButton} />
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
  passwordForm: { gap: 16, paddingTop: 13 },
  passwordInput: { backgroundColor: '#F8FAFC', borderRadius: 16, minHeight: 46 },
  finishButton: { borderRadius: 16, height: 52 },
  visibilityButton: { paddingHorizontal: 12, paddingVertical: 10 },
});
