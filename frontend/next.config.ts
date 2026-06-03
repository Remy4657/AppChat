import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["lh3.googleusercontent.com"], // thêm domain chứa ảnh
    // hoặc dùng remotePatterns (Next.js 13+)
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
