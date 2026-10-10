import type { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { OrderModel } from '../models/Order.js';
import { toCustomerOrderDto } from '../services/orderDtoService.js';
import { cancelCustomerOrder, ensurePickupPass, respondToSubstitution } from '../services/orderWorkflowService.js';

const validId = (value: string) => Types.ObjectId.isValid(value);
const customerQuery = (customer: string) => OrderModel.find({ customer })
  .populate('shop', 'name address phone')
  .populate('pickupSlot', 'date startTime endTime')
  .sort({ createdAt: -1 });

export const listOrders: RequestHandler = async (_request, response, next) => {
  try { response.json((await customerQuery(response.locals.userId).lean()).map((order) => toCustomerOrderDto(order))); }
  catch (error) { next(error); }
};

export const getOrder: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id);
    if (!validId(id)) { response.status(400).json({ message: 'Invalid order id' }); return; }
    let order: any = await OrderModel.findOne({ _id: id, customer: response.locals.userId });
    if (!order) { response.status(404).json({ message: 'Order not found' }); return; }
    order = await ensurePickupPass(order);
    const populated = await order.populate([{ path: 'shop', select: 'name address phone' }, { path: 'pickupSlot', select: 'date startTime endTime' }, { path: 'items.product', select: 'category' }]);
    response.json(toCustomerOrderDto(populated.toObject(), true));
  } catch (error) { next(error); }
};

export const cancelOrder: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id);
    if (!validId(id)) { response.status(400).json({ message: 'Invalid order id' }); return; }
    const order = await cancelCustomerOrder(response.locals.userId, id);
    response.json(toCustomerOrderDto(order.toObject(), true));
  } catch (error) { next(error); }
};

export const respondToOrderSubstitution: RequestHandler = async (request, response, next) => {
  try {
    const id = String(request.params.id); const productId = String(request.params.productId);
    if (!validId(id) || !validId(productId)) { response.status(400).json({ message: 'Invalid order or product id' }); return; }
    const order = await respondToSubstitution(response.locals.userId, id, productId, String(request.body?.decision ?? ''));
    response.json(toCustomerOrderDto(order.toObject(), true));
  } catch (error) { next(error); }
};
