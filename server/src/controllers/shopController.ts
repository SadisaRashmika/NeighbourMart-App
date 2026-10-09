import type { RequestHandler } from 'express';
import { findAllShops, resolveShop } from '../services/shopService.js';
import { UserModel } from '../models/User.js';

export const listShops: RequestHandler = async (_request, response, next) => {
  try { response.json((await findAllShops()).map(dto)); } catch (e) { next(e); }
};

const dto = (s: { _id: unknown; name: string; category?: string | null; address: string; phone?: string | null; acceptingOrders?: boolean | null; openingTime?: string; closingTime?: string; pickupBufferMinutes?: number; activeOrdersCap?: number; autoSuggestSubstitutions?: boolean; autoCancelExpiredPickups?: boolean; pickupExpiryMinutes?: number; acceptsCounterCash?: boolean }) => ({
  id: String(s._id), name: s.name, category: s.category, address: s.address, phone: s.phone, acceptingOrders: s.acceptingOrders ?? true, openingTime: s.openingTime ?? '07:30', closingTime: s.closingTime ?? '21:00', pickupBufferMinutes: s.pickupBufferMinutes ?? 15, activeOrdersCap: s.activeOrdersCap ?? 10, autoSuggestSubstitutions: s.autoSuggestSubstitutions ?? true, autoCancelExpiredPickups: s.autoCancelExpiredPickups ?? true, pickupExpiryMinutes: s.pickupExpiryMinutes ?? 30, acceptsCounterCash: s.acceptsCounterCash ?? true,
});

export const getMyShop: RequestHandler = async (request, response, next) => {
  try { response.json(dto(await resolveShop(request))); } catch (e) { next(e); }
};

export const updateMyShop: RequestHandler = async (request, response, next) => {
  try {
    const shop = await resolveShop(request);
    const body = request.body ?? {};
    for (const field of ['name', 'category', 'address', 'phone'] as const) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string' || !body[field].trim()) { response.status(400).json({ message: `${field} is required` }); return; }
        shop[field] = body[field].trim();
      }
    }
    if (typeof body.acceptingOrders === 'boolean') shop.acceptingOrders = body.acceptingOrders;
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (body.openingTime !== undefined && (typeof body.openingTime !== 'string' || !timePattern.test(body.openingTime))) { response.status(400).json({ message: 'openingTime must use HH:mm format' }); return; }
    if (body.closingTime !== undefined && (typeof body.closingTime !== 'string' || !timePattern.test(body.closingTime))) { response.status(400).json({ message: 'closingTime must use HH:mm format' }); return; }
    const openingTime = body.openingTime ?? shop.openingTime ?? '07:30';
    const closingTime = body.closingTime ?? shop.closingTime ?? '21:00';
    if (openingTime >= closingTime) { response.status(400).json({ message: 'Closing time must be later than opening time' }); return; }
    if (body.openingTime !== undefined) shop.openingTime = body.openingTime;
    if (body.closingTime !== undefined) shop.closingTime = body.closingTime;
    if (body.pickupBufferMinutes !== undefined && (!Number.isInteger(body.pickupBufferMinutes) || body.pickupBufferMinutes < 0 || body.pickupBufferMinutes > 240)) { response.status(400).json({ message: 'Pickup buffer must be a whole number from 0 to 240' }); return; }
    if (body.activeOrdersCap !== undefined && (!Number.isInteger(body.activeOrdersCap) || body.activeOrdersCap < 1 || body.activeOrdersCap > 1000)) { response.status(400).json({ message: 'Active order cap must be a whole number from 1 to 1000' }); return; }
    if (body.pickupBufferMinutes !== undefined) shop.pickupBufferMinutes = body.pickupBufferMinutes;
    if (body.activeOrdersCap !== undefined) shop.activeOrdersCap = body.activeOrdersCap;
    for (const field of ['autoSuggestSubstitutions', 'autoCancelExpiredPickups'] as const) {
      if (body[field] !== undefined && typeof body[field] !== 'boolean') { response.status(400).json({ message: `${field} must be boolean` }); return; }
      if (body[field] !== undefined) shop[field] = body[field];
    }
    if (body.pickupExpiryMinutes !== undefined && (!Number.isInteger(body.pickupExpiryMinutes) || body.pickupExpiryMinutes < 5 || body.pickupExpiryMinutes > 240)) { response.status(400).json({ message: 'Pickup expiry must be a whole number from 5 to 240' }); return; }
    if (body.pickupExpiryMinutes !== undefined) shop.pickupExpiryMinutes = body.pickupExpiryMinutes;
    if (body.acceptsCounterCash !== undefined && typeof body.acceptsCounterCash !== 'boolean') { response.status(400).json({ message: 'acceptsCounterCash must be boolean' }); return; }
    if (body.acceptsCounterCash !== undefined) shop.acceptsCounterCash = body.acceptsCounterCash;
    await shop.save();
    if (typeof body.ownerName === 'string') {
      if (!body.ownerName.trim()) { response.status(400).json({ message: 'ownerName is required' }); return; }
      await UserModel.findByIdAndUpdate((request as typeof request & { userId?: string }).userId, { name: body.ownerName.trim() });
    }
    response.json(dto(shop));
  } catch (e) { next(e); }
};
