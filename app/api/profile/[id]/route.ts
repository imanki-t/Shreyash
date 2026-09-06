import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { ADMIN_EMAIL } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams.id;
    if (!rawId) {
      return NextResponse.json({ error: "Missing operative identifier" }, { status: 400 });
    }

    const decodedId = decodeURIComponent(rawId);
    const escaped = decodedId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({
        profile: {
          codename: decodedId,
          name: decodedId,
          totalPosts: 0,
          totalStamps: 0,
          totalReactions: 0,
          totalViews: 0,
          dockets: [],
          firstActive: new Date().toISOString(),
          clearanceTier: "FIELD OPERATIVE // LEVEL 2",
        },
      });
    }

    const posts = await Post.find({
      isDeleted: false,
      $or: [
        { "author.codename": { $regex: `^${escaped}$`, $options: "i" } },
        { "author.name": { $regex: `^${escaped}$`, $options: "i" } },
        { "author.email": { $regex: `^${escaped}$`, $options: "i" } },
      ],
    }).lean();

    let authorName = decodedId;
    let authorCodename = decodedId;
    let authorEmail: string | undefined = undefined;
    let totalVerifiedStamps = 0;
    let totalCorroborations = 0;
    let totalReactions = 0;
    let totalViews = 0;
    const docketsSet = new Set<string>();
    let earliestDate: Date | null = null;

    for (const p of posts as any[]) {
      if (p.author?.name && authorName === decodedId) authorName = p.author.name;
      if (p.author?.codename && authorCodename === decodedId) authorCodename = p.author.codename;
      if (p.author?.email && !authorEmail) authorEmail = p.author.email;

      if (p.docketName) docketsSet.add(p.docketName);

      if (p.stamps) {
        totalVerifiedStamps += (p.stamps.verifiedAccurate || 0);
        totalCorroborations += (p.stamps.corroborated || 0);
      }
      if (p.emojis) {
        totalReactions += (p.emojis.thumbsUp || 0) + (p.emojis.laugh || 0) + (p.emojis.heart || 0) + (p.emojis.skull || 0);
      }
      if (p.engagement?.views) {
        totalViews += p.engagement.views;
      }

      const pDate = new Date(p.createdAt);
      if (!earliestDate || pDate < earliestDate) {
        earliestDate = pDate;
      }
    }

    const isMasterAdmin =
      authorEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      decodedId.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      decodedId.toLowerCase() === "admin";

    const clearanceTier = isMasterAdmin
      ? "LEAD DIRECTORATE // MASTER CLEARANCE"
      : posts.length > 5
      ? "SENIOR INVESTIGATIVE AGENT // LEVEL 3"
      : "FIELD OPERATIVE // LEVEL 2";

    return NextResponse.json({
      success: true,
      profile: {
        codename: authorCodename,
        name: authorName,
        email: authorEmail,
        isMasterAdmin,
        clearanceTier,
        totalPosts: posts.length,
        totalVerifiedStamps,
        totalCorroborations,
        totalReactions,
        totalViews,
        dockets: Array.from(docketsSet),
        firstActive: earliestDate ? earliestDate.toISOString() : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[API PROFILE ERROR]", error);
    return NextResponse.json({ error: "Failed to load operative profile." }, { status: 500 });
  }
}
