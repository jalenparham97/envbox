import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@envbox/ui", "@envbox/utils"],
  typedRoutes: true,
};

export default nextConfig;