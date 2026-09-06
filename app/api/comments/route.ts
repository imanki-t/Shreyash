import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
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
    return NextResponse.json({ error: "Failed to fetch field notes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { caseId, authorName, authorCodename, authorEmail, isAnonymous, content } = body;

    if (!caseId || !content) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ["b", "i", "u", "span", "code", "mark"],
      allowedAttributes: { span: ["class"] },
    });

    await connectToDatabase();
    const comment = await Comment.create({
      caseId,
      authorName: isAnonymous ? "Masked Operative" : (authorName || "Field Agent"),
      authorCodename: authorCodename || "Investigator",
      authorEmail,
      isAnonymous: !!isAnonymous,
      content: sanitizedContent,
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error: any) {
    console.error("[API COMMENTS POST ERROR]", error);
    return NextResponse.json({ error: "Failed to record field note." }, { status: 500 });
  }
}
