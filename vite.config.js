import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/unlinked.xyz/',
  plugins: [react()],
  server: {
    allowedHosts: ['nonmodificatory-gethsemanic-refugio.ngrok-free.dev'],
  },
}))
