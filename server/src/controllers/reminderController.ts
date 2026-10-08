import type { RequestHandler } from 'express';
import { PickupReminderModel } from '../models/PickupReminder.js';

function publicReminder(reminder: { _id: unknown; items: Array<{ _id: unknown; name: string; quantity: number }> }) {
  return {
    id: String(reminder._id),
    items: reminder.items.map((item) => ({ id: String(item._id), name: item.name, quantity: item.quantity })),
  };
}

export const getCurrentReminder: RequestHandler = async (_request, response) => {
  const reminder = await PickupReminderModel.findOne({ customer: response.locals.userId }).lean();
  response.json({ reminder: reminder ? publicReminder(reminder) : { id: null, items: [] } });
};

export const updateCurrentReminder: RequestHandler = async (request, response) => {
  if (!Array.isArray(request.body.items) || request.body.items.length > 100) {
    response.status(400).json({ message: 'Provide up to 100 reminder items' });
    return;
  }

  const items = request.body.items.map((item: { name?: unknown; quantity?: unknown }) => ({
    name: String(item.name ?? '').trim(),
    quantity: Number(item.quantity ?? 1),
  }));

  if (items.some((item: { name: string; quantity: number }) => !item.name || item.name.length > 120 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    response.status(400).json({ message: 'Each reminder item needs a name and a quantity from 1 to 99' });
    return;
  }

  const reminder = await PickupReminderModel.findOneAndUpdate(
    { customer: response.locals.userId },
    { customer: response.locals.userId, items },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();

  response.json({ reminder: publicReminder(reminder) });
};

export const deleteCurrentReminder: RequestHandler = async (_request, response) => {
  await PickupReminderModel.findOneAndDelete({ customer: response.locals.userId });
  response.json({ message: 'Pickup reminder list deleted' });
};