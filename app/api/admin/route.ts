import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { ADMIN_EMAIL } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail || userEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized. Lead Directorate clearance required." }, { status: 403 });
    }

    await connectToDatabase();
    const redactedCases = await Post.find({ isRedacted: true, isDeleted: false }).sort({ updatedAt: -1 }).lean();
    const totalCases = await Post.countDocuments({ isDeleted: false });
    const allRecentCases = await Post.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(20).lean();

    return NextResponse.json({
      redactedCases,
      totalCases,
      allRecentCases,
      adminEmail: ADMIN_EMAIL,
    });
  } catch (error: any) {
    console.error("[API ADMIN GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch admin stats." }, { status: 500 });
  }
}
