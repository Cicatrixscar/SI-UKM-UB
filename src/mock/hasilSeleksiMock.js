/**
 * Mock layer: hasil seleksi mahasiswa (UC005).
 *
 * [DOKUMEN] PRD v0.3 §7.10 — `hasilSeleksiService.getHasilSeleksi(idMahasiswa)`.
 * [DOKUMEN] PRD v0.3 §11.5 — pengumuman dilakukan per UKM, sehingga hasil
 *           ditampilkan per pendaftaran milik mahasiswa.
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-07 — kartu hasil: ikon UKM, nama UKM,
 *           chip kategori, badge hasil, "Diumumkan pada [tanggal]", pesan hasil,
 *           panel langkah selanjutnya (DITERIMA) / panel abu (DITOLAK) /
 *           kartu redup (MENUNGGU PENGUMUMAN).
 * [DOKUMEN] AI.md §4 — semua service mengembalikan Promise.
 *
 * [USULAN] Bentuk return (gabungan Pendaftaran + UKM + kategori) tidak ada di
 *          PRD; dipilih agar halaman tidak menggabungkan data sendiri.
 */

import { store } from './store.js'
import { STATUS_SELEKSI } from '../enums/statusBerkas.js'

function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Hasil seleksi seluruh pendaftaran milik satu mahasiswa, terbaru di atas.
 * @param {string} idMahasiswa
 * @returns {Promise<Array<object>>} tiap entri: pendaftaran + ukm + kategori
 */
export async function mockGetHasilSeleksi(idMahasiswa) {
  await delay()

  const hasil = []
  for (const p of store.pendaftaran) {
    if (p.idMahasiswa !== idMahasiswa) continue
    const ukm = store.ukm.find(u => u.idUKM === p.idUKM)
    if (!ukm) continue
    const kategori = store.kategori.find(k => k.idKategori === ukm.idKategori)

    hasil.push({
      idPendaftaran: p.idPendaftaran,
      nomorPendaftaran: p.nomorPendaftaran,
      idUKM: ukm.idUKM,
      namaUKM: ukm.namaUKM,
      ikon: ukm.ikon,
      foto: ukm.foto,
      idKategori: ukm.idKategori,
      namaKategori: kategori?.namaKategori ?? '',
      statusSeleksi: p.statusSeleksi,
      terkunci: Boolean(p.terkunci),
      tanggalDiumumkan: p.tanggalDiumumkan ?? null,
      langkahSelanjutnya: ukm.langkahSelanjutnya ?? null,
      // Pesan hasil untuk DITOLAK tidak memakai catatanAdmin (Brief K4/G9).
      catatanSeleksi: p.catatanSeleksi ?? '',
    })
  }

  return hasil.sort(
    (a, b) => new Date(b.tanggalDiumumkan ?? 0).getTime() - new Date(a.tanggalDiumumkan ?? 0).getTime()
  )
}

/**
 * Apakah hasil seleksi sudah tersedia (ada pendaftaran berstatus bukan PENDING)?
 * [USULAN] membantu halaman memilih teks kosong; PRD tidak memuat method ini.
 * @param {string} idMahasiswa
 * @returns {Promise<boolean>}
 */
export async function mockAdaHasilSeleksi(idMahasiswa) {
  const daftar = await mockGetHasilSeleksi(idMahasiswa)
  return daftar.some(h => h.statusSeleksi !== STATUS_SELEKSI.PENDING)
}
