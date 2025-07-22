/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像最適化設定
  images: {
    // domains: ['localhost', 'bakushin.blog'], // ← この行を削除またはコメントアウト
    remotePatterns: [
      {
        protocol: 'http', // ローカル開発環境がHTTPの場合。HTTPSの場合は 'https' に変更してください。
        hostname: 'localhost',
        // port: '3000', // ローカル開発サーバーのポート番号を必要に応じて指定してください。
        pathname: '/**', // localhost上の全ての画像パスを許可する場合
      },
      {
        protocol: 'https', // bakushin.blog が通常HTTPSで提供されていると仮定。HTTPの場合は 'http' に変更してください。
        hostname: 'bakushin.blog',
        pathname: '/**', // bakushin.blog 上の全ての画像パスを許可する場合
      },
    ],
    // unoptimized: true, // 静的エクスポート時のみ必要な場合はコメントアウト
  },

  // CORS設定（既存設定を維持）
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },

  // SSG最適化設定（必要に応じて有効化）
  // output: 'export', // 完全な静的サイト生成が必要な場合のみ有効化
  trailingSlash: false, // お好みに応じて調整

  // 実験的機能
  experimental: {
    // App Routerの静的生成最適化
    optimizePackageImports: ['@apollo/client'],
  },

  // Webpack設定
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // プロダクションビルド時の最適化
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }

    return config;
  },

  // 環境変数の公開
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://bakushin.blog',
  },

  // リダイレクト設定（必要に応じて追加）
  async redirects() {
    return [
      // 例: 旧URLから新URLへのリダイレクト
      // {
      //   source: '/old-blog/:slug',
      //   destination: '/all-blogs/:slug',
      //   permanent: true,
      // },
    ];
  },

  // リライト設定（必要に応じて追加）
  async rewrites() {
    return [
      // 例: API プロキシ設定
      // {
      //   source: '/wp-api/:path*',
      //   destination: 'https://bakushin.blog/wp-json/:path*',
      // },
    ];
  },
};

export default nextConfig;