/** @type {import('next').NextConfig} */

const path = require('path')

const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/account123/**',
			},
		],
	},
	headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin", // "same-origin-allow-popups"
					},
					// {
					// 	key: "Cross-Origin-Embedder-Policy",
					// 	value: "require-corp",
					// },
				],
			},
		];
	},
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
	},
}

module.exports = nextConfig
