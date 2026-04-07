<div align="center">

# 🔍 AI-Based Camera Product Recognition & Smart Comparison System

### *Real-time product identification powered by multi-model AI vision with intelligent price comparison*

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![CLIP](https://img.shields.io/badge/OpenAI_CLIP-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/research/clip)
[![Tesseract](https://img.shields.io/badge/Tesseract_OCR-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://tesseract-ocr.github.io)
[![Render](https://img.shields.io/badge/Deploy_on_Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

---

*A production-ready, mobile-first web application that uses a device camera to capture real-world products, identifies them using a cascading multi-model AI vision pipeline, and returns structured product information, nutrition data, technical specifications, and real-time price comparison across e-commerce platforms.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Machine Vision Pipeline](#-machine-vision-pipeline)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Future Enhancements](#-future-enhancements)

---

## 🧠 Overview

This system solves the problem of **instant product identification** — a user points their phone or laptop camera at any real-world product (food, electronics, cosmetics, clothing, etc.), taps "Capture & Analyze", and receives:

| Output | Description |
|--------|-------------|
| **Product Identity** | Exact product name, brand, and description extracted via AI vision |
| **Category Classification** | Automatic categorization into Food, Electronics, Cosmetics, Clothing, Books, Household |
| **Nutrition Facts** | Estimated calories, protein, carbs, fat, sugar, fiber (for food products) |
| **Technical Specs** | Display, processor, RAM, battery, storage (for electronics) |
| **Price Comparison** | Real-time prices from Amazon, Flipkart, Snapdeal with direct purchase links |
| **Scan History** | All past scans persisted in MongoDB Atlas with full detail retrieval |

---

## 🔬 Machine Vision Pipeline

The core innovation of this project is a **cascading multi-model AI vision pipeline** that ensures high accuracy with graceful degradation:

```
┌─────────────────────────────────────────────────────────────┐
│                    IMAGE CAPTURE                            │
│  Browser MediaDevices API → Canvas → Base64 JPEG            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              PRIMARY: GROQ LLAMA 4 SCOUT                    │
│                                                             │
│  Model: meta-llama/llama-4-scout-17b-16e-instruct          │
│  Type:  175B parameter multimodal vision-language model     │
│  Speed: <1s inference (Groq LPU hardware)                   │
│  Output: Structured JSON with product details               │
│                                                             │
│  Capabilities:                                              │
│  ├─ Product identification & brand recognition              │
│  ├─ OCR text extraction from labels                         │
│  ├─ Nutrition data estimation for food products             │
│  ├─ Technical specification extraction for electronics      │
│  ├─ Price estimation in INR                                 │
│  └─ Search query generation for e-commerce                  │
│                                                             │
│  If successful → Return result                              │
│  If fails (quota/network) → Cascade to fallback ↓           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FALLBACK: OPENAI CLIP + TESSERACT OCR          │
│                                                             │
│  Model: openai/clip-vit-base-patch32 (Zero-Shot Classifier) │
│  OCR:   Tesseract v5 with image preprocessing               │
│  Accel: Apple Silicon MPS / NVIDIA CUDA / CPU               │
│                                                             │
│  Phase 1 — Category Classification (10 categories):         │
│  ├─ Food, Electronics, Cosmetics, Clothing, Books           │
│  ├─ Household, Camera, Drinkware, Medicine, Toys            │
│  └─ Confidence-weighted softmax scoring                     │
│                                                             │
│  Phase 2 — Sub-Category Identification:                     │
│  ├─ 20 Food sub-types (Chocolate, Chips, Noodles...)        │
│  ├─ 20 Electronics sub-types (Smartphone, Laptop, Camera..) │
│  ├─ 13 Cosmetics sub-types (Shampoo, Lipstick, Perfume...) │
│  └─ 10 Household sub-types (Water Bottle, Detergent...)     │
│                                                             │
│  Phase 3 — OCR Text Extraction:                             │
│  ├─ Image preprocessing (contrast + sharpening)             │
│  ├─ Tesseract OCR with custom PSM configuration             │
│  ├─ Brand matching against 80+ known brand database         │
│  └─ Intelligent product name extraction with noise filter   │
│                                                             │
│  Combined: CLIP category + OCR brand/name → Product result  │
└─────────────────────────────────────────────────────────────┘
```

### Why a Cascading Pipeline?

| Scenario | Primary (Groq) | Fallback (CLIP) | Behavior |
|----------|----------------|-----------------|----------|
| Normal operation | ✅ Available | — | Best accuracy, structured data |
| API quota exceeded | ❌ 429 Error | ✅ Available | Local model takes over instantly |
| No internet | ❌ Unreachable | ✅ Available | Runs entirely offline via CLIP |
| Production (Render) | ✅ Available | — | Cloud-only, no Python needed |
| Local development | ✅ Available | ✅ Available | Both active, Groq preferred |

### CLIP Zero-Shot Classification Deep Dive

The CLIP fallback uses a **two-phase zero-shot classification** approach:

1. **Phase 1** sends the image against 10 carefully crafted text prompts (one per category), each containing rich visual descriptions. CLIP computes cosine similarity between the image embedding and each text embedding.

2. **Phase 2** narrows down within the winning category — e.g., if "Electronics" wins Phase 1, the image is then classified against 20 electronics-specific prompts (Smartphone, Laptop, Camera Lens, etc.)

3. **OCR Phase** runs Tesseract in parallel with preprocessing (grayscale conversion, contrast enhancement, sharpening) and matches extracted text against a database of 80+ known brands for accurate brand identification.

---

## ✨ Key Features

### 🎯 AI-Powered Product Recognition
- **Multi-model architecture** with automatic failover
- **Zero-shot classification** — no training data needed, works on any product
- **Structured output** — JSON with name, brand, category, nutrition, specs, price
- **Sub-second inference** via Groq LPU acceleration

### 📱 Mobile-First Design
- Responsive glassmorphism UI with smooth animations
- Native camera integration via `getUserMedia` API
- Touch-optimized capture flow
- Dark mode design optimized for camera usage

### 🍎 Smart Category-Specific Data
- **Food products** → Nutrition facts (calories, protein, carbs, fat, sugar, fiber)
- **Electronics** → Technical specifications (display, CPU, RAM, storage, battery)
- **Cosmetics** → Product details (type, volume, key ingredients, skin type)

### 💰 Real-Time Price Comparison
- Aggregated pricing from **Amazon**, **Flipkart**, and **Snapdeal**
- Direct purchase links with search queries
- AI-estimated base pricing for accurate comparison
- Sorted by best deal with visual "BEST" badge

### 📊 Scan History
- Full scan history persisted in MongoDB Atlas
- Product detail pages with all data preserved
- Timestamp and confidence tracking

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐  │
│  │  Camera   │  │  Scan Page   │  │  History  │  │  Product   │  │
│  │  Capture  │→ │  Results UI  │  │  Page     │  │  Detail    │  │
│  └──────────┘  └──────────────┘  └───────────┘  └───────────┘  │
└─────────────────────────┬────────────────────────────────────────┘
                          │ HTTPS POST /api/scan
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js API Routes)                   │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │  /api/scan    │  │  /api/history  │  │  /api/product/[id]  │  │
│  │  POST         │  │  GET           │  │  GET                │  │
│  └──────┬───────┘  └────────┬───────┘  └──────────┬──────────┘  │
│         │                   │                     │              │
│         ▼                   ▼                     ▼              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MongoDB Atlas                         │   │
│  │              (Scan history & product data)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────┬────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    AI VISION LAYER                               │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │  Groq API (Primary)  │───▶│  CLIP + Tesseract (Fallback) │    │
│  │  Llama 4 Scout       │    │  PyTorch + MPS/CUDA          │    │
│  │  Cloud Inference     │    │  Local Inference              │    │
│  └─────────────────────┘    └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** (App Router) | Full-stack React framework with API routes |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling with glassmorphism design |
| **Lucide React** | Premium icon library |

### AI / Machine Learning
| Technology | Purpose |
|-----------|---------|
| **Groq API** (Llama 4 Scout) | Primary vision model — multimodal product recognition |
| **OpenAI CLIP** (ViT-B/32) | Fallback zero-shot image classifier (63M+ params) |
| **Tesseract OCR** v5 | Optical character recognition for label text extraction |
| **PyTorch** | ML framework with MPS/CUDA GPU acceleration |
| **Hugging Face Transformers** | CLIP model loading and inference |
| **Pillow** | Image preprocessing (contrast, sharpening, grayscale) |

### Backend & Database
| Technology | Purpose |
|-----------|---------|
| **MongoDB Atlas** | Cloud database for scan history persistence |
| **Flask** | Lightweight Python microservice for CLIP inference |
| **Render** | Cloud hosting platform |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for CLIP fallback, optional)
- Tesseract OCR binary (for CLIP fallback, optional)

### Quick Start (Cloud AI only)

```bash
# Clone the repository
git clone https://github.com/jayashish05/Al-Based-Camera-Product-Recognition-Smart-Comparison-System.git
cd Al-Based-Camera-Product-Recognition-Smart-Comparison-System

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your keys (see Environment Variables below)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Full Setup (with CLIP Fallback)

```bash
# 1. Start CLIP ML Service (in a separate terminal)
cd ml-service
python -m venv venv
source venv/bin/activate       # macOS/Linux
pip install flask torch transformers pillow pytesseract
brew install tesseract          # macOS (or apt-get on Linux)
python app.py                   # Starts on port 5001

# 2. Start Next.js Frontend (in another terminal)
cd frontend
npm install
npm run dev                     # Starts on port 3000
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# Required — MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Required — Groq API key (free at https://console.groq.com/keys)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional — CLIP ML service URL (for local fallback)
ML_SERVICE_URL=http://localhost:5001
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `GROQ_API_KEY` | ✅ Yes | Free API key from [console.groq.com](https://console.groq.com/keys) |
| `ML_SERVICE_URL` | ❌ No | CLIP fallback service URL (default: `http://localhost:5001`) |

---

## ☁️ Deployment

### Deploy to Render (Recommended)

1. Push code to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Configure:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build && bash render-build.sh` |
| **Start Command** | `node .next/standalone/server.js` |
| **Instance Type** | Free |

4. Add environment variables (`MONGODB_URI`, `GROQ_API_KEY`, `PORT=3000`)
5. In MongoDB Atlas → Network Access → Allow `0.0.0.0/0`

> **Note:** The CLIP fallback is for local development only. On Render, Groq handles all AI recognition via cloud API — no Python service needed.

---

## 📡 API Reference

### `POST /api/scan`

Accepts a base64-encoded image and returns structured product data.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "product": {
    "name": "Cadbury Dairy Milk Silk",
    "brand": "Cadbury",
    "category": "Food",
    "confidence": 0.94,
    "description": "A premium milk chocolate bar by Cadbury"
  },
  "nutrition": {
    "calories": 546,
    "protein": 7.6,
    "carbs": 56.8,
    "fat": 32.5,
    "sugar": 52.0,
    "fiber": 1.2
  },
  "specs": null,
  "offers": [
    {
      "site": "Amazon",
      "price": 120,
      "currency": "₹",
      "url": "https://www.amazon.in/s?k=Cadbury+Dairy+Milk+Silk",
      "delivery": "Tomorrow"
    }
  ],
  "createdAt": "2026-04-07T17:00:00.000Z"
}
```

### `GET /api/history`

Returns the 50 most recent scans.

### `GET /api/product/[id]`

Returns full details of a specific scan by MongoDB ObjectId.

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/route.ts          # Main scan endpoint (Groq + CLIP)
│   │   │   ├── history/route.ts       # Scan history endpoint
│   │   │   └── product/[id]/route.ts  # Product detail endpoint
│   │   ├── scan/page.tsx              # Camera + results page
│   │   ├── history/page.tsx           # Scan history page
│   │   ├── product/[id]/page.tsx      # Product detail page
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Design system & animations
│   ├── components/
│   │   ├── scanner/
│   │   │   ├── CameraView.tsx         # Camera capture component
│   │   │   └── ScanResults.tsx        # Results display cards
│   │   └── layout/
│   │       ├── Header.tsx             # Navigation header
│   │       └── Footer.tsx             # Page footer
│   └── lib/
│       ├── gemini-client.ts           # AI vision pipeline (Groq → CLIP)
│       ├── ml-client.ts               # CLIP ML service client
│       ├── mongodb.ts                 # Database connection
│       ├── data-resolver.ts           # Category-specific data resolver
│       ├── price-comparison.ts        # Multi-provider price aggregator
│       ├── food-api.ts                # Nutrition data helpers
│       └── types.ts                   # TypeScript type definitions
├── ml-service/                        # Python CLIP fallback service
│   ├── app.py                         # Flask server with thread-safe loading
│   └── models/
│       ├── classifier.py              # CLIP zero-shot classifier (63 labels)
│       └── ocr.py                     # Tesseract OCR with brand matching
├── next.config.ts                     # Next.js config (standalone output)
├── render-build.sh                    # Render deployment build script
└── package.json
```

---

## 🔮 Future Enhancements

- [ ] **Real affiliate API integration** — Amazon PA API & Flipkart Affiliate for live pricing
- [ ] **Barcode/QR scanning** — Hardware barcode reader integration for UPC/EAN lookup
- [ ] **Fine-tuned CLIP model** — Custom training on Indian product dataset for higher accuracy
- [ ] **Voice feedback** — Text-to-speech for product identification results
- [ ] **AR overlay** — Real-time product annotation using camera view
- [ ] **User accounts** — Authentication and personalized scan history
- [ ] **Rate limiting** — API throttling to protect against abuse

---

<div align="center">

### Built with ❤️ by [Jayashish](https://github.com/jayashish05)

*AI-Based Camera Product Recognition & Smart Comparison System*

</div>
