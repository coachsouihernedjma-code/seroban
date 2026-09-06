import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { neonApiMiddleware } from './server/neonApi.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'neon-api-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          neonApiMiddleware(req, res, next);
        });
      },
    },
  ],
})

