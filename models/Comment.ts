import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  caseId: string;
  parentId?: string;
  authorName: string;
  authorCodename: string;
  authorEmail?: string;
  isAnonymous: boolean;
  content: string;
  score: number;
  userVotes: Array<{ userId: string; vote: number }>;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    caseId: { type: String, required: true, index: true },
    parentId: { type: String, index: true },
    authorName: { type: String, required: true },
    authorCodename: { type: String, required: true },
    authorEmail: { type: String },
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true },
    score: { type: Number, default: 1 },
    userVotes: [
      {
        userId: { type: String, required: true },
        vote: { type: Number, required: true, enum: [1, -1] },
      },
    ],
  },
  { timestamps: true }
);

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
