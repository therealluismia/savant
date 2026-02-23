import type { NextConfig } from "next";

// Loader path from @ideavo/webpack-tagger - use direct resolve to get the actual file
const loaderPath = require.resolve('@ideavo/webpack-tagger');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  allowedDevOrigins: ['*.e2b.app', '*.ideavo.app', '*.ideavo.ai'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Proxy Metro bundler requests to port 8081
  async rewrites() {
    return [
      // Proxy /expo/* → Metro root (catches /expo and /expo/anything)
      {
        source: '/expo',
        destination: 'http://localhost:8081/',
      },
      {
        source: '/expo/:path*',
        destination: 'http://localhost:8081/:path*',
      },
      // Metro JS bundles requested at root level (e.g. /index.ts.bundle?...)
      {
        source: '/index.ts.bundle',
        destination: 'http://localhost:8081/index.ts.bundle',
      },
      // Metro source maps
      {
        source: '/index.ts.map',
        destination: 'http://localhost:8081/index.ts.map',
      },
      // Metro static assets served by Expo web (/_expo/static/*)
      {
        source: '/_expo/:path*',
        destination: 'http://localhost:8081/_expo/:path*',
      },
      // Metro HMR websocket path
      {
        source: '/__metro/:path*',
        destination: 'http://localhost:8081/__metro/:path*',
      },
    ];
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  }
} as NextConfig;

export default nextConfig;
