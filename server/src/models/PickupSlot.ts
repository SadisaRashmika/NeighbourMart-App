import { model, Schema, type InferSchemaType } from 'mongoose';

const pickupSlotSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    booked: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

pickupSlotSchema.index({ shop: 1, date: 1, startTime: 1 }, { unique: true });

export type PickupSlot = InferSchemaType<typeof pickupSlotSchema>;
export const PickupSlotModel = model('PickupSlot', pickupSlotSchema);
