/**
 * Data dummy: Pendaftaran dan DokumenPendaftaran.
 *
 * [DOKUMEN] MP2 §3.4.1 Gambar Diagram Kelas Utuh, hal. 67-68 — Pendaftaran
 *           dan DokumenPendaftaran.
 * [DOKUMEN] PRD v0.3 §6.5 (statusBerkas) dan §6.6 (DokumenPendaftaran).
 * [DOKUMEN] AI.md §5 — file ini dibatasi "hanya data untuk sprint ini".
 *
 * Catatan [USULAN]:
 *   - Riwayat Pendaftaran (M-06) di luar lingkup sprint, jadi data ini hanya
 *     menyiapkan store agar tidak kosong; tidak ada layar yang membacanya.
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

/** @type {import('../../models/Pendaftaran.js').Pendaftaran[]} */
export const PENDAFTARAN_DUMMY = Object.freeze([
  Object.freeze(
    createPendaftaran({
      idPendaftaran: 'PD-DUMMY-001',
      idUKM: 'UKM-BASKET',
      idMahasiswa: 'USR-001',
      tanggalDaftar: '2026-10-16T09:12:00+07:00',
      statusBerkas: STATUS_BERKAS.SIAP_SELEKSI,
      statusSeleksi: STATUS_SELEKSI.PENDING,
    })
  ),
  Object.freeze(
    createPendaftaran({
      idPendaftaran: 'PD-DUMMY-002',
      idUKM: 'UKM-FOTO',
      idMahasiswa: 'USR-002',
      tanggalDaftar: '2026-10-18T14:40:00+07:00',
      statusBerkas: STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS,
      statusSeleksi: STATUS_SELEKSI.PENDING,
    })
  ),
])

/** @type {import('../../models/DokumenPendaftaran.js').DokumenPendaftaran[]} */
export const DOKUMEN_DUMMY = Object.freeze([
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-DUMMY-001',
      idPendaftaran: 'PD-DUMMY-001',
      namaFile: 'ktm-rusdi.pdf',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 184320,
      tanggalUnggah: '2026-10-16T09:10:00+07:00',
    })
  ),
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-DUMMY-002',
      idPendaftaran: 'PD-DUMMY-001',
      namaFile: 'transkrip-rusdi.pdf',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 256000,
      tanggalUnggah: '2026-10-16T09:11:00+07:00',
    })
  ),
  Object.freeze(
    createDokumenPendaftaran({
      idDokumen: 'DKM-DUMMY-003',
      idPendaftaran: 'PD-DUMMY-001',
      namaFile: 'cv-rusdi.pdf',
      tipeDokumen: BERKAS_PDF,
      fileUrl: '',
      ukuranFile: 128000,
      tanggalUnggah: '2026-10-16T09:12:00+07:00',
    })
  ),
])
