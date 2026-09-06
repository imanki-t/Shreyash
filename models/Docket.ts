import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocket extends Document {
  docketNumber: string;
  name: string;
  slug: string;
  description: string;
  classificationDefault: string;
}

const DocketSchema = new Schema<IDocket>(
  {
    docketNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    classificationDefault: { type: String, default: "RESTRICTED" },
  },
  { timestamps: true }
);

export const Docket: Model<IDocket> =
  mongoose.models.Docket || mongoose.model<IDocket>("Docket", DocketSchema);
