import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachment {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  mediaType: "video" | "audio" | "image" | "document";
}

export interface IAmendment {
  timestamp: Date;
  amendedBy: string;
  summary: string;
  previousNarrative: string;
}

export interface IPost extends Document {
  caseNumber: string;
  title: string;
  docketSlug: string;
  docketName: string;
  classificationTier: string;
  debriefNarrative: string;
  author: {
    name: string;
    email?: string;
    codename: string;
    isAnonymous: boolean;
  };
  passkeyHash?: string;
  attachments: IAttachment[];
  stamps: {
    verifiedAccurate: number;
    corroborated: number;
    flaggedAnomaly: number;
    discrepancyDetected: number;
  };
  emojis: {
    thumbsUp: number;
    thumbsDown: number;
    laugh: number;
    skull: number;
    heart: number;
  };
  ratings: {
    totalScore: number;
    count: number;
    average: number;
  };
  amendments: IAmendment[];
  engagement: {
    views: number;
    totalDwellSeconds: number;
    scrollDepthCount: number;
    lastEngagedAt?: Date;
  };
  reports: Array<{
    reason: string;
    category: string;
    reportedAt: Date;
    reporterCodename?: string;
    notes?: string;
  }>;
  isRedacted: boolean;
  isDeleted: boolean;
  isPrivate?: boolean;
  flair?: string;
  userVotes?: Array<{ userId: string; vote: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  fileId: { type: String, required: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  mediaType: { type: String, enum: ["video", "audio", "image", "document"], required: true },
});

const AmendmentSchema = new Schema<IAmendment>({
  timestamp: { type: Date, default: Date.now },
  amendedBy: { type: String, required: true },
  summary: { type: String, required: true },
  previousNarrative: { type: String, required: true },
});

const PostSchema = new Schema<IPost>(
  {
    caseNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: "text" },
    docketSlug: { type: String, required: true, index: true },
    docketName: { type: String, required: true },
    classificationTier: { type: String, default: "RESTRICTED" },
    debriefNarrative: { type: String, required: true, index: "text" },
    author: {
      name: { type: String, required: true },
      email: { type: String },
      codename: { type: String, required: true },
      isAnonymous: { type: Boolean, default: false },
    },
    passkeyHash: { type: String },
    attachments: [AttachmentSchema],
    stamps: {
      verifiedAccurate: { type: Number, default: 0 },
      corroborated: { type: Number, default: 0 },
      flaggedAnomaly: { type: Number, default: 0 },
      discrepancyDetected: { type: Number, default: 0 },
    },
    emojis: {
      thumbsUp: { type: Number, default: 0 },
      thumbsDown: { type: Number, default: 0 },
      laugh: { type: Number, default: 0 },
      skull: { type: Number, default: 0 },
      heart: { type: Number, default: 0 },
    },
    ratings: {
      totalScore: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
    },
    amendments: [AmendmentSchema],
    engagement: {
      views: { type: Number, default: 0 },
      totalDwellSeconds: { type: Number, default: 0 },
      scrollDepthCount: { type: Number, default: 0 },
      lastEngagedAt: { type: Date },
    },
    reports: [
      {
        reason: { type: String, required: true },
        category: { type: String, default: "discrepancy" },
        reportedAt: { type: Date, default: Date.now },
        reporterCodename: { type: String },
        notes: { type: String },
      },
    ],
    isRedacted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false, index: true },
    flair: { type: String, default: "Discussion" },
    userVotes: [
      {
        userId: { type: String, required: true },
        vote: { type: Number, required: true, enum: [1, -1] },
      },
    ],
  },
  { timestamps: true }
);

export const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
