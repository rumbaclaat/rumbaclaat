import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Static-source reference imagery (to be migrated into Supabase Storage).
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage public bucket.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
