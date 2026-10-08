import { model, Schema, type InferSchemaType } from 'mongoose';

const reminderItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: true }
);

const pickupReminderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: { type: [reminderItemSchema], default: [] },
  },
  { timestamps: true }
);

export type PickupReminder = InferSchemaType<typeof pickupReminderSchema>;
export const PickupReminderModel = model('PickupReminder', pickupReminderSchema);
