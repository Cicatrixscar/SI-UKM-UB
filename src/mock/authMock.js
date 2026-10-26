/**
 * Mock layer: autentikasi.
 *
 * [DOKUMEN] PRD v0.3 §7.1 authService (mock):
 *           | login(email, pass) | String, String | `{ berhasil, user, pesan }` |
 *           | logout() | — | void |
 * [DOKUMEN] MP2 §3.4.1 hal. 65 — Pengguna.login(email, pass): boolean,
 *           Pengguna.logout(): void.
 * [DOKUMEN] AI.md §4: "Setiap service mengembalikan Promise. Mock memakai
 *           await delay(...)."
 *
 * [USULAN] `delay` diduplikasi di tiap file mock karena daftar file (AI.md §5)
 *          tidak memuat file utilitas mock terpisah.
 */

import { store } from './store.js'
import { login as loginPengguna, logout as logoutPengguna } from '../models/Pengguna.js'

/** Latensi tiruan agar state loading bisa dilihat di UI. */
function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Autentikasi mock.
 * @returns {Promise<{berhasil: boolean, user: object|null, pesan: string}>}
 *
 * [USULAN] `pesan` dibiarkan kosong untuk kredensial salah — PRD §14 tidak
 *          memuat teks pesan "login gagal" (AI.md §9 melarang membuat teks baru).
 */
export async function mockLogin(email, pass) {
  await delay()
  const ditemukan = loginPengguna(store.pengguna, email, pass)
  if (!ditemukan) return { berhasil: false, user: null, pesan: '' }
  const user = store.pengguna.find(
    p => p.email.toLowerCase() === String(email).trim().toLowerCase()
  )
  return { berhasil: true, user, pesan: '' }
}

/** @returns {Promise<void>} */
export async function mockLogout() {
  await delay(120)
  logoutPengguna()
}

/**
 * Cari akun berdasarkan email (untuk tombol cepat mode mock).
 * [USULAN] Brief M-02: "Di layar ini pilih role untuk mode mock."
 */
export async function mockLoginSebagaiMahasiswa() {
  await delay(200)
  const mahasiswa = store.pengguna.find(p => p.role === 'MAHASISWA')
  return { berhasil: Boolean(mahasiswa), user: mahasiswa ?? null, pesan: '' }
}
