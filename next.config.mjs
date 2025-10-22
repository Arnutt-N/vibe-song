/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn-images.dzcdn.net', 'e-cdns-images.dzcdn.net', 'api.deezer.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

export default nextConfig
