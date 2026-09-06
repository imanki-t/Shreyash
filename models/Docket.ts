import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocket extends Document {
  docketNumber: string;
  name: string;
  slug: string;
  description: string;
  classificationDefault: string;
  isPrivate?: boolean;
  bannerUrl?: string;
  iconUrl?: string;
  creatorEmail?: string;
}

const DocketSchema = new Schema<IDocket>(
  {
    docketNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    classificationDefault: { type: String, default: "RESTRICTED" },
    isPrivate: { type: Boolean, default: false },
    bannerUrl: { type: String },
    iconUrl: { type: String },
    creatorEmail: { type: String },
  },
  { timestamps: true }
);

export const Docket: Model<IDocket> =
  mongoose.models.Docket || mongoose.model<IDocket>("Docket", DocketSchema);
