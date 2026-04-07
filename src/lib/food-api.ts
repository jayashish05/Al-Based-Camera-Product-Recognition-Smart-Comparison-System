// ============================================================
// Open Food Facts API Integration
// ============================================================

import type { NutritionInfo } from "./types";

const OFF_SEARCH_URL =
  "https://world.openfoodfacts.org/cgi/search.pl";
const USER_AGENT = "UVPS/1.0 (https://github.com/uvps)";

interface OFFProduct {
  product_name?: string;
  brands?: string;
  image_url?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    sugars_100g?: number;
    fiber_100g?: number;
    [key: string]: number | undefined;
  };
  ingredients_text?: string;
  categories?: string;
}

interface OFFSearchResponse {
  count: number;
  products: OFFProduct[];
}

/**
 * Search Open Food Facts for a product by name and optional brand.
 * Returns nutrition info if found, null otherwise.
 */
export async function fetchFoodDetails(
  productName: string,
  brand?: string
): Promise<{
  nutrition: NutritionInfo | null;
  image: string | null;
  resolvedName: string | null;
}> {
  try {
    const searchTerms = brand
      ? `${brand} ${productName}`
      : productName;

    const params = new URLSearchParams({
      search_terms: searchTerms,
      search_simple: "1",
      action: "process",
      json: "1",
      page_size: "5",
      fields:
        "product_name,brands,image_url,nutriments,ingredients_text,categories",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${OFF_SEARCH_URL}?${params}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Open Food Facts returned ${response.status}`);
      return { nutrition: null, image: null, resolvedName: null };
    }

    const data: OFFSearchResponse = await response.json();

    if (!data.products || data.products.length === 0) {
      console.log(`No products found on OFF for: ${searchTerms}`);
      return { nutrition: null, image: null, resolvedName: null };
    }

    // Pick best match (first result)
    const product = data.products[0];
    const n = product.nutriments;

    const nutrition: NutritionInfo | null = n
      ? {
          calories: Math.round(n["energy-kcal_100g"] || 0),
          protein: Math.round((n.proteins_100g || 0) * 10) / 10,
          carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
          fat: Math.round((n.fat_100g || 0) * 10) / 10,
          sugar: Math.round((n.sugars_100g || 0) * 10) / 10,
          fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
          ingredients: product.ingredients_text || undefined,
        }
      : null;

    return {
      nutrition,
      image: product.image_url || null,
      resolvedName: product.product_name || null,
    };
  } catch (error) {
    console.warn(
      "⚠️  Open Food Facts API error:",
      error instanceof Error ? error.message : error
    );
    return { nutrition: null, image: null, resolvedName: null };
  }
}

/**
 * Generate mock nutrition data for demo purposes when OFF has no data.
 */
export function getMockNutrition(): NutritionInfo {
  return {
    calories: Math.round(150 + Math.random() * 400),
    protein: Math.round((2 + Math.random() * 25) * 10) / 10,
    carbs: Math.round((10 + Math.random() * 60) * 10) / 10,
    fat: Math.round((1 + Math.random() * 35) * 10) / 10,
    sugar: Math.round((1 + Math.random() * 50) * 10) / 10,
    fiber: Math.round((0.5 + Math.random() * 10) * 10) / 10,
    ingredients: "Ingredients data unavailable — mock result",
  };
}
