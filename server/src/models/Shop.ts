import { model, Schema, type InferSchemaType } from 'mongoose';

const shopSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    packingFee: { type: Number, min: 0, default: 0 },
    communityDiscount: { type: Number, min: 0, default: 0 },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    acceptingOrders: { type: Boolean, default: true },
    openingTime: { type: String, default: '07:30' },
    closingTime: { type: String, default: '21:00' },
    pickupBufferMinutes: { type: Number, default: 15, min: 0 },
    activeOrdersCap: { type: Number, default: 10, min: 1 },
    autoSuggestSubstitutions: { type: Boolean, default: true },
    autoCancelExpiredPickups: { type: Boolean, default: true },
    pickupExpiryMinutes: { type: Number, default: 30, min: 5, max: 240 },
    acceptsCounterCash: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type Shop = InferSchemaType<typeof shopSchema>;
export const ShopModel = model('Shop', shopSchema);
