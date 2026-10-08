import { Link, router } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '@/context/AuthContext';
import { login } from '@/features/auth/authApi';
import { Button } from '@/components/common/Button';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signIn = async () => {
    setBusy(true); setError('');
    try { const user = await login({ mobileNumber: mobileNumber.trim(), password }); setUser(user); router.replace(user.role === 'customer' ? '/customer/dashboard' : '/shop/dashboard'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Header
        subtitle="Fresh local groceries with convenient neighborhood pickup."
        title="Welcome Neighbor!"
      />
      <Input keyboardType="phone-pad" label="Mobile phone number" placeholder="0771234567" value={mobileNumber} onChangeText={setMobileNumber} />
      <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {!!error && <Text accessibilityRole="alert" style={{ color: '#A32121' }}>{error}</Text>}
      <Button label={busy ? 'Signing in…' : 'Sign in'} disabled={busy || !mobileNumber || !password} onPress={() => void signIn()} />
      <View style={styles.links}>
        <Link href="/(auth)/customer-signup">Create customer account</Link>
        <Link href="/(auth)/shop-signup">Register a shop</Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, gap: 18, justifyContent: 'center', padding: 24 },
  links: { alignItems: 'center', gap: 12 },
});
