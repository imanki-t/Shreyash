import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // In case sendBeacon sends plain text or blob
      body = {};
    }

    const dwellSeconds = Math.max(0, Math.min(3600, Number(body.dwellSeconds) || 0));
    const scrolled = Boolean(body.scrolled);
    const scrollPercentage = Math.max(0, Math.min(100, Number(body.scrollPercentage) || 0));

    await connectToDatabase();

    const post = await Post.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseNumber: id }],
      isDeleted: false,
    });

    if (!post) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    if (!post.engagement) {
      post.engagement = {
        views: 0,
        totalDwellSeconds: 0,
        scrollDepthCount: 0,
        lastEngagedAt: new Date(),
      };
    }

    post.engagement.views = (post.engagement.views || 0) + 1;
    post.engagement.totalDwellSeconds = (post.engagement.totalDwellSeconds || 0) + dwellSeconds;
    if (scrolled || scrollPercentage >= 40) {
      post.engagement.scrollDepthCount = (post.engagement.scrollDepthCount || 0) + 1;
    }
    post.engagement.lastEngagedAt = new Date();

    await post.save();

    return NextResponse.json({
      success: true,
      metrics: {
        views: post.engagement.views,
        dwellSeconds: post.engagement.totalDwellSeconds,
        scrollDepthCount: post.engagement.scrollDepthCount,
      },
    });
  } catch (error: any) {
    console.error("[ENGAGEMENT TELEMETRY ERROR]", error);
    return NextResponse.json({ error: "Failed to record engagement metrics." }, { status: 500 });
  }
}
