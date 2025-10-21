import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Unoptimized images required for Cloudflare Workers
    // Cloudflare Workers don't support Next.js automatic image optimization
    // Use Cloudflare Images or external CDN for production optimization
    unoptimized: true,
  },
  // Security headers for production-ready app
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          // Force HTTPS for 2 years
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          // Prevent clickjacking attacks
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          // Prevent MIME type sniffing
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          // Control referrer information
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          // Disable unused browser features
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
