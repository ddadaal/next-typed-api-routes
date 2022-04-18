const external = (child) =>
  process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true',
    })(child)
    : child;

/** @type {import('next').NextConfig} */
module.exports = external({
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
})
