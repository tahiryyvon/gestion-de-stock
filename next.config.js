/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configuration pour le build desktop (static export)
  ...(process.env.NODE_ENV === 'desktop' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  })
}

module.exports = nextConfig