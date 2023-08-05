/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CompanyName: 'Daydream Technology',
    WebsiteName: 'Daydream HCM',
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
