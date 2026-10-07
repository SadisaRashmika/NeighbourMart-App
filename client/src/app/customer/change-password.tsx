import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { requestPasswordChangeCode, resetPassword } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';

export default function ChangePassword() {
  const { token, user } = useAuth();
  const [code, setCode] = useState('');
  const [developmentCode, setDevelopmentCode] = useState('');
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Your session has expired. Please sign in again.');
      setIsLoading(false);
      return;
    }

    requestPasswordChangeCode(token)
      .then((result) => {
        setDevelopmentCode(result.developmentCode ?? '');
        setMessage(`We sent a password code to ${result.email}.`);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not send the password code.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  async function savePassword() {
    setError('');
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      await resetPassword({ email: user?.email ?? '', code, password });
      setMessage('Password updated successfully.');
      setTimeout(() => router.back(), 700);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update your password.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity><Text style={styles.title}>Change Password</Text><View style={styles.headerSpace} /></View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.icon}><Text style={styles.iconText}>✦</Text></View>
        <Text style={styles.heading}>Verify it&apos;s you</Text>
        <Text style={styles.description}>We&apos;ll send a 6-digit code to {user?.email ?? 'your verified email'} before you can choose a new password.</Text>
        {isLoading ? <View style={styles.loading}><ActivityIndicator color="#138A43" /><Text style={styles.loadingText}>Sending code...</Text></View> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {developmentCode ? <Text style={styles.devCode}>Development code: {developmentCode}</Text> : null}
        <Input keyboardType="number-pad" label="EMAIL CODE" maxLength={6} onChangeText={setCode} placeholder="000000" value={code} />
        <Input autoCapitalize="none" label="NEW PASSWORD" onChangeText={setPasswordValue} placeholder="At least 8 characters" secureTextEntry value={password} />
        <Input autoCapitalize="none" label="CONFIRM NEW PASSWORD" onChangeText={setConfirmPassword} placeholder="Repeat your password" secureTextEntry value={confirmPassword} />
        {error ? <ErrorMessage message={error} /> : null}
        <Button disabled={isLoading || isSaving} label={isSaving ? 'Updating...' : 'Update Password'} onPress={savePassword} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9F8', flex: 1 },
  header: { alignItems: 'center', backgroundColor: '#fff', borderBottomColor: '#E4E8EF', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  title: { color: '#172B24', fontSize: 17, fontWeight: '800' },
  cancel: { color: '#667085', fontSize: 14 },
  headerSpace: { width: 48 },
  content: { gap: 14, padding: 24, paddingBottom: 34 },
  icon: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#EAF7F0', borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  iconText: { color: '#138A43', fontSize: 26, fontWeight: '800' },
  heading: { color: '#172B24', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  description: { color: '#667085', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  loading: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center' },
  loadingText: { color: '#667085', fontSize: 12 },
  message: { color: '#13753F', fontSize: 13, textAlign: 'center' },
  devCode: { color: '#13753F', fontSize: 13, fontWeight: '800', textAlign: 'center' },
});
