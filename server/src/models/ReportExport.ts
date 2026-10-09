import { model, Schema, type InferSchemaType } from 'mongoose';

const reportExportSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    period: { type: String, enum: ['today', 'week', 'month'], required: true },
    sales: { type: Number, required: true, min: 0 },
    orders: { type: Number, required: true, min: 0 },
    csv: { type: String, required: true },
  },
  { timestamps: true }
);

export type ReportExport = InferSchemaType<typeof reportExportSchema>;
export const ReportExportModel = model('ReportExport', reportExportSchema);
