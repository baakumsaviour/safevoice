/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Must fit an 8 MB evidence file + a voice note + form fields together.
      bodySizeLimit: '20mb'
    }
  }
}

export default nextConfig
