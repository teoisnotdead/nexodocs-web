import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const monorepoRoot = path.resolve(process.cwd(), "../..");
const turbopackRoot = existsSync(path.join(monorepoRoot, "pnpm-workspace.yaml"))
  ? monorepoRoot
  : process.cwd();

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
