/**
 * Mock layer: notifikasi mahasiswa.
 *
 * [DOKUMEN] PRD v0.3 §7.9 — `notifikasiService.getNotifikasiSaya(idMahasiswa)`
 *           dan `notifikasiService.tandaiDibaca(idNotifikasi)`.
 * [DOKUMEN] PRD v0.3 §6.10 — entitas Notifikasi; `simpanNotifikasiBatch` dipakai
 *           saat pengumuman (di luar lingkup layar mahasiswa sprint ini).
 * [DOKUMEN] AI.md §4 — semua service mengembalikan Promise; halaman tidak
 *           mengimpor mock secara langsung.
 *
 * [USULAN] `tandaiSemuaDibaca(idMahasiswa)` tidak ada di PRD; dibutuhkan tombol
 *          "Tandai semua dibaca" pada desain Hi-Fi layar Notifikasi.
 */

import { store } from './store.js'

function delay(ms = 250) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Urutkan terbaru di atas (desain Hi-Fi: "Urutkan: Terbaru"). */
function terbaru(dulu, baru) {
  return new Date(baru.timestamp).getTime() - new Date(dulu.timestamp).getTime()
}

/**
 * Notifikasi milik satu mahasiswa, terbaru di atas.
 * @param {string} idMahasiswa
 * @returns {Promise<Array<object>>}
 */
export async function mockGetNotifikasiSaya(idMahasiswa) {
  await delay()
  return store.notifikasi
    .filter(n => n.idMahasiswa === idMahasiswa)
    .sort(terbaru)
    .map(n => ({ ...n }))
}

/**
 * Tandai satu notifikasi sebagai sudah dibaca.
 * @param {string} idNotifikasi
 * @returns {Promise<boolean>} false bila id tidak ditemukan
 */
export async function mockTandaiDibaca(idNotifikasi) {
  await delay(150)
  const item = store.notifikasi.find(n => n.idNotifikasi === idNotifikasi)
  if (!item) return false
  item.dibaca = true
  return true
}

/**
 * Tandai seluruh notifikasi mahasiswa sebagai sudah dibaca.
 * [USULAN] PRD §7.9 hanya memuat `tandaiDibaca`; tombol "Tandai semua dibaca"
 *          pada desain Hi-Fi butuh aksi massal.
 * @param {string} idMahasiswa
 * @returns {Promise<boolean>} true bila ada yang berubah
 */
export async function mockTandaiSemuaDibaca(idMahasiswa) {
  await delay(150)
  let berubah = false
  for (const n of store.notifikasi) {
    if (n.idMahasiswa === idMahasiswa && !n.dibaca) {
      n.dibaca = true
      berubah = true
    }
  }
  return berubah
}
