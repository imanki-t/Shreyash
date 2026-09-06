import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Guests cannot vote or react. Please sign in to participate." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { caseId, type = "vote", delta, field } = body;

    if (!caseId) {
      return NextResponse.json({ error: "caseId is required." }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findOne({
      $or: [{ _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null }, { caseNumber: caseId }],
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const userId = session.user.email || (session.user as any).codename || session.user.name || "user";

    // Initialize userVotes array if not present
    if (!post.userVotes) {
      post.userVotes = [];
    }

    // Determine target vote value: 1 (upvote) or -1 (downvote)
    const targetVote: 1 | -1 = delta === -1 || field === "thumbsDown" ? -1 : 1;
    const existingIndex = post.userVotes.findIndex((v) => v.userId === userId);

    let newUserVote: 1 | -1 | 0 = 0;

    if (existingIndex >= 0) {
      if (post.userVotes[existingIndex].vote === targetVote) {
        // User clicked the same vote button again -> remove vote (neutral)
        post.userVotes.splice(existingIndex, 1);
        newUserVote = 0;
      } else {
        // User switched vote from up to down or down to up
        post.userVotes[existingIndex].vote = targetVote;
        newUserVote = targetVote;
      }
    } else {
      // First time voting on this post
      post.userVotes.push({ userId, vote: targetVote });
      newUserVote = targetVote;
    }

    // Recalculate tally directly from single-vote source of truth
    const upCount = post.userVotes.filter((v) => v.vote === 1).length;
    const downCount = post.userVotes.filter((v) => v.vote === -1).length;

    post.emojis.thumbsUp = upCount;
    post.emojis.thumbsDown = downCount;

    await post.save();

    return NextResponse.json({
      success: true,
      userVote: newUserVote,
      upvotes: upCount,
      downvotes: downCount,
      totalScore: upCount - downCount,
    });
  } catch (error: any) {
    console.error("[API REACTION ERROR]", error);
    return NextResponse.json({ error: "Failed to record vote." }, { status: 500 });
  }
}
