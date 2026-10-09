import { OrderModel } from '../models/Order.js';
import { ReportExportModel } from '../models/ReportExport.js';

export function countCompletedOrders(shopId: string) {
  return OrderModel.countDocuments({ shop: shopId, status: 'picked-up' });
}

export type Period = 'today' | 'week' | 'month';
export const isPeriod = (v: unknown): v is Period => v === 'today' || v === 'week' || v === 'month';

const DAY = 86400000;
const SLOTS: [number, string][] = [[10, '8-10A'], [12, '10-12'], [14, '12-2P'], [16, '2-4P'], [17, '4-5P'], [19, '5-7P'], [24, '7-8P']];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export async function buildReport(shopId: string, period: Period) {
  const today = startOfDay(new Date());
  const from = period === 'today' ? today : new Date(today.getTime() - (period === 'week' ? 6 : 27) * DAY);
  const orders = await OrderModel.find({ shop: shopId, status: 'picked-up', createdAt: { $gte: from } }).lean();

  let labels: string[];
  if (period === 'today') labels = SLOTS.map((s) => s[1]);
  else if (period === 'week') labels = Array.from({ length: 7 }, (_, i) => new Date(from.getTime() + i * DAY).toLocaleDateString('en-US', { weekday: 'short' }));
  else labels = ['W1', 'W2', 'W3', 'W4'];
  const values = labels.map(() => 0);

  const movers = new Map<string, { units: number; revenue: number }>();
  let sales = 0;
  for (const o of orders) {
    sales += o.total;
    const at = new Date(o.createdAt as Date);
    const days = Math.floor((startOfDay(at).getTime() - from.getTime()) / DAY);
    const idx = period === 'today' ? Math.max(0, SLOTS.findIndex((s) => at.getHours() < s[0])) : period === 'week' ? days : Math.floor(days / 7);
    if (values[idx] !== undefined) values[idx] += 1;
    for (const i of o.items) {
      const m = movers.get(i.name) ?? { units: 0, revenue: 0 };
      m.units += i.quantity; m.revenue += i.quantity * i.unitPrice;
      movers.set(i.name, m);
    }
  }
  const peak = Math.max(...values, 0);
  return {
    period, sales, orders: orders.length, average: orders.length ? Math.round(sales / orders.length) : 0,
    labels, values, peakLabel: peak > 0 ? labels[values.indexOf(peak)] : null,
    movers: [...movers.entries()].map(([name, m]) => ({ name, ...m })).sort((a, b) => b.revenue - a.revenue).slice(0, 3),
  };
}

export async function createExport(shopId: string, period: Period) {
  const r = await buildReport(shopId, period);
  const rows = [`NeighbourMart sales summary (${period})`, `Total sales,${r.sales}`, `Orders,${r.orders}`, `Average order,${r.average}`, '', 'Item,Units,Revenue',
    ...r.movers.map((m) => `"${m.name.replace(/"/g, '""')}",${m.units},${m.revenue}`)];
  return ReportExportModel.create({ shop: shopId, period, sales: r.sales, orders: r.orders, csv: rows.join('\n') });
}
export const listExports = (shopId: string) => ReportExportModel.find({ shop: shopId }).sort({ createdAt: -1 }).limit(20).lean();
export const deleteExport = (shopId: string, id: string) => ReportExportModel.findOneAndDelete({ _id: id, shop: shopId });
