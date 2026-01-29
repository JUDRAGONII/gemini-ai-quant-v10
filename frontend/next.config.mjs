/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // 確保靜態資產加載正確
    poweredByHeader: false,
    compress: true,
};

export default nextConfig;
