/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CompanyName: 'Lionrock Technology Inc.',
    WebsiteName: 'LRT Staff Management',
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
