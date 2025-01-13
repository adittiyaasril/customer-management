const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cwsmnrhaakrlgyihdljl.supabase.co",
        pathname: "/storage/v1/object/public/customer-photos/**",
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
