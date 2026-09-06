import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId, type, key, score } = body;

    if (!caseId || !type) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findOne({
      $or: [{ _id: caseId.match(/^[0-9a-fA-F]{24}$/) ? caseId : null }, { caseNumber: caseId }],
    });

    if (!post) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    if (type === "stamp") {
      if (key in post.stamps) {
        (post.stamps as any)[key] = ((post.stamps as any)[key] || 0) + 1;
        await post.save();
        return NextResponse.json({ success: true, stamps: post.stamps });
      }
    }

    if (type === "emoji") {
      if (key in post.emojis) {
        (post.emojis as any)[key] = ((post.emojis as any)[key] || 0) + 1;
        await post.save();
        return NextResponse.json({ success: true, emojis: post.emojis });
      }
    }

    if (type === "rating") {
      const numScore = Math.max(1, Math.min(5, Number(score) || 5));
      post.ratings.totalScore = (post.ratings.totalScore || 0) + numScore;
      post.ratings.count = (post.ratings.count || 0) + 1;
      post.ratings.average = Number((post.ratings.totalScore / post.ratings.count).toFixed(1));
      await post.save();
      return NextResponse.json({ success: true, ratings: post.ratings });
    }

    return NextResponse.json({ error: "Invalid reaction type." }, { status: 400 });
  } catch (error: any) {
    console.error("[API REACTION ERROR]", error);
    return NextResponse.json({ error: "Failed to record reaction." }, { status: 500 });
  }
}
