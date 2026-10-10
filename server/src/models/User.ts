import { model, Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    location: { type: String, required: true, trim: true },
    avatarUrl: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    pickupTime: { type: String, trim: true },
    pickupInstructions: { type: String, trim: true },
    allowCalls: { type: Boolean, default: false },
    selectedShopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    passwordHash: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    verificationCodeHash: { type: String, select: false },
    verificationCodeExpiresAt: { type: Date, select: false },
    passwordResetCodeHash: { type: String, select: false },
    passwordResetCodeExpiresAt: { type: Date, select: false },
    role: { type: String, enum: ['customer', 'shop'], required: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
