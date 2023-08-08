/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CompanyName: 'Daydream Technology',
    WebsiteName: 'Daydream Technology HCM',
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
