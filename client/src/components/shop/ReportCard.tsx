import { StyleSheet, Text, View } from 'react-native';

export function ReportCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderColor: '#D1FADF', borderRadius: 12, borderWidth: 1, gap: 6, padding: 16 },
  title: { color: '#475467' },
  value: { color: '#101828', fontSize: 20, fontWeight: '800' },
});
