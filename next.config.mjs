/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
    async redirects() {
        return [
            // Basic redirect
            {
                source: '/index.html',
                destination: '/auth/login',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;
