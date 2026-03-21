import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/athena-web",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
