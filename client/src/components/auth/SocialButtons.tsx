import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function SocialButtons() {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.button}>
        <Ionicons color="#EA4335" name="logo-google" size={18} />
        <Text style={styles.label}>Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Ionicons color="#111827" name="logo-apple" size={18} />
        <Text style={styles.label}>Apple</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  button: { alignItems: 'center', borderColor: '#E0E5ED', borderRadius: 11, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 42 },
  label: { color: '#27364A', fontSize: 13, fontWeight: '600' },
});
