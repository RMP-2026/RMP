import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — otherwise Next.js's root inference can pick up
  // an unrelated lockfile elsewhere on disk instead of this pnpm monorepo's root.
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
