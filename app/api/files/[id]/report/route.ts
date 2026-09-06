import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { reason, category, reporterCodename, notes } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: "Reason for flag report is required." }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseNumber: id }],
      isDeleted: false,
    });

    if (!post) {
      return NextResponse.json({ error: "Case file not found." }, { status: 404 });
    }

    if (!post.reports) {
      post.reports = [];
    }

    post.reports.push({
      reason: reason.trim(),
      category: category || "discrepancy",
      reportedAt: new Date(),
      reporterCodename: reporterCodename || "Anonymous Operative",
      notes: notes?.trim(),
    });

    if (!post.stamps) {
      post.stamps = {
        verifiedAccurate: 0,
        corroborated: 0,
        flaggedAnomaly: 0,
        discrepancyDetected: 0,
      };
    }

    post.stamps.flaggedAnomaly = (post.stamps.flaggedAnomaly || 0) + 1;

    if (post.reports.length >= 3) {
      post.stamps.discrepancyDetected = (post.stamps.discrepancyDetected || 0) + 1;
    }

    await post.save();

    return NextResponse.json({
      success: true,
      message: "Incident anomaly report successfully logged into audit stream.",
      stamps: post.stamps,
      totalReports: post.reports.length,
    });
  } catch (error: any) {
    console.error("[REPORT SUBMISSION ERROR]", error);
    return NextResponse.json({ error: "Failed to submit incident flag report." }, { status: 500 });
  }
}
