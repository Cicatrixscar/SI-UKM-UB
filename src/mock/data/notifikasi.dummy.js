/**
 * Data dummy: Notifikasi.
 *
 * [DOKUMEN] PRD v0.3 §6.10 — entitas Notifikasi: `idNotifikasi, idMahasiswa,
 *           judul (String), pesan (String)`.
 * [DOKUMEN] PRD v0.3 §7.9 — `notifikasiService.getNotifikasiSaya(idMahasiswa)`.
 * [DOKUMEN] Desain Hi-Fi layar "Notifikasi" — lima notifikasi, dua di antaranya
 *           belum dibaca, masing-masing punya tautan aksi ("Perbaiki berkas",
 *           "Lihat jadwal", "Lihat detail", "Lihat hasil", "Lihat UKM").
 * [DOKUMEN] AI.md §4 — halaman hanya memanggil `services/`, sehingga data dummy
 *           ini dibaca lewat `notifikasiService`.
 *
 * Catatan [USULAN]:
 *   - `kategori`, `aksiLabel`, dan `aksiJalur` tidak ada di entitas modul;
 *     dibutuhkan desain Hi-Fi (baris notifikasi + tautan aksi).
 *   - Notifikasi "Berkas perlu diperbaiki" menunjuk UKM Paduan Suara (bukan
 *     Fotografi) agar konsisten dengan keputusan user: Fotografi DITERIMA di
 *     semua layar, blok "Berkas Tidak Lengkap" dipindah ke Paduan Suara.
 *   - `timestamp` disusun agar jaraknya ke `config.tanggalDemo`
 *     (2026-10-25T20:59+07:00) menghasilkan label Hi-Fi:
 *     "15 menit lalu", "1 jam lalu", "Kemarin, 14.30 WIB".
 */

import { createNotifikasi } from '../../models/Notifikasi.js'

/** @type {import('../../models/Notifikasi.js').Notifikasi[]} */
export const NOTIFIKASI_DUMMY = Object.freeze([
  Object.freeze(
    createNotifikasi({
      idNotifikasi: 'NTF-2026-0051',
      idMahasiswa: 'USR-001',
      judul: 'Berkas perlu diperbaiki · UKM Paduan Suara',
      pesan: 'KTM belum diunggah. Lengkapi berkas untuk melanjutkan pendaftaran.',
      dibaca: false,
      timestamp: '2026-10-25T20:44:00+07:00',
      kategori: 'Pemeriksaan berkas',
      aksiLabel: 'Perbaiki berkas',
      aksiJalur: '#/mahasiswa/riwayat/PD-2026-0151',
    })
  ),
  Object.freeze(
    createNotifikasi({
      idNotifikasi: 'NTF-2026-0050',
      idMahasiswa: 'USR-001',
      judul: 'Jadwal seleksi tersedia · UKM Basket',
      pesan: 'Seleksi dilaksanakan 13 November 2026, pukul 15.00 WIB di GOR kampus.',
      dibaca: false,
      timestamp: '2026-10-25T19:59:00+07:00',
      kategori: 'Jadwal seleksi',
      aksiLabel: 'Lihat jadwal',
      aksiJalur: '#/mahasiswa/riwayat/PD-2026-0139',
    })
  ),
  Object.freeze(
    createNotifikasi({
      idNotifikasi: 'NTF-2026-0048',
      idMahasiswa: 'USR-001',
      judul: 'Pendaftaran berhasil dikirim · UKM Fotografi',
      pesan: 'Pendaftaran Anda sudah diterima dan menunggu verifikasi berkas.',
      dibaca: true,
      timestamp: '2026-10-24T14:30:00+07:00',
      kategori: 'Pendaftaran',
      aksiLabel: 'Lihat detail',
      aksiJalur: '#/mahasiswa/riwayat/PD-2026-0142',
    })
  ),
  Object.freeze(
    createNotifikasi({
      idNotifikasi: 'NTF-2026-0041',
      idMahasiswa: 'USR-001',
      judul: 'Hasil seleksi tersedia · UKM Fotografi',
      pesan: 'Selamat! Anda diterima di UKM Fotografi. Lihat informasi langkah selanjutnya.',
      dibaca: true,
      timestamp: '2026-10-20T15:00:00+07:00',
      kategori: 'Hasil seleksi',
      aksiLabel: 'Lihat hasil',
      aksiJalur: '#/mahasiswa/hasil',
    })
  ),
  Object.freeze(
    createNotifikasi({
      idNotifikasi: 'NTF-2026-0039',
      idMahasiswa: 'USR-001',
      judul: 'Pendaftaran segera ditutup · UKM Teater',
      pesan: 'Pastikan data diri dan dokumen sudah lengkap sebelum pendaftaran ditutup.',
      dibaca: true,
      timestamp: '2026-10-19T09:00:00+07:00',
      kategori: 'Pengingat',
      aksiLabel: 'Lihat UKM',
      aksiJalur: '#/mahasiswa/ukm/UKM-TEATER',
    })
  ),
])
