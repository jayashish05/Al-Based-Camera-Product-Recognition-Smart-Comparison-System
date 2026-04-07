// ============================================================
// MongoDB Connection Singleton
// ============================================================

import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "UVPS";

if (!MONGODB_URI) {
  console.warn(
    "⚠️  MONGODB_URI is not set. Database operations will fail. " +
    "Set MONGODB_URI in .env.local to connect to MongoDB Atlas."
  );
}

// Cached connection for dev hot-reload
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Extend global for Next.js hot-reload caching
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Please set it in your .env.local file."
    );
  }

  let client: MongoClient;

  if (process.env.NODE_ENV === "development") {
    // In dev, use a global variable to preserve connection across hot-reloads
    if (!global._mongoClientPromise) {
      const newClient = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = newClient.connect();
    }
    client = await global._mongoClientPromise;
  } else {
    client = await new MongoClient(MONGODB_URI).connect();
  }

  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  console.log("✅ Connected to MongoDB Atlas");
  return { client, db };
}

export async function getCollection(name: string) {
  const { db } = await connectToDatabase();
  return db.collection(name);
}
