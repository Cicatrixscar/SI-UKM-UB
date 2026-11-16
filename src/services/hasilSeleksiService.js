/**
 * Service: hasil seleksi mahasiswa (UC005).
 *
 * [DOKUMEN] PRD v0.3 §7.10 — tabel `hasilSeleksiService` `[USULAN]`:
 *   | getHasilSeleksi(idMahasiswa) | UC005 |
 * [DOKUMEN] PRD v0.3 §11.5 — pengumuman dilakukan per UKM; hasil ditampilkan
 *           per pendaftaran milik mahasiswa.
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-07 — halaman Hasil Seleksi.
 * [DOKUMEN] AI.md §4 — setiap service mengembalikan Promise; halaman hanya
 *           memanggil `services/`, tidak mengimpor `mock/`.
 */

import { config } from '../config.js'
import { mockGetHasilSeleksi, mockAdaHasilSeleksi } from '../mock/hasilSeleksiMock.js'

/**
 * Ambil hasil seleksi seluruh pendaftaran milik mahasiswa.
 * [DOKUMEN] PRD v0.3 §7.10.
 * @param {string} idMahasiswa
 * @returns {Promise<Array<object>>}
 */
export async function getHasilSeleksi(idMahasiswa) {
  if (!config.USE_MOCK) throw new Error('Backend belum tersedia')
  return mockGetHasilSeleksi(idMahasiswa)
}

/**
 * Apakah minimal satu hasil sudah diumumkan.
 * [USULAN] PRD tidak memuat method ini; dipakai halaman untuk memilih antara
 *          pesan kosong M-07 dan daftar hasil.
 * @param {string} idMahasiswa
 * @returns {Promise<boolean>}
 */
export async function adaHasilSeleksi(idMahasiswa) {
  if (!config.USE_MOCK) throw new Error('Backend belum tersedia')
  return mockAdaHasilSeleksi(idMahasiswa)
}
