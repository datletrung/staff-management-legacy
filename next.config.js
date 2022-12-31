/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    websiteName: 'LRT Staff Management',
  },
  images: {
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
  },
}

module.exports = nextConfig
