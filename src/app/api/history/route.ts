// ============================================================
// GET /api/history — Retrieve scan history
// ============================================================

import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { HistoryItem } from "@/lib/types";

export async function GET() {
  try {
    const collection = await getCollection("scans");

    const docs = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .project({
        "product.name": 1,
        "product.brand": 1,
        "product.category": 1,
        "product.confidence": 1,
        "product.image": 1,
        createdAt: 1,
      })
      .toArray();

    const items: HistoryItem[] = docs.map((doc) => ({
      _id: doc._id.toString(),
      productName: doc.product?.name || "Unknown Product",
      brand: doc.product?.brand || "Unknown",
      category: doc.product?.category || "Other",
      confidence: doc.product?.confidence || 0,
      thumbnail: doc.product?.image || null,
      createdAt: doc.createdAt
        ? new Date(doc.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("[HISTORY] Error fetching history:", error);

    // If MongoDB is not configured, return empty list gracefully
    if (
      error instanceof Error &&
      error.message.includes("MONGODB_URI")
    ) {
      return NextResponse.json({ items: [], total: 0 });
    }

    return NextResponse.json(
      { error: "Failed to fetch scan history", code: "DB_ERROR" },
      { status: 500 }
    );
  }
}
