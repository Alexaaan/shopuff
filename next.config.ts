import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation pour Vercel
  output: 'standalone',

  // Optimisation des images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jnrpuff.fr',
      },
      {
        protocol: 'https',
        hostname: 'mgurvmzppgdlpvdmvhla.supabase.co',
      },
    ],
  },

  // Fonctionnalités expérimentales optimisées
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  // Configuration Turbopack
  turbopack: {},

  // Compression et optimisation
  compress: true,
  poweredByHeader: false,


  // Headers de sécurité et performance
  async headers() {
    return [
      // Sécurité générale
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },

      // Cache pour les APIs
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-RateLimit-Limit',
            value: '100',
          },
        ],
      },

      // Cache agressif pour les assets statiques
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // Cache pour les images
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },

  // Optimisation des pages statiques
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Webpack optimisation
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimisation des chunks
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        supabase: {
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          name: 'supabase',
          chunks: 'all',
          priority: 20,
        },
      };
    }

    // Alias pour optimiser les imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/hooks': './src/hooks',
      '@/types': './src/types',
      '@/services': './src/services',
    };

    return config;
  },

  // Logging optimisé
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Types d'environnement
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
