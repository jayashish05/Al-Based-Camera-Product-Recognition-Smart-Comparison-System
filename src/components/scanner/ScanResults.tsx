"use client";

import type { ScanResult } from "@/lib/types";
import {
  Package,
  Tag,
  TrendingUp,
  ShoppingCart,
  ExternalLink,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Cookie,
  Leaf,
  Cpu,
  HardDrive,
  Battery,
  Monitor,
  Smartphone,
  Sparkles,
} from "lucide-react";

interface ScanResultsProps {
  result: ScanResult;
}

function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case "Food":
      return "badge-food";
    case "Electronics":
      return "badge-electronics";
    case "Cosmetics":
      return "badge-cosmetics";
    default:
      return "badge-other";
  }
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-sm font-mono font-semibold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function NutritionCard({ nutrition }: { nutrition: ScanResult["nutrition"] }) {
  if (!nutrition) return null;

  const items = [
    { icon: Flame, label: "Calories", value: `${nutrition.calories}`, unit: "kcal", color: "#ef4444" },
    { icon: Beef, label: "Protein", value: `${nutrition.protein}`, unit: "g", color: "#f97316" },
    { icon: Wheat, label: "Carbs", value: `${nutrition.carbs}`, unit: "g", color: "#eab308" },
    { icon: Droplet, label: "Fat", value: `${nutrition.fat}`, unit: "g", color: "#3b82f6" },
    { icon: Cookie, label: "Sugar", value: `${nutrition.sugar}`, unit: "g", color: "#ec4899" },
    { icon: Leaf, label: "Fiber", value: `${nutrition.fiber}`, unit: "g", color: "#10b981" },
  ];

  return (
    <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Flame className="h-4 w-4 text-emerald-400" />
        Nutrition Facts
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.1] transition-colors"
          >
            <item.icon className="h-4 w-4 mx-auto mb-1.5" style={{ color: item.color }} />
            <div className="text-lg sm:text-xl font-bold text-white">
              {item.value}
              <span className="text-xs text-slate-500 font-normal ml-0.5">{item.unit}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
      {nutrition.ingredients && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-slate-500 font-medium mb-1">Ingredients</p>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {nutrition.ingredients}
          </p>
        </div>
      )}
    </div>
  );
}

function SpecsCard({ specs }: { specs: ScanResult["specs"] }) {
  if (!specs) return null;

  const specIcons: Record<string, typeof Cpu> = {
    ram: HardDrive,
    storage: HardDrive,
    battery: Battery,
    display: Monitor,
    processor: Cpu,
    os: Smartphone,
  };

  const entries = Object.entries(specs).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );

  if (entries.length === 0) return null;

  return (
    <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Cpu className="h-4 w-4 text-indigo-400" />
        Specifications
      </h3>
      <div className="space-y-3">
        {entries.map(([key, val]) => {
          const Icon = specIcons[key] || Cpu;
          return (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-slate-400 capitalize">{key}</span>
              </div>
              <span className="text-sm font-medium text-white">{String(val)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OffersCard({ offers }: { offers: ScanResult["offers"] }) {
  if (!offers || offers.length === 0) return null;

  const siteColors: Record<string, string> = {
    Amazon: "#ff9900",
    Flipkart: "#2874f0",
    Myntra: "#ff3f6c",
    Snapdeal: "#e40046",
    Other: "#6366f1",
  };

  return (
    <div className="glass-card p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-cyan-400" />
        Price Comparison
      </h3>
      <div className="space-y-2.5">
        {offers
          .sort((a, b) => a.price - b.price)
          .map((offer, idx) => {
            const color = siteColors[offer.site] || siteColors.Other;
            const isBest = idx === 0;

            return (
              <a
                key={`${offer.site}-${idx}`}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all hover:scale-[1.02] ${
                  isBest
                    ? "bg-emerald-500/[0.06] border-emerald-500/20 hover:border-emerald-500/40"
                    : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: color }}
                  >
                    {offer.site.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      {offer.site}
                      {isBest && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          BEST
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{offer.delivery}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    {offer.currency}
                    {offer.price}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </div>
              </a>
            );
          })}
      </div>
    </div>
  );
}

export default function ScanResults({ result }: ScanResultsProps) {
  const { product, nutrition, specs, offers } = result;

  return (
    <div className="space-y-4 stagger-children">
      {/* Product Summary */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          {product.image && (
            <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-white/[0.05] border border-white/[0.08]">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`badge ${getCategoryBadgeClass(product.category)}`}>
                {product.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
              <Tag className="h-3.5 w-3.5" />
              <span>{product.brand}</span>
            </div>
            {product.description && (
              <p className="mt-2 text-xs sm:text-sm text-slate-400/80 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Confidence */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI Confidence
            </span>
          </div>
          <ConfidenceMeter value={product.confidence} />
        </div>
      </div>

      {/* Category-Specific Info */}
      {nutrition && <NutritionCard nutrition={nutrition} />}
      {specs && <SpecsCard specs={specs} />}

      {/* Offers */}
      <OffersCard offers={offers} />
    </div>
  );
}
