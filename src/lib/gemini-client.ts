// ============================================================
// AI Vision — Product Recognition
// 
// Priority: Groq (Llama 4 Scout) → Local CLIP fallback
// No Gemini. Just Groq + CLIP.
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

// Current Groq vision model (Llama 4 Scout — multimodal)
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

/** Structured product result */
export interface GeminiProductResult {
  product_name: string;
  brand: string;
  category: "Food" | "Electronics" | "Cosmetics" | "Clothing" | "Books" | "Household" | "Other";
  sub_category: string;
  description: string;
  confidence: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar?: number;
    fiber?: number;
  } | null;
  specs?: Record<string, string> | null;
  estimated_price_inr?: number;
  search_query: string;
  source: "groq" | "clip" | "fallback";
}

const SYSTEM_PROMPT = `You are a product recognition AI. Analyze the image and identify the product shown.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation):
{
  "product_name": "Full product name from the label/packaging",
  "brand": "Brand name (e.g., Samsung, Nestle, Nike). Use 'Unknown' if not identifiable",
  "category": "One of: Food, Electronics, Cosmetics, Clothing, Books, Household, Other",
  "sub_category": "Specific type (e.g., 'Smartphone', 'Chocolate Bar', 'Shampoo')",
  "description": "1-2 sentence product description",
  "confidence": 0.85,
  "nutrition": null,
  "specs": null,
  "estimated_price_inr": 500,
  "search_query": "search query to find this product online"
}

Rules:
- confidence: 0.0-1.0 based on identification certainty
- If FOOD: fill nutrition with {"calories":num,"protein":num,"carbs":num,"fat":num,"sugar":num,"fiber":num} per 100g
- If ELECTRONICS: fill specs like {"Display":"6.7 AMOLED","RAM":"12GB","Battery":"5000mAh"}
- If COSMETICS: fill specs like {"Type":"Shampoo","Volume":"200ml","Key Ingredient":"Keratin"}
- estimated_price_inr: approximate retail price in Indian Rupees
- Be specific — include model numbers, sizes, variants if visible
- ONLY return valid JSON`;

// ============================================================
// Main entry — Groq first, CLIP fallback
// ============================================================

export async function identifyWithGemini(imageBase64: string): Promise<GeminiProductResult> {
  // ── 1. Try Groq (Llama 4 Scout Vision) ──
  if (GROQ_API_KEY) {
    try {
      const result = await callGroq(imageBase64);
      if (result) return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[GROQ] ⚠️ ${msg.substring(0, 150)}`);
    }
  } else {
    console.warn("[GROQ] No GROQ_API_KEY set. Get one free at https://console.groq.com/keys");
  }

  // ── 2. Fallback: Local CLIP ML Service ──
  try {
    console.log("[CLIP] 🔄 Falling back to local CLIP service...");
    const result = await callClipService(imageBase64);
    if (result) return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[CLIP] ⚠️ ${msg.substring(0, 150)}`);
  }

  // ── 3. Everything failed ──
  return getStaticFallback();
}

// ============================================================
// Groq — Llama 4 Scout (FREE, fast, multimodal)
// ============================================================

async function callGroq(imageBase64: string): Promise<GeminiProductResult | null> {
  console.log(`[GROQ] 🔄 Sending image to ${GROQ_MODEL}...`);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: SYSTEM_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`Groq ${response.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    console.warn("[GROQ] Empty response from model");
    return null;
  }

  console.log(`[GROQ] 📝 Raw: ${text.substring(0, 150)}...`);

  const parsed = parseJSON(text);
  if (!parsed) return null;

  parsed.source = "groq";
  console.log(
    `[GROQ] ✅ ${parsed.product_name} by ${parsed.brand} [${parsed.category}] (${(parsed.confidence * 100).toFixed(0)}%)`
  );
  return parsed;
}

// ============================================================
// Local CLIP ML Service (unlimited, no API key needed)
// ============================================================

async function callClipService(imageBase64: string): Promise<GeminiProductResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${ML_SERVICE_URL}/ml/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!response.ok) throw new Error(`CLIP ${response.status}`);

    const data = await response.json();
    const productName = (data.product_name && data.product_name !== "Unknown")
      ? data.product_name
      : data.sub_category || "Unknown Product";

    console.log(`[CLIP] ✅ ${productName} [${data.category}] (${((data.confidence || 0) * 100).toFixed(0)}%)`);

    return {
      product_name: productName,
      brand: data.brand || "Unknown",
      category: validateCategory(data.category),
      sub_category: data.sub_category || data.category || "Unknown",
      description: `Identified by local AI (CLIP). Category: ${data.sub_category || data.category}.`,
      confidence: data.confidence || 0.5,
      nutrition: null,
      specs: null,
      estimated_price_inr: 500,
      search_query: `${data.brand || ""} ${productName}`.trim(),
      source: "clip",
    };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// ============================================================
// Helpers
// ============================================================

function parseJSON(text: string): GeminiProductResult | null {
  try {
    let jsonStr = text.trim();
    // Strip markdown code blocks
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "");
    }
    // Find first { and last } to handle any preamble text
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    jsonStr = jsonStr.substring(start, end + 1);

    const parsed = JSON.parse(jsonStr);
    if (!parsed.product_name || !parsed.category) return null;
    return parsed as GeminiProductResult;
  } catch (e) {
    console.warn(`[PARSE] Failed to parse response: ${e}`);
    return null;
  }
}

function validateCategory(cat: string): GeminiProductResult["category"] {
  const valid = ["Food", "Electronics", "Cosmetics", "Clothing", "Books", "Household", "Other"];
  return valid.includes(cat) ? (cat as GeminiProductResult["category"]) : "Other";
}

function getStaticFallback(): GeminiProductResult {
  return {
    product_name: "Unrecognized Product",
    brand: "Unknown",
    category: "Other",
    sub_category: "Unknown",
    description: "Could not identify the product. Make sure GROQ_API_KEY is set in .env.local, or run the CLIP service (cd ml-service && python app.py).",
    confidence: 0,
    nutrition: null,
    specs: null,
    estimated_price_inr: 0,
    search_query: "",
    source: "fallback",
  };
}
