import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Comment } from "@/models/Comment";
import { Notification } from "@/models/Notification";
import { ChatMessage } from "@/models/ChatMessage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    const userEmail = session.user.email || "";
    const userCodename = (session.user as any).codename || session.user.name || "";

    const authorQuery = {
      $or: [
        { "author.email": userEmail },
        { "author.codename": userCodename },
      ],
    };

    if (action === "delete_all_posts") {
      const result = await Post.updateMany(authorQuery, {
        $set: { isDeleted: true },
      });

      // Also clean up user notifications
      await Notification.deleteMany({
        $or: [{ recipient: userEmail }, { recipient: userCodename }],
      });

      return NextResponse.json({
        success: true,
        message: `Successfully purged ${result.modifiedCount} posts and associated data.`,
        deletedCount: result.modifiedCount,
      });
    }

    if (action === "purge_account") {
      const postsResult = await Post.updateMany(authorQuery, {
        $set: { isDeleted: true },
      });
      await Comment.deleteMany({
        $or: [{ author: userCodename }, { author: userEmail }],
      });
      await Notification.deleteMany({
        $or: [{ recipient: userEmail }, { recipient: userCodename }],
      });
      await ChatMessage.deleteMany({
        $or: [{ "sender.email": userEmail }, { "sender.codename": userCodename }],
      });

      return NextResponse.json({
        success: true,
        message: "All user posts, comments, notifications, and chat records purged successfully.",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
