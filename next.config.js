/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['bullmq', 'ioredis'],
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
