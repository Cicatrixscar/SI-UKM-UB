import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: false,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globals: false,
    // Tes format memakai jam lokal; pakai WIB agar hasil sama di mesin mana pun.
    env: { TZ: 'Asia/Jakarta' },
    // Cakupan diukur pada logika murni saja; service memanggil jaringan.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**/*.js', 'src/services/pemetaanBaris.js'],
    },
  },
})
