import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to the monorepo root for correct lockfile detection.
  turbopack: {
    root: join(__dirname, "..", ".."),
  },
  // Transpile shared workspace packages (shipped as TypeScript source).
  transpilePackages: ["@pocketpilot/core", "@pocketpilot/supabase"],
};

export default nextConfig;
