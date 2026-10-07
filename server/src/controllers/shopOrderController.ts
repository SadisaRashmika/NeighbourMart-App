import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { createCounterOrder, findOrdersByShop, FROM_UI, removeOrder, setOrderStatus, toShopOrderDto } from '../services/orderService.js';
import { resolveShop } from '../services/shopService.js';

export const listShopOrders: RequestHandler = async (request, response, next) => {
  try { const s = await resolveShop(request); response.json((await findOrdersByShop(String(s._id))).map(toShopOrderDto)); } catch (e) { next(e); }
};
export const createShopOrder: RequestHandler = async (request, response, next) => {
  try {
    const { customerName, items } = request.body ?? {};
    const lines = Array.isArray(items) ? items.map((i: { productId: string; quantity: number }) => ({ productId: String(i.productId), quantity: Number(i.quantity) })).filter((i) => Types.ObjectId.isValid(i.productId) && i.quantity >= 1) : [];
    if (!String(customerName ?? '').trim() || !lines.length) { response.status(400).json({ message: 'customerName and at least one item are required' }); return; }
    const s = await resolveShop(request);
    const o = await createCounterOrder(s, String(customerName).trim(), lines);
    if (!o) { response.status(400).json({ message: 'No valid products selected' }); return; }
    response.status(201).json(toShopOrderDto(o));
  } catch (e) { next(e); }
};
export const updateShopOrderStatus: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id); const status = String(request.body?.status ?? '');
    if (!Types.ObjectId.isValid(id) || !(status in FROM_UI)) { response.status(400).json({ message: 'Invalid order id or status' }); return; }
    const s = await resolveShop(request);
    const o = await setOrderStatus(String(s._id), id, status);
    if (!o) { response.status(404).json({ message: 'Order not found' }); return; }
    response.json(toShopOrderDto(o));
  } catch (e) { next(e); }
};
export const deleteShopOrder: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id);
    if (!Types.ObjectId.isValid(id)) { response.status(400).json({ message: 'Invalid order id' }); return; }
    const s = await resolveShop(request);
    if (!(await removeOrder(String(s._id), id))) { response.status(404).json({ message: 'Order not found' }); return; }
    response.json({ id });
  } catch (e) { next(e); }
};
