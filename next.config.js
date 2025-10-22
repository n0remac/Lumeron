/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.printify.com',
      },
      {
        protocol: 'https',
        hostname: '**.etsystatic.com',
      },
    ],
  },
};

module.exports = nextConfig;
