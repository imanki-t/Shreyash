import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  caseId: string;
  authorName: string;
  authorCodename: string;
  authorEmail?: string;
  isAnonymous: boolean;
  content: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    caseId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorCodename: { type: String, required: true },
    authorEmail: { type: String },
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
