import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getGridFSBucket } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bucket = await getGridFSBucket();

    if (!bucket) {
      return NextResponse.json(
        { error: "Database storage engine unavailable." },
        { status: 503 }
      );
    }

    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Invalid record identifier." }, { status: 400 });
    }

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Evidence file not found in repository." }, { status: 404 });
    }

    const file = files[0];
    const contentType = (file as any).metadata?.contentType || (file as any).contentType || "application/octet-stream";
    const fileSize = file.length;

    const rangeHeader = req.headers.get("range");

    if (rangeHeader && (contentType.startsWith("video/") || contentType.startsWith("audio/"))) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const downloadStream = bucket.openDownloadStream(objectId, {
        start,
        end: end + 1,
      });

      const readableWebStream = new ReadableStream({
        start(controller) {
          downloadStream.on("data", (chunk) => controller.enqueue(chunk));
          downloadStream.on("end", () => controller.close());
          downloadStream.on("error", (err) => controller.error(err));
        },
      });

      return new NextResponse(readableWebStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const downloadStream = bucket.openDownloadStream(objectId);
    const readableWebStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => controller.enqueue(chunk));
        downloadStream.on("end", () => controller.close());
        downloadStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readableWebStream, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      },
    });
  } catch (error: any) {
    console.error("[GRIDFS STREAM ERROR]", error);
    return NextResponse.json({ error: "Failed to stream media asset." }, { status: 500 });
  }
}
