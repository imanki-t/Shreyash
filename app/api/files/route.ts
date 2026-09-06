import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, getGridFSBucket } from "@/lib/mongodb";
import { Post, IAttachment } from "@/models/Post";
import bcrypt from "bcryptjs";
import sanitizeHtml from "sanitize-html";
import { DEFAULT_DOCKETS } from "@/lib/defaultDockets";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { AIRankingEngine, PostInput } from "@/ai-ranking-engine";

const rankingEngine = new AIRankingEngine();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const docket = searchParams.get("docket");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "ai";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({
        cases: [],
        total: 0,
        page,
        notice: "Repository database offline or MONGODB_URI not configured.",
      });
    }

    const query: any = { isDeleted: false };
    if (docket && docket !== "all") {
      query.docketSlug = docket;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { debriefNarrative: { $regex: search, $options: "i" } },
        { caseNumber: { $regex: search, $options: "i" } },
        { "author.codename": { $regex: search, $options: "i" } },
      ];
    }

    const rawCases = await Post.find(query).lean();
    let finalCases = [...rawCases];

    if (sort === "ai" && rawCases.length > 0) {
      const inputs: PostInput[] = rawCases.map((c: any) => ({
        id: c._id.toString(),
        caseNumber: c.caseNumber || "",
        title: c.title || "",
        docketSlug: c.docketSlug || "",
        classificationTier: c.classificationTier || "RESTRICTED",
        debriefNarrative: c.debriefNarrative || "",
        createdAt: c.createdAt,
        attachmentsCount: c.attachments?.length || 0,
        hasVideo: Boolean(c.attachments?.some((a: any) => a.mediaType === "video")),
        hasAudio: Boolean(c.attachments?.some((a: any) => a.mediaType === "audio")),
        hasImage: Boolean(c.attachments?.some((a: any) => a.mediaType === "image")),
        stamps: {
          verifiedAccurate: c.stamps?.verifiedAccurate || 0,
          corroborated: c.stamps?.corroborated || 0,
          flaggedAnomaly: c.stamps?.flaggedAnomaly || 0,
          discrepancyDetected: c.stamps?.discrepancyDetected || 0,
        },
        emojis: {
          thumbsUp: c.emojis?.thumbsUp || 0,
          thumbsDown: c.emojis?.thumbsDown || 0,
          laugh: c.emojis?.laugh || 0,
          skull: c.emojis?.skull || 0,
          heart: c.emojis?.heart || 0,
        },
        ratings: {
          average: c.ratings?.average || 0,
          count: c.ratings?.count || 0,
          totalScore: c.ratings?.totalScore || 0,
        },
        authorCodename: c.author?.codename || "Operative",
        isAnonymous: Boolean(c.author?.isAnonymous),
        isRedacted: Boolean(c.isRedacted),
        engagement: {
          views: c.engagement?.views || 0,
          totalDwellSeconds: c.engagement?.totalDwellSeconds || 0,
          scrollDepthCount: c.engagement?.scrollDepthCount || 0,
        },
      }));

      const rankingResponse = rankingEngine.rank({
        posts: inputs,
        topK: limit * page,
        applyDiversity: true,
      });

      const scoreMap = new Map<string, any>();
      for (const r of rankingResponse.rankedPosts) {
        scoreMap.set(r.postId, r);
      }

      finalCases.sort((a: any, b: any) => {
        const scoreA = scoreMap.get(a._id.toString())?.finalScore || 0;
        const scoreB = scoreMap.get(b._id.toString())?.finalScore || 0;
        return scoreB - scoreA;
      });

      for (const c of finalCases as any[]) {
        const rankInfo = scoreMap.get(c._id.toString());
        if (rankInfo) {
          c.aiRank = rankInfo.rank;
          c.aiScore = Math.round(rankInfo.finalScore * 100);
          c.aiContributions = rankInfo.featureContributions;
        }
      }
    } else if (sort === "date_asc") {
      finalCases.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      finalCases.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = finalCases.length;
    const paginatedCases = finalCases.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ cases: paginatedCases, total, page, limit });
  } catch (error: any) {
    console.error("[API FILES GET ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch repository cases." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const recaptchaToken = formData.get("recaptchaToken") as string;
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: recaptchaResult.error || "Anti-automation bot verification failed." },
        { status: 403 }
      );
    }

    const title = formData.get("title") as string;
    const docketSlug = formData.get("docketSlug") as string;
    const classificationTier = (formData.get("classificationTier") as string) || "RESTRICTED";
    const debriefNarrative = formData.get("debriefNarrative") as string;
    const authorName = (formData.get("authorName") as string) || "Operative";
    const authorCodename = (formData.get("authorCodename") as string) || "Masked Operative";
    const authorEmail = (formData.get("authorEmail") as string) || undefined;
    const isAnonymous = formData.get("isAnonymous") === "true";
    const passkey = formData.get("passkey") as string;

    if (!title || !docketSlug || !debriefNarrative) {
      return NextResponse.json(
        { error: "Missing required fields: Title, Docket, or Narrative." },
        { status: 400 }
      );
    }

    const transformedNarrative = debriefNarrative.replace(
      /<\/\s*([\s\S]*?)\s*\\>/g,
      '<span class="classified-spoiler" data-spoiler="true" role="button" tabindex="0" title="Classified Redaction: Click to Decrypt">$1</span>'
    );

    const sanitizedNarrative = sanitizeHtml(transformedNarrative, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "span", "b", "i", "u", "s", "mark", "pre", "code"]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        span: ["class", "data-*", "role", "tabindex", "title"],
        mark: ["class"],
      },
    });

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json(
        { error: "Database not connected. Please check MONGODB_URI credentials." },
        { status: 503 }
      );
    }

    const bucket = await getGridFSBucket();
    const attachments: IAttachment[] = [];

    const fileEntries = formData.getAll("attachments") as File[];
    for (const file of fileEntries) {
      if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
        let mediaType: "video" | "audio" | "image" | "document" = "document";
        const type = file.type.toLowerCase();
        if (type.startsWith("video/")) mediaType = "video";
        else if (type.startsWith("audio/")) mediaType = "audio";
        else if (type.startsWith("image/")) mediaType = "image";

        if (bucket) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadStream = bucket.openUploadStream(file.name, {
            metadata: { contentType: file.type || "application/octet-stream" },
          });

          await new Promise<void>((resolve, reject) => {
            uploadStream.on("finish", () => resolve());
            uploadStream.on("error", (err) => reject(err));
            uploadStream.end(buffer);
          });

          attachments.push({
            fileId: uploadStream.id.toString(),
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            mediaType,
          });
        }
      }
    }

    let passkeyHash: string | undefined = undefined;
    if (passkey) {
      passkeyHash = await bcrypt.hash(passkey, 10);
    }

    const docketObj = DEFAULT_DOCKETS.find((d) => d.slug === docketSlug);
    const docketName = docketObj ? docketObj.name : docketSlug;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseNumber = `INC-2006-${randomSuffix}`;

    const newPost = await Post.create({
      caseNumber,
      title,
      docketSlug,
      docketName,
      classificationTier,
      debriefNarrative: sanitizedNarrative,
      author: {
        name: isAnonymous ? "Masked Operative" : authorName,
        email: authorEmail,
        codename: authorCodename,
        isAnonymous,
      },
      passkeyHash,
      attachments,
      stamps: { verifiedAccurate: 0, corroborated: 0, flaggedAnomaly: 0, discrepancyDetected: 0 },
      emojis: { thumbsUp: 0, thumbsDown: 0, laugh: 0, skull: 0, heart: 0 },
      ratings: { totalScore: 0, count: 0, average: 0 },
      amendments: [],
      engagement: {
        views: 0,
        totalDwellSeconds: 0,
        scrollDepthCount: 0,
      },
      reports: [],
      isRedacted: false,
      isDeleted: false,
    });

    return NextResponse.json({ success: true, case: newPost }, { status: 201 });
  } catch (error: any) {
    console.error("[API FILES POST ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to lodge case record." }, { status: 500 });
  }
}
