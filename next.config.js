/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    swcMinify: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, "bcrypt"]
    return config
  },
}

module.exports = nextConfig