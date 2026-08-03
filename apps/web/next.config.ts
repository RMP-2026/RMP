import path from "node:path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — otherwise Next.js's root inference can pick up
  // an unrelated lockfile elsewhere on disk instead of this pnpm monorepo's root.
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default withSentryConfig(nextConfig, {
  org: "rental-marketplace",
  project: "javascript-nextjs",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
