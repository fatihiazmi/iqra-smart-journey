import path from "path";
import withPWAInit from "@ducanh2912/next-pwa";

const pwaOptions = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withPWA = withPWAInit(pwaOptions as any);

const nextConfig = withPWA({
  turbopack: {},
  webpack: (config: { resolve: { alias: Record<string, string> } }) => {
    config.resolve.alias["@"] = path.resolve(process.cwd(), "src");
    return config;
  },
});

export default nextConfig;
