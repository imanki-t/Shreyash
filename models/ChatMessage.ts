import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage extends Document {
  sender: {
    name: string;
    email?: string;
    codename: string;
    image?: string;
  };
  channelId: string;
  recipientCodename?: string;
  text: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      name: { type: String, required: true },
      email: { type: String },
      codename: { type: String, required: true },
      image: { type: String },
    },
    channelId: { type: String, default: "general", index: true },
    recipientCodename: { type: String, index: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
