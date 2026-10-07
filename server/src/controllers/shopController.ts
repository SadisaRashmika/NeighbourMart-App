import type { RequestHandler } from 'express';
import { resolveShop } from '../services/shopService.js';

export const listShops: RequestHandler = (_request, response) => {
  response.status(501).json({ message: 'Shop endpoints are not implemented yet' });
};

const dto = (s: { _id: unknown; name: string; address: string; acceptingOrders?: boolean | null }) => ({
  id: String(s._id), name: s.name, address: s.address, acceptingOrders: s.acceptingOrders ?? true,
});

export const getMyShop: RequestHandler = async (request, response, next) => {
  try { response.json(dto(await resolveShop(request))); } catch (e) { next(e); }
};

export const updateMyShop: RequestHandler = async (request, response, next) => {
  try {
    const shop = await resolveShop(request);
    if (typeof request.body?.acceptingOrders === 'boolean') shop.acceptingOrders = request.body.acceptingOrders;
    await shop.save();
    response.json(dto(shop));
  } catch (e) { next(e); }
};
