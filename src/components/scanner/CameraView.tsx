"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, RefreshCw, X, AlertTriangle } from "lucide-react";

interface CameraViewProps {
  onCapture: (imageBase64: string) => void;
  isProcessing: boolean;
}

export default function CameraView({ onCapture, isProcessing }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async () => {
    setError(null);
    setCapturedImage(null);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setError("No camera found. Please connect a camera and try again.");
      } else {
        setError(`Camera error: ${msg}`);
      }
      setCameraReady(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(base64);
    onCapture(base64);
  }, [onCapture]);

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  // Error state
  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Camera Unavailable</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">{error}</p>
        <button onClick={startCamera} className="btn-primary">
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Preview / Captured Image */}
      <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/[0.06]"
        style={{ aspectRatio: "4/3" }}
      >
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured product"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanning overlay */}
            {cameraReady && !isProcessing && (
              <>
                <div className="scanner-overlay" />
                <div className="scanner-corners" />
                <div className="scanner-corners-bottom" />
              </>
            )}

            {/* Loading camera */}
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <div className="h-8 w-8 mx-auto mb-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Initializing camera...</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="h-12 w-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 h-12 w-12 border-2 border-indigo-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <p className="text-sm font-medium text-white">Analyzing Product...</p>
              <p className="text-xs text-slate-400 mt-1">Running ML classification & OCR</p>
            </div>
          </div>
        )}

        {/* Camera toggle */}
        {!capturedImage && cameraReady && !isProcessing && (
          <button
            onClick={toggleCamera}
            className="absolute top-3 right-3 h-10 w-10 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm border border-white/[0.1] text-white hover:bg-black/60 transition-all"
            aria-label="Switch camera"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Action buttons */}
      <div className="flex gap-3">
        {capturedImage ? (
          <>
            <button
              onClick={resetCapture}
              disabled={isProcessing}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Retake
            </button>
          </>
        ) : (
          <button
            onClick={captureFrame}
            disabled={!cameraReady || isProcessing}
            className="btn-capture flex-1 flex items-center justify-center gap-2"
            id="capture-btn"
          >
            <Camera className="h-5 w-5" />
            Capture & Analyze
          </button>
        )}
      </div>
    </div>
  );
}
