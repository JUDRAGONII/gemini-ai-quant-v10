/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // 確保靜態資產加載正確
    poweredByHeader: false,
    compress: true,

    // 代理後端 API 請求（統一 catch-all 規則）
    async rewrites() {
        // 容器內使用 Docker service name；本地開發使用 localhost
        const backendUrl = process.env.BACKEND_URL || 'http://ai-api:8001';
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            }
        ];
    },
};

export default nextConfig;
