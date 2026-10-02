import { StyleSheet, Text, View } from 'react-native';

export function PickupTimeCard({ label, available = true }: { label: string; available?: boolean }) {
  return (
    <View style={[styles.card, !available && styles.unavailable]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.status}>{available ? 'Available' : 'Unavailable'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: '#A6E9C1', borderRadius: 12, borderWidth: 1, gap: 4, padding: 14 },
  unavailable: { opacity: 0.5 },
  label: { color: '#101828', fontWeight: '700' },
  status: { color: '#138A43', fontSize: 12 },
});
