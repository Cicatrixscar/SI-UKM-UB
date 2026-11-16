/**
 * Data dummy: Pendaftaran dan DokumenPendaftaran.
 *
 * [DOKUMEN] MP2 §3.4.1 Gambar Diagram Kelas Utuh, hal. 67-68 — Pendaftaran
 *           dan DokumenPendaftaran.
 * [DOKUMEN] PRD v0.3 §6.5 (statusBerkas) dan §6.6 (DokumenPendaftaran).
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-06 (detail riwayat) dan M-07 (hasil).
 * [DOKUMEN] AI.md §5 — file ini dibatasi "hanya data untuk sprint ini".
 *
 * Keputusan koherensi data (pilihan user):
 *   UKM Fotografi konsisten berstatus DITERIMA di Riwayat, Hasil Seleksi, dan
 *   Notifikasi. Desain "Berkas Tidak Lengkap" (Brief M-06) dipindahkan ke
 *   pendaftaran UKM Paduan Suara agar tidak kontradiktif.
 *
 * Catatan [USULAN]:
 *   - `nomorPendaftaran` (Brief G4 "No. UKM-2026-0142") — AI.md K4 menangguhkan
 *     field ini pada sprint awal; kini dibutuhkan layar M-06/M-08.
 *   - `tanggalDiumumkan` — Brief M-07 "Diumumkan pada [tanggal]".
 *   - `fileUrl` dibiarkan kosong. File asli tidak ada di mock, sehingga preview
 *     memakai pesan PRD §14: "Dokumen tidak dapat ditampilkan. File mungkin
 *     rusak atau format tidak didukung".
 *   - Dokumen dummy dideklarasikan langsung di file ini karena daftar file mock
 *     (AI.md §5) tidak memuat `dokumen.dummy.js`.
 */

import { createPendaftaran } from '../../models/Pendaftaran.js'
import { createDokumenPendaftaran } from '../../models/DokumenPendaftaran.js'
import { STATUS_BERKAS, STATUS_SELEKSI } from '../../enums/statusBerkas.js'

const BERKAS_PDF = 'application/pdf'
const BERKAS_JPG = 'image/jpeg'

/** @type {import('../../models/Pendaftaran.js').Pendaftaran[]} */
export const PENDAFTARAN_DUMMY = Object.freeze([
  // M-06/M-07: Fotografi DITERIMA (konsisten di semua layar).
  Object.freeze(
    createPendaftaran({
      idPendaftaran: 'PD-2026-0142',
      nomorPendaftaran: 'UKM-2026-0142',
      idUKM: 'UKM-FOTO',
      idMahasiswa: 'USR-001',
      tanggalDaftar: '2026-10-16T09:15:00+07:00',
      statusBerkas: STATUS_BERKAS.SIAP_SELEKSI,
      statusSeleksi: STATUS_SELEKSI.DITERIMA,
      terkunci: true,
      tanggalDiumumkan: '2026-10-20T15:00:00+07:00',
      tanggalUpdateBerkas: '2026-10-17T10:00:00+07:00',
      catatanAdmin: 'Berkas lengkap dan lolos verifikasi.',
      // [USULAN] Pesan hasil tampil di kartu M-07 (Hi-Fi "Selamat bergabung! …").
      catatanSeleksi: 'Selamat bergabung! Silakan cek kontak di bawah untuk informasi selanjutnya.',
    })
  ),
  // M-07: Basket DITOLAK.
  Object.freeze(
    createPendaftaran({
      idPendaftaran: 'PD-2026-0139',
      nomorPendaftaran: 'UKM-2026-0139',
      idUKM: 'UKM-BASKET',
      idMahasiswa: 'USR-001',
      tanggalDaftar: '2026-10-14T10:20:00+07:00',
      statusBerkas: STATUS_BERKAS.SIAP_SELEKSI,
      statusSeleksi: STATUS_SELEKSI.DITOLAK,
      terkunci: true,
      tanggalDiumumkan: '2026-10-20T15:00:00+07:00',
      tanggalUpdateBerkas: '2026-10-15T11:00:00+07:00',
      catatanAdmin: 'Kuota tahun ini sudah terpenuhi.',
      // [USULAN] Pesan hasil DITOLAK memakai `catatanSeleksi`, bukan catatan admin.
      catatanSeleksi: 'Terima kasih telah mendaftar. Kuota tahun ini sudah terpenuhi.',
    })
  ),
  // M-06: Paduan Suara BERKAS TIDAK LENGKAP (desain "Perbaiki Berkas").
  Object.freeze(
    createPendaftaran({
      idPendaftaran: 'PD-2026-0151',
      nomorPendaftaran: 'UKM-2026-0151',
      idUKM: 'UKM-PADUANSUARA',
      idMahasiswa: 'USR-001',
      tanggalDaftar: '2026-10-24T14:30:00+07:00',
      statusBerkas: STATUS_BERKAS.TIDAK_LENGKAP,
      statusSeleksi: STATUS_SELEKSI.PENDING,
      terkunci: false,
      catatanAdmin: 'KTM belum diunggah, silakan upload ulang',
      tanggalUpdateBerkas: '2026-10-25T09:15:00+07:00',
    })
  ),
])

