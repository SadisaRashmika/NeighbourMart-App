import { PickupSlotModel } from '../models/PickupSlot.js';
import { ShopModel } from '../models/Shop.js';

// Lazy creation uses the existing owner's opening hours and capacity settings.
// Existing slots/bookings are never overwritten.
export async function ensurePickupSlots(shopId: string) {
  const shop = await ShopModel.findById(shopId);
  if (!shop?.acceptingOrders) return;
  const minutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const format = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  const start = minutes(shop.openingTime || '07:30');
  const end = minutes(shop.closingTime || '21:00');
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;
  const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
  const writes = [];
  for (let day = 0; day < 3; day++) {
    const date = new Date(new Date(`${today}T00:00:00Z`).getTime() + day * 86400000);
    for (let t = start; t + 30 <= end; t += 30) {
      writes.push({ updateOne: {
        filter: { shop: shop._id, date, startTime: format(t) },
        update: { $setOnInsert: { shop: shop._id, date, startTime: format(t), endTime: format(t + 30), capacity: shop.activeOrdersCap || 10, booked: 0 } },
        upsert: true,
      } });
    }
  }
  if (writes.length) await PickupSlotModel.bulkWrite(writes);
}
