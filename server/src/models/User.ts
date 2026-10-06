import { model, Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    location: { type: String, required: true, trim: true },
    passwordHash: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    verificationCodeHash: { type: String, select: false },
    verificationCodeExpiresAt: { type: Date, select: false },
    role: { type: String, enum: ['customer', 'shop'], required: true },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
