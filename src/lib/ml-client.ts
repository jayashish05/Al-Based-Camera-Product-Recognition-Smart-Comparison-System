// ============================================================
// ML Service Client — Enhanced
// ============================================================

import type { MLIdentifyResponse } from "./types";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

/**
 * Call the Python ML microservice to identify a product from an image.
 * No more random fallback — returns "Unknown" if ML service is down.
 */
export async function identifyProduct(
  imageBase64: string
): Promise<MLIdentifyResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s for first load

    const response = await fetch(`${ML_SERVICE_URL}/ml/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const data = await response.json();

    return {
      product_name: data.product_name || "Unknown Product",
      brand: data.brand || "Unknown",
      category: data.category || "Other",
      confidence: data.confidence || 0,
      raw_text: data.raw_text || "",
      sub_category: data.sub_category || data.category || "Other",
    };
  } catch (error) {
    console.error(
      "❌ ML service error:",
      error instanceof Error ? error.message : error
    );

    // Return honest "unknown" instead of fake random data
    return {
      product_name: "Unrecognized Product",
      brand: "Unknown",
      category: "Other",
      confidence: 0,
      raw_text: "",
      sub_category: "Unknown",
    };
  }
}
