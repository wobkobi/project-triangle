// next.config.mjs

import bundleAnalyzer from "@next/bundle-analyzer";

/** @type {import("next").NextConfig} */
const nextConfig = {
  // — Opt in to React strict mode
  reactStrictMode: true,

  // — Standalone build for Docker / serverless
  output: "standalone",

  // — Don’t block production builds on lint errors
  eslint: { ignoreDuringBuilds: true },

  // — Fail build on TS errors
  typescript: { ignoreBuildErrors: false },

  // — Allow Next.js Image to load external icons from maps.google.com
  images: {
    domains: ["maps.google.com"],
  },

  // — Global security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
