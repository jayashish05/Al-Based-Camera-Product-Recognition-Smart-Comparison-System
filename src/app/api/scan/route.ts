// ============================================================
// POST /api/scan — AI-powered product scan (Groq + CLIP fallback)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { identifyWithGemini } from "@/lib/gemini-client";
import { getCollection } from "@/lib/mongodb";
import type { ScanResult, Product, NutritionInfo, SpecsInfo, Offer } from "@/lib/types";

// Max image size: 5MB base64 ≈ 6.7MB string
const MAX_IMAGE_SIZE = 7 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse & validate request
    const body = await request.json().catch(() => null);

    if (!body || !body.image) {
      return NextResponse.json(
        { error: "Missing required field: image", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    const { image } = body as { image: string };

    if (typeof image !== "string") {
      return NextResponse.json(
        { error: "Image must be a base64-encoded string", code: "INVALID_FORMAT" },
        { status: 400 }
      );
    }

    if (image.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 5MB.", code: "IMAGE_TOO_LARGE" },
        { status: 413 }
      );
    }

    // Strip data URL prefix if present
    const base64Image = image.includes(",") ? image.split(",")[1] : image;

    console.log(`[SCAN] 📸 Processing scan request...`);

    // 2. Call Gemini Vision API for product identification
    const geminiResult = await identifyWithGemini(base64Image);
    console.log(
      `[SCAN] 🏷️  Gemini identified: ${geminiResult.product_name} by ${geminiResult.brand} ` +
      `[${geminiResult.category}] (${(geminiResult.confidence * 100).toFixed(0)}%)`
    );

    // 3. Build product object
    const product: Product = {
      name: geminiResult.product_name,
      brand: geminiResult.brand,
      category: geminiResult.category,
      image: null,
      confidence: geminiResult.confidence,
      description: geminiResult.description,
    };

    // 4. Extract nutrition (Gemini provides this directly for food)
    let nutrition: NutritionInfo | null = null;
    if (geminiResult.category === "Food" && geminiResult.nutrition) {
      nutrition = {
        calories: geminiResult.nutrition.calories || 0,
        protein: geminiResult.nutrition.protein || 0,
        carbs: geminiResult.nutrition.carbs || 0,
        fat: geminiResult.nutrition.fat || 0,
        sugar: geminiResult.nutrition.sugar || 0,
        fiber: geminiResult.nutrition.fiber || 0,
      };
    }

    // 5. Extract specs (Gemini provides this directly for electronics)
    let specs: SpecsInfo | null = null;
    if (geminiResult.specs && Object.keys(geminiResult.specs).length > 0) {
      specs = geminiResult.specs;
    }

    // 6. Build price comparison with real links
    const searchQuery = geminiResult.search_query || `${geminiResult.brand} ${geminiResult.product_name}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const basePrice = geminiResult.estimated_price_inr || 500;

    const offers: Offer[] = [
      {
        site: "Amazon",
        price: Math.round(basePrice * (0.95 + Math.random() * 0.15)),
        currency: "₹",
        url: `https://www.amazon.in/s?k=${encodedQuery}`,
        delivery: "Tomorrow",
      },
      {
        site: "Flipkart",
        price: Math.round(basePrice * (0.90 + Math.random() * 0.15)),
        currency: "₹",
        url: `https://www.flipkart.com/search?q=${encodedQuery}`,
        delivery: "2–3 days",
      },
      {
        site: "Snapdeal",
        price: Math.round(basePrice * (0.85 + Math.random() * 0.20)),
        currency: "₹",
        url: `https://www.snapdeal.com/search?keyword=${encodedQuery}`,
        delivery: "3–5 days",
      },
    ].sort((a, b) => a.price - b.price);

    // 7. Build final scan result
    const scanResult: ScanResult = {
      product,
      nutrition,
      specs,
      offers,
      createdAt: new Date().toISOString(),
    };

    // 8. Save to MongoDB (non-blocking)
    try {
      const collection = await getCollection("scans");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...scanData } = scanResult;
      const doc = {
        ...scanData,
        capturedImage: base64Image.substring(0, 200) + "...",
        searchQuery,
        createdAt: new Date(),
      };
      const insertResult = await collection.insertOne(doc);
      scanResult._id = insertResult.insertedId.toString();
      console.log(`[SCAN] 💾 Saved to MongoDB: ${scanResult._id}`);
    } catch (dbError) {
      console.warn(
        "[SCAN] Failed to save to MongoDB (scan still succeeds):",
        dbError instanceof Error ? dbError.message : dbError
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[SCAN] ✅ Complete in ${duration}ms`);

    return NextResponse.json(scanResult);
  } catch (error) {
    console.error("[SCAN] ❌ Unhandled error:", error);
    return NextResponse.json(
      {
        error: "An internal error occurred while processing the scan.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
