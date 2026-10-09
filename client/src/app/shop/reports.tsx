import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReportCard } from '@/components/shop/ReportCard';
import { ActionButton, Pill, SectionTitle, Thumb } from '@/components/shop/ShopUI';
import { T, emojiFor, money, shadow } from '@/components/shop/shopTheme';
import { createExport, deleteExport, getExports, getReport, type Period, type ReportExport, type ShopReport } from '@/features/shop/reportApi';

const PERIODS: { key: Period; label: string }[] = [{ key: 'today', label: 'Today' }, { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }];

export default function ShopReports() {
  const [period, setPeriod] = useState<Period>('today');
  const [report, setReport] = useState<ShopReport | null>(null);
  const [saved, setSaved] = useState<ReportExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: Period) => {
    try { setError(null); const [r, e] = await Promise.all([getReport(p), getExports()]); setReport(r); setSaved(e); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load reports'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(period); }, [load, period]));

  async function generate() {
    try {
      const e = await createExport(period);
      setSaved((l) => [e, ...l]);
      await Share.share({ title: `Sales summary (${period})`, message: e.csv });
    } catch (err) { Alert.alert('Could not create summary', err instanceof Error ? err.message : ''); }
  }
  const remove = (id: string) =>
    Alert.alert('Delete summary', 'Remove this saved summary?', [{ text: 'Keep', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteExport(id); setSaved((l) => l.filter((x) => x.id !== id)); } catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); } } }]);

  const max = Math.max(1, ...(report?.values ?? [0]));
  const label = PERIODS.find((p) => p.key === period)?.label ?? '';
  return (
    <ScrollView contentContainerStyle={styles.screen} style={{ backgroundColor: T.bg }}>
      <View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE REGISTER SYNC</Text></View>
      <View style={styles.tabs}>
        {PERIODS.map((p) => (
          <TouchableOpacity key={p.key} onPress={() => { setLoading(true); setPeriod(p.key); }} style={[styles.tab, period === p.key && styles.tabOn]}>
            <Text style={[styles.tabText, period === p.key && { color: '#fff' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <TouchableOpacity onPress={() => load(period)}><Text style={styles.error}>{error} - tap to retry</Text></TouchableOpacity>}
      {loading || !report ? <ActivityIndicator color={T.green2} size="large" style={{ marginTop: 40 }} /> : (
        <>
          <View style={[styles.hero, shadow]}>
            <View style={styles.row}><Ionicons color="#BBF7D0" name="ribbon-outline" size={16} /><Text style={styles.heroLabel}>{label.toUpperCase()} PERFORMANCE</Text></View>
            <Text style={styles.heroTitle}>{report.orders > 0 ? `${report.orders} orders fulfilled` : 'No completed orders yet'}</Text>
            <Text style={styles.heroSub}>{report.orders > 0 ? `${money(report.sales)} in sales this period` : 'Complete orders to see your performance'}</Text>
            <View style={styles.bolt}><Ionicons color="#BBF7D0" name="flash" size={26} /></View>
          </View>

          <View style={styles.grid}>
            <ReportCard note="Completed orders" title="Total Sales" value={money(report.sales)} />
            <ReportCard note="Handed over" title="Fulfilled" value={`${report.orders} orders`} />
            <ReportCard title="Avg Order Value" value={money(report.average)} />
            <ReportCard note="Busiest slot" title="Peak Time" value={report.peakLabel ?? '-'} />
          </View>

          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>{period === 'today' ? 'Hourly Order Rush' : 'Order Rush'}</Text>
            <Text style={styles.mute}>Customer pickup distribution</Text>
            {report.peakLabel ? <Pill bg={T.amberBg} fg={T.amber} icon="flame-outline" text={`Peak ${report.peakLabel}`} /> : null}
            <View style={styles.chart}>
              {report.values.map((v, i) => {
                const peak = report.labels[i] === report.peakLabel && v > 0;
                return (
                  <View key={report.labels[i]} style={styles.barCol}>
                    <Text style={[styles.mute, peak && { color: T.green, fontWeight: '800' }]}>{v}{peak ? '★' : ''}</Text>
                    <View style={[styles.bar, { height: 8 + (v / max) * 100, backgroundColor: peak ? T.green : '#A7E3BD' }]} />
                    <Text style={styles.axis}>{report.labels[i]}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.tip}><Ionicons color={T.amber} name="bulb-outline" size={18} /><Text style={styles.tipText}>{report.peakLabel ? `Prepare grocery bags before ${report.peakLabel} for a smoother handoff.` : 'Your rush pattern appears once orders are completed.'}</Text></View>
          </View>

          <View style={[styles.card, shadow]}>
            <Text style={styles.h2}>Top Movers</Text>
            <Text style={styles.mute}>High-demand basket staples</Text>
            {report.movers.length === 0 && <Text style={[styles.mute, { marginTop: 8 }]}>Complete some orders to see your best sellers.</Text>}
            {report.movers.map((m, i) => (
              <View key={m.name} style={styles.mover}>
                <View><Thumb emoji={emojiFor('', m.name)} size={46} /><Text style={styles.rank}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.bold}>{m.name}</Text><Text style={styles.mute}>{m.units} units sold</Text></View>
                <Text style={styles.moverRev}>{money(m.revenue)}</Text>
              </View>
            ))}
          </View>

          <ActionButton icon="download-outline" label="Download Daily Sales Summary" onPress={generate} style={styles.download} />

          <SectionTitle title="Saved summaries" />
          {saved.length === 0 && <Text style={styles.mute}>None yet. Tap the green button above to save one.</Text>}
          {saved.map((e) => (
            <View key={e.id} style={[styles.saved, shadow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bold}>{e.period.toUpperCase()} - {money(e.sales)}</Text>
                <Text style={styles.mute}>{e.orders} orders - {e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => Share.share({ message: e.csv })}><Ionicons color={T.green2} name="share-outline" size={22} /></TouchableOpacity>
              <TouchableOpacity onPress={() => remove(e.id)}><Ionicons color={T.red} name="trash-outline" size={22} /></TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 12, padding: 14, paddingBottom: 40 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  live: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  liveDot: { backgroundColor: T.green2, borderRadius: 4, height: 8, width: 8 },
  liveText: { color: T.slate, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  tabs: { backgroundColor: T.lav, borderRadius: 99, flexDirection: 'row', padding: 4 },
  tab: { alignItems: 'center', borderRadius: 99, flex: 1, paddingVertical: 9 },
  tabOn: { backgroundColor: T.green },
  tabText: { color: T.ink, fontWeight: '800' },
  error: { color: T.red },
  hero: { backgroundColor: T.green, borderRadius: 22, gap: 4, overflow: 'hidden', padding: 18 },
  heroLabel: { color: '#BBF7D0', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroSub: { color: '#D7F5E3', fontSize: 13 },
  bolt: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 30, height: 60, justifyContent: 'center', position: 'absolute', right: 16, top: 16, width: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 20, gap: 6, padding: 16 },
  h2: { color: T.ink, fontSize: 18, fontWeight: '800' },
  mute: { color: T.mute, fontSize: 12 },
  bold: { color: T.ink, fontSize: 14, fontWeight: '800' },
  chart: { alignItems: 'flex-end', flexDirection: 'row', gap: 6, height: 160, justifyContent: 'space-between', marginTop: 10 },
  barCol: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 6, width: '78%' },
  axis: { color: T.mute, fontSize: 9, marginTop: 4 },
  tip: { alignItems: 'center', backgroundColor: '#F4F5FB', borderRadius: 14, flexDirection: 'row', gap: 8, marginTop: 8, padding: 12 },
  tipText: { color: T.slate, flex: 1, fontSize: 13 },
  mover: { alignItems: 'center', flexDirection: 'row', gap: 12, marginTop: 12 },
  rank: { backgroundColor: T.green, borderRadius: 9, color: '#fff', fontSize: 10, fontWeight: '800', height: 18, left: -4, overflow: 'hidden', position: 'absolute', textAlign: 'center', top: -4, width: 18 },
  moverRev: { color: T.ink, fontSize: 15, fontWeight: '800' },
  download: { backgroundColor: T.green, borderColor: T.green, minHeight: 54 },
  saved: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', gap: 14, marginBottom: 8, padding: 14 },
});
