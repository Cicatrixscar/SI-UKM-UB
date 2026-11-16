/**
 * Pemetaan baris Supabase (snake_case) → objek model (camelCase).
 *
 * [DOKUMEN] Kolom database mengikuti `supabase/schema.sql`; nama atribut objek
 *           mengikuti `src/models/*.js`. Halaman hanya menerima bentuk camelCase,
 *           jadi pemetaan dikumpulkan di satu tempat dan bisa diuji tanpa jaringan.
 */

import { createUKM } from '../models/UKM.js'
import { createPendaftaran } from '../models/Pendaftaran.js'
import { createDokumenPendaftaran } from '../models/DokumenPendaftaran.js'
import { createPersyaratanDokumen } from '../models/PersyaratanDokumen.js'
import { createNotifikasi } from '../models/Notifikasi.js'

/** Baris `ukm` → objek UKM. */
export function petakanUkm(baris) {
  if (!baris) return null
  return createUKM({
    idUKM: baris.id_ukm,
    namaUKM: baris.nama_ukm,
    idKategori: baris.id_kategori,
    deskripsi: baris.deskripsi,
    visiMisi: baris.visi_misi,
    emailUKM: baris.email_ukm,
    ikon: baris.icon,
    foto: baris.foto,
    statusPendaftaran: baris.status_pendaftaran,
    statusVerifikasi: baris.status_verifikasi,
    tanggalBuka: baris.tanggal_buka,
    tanggalTutup: baris.tanggal_tutup,
    langkahSelanjutnya: baris.langkah_selanjutnya,
  })
}

/** Baris `kategori` → objek Kategori. */
export function petakanKategori(baris) {
  return {
    idKategori: baris.id_kategori,
    namaKategori: baris.nama_kategori,
    deskripsi: baris.deskripsi ?? '',
    iconUrl: baris.icon_url ?? '',
  }
}

/** Baris `persyaratan_dokumen` → objek PersyaratanDokumen. */
export function petakanPersyaratan(baris) {
  return createPersyaratanDokumen({
    kode: baris.kode,
    nama: baris.nama,
    deskripsi: baris.deskripsi,
    wajib: baris.wajib,
  })
}

/** Baris `timeline_ukm` → tahap timeline yang dipakai kartu "Timeline Pendaftaran". */
export function petakanTimeline(baris) {
  return {
    tahap: baris.tahap,
    tanggal: baris.tanggal_label,
    mulai: baris.mulai,
    selesai: baris.selesai,
  }
}

/** Baris `pendaftaran` → objek Pendaftaran. */
export function petakanPendaftaran(baris) {
  if (!baris) return null
  return createPendaftaran({
    idPendaftaran: baris.id_pendaftaran,
    nomorPendaftaran: baris.nomor_pendaftaran,
    idUKM: baris.id_ukm,
    idMahasiswa: baris.id_mahasiswa,
    tanggalDaftar: baris.tanggal_daftar,
    statusBerkas: baris.status_berkas,
    statusSeleksi: baris.status_seleksi,
    terkunci: baris.terkunci,
    tanggalDiumumkan: baris.tanggal_diumumkan,
    tanggalUpdateBerkas: baris.tanggal_update_berkas,
    catatanAdmin: baris.catatan_admin,
    catatanSeleksi: baris.catatan_seleksi,
  })
}

/** Baris `dokumen_pendaftaran` → objek DokumenPendaftaran. */
export function petakanDokumen(baris) {
  return createDokumenPendaftaran({
    idDokumen: baris.id_dokumen,
    idPendaftaran: baris.id_pendaftaran,
    namaFile: baris.nama_file,
    kodeDokumen: baris.kode_dokumen,
    tipeDokumen: baris.tipe_dokumen,
    fileUrl: baris.file_url ?? '',
    ukuranFile: baris.ukuran_file,
    tanggalUnggah: baris.tanggal_unggah,
  })
}

/** Baris `notifikasi` → objek Notifikasi. */
export function petakanNotifikasi(baris) {
  return createNotifikasi({
    idNotifikasi: baris.id_notifikasi,
    idMahasiswa: baris.id_mahasiswa,
    judul: baris.judul,
    pesan: baris.pesan,
    dibaca: baris.dibaca,
    timestamp: baris.timestamp,
    kategori: baris.kategori,
    aksiLabel: baris.aksi_label,
    aksiJalur: baris.aksi_jalur,
  })
}

/** Baris `pengguna` → objek sesi (bentuk sama dengan mock lama). */
export function petakanPengguna(baris) {
  if (!baris) return null
  return {
    idUser: baris.id_user,
    nama: baris.nama,
    email: baris.email,
    role: baris.role,
    nim: baris.nim,
    nomorTelepon: baris.nomor_telepon,
    programStudi: baris.program_studi,
    fakultas: baris.fakultas,
  }
}
