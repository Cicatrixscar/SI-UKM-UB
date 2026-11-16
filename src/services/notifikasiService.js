/**
 * Service: notifikasi mahasiswa (UC005, UC007).
 *
 * [DOKUMEN] PRD v0.3 §7.9 — tabel `notifikasiService` `[USULAN]`:
 *   | Method                   | Parameter | Return   | UC       |
 *   | getNotifikasiSaya(id)    | String    | Notifikasi[] | UC005, UC007 |
 *   | tandaiDibaca(idNotifikasi)| String   | boolean  | UC005, UC007 |
 * [DOKUMEN] PRD v0.3 §6.10 — entitas Notifikasi.
 * [DOKUMEN] AI.md §4 — setiap service mengembalikan Promise; halaman hanya
 *           memanggil `services/`, tidak mengimpor `mock/`.
 *
 * [USULAN] `tandaiSemuaDibaca(idMahasiswa)` — dibutuhkan tombol "Tandai semua
 *          dibaca" pada desain Hi-Fi layar Notifikasi; tidak ada di PRD.
 */

import { config } from '../config.js'
import {
  mockGetNotifikasiSaya,
  mockTandaiDibaca,
  mockTandaiSemuaDibaca,
} from '../mock/notifikasiMock.js'

/**
 * Ambil seluruh notifikasi milik mahasiswa (terbaru di atas).
 * [DOKUMEN] PRD v0.3 §7.9.
 * @param {string} idMahasiswa
 * @returns {Promise<import('../models/Notifikasi.js').Notifikasi[]>}
 */
export async function getNotifikasiSaya(idMahasiswa) {
  if (!config.USE_MOCK) throw new Error('Backend belum tersedia')
  return mockGetNotifikasiSaya(idMahasiswa)
}

/**
 * Tandai satu notifikasi sudah dibaca.
 * [DOKUMEN] PRD v0.3 §7.9.
 * @param {string} idNotifikasi
 * @returns {Promise<boolean>}
 */
export async function tandaiDibaca(idNotifikasi) {
  if (!config.USE_MOCK) throw new Error('Backend belum tersedia')
  return mockTandaiDibaca(idNotifikasi)
}

/**
 * Tandai seluruh notifikasi mahasiswa sudah dibaca.
 * [USULAN] PRD §7.9 hanya memuat `tandaiDibaca`.
 * @param {string} idMahasiswa
 * @returns {Promise<boolean>}
 */
export async function tandaiSemuaDibaca(idMahasiswa) {
  if (!config.USE_MOCK) throw new Error('Backend belum tersedia')
  return mockTandaiSemuaDibaca(idMahasiswa)
}
