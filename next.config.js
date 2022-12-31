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
  settings: {
    'import/resolver': {
      'node': {
        'extensions': ['.js','.jsx','.ts','.tsx']
      }
    }
  },
}

module.exports = nextConfig
