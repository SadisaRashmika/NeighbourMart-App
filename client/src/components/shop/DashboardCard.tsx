import { StyleSheet, Text, View } from 'react-native';

type Props = { title: string; value: string; note?: string; tone?: 'default' | 'alert' };

export function DashboardCard({ title, value, note, tone = 'default' }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, tone === 'alert' && { color: '#E11D48' }]}>{value}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: 16, borderWidth: 1, flexBasis: '47%', flexGrow: 1, gap: 4, padding: 14 },
  title: { color: '#667085', fontSize: 13 },
  value: { color: '#101828', fontSize: 20, fontWeight: '800' },
  note: { color: '#667085', fontSize: 12 },
});
