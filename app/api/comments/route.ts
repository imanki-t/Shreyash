import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sanitizeHtml from "sanitize-html";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json({ error: "caseId parameter required." }, { status: 400 });
    }

    await connectToDatabase();
    const comments = await Comment.find({ caseId }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("[API COMMENTS GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch comments." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Guests cannot post comments. Please sign in to participate." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { caseId, parentId, content, action, commentId, delta } = body;

    await connectToDatabase();

    // Handle comment voting
    if (action === "vote") {
      if (!commentId) {
        return NextResponse.json({ error: "commentId required for voting." }, { status: 400 });
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return NextResponse.json({ error: "Comment not found." }, { status: 404 });
      }

      const userId = session.user.email || (session.user as any).codename || "user";
      if (!comment.userVotes) comment.userVotes = [];

      const targetVote: 1 | -1 = delta === -1 ? -1 : 1;
      const existingIndex = comment.userVotes.findIndex((v) => v.userId === userId);

      let userVote: 1 | -1 | 0 = 0;
      if (existingIndex >= 0) {
        if (comment.userVotes[existingIndex].vote === targetVote) {
          comment.userVotes.splice(existingIndex, 1);
          userVote = 0;
        } else {
          comment.userVotes[existingIndex].vote = targetVote;
          userVote = targetVote;
        }
      } else {
        comment.userVotes.push({ userId, vote: targetVote });
        userVote = targetVote;
      }

      const upVotes = comment.userVotes.filter((v) => v.vote === 1).length;
      const downVotes = comment.userVotes.filter((v) => v.vote === -1).length;
      comment.score = 1 + (upVotes - downVotes);
      await comment.save();

      return NextResponse.json({ success: true, userVote, score: comment.score });
    }

    // Creating a comment / reply
    if (!caseId || !content || !content.trim()) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const sanitizedContent = sanitizeHtml(content.trim(), {
      allowedTags: ["b", "i", "u", "span", "code", "mark", "a"],
      allowedAttributes: { span: ["class"], a: ["href", "target"] },
    });

    const authorName = session.user.name || "Community Member";
    const authorCodename = (session.user as any).codename || session.user.name || "User";
    const authorEmail = session.user.email || undefined;

    const comment = await Comment.create({
      caseId,
      parentId: parentId || undefined,
      authorName,
      authorCodename,
      authorEmail,
      isAnonymous: false,
      content: sanitizedContent,
      score: 1,
      userVotes: [{ userId: authorEmail || authorCodename, vote: 1 }],
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error: any) {
    console.error("[API COMMENTS POST ERROR]", error);
    return NextResponse.json({ error: "Failed to submit comment." }, { status: 500 });
  }
}
