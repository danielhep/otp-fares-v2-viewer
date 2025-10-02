import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [tailwindcss(), react()],
        base: mode === 'production' ? '/otp-fares-v2-viewer/' : '/',
  }
})
