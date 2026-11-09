import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { existsSync, createReadStream, statSync } from 'node:fs';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
  ico: 'image/x-icon',
  json: 'application/json',
};

function serveStaticAssetsPlugin(): Plugin {
  return {
    name: 'serve-storefront-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const urlWithoutQuery = req.url.split('?')[0];

        if (urlWithoutQuery.startsWith('/assets/')) {
          try {
            const decoded = decodeURIComponent(urlWithoutQuery);
            const relPath = decoded.replace(/^\/assets\//, '');
            const storefrontAsset = resolve(__dirname, '../storefront/public/assets', relPath);
            const adminAsset = resolve(__dirname, 'public/assets', relPath);

            const targetPath = existsSync(storefrontAsset)
              ? storefrontAsset
              : existsSync(adminAsset)
                ? adminAsset
                : null;

            if (targetPath && statSync(targetPath).isFile()) {
              const ext = targetPath.split('.').pop()?.toLowerCase() ?? '';
              const contentType = MIME_TYPES[ext] || 'application/octet-stream';
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'no-cache');
              return createReadStream(targetPath).pipe(res);
            }
          } catch {
            // Proceed to next middleware if resolution fails
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveStaticAssetsPlugin()],
  base: process.env.VITE_BASE ?? '/',
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
      '/storage': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
