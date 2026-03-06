import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: ''
      }
    ]
  },
  async rewrites() {
    const apiBase =
      process.env['services__server__https__0'] ??
      process.env['services__server__http__0']

    return apiBase
      ? [{ source: '/api/:path*', destination: `${apiBase}/api/:path*` }]
      : []
  }
}

export default nextConfig
