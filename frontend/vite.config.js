import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, el frontend (puerto 5173) reenvía la API y las imágenes al backend.
// En producción, Express sirve el build y la API desde el mismo dominio.
const BACKEND = 'http://localhost:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': BACKEND,
      '/Imagenes': BACKEND,
    },
  },
})
