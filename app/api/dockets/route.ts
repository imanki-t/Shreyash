import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Docket } from "@/models/Docket";
import { DEFAULT_DOCKETS } from "@/lib/defaultDockets";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ dockets: DEFAULT_DOCKETS });
    }

    const customDockets = await Docket.find({}).sort({ createdAt: 1 }).lean();
    
    // Combine defaults and custom
    const existingSlugs = new Set(customDockets.map((d: any) => d.slug));
    const combined = [
      ...DEFAULT_DOCKETS.filter((d) => !existingSlugs.has(d.slug)),
      ...customDockets,
    ];

    return NextResponse.json({ dockets: combined });
  } catch (error: any) {
    console.error("[API DOCKETS GET ERROR]", error);
    return NextResponse.json({ dockets: DEFAULT_DOCKETS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Guests cannot create communities. Please sign in to participate." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, classificationDefault, isPrivate, bannerUrl, iconUrl } = body;

    if (!name) {
      return NextResponse.json({ error: "Community name required." }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    await connectToDatabase();

    const count = await Docket.countDocuments();
    const docketNumber = `Docket 0${count + 6}`;

    const newDocket = await Docket.create({
      docketNumber,
      name,
      slug,
      description: description || "Community discussions and media archive.",
      classificationDefault: classificationDefault || "PUBLIC",
      isPrivate: Boolean(isPrivate),
      bannerUrl: bannerUrl || undefined,
      iconUrl: iconUrl || undefined,
    });

    return NextResponse.json({ success: true, docket: newDocket }, { status: 201 });
  } catch (error: any) {
    console.error("[API DOCKETS POST ERROR]", error);
    return NextResponse.json({ error: "Failed to open new docket." }, { status: 500 });
  }
}
