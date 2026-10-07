import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { updateProfile } from '@/features/auth/authApi';
import { useAuth } from '@/features/auth/useAuth';

export default function EditProfile() {
  const { token, user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function choosePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) setAvatarUrl(result.assets[0].uri);
  }

  async function saveProfile() {
    if (!token) {
      setError('Your session has expired. Please sign in again.');
      return;
    }
    if (!name.trim() || !location.trim()) {
      setError('Name and location are required.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      const result = await updateProfile(token, { name: name.trim(), location: location.trim(), avatarUrl });
      setUser(result.user);
      router.back();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update your profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity><Text style={styles.title}>Edit Profile</Text><View style={styles.headerSpace} /></View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity accessibilityLabel="Change profile photo" onPress={choosePhoto} style={styles.photoButton}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.photo} /> : <Text style={styles.initial}>{user?.name?.charAt(0).toUpperCase() ?? '?'}</Text>}
          <View style={styles.camera}><Text style={styles.cameraText}>+</Text></View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Tap to choose a new profile photo</Text>
        <Input autoCapitalize="words" label="FULL NAME" onChangeText={setName} value={name} />
        <Input editable={false} label="EMAIL ADDRESS" value={user?.email ?? ''} style={styles.lockedInput} />
        <Text style={styles.lockedHint}>Your Gmail address is verified and cannot be changed here.</Text>
        <Input autoCapitalize="words" label="NEIGHBORHOOD / DELIVERY AREA" onChangeText={setLocation} value={location} />
        {error ? <ErrorMessage message={error} /> : null}
        <Button disabled={isSaving} label={isSaving ? 'Saving...' : 'Save Profile'} onPress={saveProfile} />
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
  content: { alignItems: 'stretch', gap: 14, padding: 24, paddingBottom: 34 },
  photoButton: { alignSelf: 'center', backgroundColor: '#D4F1DE', borderColor: '#fff', borderRadius: 52, borderWidth: 4, height: 104, justifyContent: 'center', overflow: 'visible', width: 104 },
  photo: { borderRadius: 48, height: 96, width: 96 },
  initial: { color: '#13753F', fontSize: 42, fontWeight: '800', textAlign: 'center' },
  camera: { alignItems: 'center', backgroundColor: '#138A43', borderColor: '#fff', borderRadius: 14, borderWidth: 2, bottom: -2, height: 28, justifyContent: 'center', position: 'absolute', right: -2, width: 28 },
  cameraText: { color: '#fff', fontSize: 20, lineHeight: 22 },
  photoHint: { color: '#667085', fontSize: 12, textAlign: 'center' },
  lockedInput: { backgroundColor: '#F2F4F7', color: '#667085' },
  lockedHint: { color: '#98A2B3', fontSize: 11, marginTop: -8 },
});
