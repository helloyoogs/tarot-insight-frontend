import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // sockjs-client 등 Node 환경을 기대하는 라이브러리 호환용
    global: 'window',
  },
})
