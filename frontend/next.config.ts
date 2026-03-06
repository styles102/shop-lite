import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
