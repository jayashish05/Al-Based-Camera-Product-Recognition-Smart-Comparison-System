import Link from "next/link";
import {
  Scan,
  Zap,
  ShoppingCart,
  Apple,
  Cpu,
  ArrowRight,
  Camera,
  BarChart3,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Smart Camera Capture",
    description:
      "Point your camera at any product and capture it instantly. Our ML engine identifies it in seconds.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: Apple,
    title: "Nutrition Analysis",
    description:
      "Get detailed nutrition facts for food items — calories, protein, carbs, fats, sugar, and fiber.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Cpu,
    title: "Tech Specifications",
    description:
      "Identify electronics and get specs like RAM, storage, battery, display, and processor details.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: ShoppingCart,
    title: "Price Comparison",
    description:
      "Compare prices across Amazon, Flipkart, and more to find the best deals instantly.",
    gradient: "from-orange-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Scan History",
    description:
      "Access your complete scan history anytime. Track products you've scanned and revisit details.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: Globe,
    title: "Open Data Powered",
    description:
      "Built on Open Food Facts and open product databases for transparent, community-driven data.",
    gradient: "from-rose-500 to-red-500",
  },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-12 pb-20 sm:pt-20 sm:pb-32">
        {/* Decorative orbs */}
        <div
          className="absolute top-20 left-1/4 w-72 h-72 rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />
        <div
          className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
        />

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-slate-400 animate-fade-in-up">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            AI-Powered Product Recognition
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-white">Scan Any Product.</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Know Everything.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Point your camera at any product — food, electronics, cosmetics — and instantly get
            detailed information, nutrition data, specifications, and price comparisons.
          </p>

          {/* CTA Buttons */}
          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/scan" className="btn-capture flex items-center gap-2 w-full sm:w-auto justify-center" id="hero-scan-btn">
              <Scan className="h-5 w-5" />
              Start Scanning
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
            <Link href="/history" className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center" id="hero-history-btn">
              View Scan History
            </Link>
          </div>

          {/* Stats */}
          <div
            className="mt-16 grid grid-cols-3 gap-6 sm:gap-12 max-w-md mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { value: "5+", label: "Categories" },
              { value: "3M+", label: "Products" },
              { value: "<3s", label: "Scan Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Everything You Need to Identify Products
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From food nutrition to electronics specs, UVPS gives you comprehensive product
              intelligence in one scan.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card p-6 sm:p-7 group">
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform group-hover:scale-110`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-32">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400">Three simple steps to identify any product</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 stagger-children">
            {[
              {
                step: "01",
                title: "Point & Capture",
                desc: "Open the scanner and point your camera at any product. Tap to capture the image.",
                icon: Camera,
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Our ML engine analyzes the image using CLIP and OCR to identify the product and category.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Get Results",
                desc: "View comprehensive product info, nutrition data, specs, and price comparisons instantly.",
                icon: BarChart3,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/[0.08]">
                  <item.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-xs font-mono text-indigo-400 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="mx-auto max-w-2xl glass-card p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Scan?
          </h2>
          <p className="text-slate-400 mb-8">
            Start identifying products with your camera right now. No sign-up required.
          </p>
          <Link href="/scan" className="btn-capture inline-flex items-center gap-2" id="bottom-scan-btn">
            <Scan className="h-5 w-5" />
            Launch Scanner
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
