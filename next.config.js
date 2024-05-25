/** @type {import('next').NextConfig} */
// const nextConfig = {};
// next.config.js
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer && process.env.NEXT_DISABLE_FAST_REFRESH) {
        config.module.rules.forEach((rule) => {
          if (rule.oneOf) {
            rule.oneOf.forEach((one) => {
              if (
                one.loader &&
                one.loader.includes('next/dist/compiled/css-loader')
              ) {
                if (one.options.modules) {
                  one.options.modules.localIdentName = '[name]_[local]_[hash:base64:5]';
                }
              }
            });
          }
        });
      }
      return config;
    },
  };
  
  module.exports = nextConfig;
  

// export default nextConfig;

