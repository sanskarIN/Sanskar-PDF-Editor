import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const host = process.env.TAURI_DEV_HOST;
const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined;

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    ...(!isTauri ? [viteSingleFile()] : [])
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
})
