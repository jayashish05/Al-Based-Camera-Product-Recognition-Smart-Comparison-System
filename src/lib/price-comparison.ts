// ============================================================
// Price Comparison Layer — Pluggable Architecture
// ============================================================

import type { Offer, Product } from "./types";

/**
 * Price provider interface — implement this to add a new source.
 */
interface PriceProvider {
  name: string;
  search(query: string, category: string): Promise<Offer[]>;
}

// ============================================================
// Amazon Provider (Simulated — replace with PA API in production)
// ============================================================
const amazonProvider: PriceProvider = {
  name: "Amazon",
  async search(query: string): Promise<Offer[]> {
    const searchQuery = encodeURIComponent(query);
    const basePrice = 100 + Math.random() * 900;

    return [
      {
        site: "Amazon",
        price: Math.round(basePrice),
        currency: "₹",
        url: `https://www.amazon.in/s?k=${searchQuery}`,
        delivery: "Tomorrow",
      },
    ];
  },
};

// ============================================================
// Flipkart Provider (Simulated — replace with Affiliate API)
// ============================================================
const flipkartProvider: PriceProvider = {
  name: "Flipkart",
  async search(query: string): Promise<Offer[]> {
    const searchQuery = encodeURIComponent(query);
    const basePrice = 95 + Math.random() * 850;

    return [
      {
        site: "Flipkart",
        price: Math.round(basePrice),
        currency: "₹",
        url: `https://www.flipkart.com/search?q=${searchQuery}`,
        delivery: "2–3 days",
      },
    ];
  },
};

// ============================================================
// Snapdeal Provider (Simulated)
// ============================================================
const snapdealProvider: PriceProvider = {
  name: "Snapdeal",
  async search(query: string): Promise<Offer[]> {
    const searchQuery = encodeURIComponent(query);
    const basePrice = 90 + Math.random() * 800;

    return [
      {
        site: "Snapdeal",
        price: Math.round(basePrice),
        currency: "₹",
        url: `https://www.snapdeal.com/search?keyword=${searchQuery}`,
        delivery: "3–5 days",
      },
    ];
  },
};

// ============================================================
// Registry — add/remove providers here
// ============================================================
const providers: PriceProvider[] = [
  amazonProvider,
  flipkartProvider,
  snapdealProvider,
];

/**
 * Get price offers from all registered providers.
 * Returns a unified, sorted list of offers.
 */
export async function getOffersForProduct(
  product: Product
): Promise<Offer[]> {
  const query = `${product.brand} ${product.name}`.trim();

  try {
    const results = await Promise.allSettled(
      providers.map((p) => p.search(query, product.category))
    );

    const offers: Offer[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        offers.push(...result.value);
      } else {
        console.warn("Price provider failed:", result.reason);
      }
    }

    // Sort by price ascending
    return offers.sort((a, b) => a.price - b.price);
  } catch (error) {
    console.error("Price comparison error:", error);
    return [];
  }
}
