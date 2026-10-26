/**
 * Status berkas dan status seleksi pada entitas Pendaftaran.
 *
 * STATUS_BERKAS
 *   Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 67
 *           entitas Pendaftaran, atribut `statusBerkas : String`.
 *   Sumber: PRD v0.3 §6.5 — `MENUNGGU_VERIFIKASI_BERKAS` / `LENGKAP` /
 *           `TIDAK_LENGKAP` / `SIAP_SELEKSI`.
 *
 * STATUS_SELEKSI
 *   Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 67
 *           entitas Pendaftaran, atribut `statusSeleksi : String`.
 *   Sumber: PRD v0.3 §6.5 — `PENDING` / `DITERIMA` / `DITOLAK`.
 *   [USULAN] Ditaruh di file ini karena daftar file enum dibatasi pada
 *            AI.md §5 (hanya statusPendaftaran.js, statusBerkas.js,
 *            roles.js). Keduanya adalah field entitas Pendaftaran.
 */

export const STATUS_BERKAS = Object.freeze({
  MENUNGGU_VERIFIKASI_BERKAS: 'MENUNGGU_VERIFIKASI_BERKAS',
  LENGKAP: 'LENGKAP',
  TIDAK_LENGKAP: 'TIDAK_LENGKAP',
  SIAP_SELEKSI: 'SIAP_SELEKSI',
})

export const STATUS_SELEKSI = Object.freeze({
  PENDING: 'PENDING',
  DITERIMA: 'DITERIMA',
  DITOLAK: 'DITOLAK',
})

export const LABEL_STATUS_BERKAS = Object.freeze({
  [STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS]: 'Terdaftar - Menunggu Verifikasi Berkas',
  [STATUS_BERKAS.LENGKAP]: 'Berkas Lengkap',
  [STATUS_BERKAS.TIDAK_LENGKAP]: 'Berkas Tidak Lengkap',
  [STATUS_BERKAS.SIAP_SELEKSI]: 'Siap Seleksi',
})

export const LABEL_STATUS_SELEKSI = Object.freeze({
  [STATUS_SELEKSI.PENDING]: 'MENUNGGU PENGUMUMAN',
  [STATUS_SELEKSI.DITERIMA]: 'DITERIMA',
  [STATUS_SELEKSI.DITOLAK]: 'DITOLAK',
})
