import { model, Schema, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    substitutionPreference: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    items: { type: [orderItemSchema], required: true },
    pickupSlot: { type: Schema.Types.ObjectId, ref: 'PickupSlot' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'picked-up', 'cancelled'],
      default: 'pending',
    },
    total: { type: Number, required: true, min: 0 },
    packingFee: { type: Number, min: 0, default: 0 },
    communityDiscount: { type: Number, min: 0, default: 0 },
    checkoutKey: { type: String },
    pickupNote: { type: String, maxlength: 300 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'lankaqr'], default: 'cash' },
    lastStatusUpdateAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof orderSchema>;
orderSchema.index({ customer: 1, checkoutKey: 1 }, { unique: true, partialFilterExpression: { checkoutKey: { $type: 'string' } } });
export const OrderModel = model('Order', orderSchema);
