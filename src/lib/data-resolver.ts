// ============================================================
// Data Resolver — Enhanced: Orchestrates data by product category
// ============================================================

import type { MLIdentifyResponse, Product, NutritionInfo, SpecsInfo } from "./types";
import { fetchFoodDetails, getMockNutrition } from "./food-api";

/**
 * Resolve full product details from ML classification result.
 * Routes to category-specific data sources.
 */
export async function resolveProductDetails(mlResult: MLIdentifyResponse): Promise<{
  product: Product;
  nutrition: NutritionInfo | null;
  specs: SpecsInfo | null;
}> {
  const baseProduct: Product = {
    name: mlResult.product_name,
    brand: mlResult.brand,
    category: mlResult.category,
    image: null,
    confidence: mlResult.confidence,
  };

  let nutrition: NutritionInfo | null = null;
  let specs: SpecsInfo | null = null;

  switch (mlResult.category) {
    case "Food": {
      // Try Open Food Facts first for real nutrition data
      const foodData = await fetchFoodDetails(
        mlResult.product_name,
        mlResult.brand !== "Unknown" ? mlResult.brand : undefined
      );
      nutrition = foodData.nutrition || getMockNutrition();
      if (foodData.image) baseProduct.image = foodData.image;
      if (foodData.resolvedName && foodData.resolvedName.length > 3) {
        baseProduct.name = foodData.resolvedName;
      }
      break;
    }

    case "Electronics": {
      specs = getElectronicsSpecs(
        mlResult.sub_category || mlResult.product_name,
        mlResult.brand
      );
      break;
    }

    case "Cosmetics": {
      // Future: integrate with cosmetics databases
      break;
    }

    default:
      break;
  }

  return { product: baseProduct, nutrition, specs };
}

/**
 * Generate realistic specs based on CLIP sub-category detection.
 */
function getElectronicsSpecs(subCategory: string, brand: string): SpecsInfo {
  const sub = subCategory.toLowerCase();

  // Camera Lens
  if (sub.includes("lens")) {
    return {
      "Type": "Camera Lens",
      "Mount": brand === "Nikon" ? "Nikon F / Z Mount" :
               brand === "Canon" ? "Canon EF / RF Mount" :
               brand === "Sony" ? "Sony E Mount" : "Universal Mount",
      "Focal Length": sub.includes("wide") ? "16-35mm" :
                      sub.includes("tele") ? "70-200mm" : "24-70mm",
      "Aperture": "f/2.8",
      "Stabilization": "VR / IS",
      "Filter Size": "77mm",
    };
  }

  // DSLR / Camera
  if (sub.includes("camera") || sub.includes("dslr") || sub.includes("mirrorless")) {
    return {
      "Type": "Digital Camera",
      "Sensor": "Full Frame CMOS",
      "Resolution": "45.7 MP",
      "ISO Range": "64–25,600",
      "Video": "4K 60fps",
      "Display": "3.2-inch Tilting Touchscreen",
    };
  }

  // Smartphone
  if (sub.includes("smartphone") || sub.includes("phone") || sub.includes("iphone")) {
    return {
      display: "6.7-inch AMOLED, 120Hz",
      processor: brand === "Apple" ? "A17 Pro" :
                 brand === "Samsung" ? "Snapdragon 8 Gen 3" :
                 brand === "Google" ? "Tensor G3" : "Snapdragon 8 Gen 3",
      ram: brand === "Apple" ? "8 GB" : "12 GB",
      storage: "256 GB",
      battery: "4,500 mAh",
      os: brand === "Apple" ? "iOS 17" : "Android 14",
    };
  }

  // Laptop
  if (sub.includes("laptop") || sub.includes("macbook") || sub.includes("notebook")) {
    return {
      display: "14-inch, 2560x1600 IPS",
      processor: brand === "Apple" ? "M3 Pro" : "Intel Core i7-13700H",
      ram: "16 GB",
      storage: "512 GB SSD",
      battery: "72 Wh, ~12 hours",
      os: brand === "Apple" ? "macOS Sonoma" : "Windows 11",
    };
  }

  // Headphones / Earbuds
  if (sub.includes("headphone") || sub.includes("earbud") || sub.includes("airpod")) {
    return {
      "Type": sub.includes("earbud") ? "True Wireless Earbuds" : "Over-Ear Headphones",
      "Driver": "40mm Dynamic",
      "ANC": "Active Noise Cancellation",
      "Battery": sub.includes("earbud") ? "6h (30h with case)" : "30 hours",
      "Connectivity": "Bluetooth 5.3",
      "Codec": "AAC, SBC, LDAC",
    };
  }

  // Tablet
  if (sub.includes("tablet") || sub.includes("ipad")) {
    return {
      display: "11-inch Liquid Retina, 120Hz",
      processor: brand === "Apple" ? "M2" : "Snapdragon 8 Gen 2",
      ram: "8 GB",
      storage: "256 GB",
      battery: "10,000 mAh",
      os: brand === "Apple" ? "iPadOS 17" : "Android 14",
    };
  }

  // Smartwatch
  if (sub.includes("watch") || sub.includes("wearable") || sub.includes("band")) {
    return {
      "Display": "1.9-inch AMOLED, Always-On",
      "Sensors": "Heart Rate, SpO2, GPS",
      "Battery": "Up to 18 hours",
      "Water Resistance": "50m (IP68)",
      "Connectivity": "Bluetooth 5.3, Wi-Fi",
      "OS": brand === "Apple" ? "watchOS 10" : "Wear OS 4",
    };
  }

  // Speaker
  if (sub.includes("speaker") || sub.includes("soundbar")) {
    return {
      "Type": sub.includes("soundbar") ? "Soundbar" : "Portable Speaker",
      "Output": "20W Stereo",
      "Battery": "12 hours",
      "Connectivity": "Bluetooth 5.3, AUX",
      "Water Resistance": "IPX7",
      "Features": "360° Sound, Bass Boost",
    };
  }

  // TV / Monitor
  if (sub.includes("television") || sub.includes("monitor") || sub.includes("display")) {
    return {
      "Display": "55-inch 4K OLED",
      "Resolution": "3840 x 2160",
      "Refresh Rate": "120Hz",
      "HDR": "Dolby Vision, HDR10+",
      "Smart TV": "Google TV / webOS",
      "Ports": "HDMI 2.1 x4, USB x2",
    };
  }

  // Charger / Power Bank
  if (sub.includes("charger") || sub.includes("cable") || sub.includes("power")) {
    return {
      "Type": "Fast Charger",
      "Output": "65W USB-C PD",
      "Ports": "USB-C x2, USB-A x1",
      "Compatibility": "Universal (Phone, Laptop, Tablet)",
    };
  }

  // Gaming Console
  if (sub.includes("gaming") || sub.includes("playstation") || sub.includes("xbox")) {
    return {
      "Type": "Gaming Console",
      "GPU": "Custom RDNA 3",
      "Storage": "1 TB SSD",
      "Resolution": "4K @ 120fps",
      "Features": "Ray Tracing, 3D Audio",
    };
  }

  // Drone
  if (sub.includes("drone") || sub.includes("quadcopter")) {
    return {
      "Camera": "48MP, 4K/60fps",
      "Flight Time": "46 minutes",
      "Range": "15 km",
      "Sensors": "Omnidirectional Obstacle Sensing",
      "GPS": "Multi-GNSS",
    };
  }

  // Generic electronics fallback
  return {
    "Type": subCategory || "Electronic Device",
    "Brand": brand !== "Unknown" ? brand : "—",
    "Status": "Specifications vary by model",
  };
}
