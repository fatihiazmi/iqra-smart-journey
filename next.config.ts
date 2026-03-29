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
  // Next.js 16 uses Turbopack by default; next-pwa injects webpack config,
  // so we set an empty turbopack key to allow the build to proceed.
  turbopack: {},
});

export default nextConfig;
