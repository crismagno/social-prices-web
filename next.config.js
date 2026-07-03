/** @type {import('next').NextConfig} */

const path = require('path')

const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},

	// Otimizações de performance
	swcMinify: true,
	reactStrictMode: true,

	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},

	// Otimização de imagens
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/account123/**',
			},
		],
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},

	// Cache headers otimizados
	headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin-allow-popups"
					},
				],
			},
			{
				source: '/static/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		];
	},

	// Otimização de bundle
	experimental: {
		optimizePackageImports: ['antd', 'lodash', 'recharts', '@ant-design/icons'],
	},

	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
	},
}

module.exports = nextConfig
