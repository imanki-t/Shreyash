import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  bucket: mongoose.mongo.GridFSBucket | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongooseCache || {
  conn: null,
  promise: null,
  bucket: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    console.warn("[DATABASE NOTICE] MONGODB_URI environment variable is not defined. Running in mock/offline mode.");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("[DATABASE] Connected successfully to MongoDB.");
      return m;
    }).catch((err) => {
      console.error("[DATABASE ERROR] Failed to connect to MongoDB:", err.message);
      cached.promise = null;
      return null as unknown as typeof mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    return null;
  }
}

export async function getGridFSBucket(): Promise<mongoose.mongo.GridFSBucket | null> {
  const mongooseInstance = await connectToDatabase();
  if (!mongooseInstance || !mongooseInstance.connection.db) {
    return null;
  }

  if (!cached.bucket) {
    cached.bucket = new mongoose.mongo.GridFSBucket(mongooseInstance.connection.db, {
      bucketName: "evidence_media",
    });
  }

  return cached.bucket;
}
