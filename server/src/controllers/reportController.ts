import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { buildReport, createExport, deleteExport, isPeriod, listExports } from '../services/reportService.js';
import { resolveShop } from '../services/shopService.js';

const dto = (e: { _id: unknown; period: string; sales: number; orders: number; csv: string; createdAt?: Date }) => ({
  id: String(e._id), period: e.period, sales: e.sales, orders: e.orders, csv: e.csv, createdAt: e.createdAt,
});

export const getShopReport: RequestHandler = async (request, response, next) => {
  try {
    const period = isPeriod(request.query.period) ? request.query.period : 'today';
    const s = await resolveShop(request);
    response.json(await buildReport(String(s._id), period));
  } catch (e) { next(e); }
};
export const listShopExports: RequestHandler = async (request, response, next) => {
  try { const s = await resolveShop(request); response.json((await listExports(String(s._id))).map(dto)); } catch (e) { next(e); }
};
export const createShopExport: RequestHandler = async (request, response, next) => {
  try {
    if (!isPeriod(request.body?.period)) { response.status(400).json({ message: 'period must be today, week or month' }); return; }
    const s = await resolveShop(request);
    response.status(201).json(dto(await createExport(String(s._id), request.body.period)));
  } catch (e) { next(e); }
};
export const deleteShopExport: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id);
    if (!Types.ObjectId.isValid(id)) { response.status(400).json({ message: 'Invalid id' }); return; }
    const s = await resolveShop(request);
    if (!(await deleteExport(String(s._id), id))) { response.status(404).json({ message: 'Export not found' }); return; }
    response.json({ id });
  } catch (e) { next(e); }
};
