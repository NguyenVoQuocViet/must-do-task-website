import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Đường dẫn tương đối để chạy được ở https://<user>.github.io/<tên-repo>/ với mọi tên repo
  base: './',
  plugins: [react(), tailwindcss()],
})
