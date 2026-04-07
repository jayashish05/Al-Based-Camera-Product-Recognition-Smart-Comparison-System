import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UVPS — Universal Visual Product Scanner",
  description:
    "Point your camera at any product to instantly identify it, get nutrition data, specifications, and compare prices across e-commerce platforms.",
  keywords: [
    "product scanner",
    "visual search",
    "price comparison",
    "nutrition facts",
    "barcode scanner",
  ],
  openGraph: {
    title: "UVPS — Universal Visual Product Scanner",
    description:
      "Identify products instantly with your camera. Get nutrition data, specs, and price comparisons.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
