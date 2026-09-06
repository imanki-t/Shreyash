import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import bcrypt from "bcryptjs";
import sanitizeHtml from "sanitize-html";
import { ADMIN_EMAIL } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const post = await Post.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseNumber: id }],
      isDeleted: false,
    }).lean();

    if (!post) {
      return NextResponse.json({ error: "Case record not found in repository." }, { status: 404 });
    }

    return NextResponse.json({ case: post });
  } catch (error: any) {
    console.error("[API FILE DETAIL ERROR]", error);
    return NextResponse.json({ error: "Failed to retrieve case file." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, passkey, amendedBy, summary, newNarrative, userEmail } = body;

    await connectToDatabase();

    const post = await Post.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseNumber: id }],
    });

    if (!post) {
      return NextResponse.json({ error: "Case record not found." }, { status: 404 });
    }

    const isMasterAdmin = userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const isOriginalAuthor = userEmail && post.author.email && userEmail.toLowerCase() === post.author.email.toLowerCase();

    let authorized = isMasterAdmin || isOriginalAuthor;
    if (!authorized && passkey && post.passkeyHash) {
      authorized = await bcrypt.compare(passkey, post.passkeyHash);
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Insufficient security clearance or invalid agent passkey." },
        { status: 403 }
      );
    }

    if (action === "redact") {
      post.isRedacted = true;
      post.amendments.push({
        timestamp: new Date(),
        amendedBy: amendedBy || "Bureau Directorate",
        summary: summary || "Censored under Directorate Security Directive 4-B",
        previousNarrative: post.debriefNarrative,
      });
      await post.save();
      return NextResponse.json({ success: true, message: "File redacted successfully.", case: post });
    }

    if (action === "restore") {
      post.isRedacted = false;
      await post.save();
      return NextResponse.json({ success: true, message: "File restored to active record.", case: post });
    }

    if (action === "amend") {
      if (!newNarrative) {
        return NextResponse.json({ error: "New deposition narrative required." }, { status: 400 });
      }

      const transformedNarrative = newNarrative.replace(
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

      post.amendments.push({
        timestamp: new Date(),
        amendedBy: amendedBy || (isMasterAdmin ? "Lead Director Ankit" : post.author.codename),
        summary: summary || "Formal deposition amendment filed.",
        previousNarrative: post.debriefNarrative,
      });

      post.debriefNarrative = sanitizedNarrative;
      await post.save();
      return NextResponse.json({ success: true, message: "Amendment logged.", case: post });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[API FILE PATCH ERROR]", error);
    return NextResponse.json({ error: "Failed to update case file." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const passkey = searchParams.get("passkey");
    const userEmail = searchParams.get("userEmail");

    await connectToDatabase();
    const post = await Post.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { caseNumber: id }],
    });

    if (!post) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    const isMasterAdmin = userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    let authorized = isMasterAdmin;
    if (!authorized && passkey && post.passkeyHash) {
      authorized = await bcrypt.compare(passkey, post.passkeyHash);
    }

    if (!authorized) {
      return NextResponse.json({ error: "Administrative clearance required to shred." }, { status: 403 });
    }

    post.isDeleted = true;
    await post.save();

    return NextResponse.json({ success: true, message: "Record expunged from repository." });
  } catch (error: any) {
    console.error("[API FILE DELETE ERROR]", error);
    return NextResponse.json({ error: "Failed to shred case file." }, { status: 500 });
  }
}
