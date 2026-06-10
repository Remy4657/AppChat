import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "res.cloudinary.com",
      // },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // cho ảnh Google
      },
    ],
  },
};

export default nextConfig;
