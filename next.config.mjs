/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'loremflickr.com',
      'fra.cloud.appwrite.io',   // ← add this line
    ],
  },
};

export default nextConfig;
