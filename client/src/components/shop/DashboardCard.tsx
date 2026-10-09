import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { type IconName } from './ShopUI';
import { T, shadow } from './shopTheme';

type Props = { title: string; value: string; note?: string; tone?: 'default' | 'alert'; icon?: IconName; accent?: string };

export function DashboardCard({ title, value, note, tone = 'default', icon = 'stats-chart-outline', accent = T.green2 }: Props) {
  const alert = tone === 'alert';
  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.icon, { backgroundColor: alert ? T.redBg : `${accent}22` }]}>
          <Ionicons color={alert ? T.red : accent} name={icon} size={16} />
        </View>
      </View>
      <Text style={[styles.value, alert && { color: T.red }]}>{value}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: T.card, borderRadius: 18, flexBasis: '47%', flexGrow: 1, gap: 6, padding: 14 },
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: T.mute, fontSize: 13 },
  icon: { alignItems: 'center', borderRadius: 10, height: 30, justifyContent: 'center', width: 30 },
  value: { color: T.ink, fontSize: 21, fontWeight: '800' },
  note: { color: T.mute, fontSize: 12 },
});
