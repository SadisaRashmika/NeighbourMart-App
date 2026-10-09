import { StyleSheet, Text, View } from 'react-native';
import { T, shadow } from './shopTheme';

export function ReportCard({ title, value, note }: { title: string; value: string; note?: string }) {
  return (
    <View style={[styles.card, shadow]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: T.card, borderRadius: 18, flexBasis: '47%', flexGrow: 1, gap: 4, padding: 14 },
  title: { color: T.mute, fontSize: 13 },
  value: { color: T.ink, fontSize: 20, fontWeight: '800' },
  note: { color: T.green2, fontSize: 12, fontWeight: '700' },
});
