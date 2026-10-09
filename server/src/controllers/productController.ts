import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { createProduct, deleteProduct, findProductsByShop, updateProduct } from '../services/productService.js';
import { resolveShop } from '../services/shopService.js';

import { ProductModel } from '../models/Product.js';

export const listProducts: RequestHandler = async (request, response, next) => {
  try {
    const shopId = request.query.shopId as string;
    const q: any = {};
    if (shopId) {
      if (!Types.ObjectId.isValid(shopId)) { response.status(400).json({ message: 'Invalid shopId' }); return; }
      q.shop = shopId;
    }
    const products = await ProductModel.find(q).sort({ createdAt: -1 }).lean();
    response.json(products.map(dto));
  } catch (e) { next(e); }
};

const dto = (p: { _id: unknown; name: string; category: string; price: number; stock: number; available?: boolean | null; imageUrl?: string | null }) => ({
  id: String(p._id), name: p.name, category: p.category, price: p.price, stock: p.stock, available: p.available ?? true, imageUrl: p.imageUrl ?? undefined,
});

function clean(body: Record<string, unknown>, all: boolean) {
  const out: Record<string, unknown> = {}; const errors: string[] = [];
  for (const k of ['name', 'category'] as const) {
    if (all || body[k] !== undefined) { const v = String(body[k] ?? '').trim(); if (!v) errors.push(`${k} is required`); else out[k] = v; }
  }
  if (all || body.price !== undefined) { const n = Number(body.price); if (!Number.isFinite(n) || n < 0) errors.push('price must be 0 or more'); else out.price = n; }
  if (all || body.stock !== undefined) { const n = Number(body.stock); if (!Number.isInteger(n) || n < 0) errors.push('stock must be a whole number, 0 or more'); else out.stock = n; }
  if (typeof body.available === 'boolean') out.available = body.available;
  if (typeof body.imageUrl === 'string') out.imageUrl = body.imageUrl;
  return { out, errors };
}

export const listShopProducts: RequestHandler = async (request, response, next) => {
  try { const s = await resolveShop(request); response.json((await findProductsByShop(String(s._id))).map(dto)); } catch (e) { next(e); }
};
export const createShopProduct: RequestHandler = async (request, response, next) => {
  try {
    const { out, errors } = clean(request.body ?? {}, true);
    if (errors.length) { response.status(400).json({ message: errors.join(', ') }); return; }
    const s = await resolveShop(request);
    response.status(201).json(dto(await createProduct(String(s._id), out)));
  } catch (e) { next(e); }
};
export const updateShopProduct: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id);
    if (!Types.ObjectId.isValid(id)) { response.status(400).json({ message: 'Invalid product id' }); return; }
    const { out, errors } = clean(request.body ?? {}, false);
    if (errors.length) { response.status(400).json({ message: errors.join(', ') }); return; }
    const s = await resolveShop(request);
    const p = await updateProduct(String(s._id), id, out);
    if (!p) { response.status(404).json({ message: 'Product not found' }); return; }
    response.json(dto(p));
  } catch (e) { next(e); }
};
export const deleteShopProduct: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id);
    if (!Types.ObjectId.isValid(id)) { response.status(400).json({ message: 'Invalid product id' }); return; }
    const s = await resolveShop(request);
    const p = await deleteProduct(String(s._id), id);
    if (!p) { response.status(404).json({ message: 'Product not found' }); return; }
    response.json({ id });
  } catch (e) { next(e); }
};
