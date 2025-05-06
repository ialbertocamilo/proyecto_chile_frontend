/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    // 1) Tu fallback actual para módulos de Node
    config.resolve.fallback = {
      fs: false,
      path: false,
    };

    // 2) Regla para tratar archivos .wasm como recursos estáticos
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[name].[hash][ext]',
      },
    });

    // 3) Habilitar el experimento de WebAssembly asíncrono en webpack 5
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // 4) (Opcional) Alias para resolver importaciones directas de 'ifcdb.wasm'
    config.resolve.alias = {
      ...config.resolve.alias,
      'ifcdb.wasm': path.resolve(
        __dirname,
        'node_modules/@xeokit/xeokit-sdk/dist/ifcdb.wasm'
      ),
    };

    return config;
  },
};

module.exports = nextConfig;
