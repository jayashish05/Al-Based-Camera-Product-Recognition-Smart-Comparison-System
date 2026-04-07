"use client";

import { useState, useCallback } from "react";
import CameraView from "@/components/scanner/CameraView";
import ScanResults from "@/components/scanner/ScanResults";
import type { ScanResult } from "@/lib/types";
import { Scan, Info, RotateCcw } from "lucide-react";

export default function ScanPage() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (imageBase64: string) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Scan failed (${res.status})`);
      }

      const data: ScanResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetScan = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500">
              <Scan className="h-5 w-5 text-white" />
            </div>
            Product Scanner
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Point your camera at a product and tap capture to identify it instantly.
          </p>
        </div>

        {/* Main Content — responsive layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Camera */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CameraView onCapture={handleCapture} isProcessing={isProcessing} />

            {/* Tips */}
            {!result && !isProcessing && (
              <div className="mt-4 glass-card p-4 flex items-start gap-3">
                <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Tips for best results:</strong> Make sure the
                  product label is clearly visible, well-lit, and fills most of the frame. Works
                  best with packaged products that have visible branding.
                </div>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div>
            {error && (
              <div className="glass-card p-5 border-red-500/20 animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Info className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-1">Scan Failed</h3>
                    <p className="text-xs text-slate-400">{error}</p>
                    <button
                      onClick={resetScan}
                      className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result && <ScanResults result={result} />}

            {!result && !error && !isProcessing && (
              <div className="glass-card p-8 sm:p-12 text-center animate-fade-in">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-white/[0.06] flex items-center justify-center">
                  <Scan className="h-7 w-7 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  Ready to Scan
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Capture a product image using the camera to get detailed product information,
                  nutrition data, and price comparisons.
                </p>
              </div>
            )}

            {isProcessing && !result && (
              <div className="space-y-4 animate-fade-in">
                {/* Skeleton cards */}
                <div className="glass-card p-6">
                  <div className="flex gap-4">
                    <div className="skeleton h-20 w-20 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="skeleton h-4 w-20" />
                      <div className="skeleton h-6 w-48" />
                      <div className="skeleton h-4 w-32" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="skeleton h-3 w-full" />
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="skeleton h-4 w-28 mb-4" />
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="skeleton h-20" />
                    ))}
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="skeleton h-4 w-32 mb-4" />
                  <div className="space-y-2.5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="skeleton h-14" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
