import type { RequestHandler } from 'express';
import { ProductModel } from '../models/Product.js';

export const listProducts: RequestHandler = async (_request, response) => {
  const products = await ProductModel.find().sort({ name: 1 }).limit(200);
  response.json(products.map(p => ({ id: p.id, name: p.name, price: p.price, available: p.available, stock: p.stock, category: p.category, shopId: String(p.shop) })));
};
