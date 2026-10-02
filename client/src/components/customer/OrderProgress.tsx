import { StyleSheet, Text, View } from 'react-native';

export function OrderProgress({ status }: { status: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current order status</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#ECFDF3', borderRadius: 12, gap: 4, padding: 14 },
  label: { color: '#475467', fontSize: 12 },
  status: { color: '#138A43', fontSize: 16, fontWeight: '800' },
});
