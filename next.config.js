const withNextIntl = require('next-intl/plugin')('./src/i18n/config.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = withNextIntl(nextConfig)