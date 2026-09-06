import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ADMIN_EMAIL } from "@/lib/auth";

const dataFilePath = path.join(process.cwd(), "data", "shreyash_identity.json");

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ error: "Identity file not found." }, { status: 404 });
    }
    const rawData = fs.readFileSync(dataFilePath, "utf8");
    const identity = JSON.parse(rawData);
    return NextResponse.json({ identity });
  } catch (error: any) {
    console.error("[API IDENTITY GET ERROR]", error);
    return NextResponse.json({ error: "Failed to read identity dossier." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, identityData } = body;

    const isAuthorized =
      (userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
      body.masterKey === process.env.ADMIN_MASTER_KEY;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access denied. Only Lead Directorate clearance (imitsankit@gmail.com) may alter the master dossier." },
        { status: 403 }
      );
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(identityData, null, 2), "utf8");
    return NextResponse.json({ success: true, message: "Subject dossier updated successfully." });
  } catch (error: any) {
    console.error("[API IDENTITY PUT ERROR]", error);
    return NextResponse.json({ error: "Failed to update identity record." }, { status: 500 });
  }
}
