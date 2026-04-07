// ============================================================
// UVPS — Core Type Definitions
// ============================================================

/** Product identification from ML/Gemini service or data resolution */
export interface Product {
  name: string;
  brand: string;
  category: ProductCategory;
  image: string | null;
  confidence: number;
  description?: string;
}

/** Supported product categories */
export type ProductCategory =
  | "Food"
  | "Electronics"
  | "Cosmetics"
  | "Clothing"
  | "Books"
  | "Household"
  | "Other";

/** Nutrition data for food products */
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  fiber: number;
  ingredients?: string;
}

/** Technical specifications for electronics */
export interface SpecsInfo {
  [key: string]: string | number | undefined;
  ram?: string;
  storage?: string;
  battery?: string;
  display?: string;
  processor?: string;
  os?: string;
}

/** Price offer from an e-commerce source */
export interface Offer {
  site: string;
  price: number;
  currency: string;
  url: string;
  delivery: string;
  logo?: string;
}

/** Complete scan result returned by /api/scan */
export interface ScanResult {
  _id?: string;
  product: Product;
  nutrition: NutritionInfo | null;
  specs: SpecsInfo | null;
  offers: Offer[];
  capturedImage?: string;
  createdAt?: string;
}

/** ML service response */
export interface MLIdentifyResponse {
  product_name: string;
  brand: string;
  category: ProductCategory;
  confidence: number;
  raw_text: string;
  sub_category?: string;
}

/** History item (compact format) */
export interface HistoryItem {
  _id: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  confidence: number;
  thumbnail: string | null;
  createdAt: string;
}

/** API error response */
export interface ApiError {
  error: string;
  code: string;
  details?: string;
}
