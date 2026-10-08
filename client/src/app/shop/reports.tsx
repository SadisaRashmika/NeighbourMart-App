import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { ReportCard } from '@/components/shop/ReportCard';
import { createExport, deleteExport, getExports, getReport, type Period, type ReportExport, type ShopReport } from '@/features/shop/reportApi';

const PERIODS: { key: Period; label: string }[] = [{ key: 'today', label: 'Today' }, { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }];
const money = (n: number) => `LKR ${n.toLocaleString('en-US')}`;

export default function ShopReports() {
  const [period, setPeriod] = useState<Period>('today');
  const [report, setReport] = useState<ShopReport | null>(null);
  const [exportsList, setExports] = useState<ReportExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Period) => {
    try { setError(null); const [r, e] = await Promise.all([getReport(p), getExports()]); setReport(r); setExports(e); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load reports'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(period); }, [load, period]));

  async function generate() {
    try {
      const e = await createExport(period);
      setExports((l) => [e, ...l]);
      await Share.share({ title: `Sales summary (${period})`, message: e.csv });
    } catch (err) { Alert.alert('Could not create summary', err instanceof Error ? err.message : ''); }
  }
  const remove = (id: string) =>
    Alert.alert('Delete summary', 'Remove this saved summary?', [{ text: 'Keep', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteExport(id); setExports((l) => l.filter((x) => x.id !== id)); } catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); } } }]);

  const max = Math.max(1, ...(report?.values ?? [0]));
  return (
    <ScrollView contentContainerStyle={styles.screen} style={{ backgroundColor: '#F4F5FB' }}>
      <View style={styles.tabs}>
        {PERIODS.map((p) => (
          <TouchableOpacity key={p.key} onPress={() => { setLoading(true); setPeriod(p.key); }} style={[styles.tab, period === p.key && styles.tabOn]}>
            <Text style={[styles.tabText, period === p.key && { color: '#fff' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <TouchableOpacity onPress={() => load(period)}><Text style={styles.error}>{error} - tap to retry</Text></TouchableOpacity>}
      {loading || !report ? <ActivityIndicator color="#138A43" size="large" style={{ marginTop: 32 }} /> : (
        <>
          <View style={styles.grid}>
            <ReportCard title="Total Sales" value={money(report.sales)} />
            <ReportCard title="Fulfilled Orders" value={`${report.orders}`} />
            <ReportCard title="Avg Order Value" value={money(report.average)} />
          </View>
          <View style={styles.card}>
            <Text style={styles.h2}>{period === 'today' ? 'Hourly Order Rush' : 'Orders Over Time'}</Text>
            <Text style={styles.mute}>{report.peakLabel ? `Peak: ${report.peakLabel}` : 'No completed orders in this period yet'}</Text>
            <View style={styles.chart}>
              {report.values.map((v, i) => (
                <View key={report.labels[i]} style={styles.barCol}>
                  <Text style={styles.mute}>{v}</Text>
                  <View style={[styles.bar, { height: 8 + (v / max) * 100, backgroundColor: report.labels[i] === report.peakLabel ? '#0B6B3A' : '#A7E3BD' }]} />
                  <Text style={styles.axis}>{report.labels[i]}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.h2}>Top Movers</Text>
            {report.movers.length === 0 && <Text style={styles.mute}>Complete some orders to see your best sellers.</Text>}
            {report.movers.map((m, i) => (
              <View key={m.name} style={styles.mover}>
                <Text style={{ flex: 1 }}>{i + 1}. {m.name} ({m.units} sold)</Text>
                <Text style={styles.bold}>{money(m.revenue)}</Text>
              </View>
            ))}
          </View>
          <Button label="Generate & share sales summary" onPress={generate} />
          <Text style={styles.h2}>Saved summaries</Text>
          {exportsList.length === 0 && <Text style={styles.mute}>None yet.</Text>}
          {exportsList.map((e) => (
            <View key={e.id} style={[styles.card, styles.mover]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bold}>{e.period.toUpperCase()} - {money(e.sales)}</Text>
                <Text style={styles.mute}>{e.orders} orders - {e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => Share.share({ message: e.csv })}><Text style={styles.link}>Share</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => remove(e.id)}><Text style={styles.del}>Delete</Text></TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 12, padding: 14, paddingBottom: 40 },
  tabs: { backgroundColor: '#E8EAF9', borderRadius: 99, flexDirection: 'row', padding: 4 },
  tab: { alignItems: 'center', borderRadius: 99, flex: 1, paddingVertical: 8 },
  tabOn: { backgroundColor: '#0B6B3A' },
  tabText: { fontWeight: '700' },
  grid: { gap: 10 },
  card: { backgroundColor: '#fff', borderColor: '#E5E7EB', borderRadius: 16, borderWidth: 1, gap: 6, padding: 14 },
  h2: { fontSize: 16, fontWeight: '800' },
  mute: { color: '#667085', fontSize: 12 },
  bold: { fontWeight: '800' },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 6, height: 150, justifyContent: 'space-between', marginTop: 8 },
  barCol: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 6, width: '80%' },
  axis: { color: '#667085', fontSize: 9, marginTop: 4 },
  mover: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  link: { color: '#0B6B3A', fontWeight: '700' },
  del: { color: '#E11D48', fontWeight: '700' },
  error: { color: '#E11D48' },
});
