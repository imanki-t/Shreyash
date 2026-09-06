import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipient: string;
  actor: {
    codename: string;
    image?: string;
  };
  type: "upvote" | "comment" | "reply" | "award" | "system" | "welcome";
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: String, required: true, index: true },
    actor: {
      codename: { type: String, required: true },
      image: { type: String },
    },
    type: {
      type: String,
      enum: ["upvote", "comment", "reply", "award", "system", "welcome"],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "/home" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
