// ============================================================
// GET /api/product/[id] — Get full scan details by ID
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection("scans");
    const doc = await collection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: { capturedImage: 0 }, // Exclude raw image from response
      }
    );

    if (!doc) {
      return NextResponse.json(
        { error: "Scan not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt
        ? new Date(doc.createdAt).toISOString()
        : new Date().toISOString(),
    });
  } catch (error) {
    console.error("[PRODUCT] Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
