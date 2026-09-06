import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ChatMessage } from "@/models/ChatMessage";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId") || "general";
    const recipient = searchParams.get("recipient");

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ messages: [] });
    }

    let query: any = {};
    if (recipient) {
      query = {
        $or: [
          { recipientCodename: recipient },
          { "sender.codename": recipient },
        ],
      };
    } else {
      query = { channelId };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(60)
      .lean();

    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, channelId = "general", recipientCodename } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);

    let senderName = "Operative";
    let senderEmail = "";
    let senderCodename = "User";
    let senderImage = "";

    if (session?.user) {
      senderName = session.user.name || "Operative";
      senderEmail = session.user.email || "";
      senderImage = session.user.image || "";
      senderCodename = (session.user as any).codename || senderName.replace(/\s+/g, "_");
    } else if (body.sender) {
      senderName = body.sender.name || "Guest";
      senderCodename = body.sender.codename || "Guest";
      senderImage = body.sender.image || "";
    }

    const newMsg = await ChatMessage.create({
      sender: {
        name: senderName,
        email: senderEmail,
        codename: senderCodename,
        image: senderImage,
      },
      channelId,
      recipientCodename: recipientCodename || undefined,
      text: text.trim().slice(0, 2000),
    });

    // If direct message or specific recipient, trigger notification
    if (recipientCodename && recipientCodename !== senderCodename) {
      try {
        await Notification.create({
          recipient: recipientCodename,
          actor: {
            codename: senderCodename,
            image: senderImage,
          },
          type: "reply",
          title: `New message from u/${senderCodename}`,
          message: text.trim().slice(0, 80),
          link: "/home",
        });
      } catch {}
    }

    return NextResponse.json({ success: true, message: newMsg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
