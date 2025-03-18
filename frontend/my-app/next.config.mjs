/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**',
            port: '', // Để trống nếu không dùng port cụ thể
            pathname: '/**', // Cho phép tất cả các đường dẫn dưới domain này
          },
        ],
      },
};

export default nextConfig;
