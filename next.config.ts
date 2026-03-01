import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@lmnr-ai/lmnr", "esbuild", "@esbuild/win32-x64"],
};

export default nextConfig;
