"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HistoryItem } from "@/lib/types";
import {
  History,
  Clock,
  ArrowRight,
  Package,
  RefreshCw,
  Inbox,
  Scan,
} from "lucide-react";

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

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500">
                <History className="h-5 w-5 text-white" />
              </div>
              Scan History
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {items.length > 0 ? `${items.length} scans recorded` : "Your recent product scans"}
            </p>
          </div>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm !py-2.5 !px-4"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3 animate-fade-in">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center gap-4">
                  <div className="skeleton h-12 w-12 !rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-40" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                  <div className="skeleton h-6 w-16 !rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass-card p-8 text-center animate-fade-in-up">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load History</h3>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <button onClick={fetchHistory} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="glass-card p-12 text-center animate-fade-in-up">
            <div className="mx-auto mb-5 h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-white/[0.06] flex items-center justify-center">
              <Inbox className="h-9 w-9 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Scans Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Your scan history will appear here. Start by scanning a product with your camera.
            </p>
            <Link href="/scan" className="btn-capture inline-flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Start Scanning
            </Link>
          </div>
        )}

        {/* History List */}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-2.5 stagger-children">
            {items.map((item) => (
              <Link
                key={item._id}
                href={`/product/${item._id}`}
                className="glass-card p-4 flex items-center gap-4 group block"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-slate-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                      {item.productName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{item.brand}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {/* Category Badge */}
                <span className={`badge ${getCategoryBadgeClass(item.category)} hidden sm:inline-flex`}>
                  {item.category}
                </span>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
