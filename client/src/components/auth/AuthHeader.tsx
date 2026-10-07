import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function AuthHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
        <Ionicons color="#162238" name="arrow-back" size={22} />
      </TouchableOpacity>
      <View style={styles.brandWrap}>
        <Text style={styles.brand}>Neighbour<Text style={styles.brandAccent}>Mart</Text></Text>
        <Text style={styles.subtitle}>USER PORTAL</Text>
      </View>
      <View style={styles.actions}>
        <Text style={styles.language}>EN</Text>
        <Ionicons color="#7D8A9C" name="accessibility-outline" size={14} />
        <View style={styles.userCircle}>
          <Ionicons color="#138A43" name="person-outline" size={18} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, paddingHorizontal: 24, width: '100%' },
  iconButton: { alignItems: 'flex-start', justifyContent: 'center', width: 40 },
  brandWrap: { alignItems: 'center', flex: 1 },
  brand: { color: '#101828', fontSize: 16, fontWeight: '800' },
  brandAccent: { color: '#138A43' },
  subtitle: { color: '#8390A3', fontSize: 9, letterSpacing: 0.8, marginTop: 1 },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'flex-end', width: 104 },
  language: { backgroundColor: '#138A43', borderRadius: 14, color: '#fff', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 6 },
  userCircle: { alignItems: 'center', borderColor: '#B9E8CB', borderRadius: 16, borderWidth: 1, height: 32, justifyContent: 'center', width: 32 },
});
