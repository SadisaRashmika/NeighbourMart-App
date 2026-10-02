import { StyleSheet, Text, View } from 'react-native';

export function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F6FEF9', borderRadius: 12, gap: 6, padding: 16 },
  label: { color: '#475467', fontSize: 13 },
  value: { color: '#138A43', fontSize: 22, fontWeight: '800' },
});
