import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
    ],
  },
  // sharp loads its libvips binary at runtime through dlopen, which file
  // tracing cannot see. Without these the deployed server throws
  // "libvips-cpp.so: cannot open shared object file" on every request.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/@img/**"],
  },
  serverExternalPackages: ["sharp"],
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
