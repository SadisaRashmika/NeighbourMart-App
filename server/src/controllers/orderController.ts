import type { RequestHandler } from 'express';
import { findOrdersByCustomer } from '../services/orderService.js';

export const listOrders: RequestHandler = async (_request, response, next) => {
  try {
    const orders = await findOrdersByCustomer(response.locals.userId);
    response.json(orders.map(order => ({ id: String(order._id), status: order.status, total: order.total })));
  } catch (error) { next(error); }
};
