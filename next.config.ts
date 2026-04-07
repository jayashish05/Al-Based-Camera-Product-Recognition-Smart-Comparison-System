import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow camera access from any origin (needed for mobile scanning)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Permissions-Policy", value: "camera=(*)" },
        ],
      },
    ];
  },
};

export default nextConfig;
