/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }], unoptimized: false },
  experimental: { serverActions: { allowedOrigins: ['*'] } },
};
module.exports = nextConfig;
