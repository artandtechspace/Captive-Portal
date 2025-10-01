/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
};

export default nextConfig;
