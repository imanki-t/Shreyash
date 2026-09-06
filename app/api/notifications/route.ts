import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codename = searchParams.get("codename");

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const session = await getServerSession(authOptions);
    const targetUser =
      (session?.user as any)?.codename ||
      session?.user?.email ||
      codename ||
      "Guest";

    const notifications = await Notification.find({
      $or: [
        { recipient: targetUser },
        { recipient: "all" },
        { recipient: (session?.user as any)?.codename || "" },
        { recipient: session?.user?.email || "" },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, notifications: [], unreadCount: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, codename } = body;

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    const targetUser =
      (session?.user as any)?.codename ||
      session?.user?.email ||
      codename ||
      "Guest";

    if (action === "mark_all_read") {
      await Notification.updateMany(
        {
          $or: [
            { recipient: targetUser },
            { recipient: "all" },
            { recipient: (session?.user as any)?.codename || "" },
            { recipient: session?.user?.email || "" },
          ],
          isRead: false,
        },
        { $set: { isRead: true } }
      );
      return NextResponse.json({ success: true });
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { $set: { isRead: true } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    const targetUser =
      (session?.user as any)?.codename ||
      session?.user?.email ||
      "Guest";

    await Notification.deleteMany({
      $or: [
        { recipient: targetUser },
        { recipient: (session?.user as any)?.codename || "" },
        { recipient: session?.user?.email || "" },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
