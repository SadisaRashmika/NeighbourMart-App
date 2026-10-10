import { model, Schema, type InferSchemaType } from 'mongoose';

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    substitutionPreference: { type: String, trim: true },
    substitution: {
      status: { type: String, enum: ['none', 'pending', 'approved', 'rejected', 'expired'], default: 'none' },
      suggestedProduct: { type: Schema.Types.ObjectId, ref: 'Product' },
      suggestedName: { type: String, trim: true },
      suggestedImageUrl: { type: String, trim: true },
      suggestedUnitPrice: { type: Number, min: 0 },
      priceDifference: { type: Number },
      shopkeeperNote: { type: String, trim: true, maxlength: 300 },
      requestedAt: { type: Date },
      expiresAt: { type: Date },
      respondedAt: { type: Date },
    },
  },
  { _id: false }
);

const timelineSchema = new Schema(
  {
    event: {
      type: String,
      enum: [
        'order-received', 'shop-accepted', 'packing-started', 'substitution-requested',
        'substitution-approved', 'substitution-rejected', 'items-packed', 'ready-for-pickup',
        'pickup-verified', 'payment-confirmed', 'picked-up', 'cancelled',
      ],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    actor: { type: String, enum: ['customer', 'shop', 'system'], required: true },
    occurredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, trim: true }, // added for shop-owner screens (optional)
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    items: { type: [orderItemSchema], required: true },
    pickupSlot: { type: Schema.Types.ObjectId, ref: 'PickupSlot' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'picked-up', 'cancelled'],
      default: 'pending',
    },
    checkoutKey: { type: String },
    pickupNote: { type: String, maxlength: 300 },
    paymentMethod: { type: String, enum: ['cash', 'card', 'lankaqr'] },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    pickupCode: { type: String, trim: true },
    pickupPassToken: { type: String, trim: true },
    pickupVerifiedAt: { type: Date },
    pickedUpAt: { type: Date },
    timeline: { type: [timelineSchema], default: [] },
    packingFee: { type: Number, default: 0, min: 0 },
    communityDiscount: { type: Number, default: 0, min: 0 },
    reservationReleased: { type: Boolean, default: false },
    total: { type: Number, required: true, min: 0 },
    lastStatusUpdateAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, checkoutKey: 1 }, { unique: true, partialFilterExpression: { checkoutKey: { $type: 'string' } } });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ shop: 1, status: 1, createdAt: -1 });

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel = model('Order', orderSchema);
