import { model, Schema, type InferSchemaType } from 'mongoose';

const shopSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    acceptingOrders: { type: Boolean, default: true },
    packingFee: { type: Number, min: 0, default: 0 },
    communityDiscount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

export type Shop = InferSchemaType<typeof shopSchema>;
export const ShopModel = model('Shop', shopSchema);
