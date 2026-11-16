/**
 * Service: hasil seleksi mahasiswa (UC005).
 *
 * [DOKUMEN] PRD v0.3 §7.10 — tabel `hasilSeleksiService` `[USULAN]`:
 *   | getHasilSeleksi(idMahasiswa) | UC005 |
 * [DOKUMEN] PRD v0.3 §11.5 — pengumuman dilakukan per UKM; hasil ditampilkan
 *           per pendaftaran milik mahasiswa.
 * [DOKUMEN] Data dibaca dari tabel `pendaftaran` + relasi `ukm`/`kategori`.
 *
 * [USULAN] Bentuk return (gabungan Pendaftaran + UKM + kategori) tidak ada di
 *          PRD; dipilih agar halaman tidak menggabungkan data sendiri.
 */

import { ambilSupabase, pastikan } from './supabaseClient.js'
import { STATUS_SELEKSI } from '../enums/statusBerkas.js'

/** Kolom yang dibutuhkan kartu hasil seleksi (M-07). */
const PILIH_HASIL =
  'id_pendaftaran, nomor_pendaftaran, status_seleksi, terkunci, tanggal_diumumkan, catatan_seleksi, ' +
  'ukm(id_ukm, nama_ukm, icon, foto, id_kategori, langkah_selanjutnya, kategori(nama_kategori))'

/**
 * Hasil seleksi seluruh pendaftaran milik satu mahasiswa, terbaru di atas.
 * [DOKUMEN] PRD v0.3 §7.10.
 * @param {string} idMahasiswa
 * @returns {Promise<Array<object>>} tiap entri: pendaftaran + ukm + kategori
 */
export async function getHasilSeleksi(idMahasiswa) {
  const { data, error } = await ambilSupabase()
    .from('pendaftaran')
    .select(PILIH_HASIL)
    .eq('id_mahasiswa', idMahasiswa)
  pastikan(error)

  const hasil = (data ?? []).map(p => ({
    idPendaftaran: p.id_pendaftaran,
    nomorPendaftaran: p.nomor_pendaftaran,
    idUKM: p.ukm?.id_ukm ?? '',
    namaUKM: p.ukm?.nama_ukm ?? '',
    ikon: p.ukm?.icon ?? 'i-award',
    foto: p.ukm?.foto ?? '',
    idKategori: p.ukm?.id_kategori ?? '',
    namaKategori: p.ukm?.kategori?.nama_kategori ?? '',
    statusSeleksi: p.status_seleksi,
    terkunci: Boolean(p.terkunci),
    tanggalDiumumkan: p.tanggal_diumumkan ?? null,
    langkahSelanjutnya: p.ukm?.langkah_selanjutnya ?? null,
    // Pesan hasil untuk DITOLAK tidak memakai catatanAdmin (Brief K4/G9).
    catatanSeleksi: p.catatan_seleksi ?? '',
  }))

  return hasil.sort(
    (a, b) => new Date(b.tanggalDiumumkan ?? 0).getTime() - new Date(a.tanggalDiumumkan ?? 0).getTime()
  )
}

/**
 * Apakah minimal satu hasil sudah diumumkan.
 * [USULAN] PRD tidak memuat method ini; dipakai halaman untuk memilih antara
 *          pesan kosong M-07 dan daftar hasil.
 * @param {string} idMahasiswa
 * @returns {Promise<boolean>}
 */
export async function adaHasilSeleksi(idMahasiswa) {
  const daftar = await getHasilSeleksi(idMahasiswa)
  return daftar.some(h => h.statusSeleksi !== STATUS_SELEKSI.PENDING)
}