/** @type {import('../../models/DokumenPendaftaran.js').DokumenPendaftaran[]} */
export const DOKUMEN_DUMMY = Object.freeze([
  // Fotografi — lengkap.
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0142-01',
      idPendaftaran: 'PD-2026-0142',
      namaFile: 'KTM_Rusdi.jpg',
      kodeDokumen: 'KTM',
      tipeDokumen: BERKAS_JPG,
      fileUrl: '',
      ukuranFile: 1258291,
      tanggalUnggah: '2026-10-16T09:13:00+07:00',
    })
  ),
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0142-02',
      idPendaftaran: 'PD-2026-0142',
      namaFile: 'Transkrip_Rusdi.pdf',
      kodeDokumen: 'TRANSKRIP',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 2516582,
      tanggalUnggah: '2026-10-16T09:14:00+07:00',
    })
  ),
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0142-03',
      idPendaftaran: 'PD-2026-0142',
      namaFile: 'CV_Rusdi.pdf',
      kodeDokumen: 'CV',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 1887436,
      tanggalUnggah: '2026-10-16T09:15:00+07:00',
    })
  ),
  // Basket — lengkap.
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0139-01',
      idPendaftaran: 'PD-2026-0139',
      namaFile: 'KTM_Rusdi.jpg',
      kodeDokumen: 'KTM',
      tipeDokumen: BERKAS_JPG,
      fileUrl: '',
      ukuranFile: 1258291,
      tanggalUnggah: '2026-10-14T10:18:00+07:00',
    })
  ),
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0139-02',
      idPendaftaran: 'PD-2026-0139',
      namaFile: 'Transkrip_Rusdi.pdf',
      kodeDokumen: 'TRANSKRIP',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 2516582,
      tanggalUnggah: '2026-10-14T10:19:00+07:00',
    })
  ),
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0139-03',
      idPendaftaran: 'PD-2026-0139',
      namaFile: 'CV_Rusdi.pdf',
      kodeDokumen: 'CV',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 1887436,
      tanggalUnggah: '2026-10-14T10:20:00+07:00',
    })
  ),
  // Paduan Suara — KTM belum diunggah (M-06 dokumen "Belum tersedia").
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0151-01',
      idPendaftaran: 'PD-2026-0151',
      namaFile: 'Transkrip_Rusdi.pdf',
      kodeDokumen: 'TRANSKRIP',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 2516582,
      tanggalUnggah: '2026-10-24T14:28:00+07:00',
    })
  ),
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-0151-02',
      idPendaftaran: 'PD-2026-0151',
      namaFile: 'CV_Rusdi.pdf',
      kodeDokumen: 'CV',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 1887436,
      tanggalUnggah: '2026-10-24T14:28:00+07:00',
    })
  ),
])
