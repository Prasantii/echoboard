import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/', // The incoming request path
        destination: '/auth', // The destination path
        permanent: true, // Use true for 308, false for 307
      },
    ];
  },
};



export default nextConfig;
