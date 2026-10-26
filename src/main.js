/**
 * Titik masuk aplikasi.
 *
 * [DOKUMEN] AI.md §4: "Bahasa: JavaScript (ES Modules)", "Build: Vite".
 * [DOKUMEN] AI.md §5 daftar file yang boleh diubah — src/main.js.
 * [DOKUMEN] PRD v0.3 §5.1 (struktur folder).
 */

import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'

import { mulaiRouter, tambahRute } from './router.js'
import { config } from './config.js'
import { menuMahasiswa } from './layouts/navConfig.js'

document.title = `${config.namaAplikasi} · ${config.institusi}`

tambahRute({
  jalur: '/',
  judul: 'Masuk',
  perluLogin: false,
  halaman: () => import('./pages/auth/LoginPage.js'),
})

// Rute menu Mahasiswa (navConfig.js) — Riwayat dan Hasil Seleksi tampil tetapi
// belum berfungsi pada sprint ini (AI.md §1).
for (const item of menuMahasiswa) {
  tambahRute({
    jalur: item.jalur,
    judul: item.label,
    perluLogin: true,
    peran: 'MAHASISWA',
    halaman: item.halaman,
  })
}

// Detail UKM — [DOKUMEN] Brief §4.3: `#/mahasiswa/ukm/:id`.
tambahRute({
  jalur: '/mahasiswa/ukm/:idUKM',
  judul: 'Detail UKM',
  perluLogin: true,
  peran: 'MAHASISWA',
  halaman: () => import('./pages/mahasiswa/DetailUKMPage.js'),
})

// Form pendaftaran tiga langkah — [DOKUMEN] Brief §4.3: `#/mahasiswa/daftar/:id/data|dokumen|review`.
for (const tahap of ['data', 'dokumen', 'review']) {
  tambahRute({
    jalur: `/mahasiswa/daftar/:idUKM/${tahap}`,
    judul: 'Form Pendaftaran',
    perluLogin: true,
    peran: 'MAHASISWA',
    halaman: () => import('./pages/mahasiswa/FormPendaftaranPage.js'),
  })
}

const akar = document.getElementById('app')

if (import.meta.env.DEV) {
  // Penanda Tahap T0 — halaman kosong pada `#/` sampai T1 menggantinya.
  console.info(`[SI UKM UB] mock=${config.USE_MOCK} · rute=${location.hash || '#/'}`)
}

mulaiRouter(akar)
