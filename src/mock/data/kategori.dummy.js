/**
 * Data dummy: Kategori.
 *
 * [DOKUMEN] PRD v0.3 §6.7 Kategori:
 *           "idKategori, namaKategori, deskripsi, iconUrl (String).
 *            Method: findAll(): Kategori[], findById(idKategori): Kategori."
 *           Method entitas Kategori TIDAK diimplementasikan — sprint UC003/UC004
 *           hanya membutuhkan `kategoriService.getDaftarKategori()` (PRD §7.8).
 *
 * [DOKUMEN] UI/UX Wireframe Brief §9 keputusan G2:
 *           "Nama kategori di screenshot: Seni & Kreativitas, Olahraga, Alam,
 *            Teknologi, Penalaran ... Ubah data dummy kategori sesuai screenshot."
 *
 * [DOKUMEN] AI.md §5 — file ini dibatasi "hanya data untuk sprint ini".
 */

import { createPersyaratanDokumen, KODE_DOKUMEN } from '../../models/PersyaratanDokumen.js'

/**
 * @typedef {object} Kategori
 * @property {string} idKategori
 * @property {string} namaKategori
 * @property {string} deskripsi
 * @property {string} iconUrl
 */

/** @type {Kategori[]} */
export const KATEGORI_DUMMY = Object.freeze([
  Object.freeze({
    idKategori: 'KAT-SENI',
    namaKategori: 'Seni & Kreativitas',
    deskripsi: 'UKM di bidang seni pertunjukan dan seni rupa.',
    iconUrl: 'i-palette',
  }),
  Object.freeze({
    idKategori: 'KAT-OLAHRAGA',
    namaKategori: 'Olahraga',
    deskripsi: 'UKM di bidang olahraga dan kebugaran.',
    iconUrl: 'i-basketball',
  }),
  Object.freeze({
    idKategori: 'KAT-ALAM',
    namaKategori: 'Alam',
    deskripsi: 'UKM di bidang alam dan lingkungan.',
    iconUrl: 'i-mountain',
  }),
  Object.freeze({
    idKategori: 'KAT-TEKNOLOGI',
    namaKategori: 'Teknologi',
    deskripsi: 'UKM di bidang teknologi dan riset.',
    iconUrl: 'i-cpu',
  }),
  Object.freeze({
    idKategori: 'KAT-PENALARAN',
    namaKategori: 'Penalaran',
    deskripsi: 'UKM di bidang argumentasi dan kajian ilmiah.',
    iconUrl: 'i-book-open',
  }),
])

/**
 * Daftar persyaratan dokumen wajib untuk seluruh UKM pada sprint ini.
 *
 * [DOKUMEN] AI.md §3 keputusan sementara K2:
 *           "Daftar terstruktur: { kode, nama, deskripsi, wajib }."
 * [DOKUMEN] AI.md §6 M-04: "Ketiga dokumen wajib (KTM, Transkrip, CV)."
 * [DOKUMEN] AI.md §9 larangan: "Jangan mengubah nama method, halaman, atau
 *           service dari PRD" — PersyaratanDokumen sendiri [USULAN].
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-02 (Detail UKM) — deskripsi per dokumen:
 *           KTM "Identitas diri", Transkrip "Nilai akademik terbaru",
 *           CV "Pengalaman & keterampilan".
 */
export const PERSYARATAN_DOKUMEN_DUMMY = Object.freeze([
  Object.freeze(
    createPersyaratanDokumen({
      kode: KODE_DOKUMEN.KTM,
      nama: 'KTM',
      deskripsi: 'Identitas diri',
      wajib: true,
    })
  ),
  Object.freeze(
    createPersyaratanDokumen({
      kode: KODE_DOKUMEN.TRANSKRIP,
      nama: 'Transkrip',
      deskripsi: 'Nilai akademik terbaru',
      wajib: true,
    })
  ),
  Object.freeze(
    createPersyaratanDokumen({
      kode: KODE_DOKUMEN.CV,
      nama: 'CV',
      deskripsi: 'Pengalaman & keterampilan',
      wajib: true,
    })
  ),
])
