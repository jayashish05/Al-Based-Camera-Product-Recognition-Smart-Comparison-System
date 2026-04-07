"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ScanResults from "@/components/scanner/ScanResults";
import type { ScanResult } from "@/lib/types";
import { ArrowLeft, Loader2, AlertTriangle, Clock } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Scan not found");
          throw new Error("Failed to load product details");
        }
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>

        {/* Loading */}
        {loading && (
          <div className="glass-card p-12 text-center animate-fade-in">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400">Loading product details...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-8 text-center animate-fade-in-up">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{error}</h3>
            <p className="text-sm text-slate-400 mb-4">
              This scan may have been deleted or the ID is invalid.
            </p>
            <Link href="/history" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to History
            </Link>
          </div>
        )}

        {/* Scan Result */}
        {result && !loading && (
          <div className="animate-fade-in-up">
            {/* Timestamp */}
            {result.createdAt && (
              <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Scanned on{" "}
                  {new Date(result.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <ScanResults result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
