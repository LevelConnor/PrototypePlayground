/** @type {import('next').NextConfig} */
const nextConfig = {
  // Clean URLs: domain.com/p/{slug} → public/prototypes/{slug}/index.html
  async rewrites() {
    return [
      {
        source: '/p/:slug',
        destination: '/prototypes/:slug/index.html',
      },
    ];
  },
  // Permissive headers so vibe-coded prototypes that load CDN scripts work
  async headers() {
    return [
      {
        source: '/prototypes/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
