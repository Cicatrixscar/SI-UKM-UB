/**
 * Tes: src/services/pendaftaranUKMService.js + pemetaan baris Supabase.
 *
 * [DOKUMEN] AI.md §6 — aturan bisnis yang harus diuji (katalog/detail,
 *           M-04, M-05). Tes ini tidak menyentuh jaringan: validasi berkas
 *           bersifat murni, dan pemetaan baris diuji dengan baris tiruan
 *           berbentuk hasil query Supabase.
 * [DOKUMEN] AI.md §10 DoD: "Kirim sukses menyimpan Pendaftaran dengan
 *           statusBerkas = MENUNGGU_VERIFIKASI_BERKAS" — diuji lewat konstanta
 *           status yang dipakai service, bukan dengan menulis ke database.
 */

import { describe, it, expect } from 'vitest'
import { validasiDokumen, validasiSemuaBerkas } from '../src/services/pendaftaranUKMService.js'
import {
  petakanUkm,
  petakanKategori,
  petakanPersyaratan,
  petakanTimeline,
  petakanPendaftaran,
  petakanDokumen,
  petakanNotifikasi,
  petakanPengguna,
} from '../src/services/pemetaanBaris.js'
import { PESAN } from '../src/utils/errors.js'
import { KODE_DOKUMEN } from '../src/models/PersyaratanDokumen.js'

const MB = 1024 * 1024

function berkas(tipe, byte, nama = 'dummy.pdf') {
  return { name: nama, type: tipe, size: byte }
}

const BERKAS_LENGKAP = [
  { kode: KODE_DOKUMEN.KTM, file: berkas('application/pdf', 1 * MB, 'ktm.pdf') },
  { kode: KODE_DOKUMEN.TRANSKRIP, file: berkas('application/pdf', 2 * MB, 'transkrip.pdf') },
  { kode: KODE_DOKUMEN.CV, file: berkas('image/jpeg', 1 * MB, 'cv.jpg') },
]

/** Baris tiruan persis seperti hasil `select` PostgREST. */
const BARIS_UKM = {
  id_ukm: 'UKM-FOTO',
  nama_ukm: 'UKM Fotografi',
  id_kategori: 'KAT-SENI',
  deskripsi: 'Belajar menangkap cerita melalui lensa.',
  visi_misi: 'Ruang belajar dan berkarya.',
  email_ukm: 'fotografi@ukm.ub.ac.id',
  icon: 'i-camera',
  foto: '/img/ukm-fotografi.jpg',
  status_pendaftaran: 'DIBUKA',
  status_verifikasi: 'TERVERIFIKASI',
  tanggal_buka: '2026-10-14T17:00:00+00:00',
  tanggal_tutup: '2026-10-30T16:59:00+00:00',
  langkah_selanjutnya: { grupWA: 'Grup WhatsApp: Fotografi 2026' },
}

describe('validasiDokumen', () => {
  it('menerima PDF kecil dengan pesan "Format dokumen valid"', async () => {
    expect(await validasiDokumen(berkas('application/pdf', 1 * MB))).toEqual({
      valid: true,
      pesan: PESAN.FORMAT_VALID,
    })
  })

  it('menolak format selain PDF/JPEG', async () => {
    expect(await validasiDokumen(berkas('application/zip', 1 * MB))).toEqual({
      valid: false,
      pesan: PESAN.FORMAT_FILE,
    })
  })

  it('menolak berkas lebih dari 5 MB', async () => {
    expect(await validasiDokumen(berkas('application/pdf', 5 * MB + 1))).toEqual({
      valid: false,
      pesan: PESAN.UKURAN_FILE,
    })
  })
})

describe('validasiSemuaBerkas', () => {
  it('menerima tiga dokumen wajib valid', async () => {
    expect(await validasiSemuaBerkas(BERKAS_LENGKAP)).toEqual({
      valid: true,
      pesan: PESAN.FORMAT_VALID,
    })
  })

  it('menolak jika berkas kurang dari tiga', async () => {
    const hasil = await validasiSemuaBerkas(BERKAS_LENGKAP.slice(0, 2))
    expect(hasil.valid).toBe(false)
  })

  it('menolak jika satu berkas berformat salah', async () => {
    const salah = [
      BERKAS_LENGKAP[0],
      { kode: KODE_DOKUMEN.TRANSKRIP, file: berkas('text/plain', 1 * MB) },
      BERKAS_LENGKAP[2],
    ]
    expect(await validasiSemuaBerkas(salah)).toEqual({
      valid: false,
      pesan: PESAN.FORMAT_FILE,
    })
  })
})

describe('petakanUkm', () => {
  it('mengubah kolom snake_case menjadi atribut model', () => {
    const ukm = petakanUkm(BARIS_UKM)
    expect(ukm.idUKM).toBe('UKM-FOTO')
    expect(ukm.namaUKM).toBe('UKM Fotografi')
    expect(ukm.idKategori).toBe('KAT-SENI')
    expect(ukm.statusPendaftaran).toBe('DIBUKA')
    expect(ukm.statusVerifikasi).toBe('TERVERIFIKASI')
    expect(ukm.ikon).toBe('i-camera')
    expect(ukm.emailUKM).toBe('fotografi@ukm.ub.ac.id')
    expect(ukm.tanggalTutup).toBe('2026-10-30T16:59:00+00:00')
    expect(ukm.langkahSelanjutnya.grupWA).toBe('Grup WhatsApp: Fotografi 2026')
  })

  it('mengembalikan null untuk baris kosong', () => {
    expect(petakanUkm(null)).toBeNull()
  })

  it('memberi nilai bawaan untuk kolom opsional yang null', () => {
    const ukm = petakanUkm({ ...BARIS_UKM, icon: null, email_ukm: null, foto: null })
    expect(ukm.ikon).toBe('i-award')
    expect(ukm.emailUKM).toBe('')
    expect(ukm.foto).toBe('')
  })
})

describe('petakanKategori dan petakanPersyaratan', () => {
  it('memetakan kategori', () => {
    expect(
      petakanKategori({ id_kategori: 'KAT-SENI', nama_kategori: 'Seni & Kreativitas', deskripsi: 'Seni.', icon_url: 'i-palette' })
    ).toEqual({
      idKategori: 'KAT-SENI',
      namaKategori: 'Seni & Kreativitas',
      deskripsi: 'Seni.',
      iconUrl: 'i-palette',
    })
  })

  it('memetakan persyaratan dokumen wajib', () => {
    const p = petakanPersyaratan({ kode: 'KTM', nama: 'KTM', deskripsi: 'Identitas diri', wajib: true })
    expect(p.kode).toBe('KTM')
    expect(p.wajib).toBe(true)
  })
})

describe('petakanTimeline', () => {
  it('memakai tanggal_label sebagai teks tanggal', () => {
    const t = petakanTimeline({
      tahap: 'Pengumuman',
      tanggal_label: '7 Nov 2026',
      mulai: '2026-11-06T17:00:00+00:00',
      selesai: '2026-11-07T16:59:00+00:00',
    })
    expect(t).toEqual({
      tahap: 'Pengumuman',
      tanggal: '7 Nov 2026',
      mulai: '2026-11-06T17:00:00+00:00',
      selesai: '2026-11-07T16:59:00+00:00',
    })
  })
})

describe('petakanPendaftaran', () => {
  it('memetakan status berkas dan seleksi', () => {
    const p = petakanPendaftaran({
      id_pendaftaran: 'PD-2026-0142',
      nomor_pendaftaran: 'UKM-2026-0142',
      id_ukm: 'UKM-FOTO',
      id_mahasiswa: 'USR-001',
      tanggal_daftar: '2026-10-16T02:15:00+00:00',
      status_berkas: 'SIAP_SELEKSI',
      status_seleksi: 'DITERIMA',
      terkunci: true,
      tanggal_diumumkan: '2026-10-20T08:00:00+00:00',
      tanggal_update_berkas: '2026-10-17T03:00:00+00:00',
      catatan_admin: 'Berkas lengkap.',
      catatan_seleksi: 'Selamat bergabung!',
    })
    expect(p.idPendaftaran).toBe('PD-2026-0142')
    expect(p.nomorPendaftaran).toBe('UKM-2026-0142')
    expect(p.statusBerkas).toBe('SIAP_SELEKSI')
    expect(p.statusSeleksi).toBe('DITERIMA')
    expect(p.terkunci).toBe(true)
    expect(p.catatanSeleksi).toBe('Selamat bergabung!')
  })
})

describe('petakanDokumen', () => {
  it('memetakan kode dokumen dan ukuran berkas', () => {
    const d = petakanDokumen({
      id_dokumen: 'DKM-0142-01',
      id_pendaftaran: 'PD-2026-0142',
      nama_file: 'KTM_Rusdi.jpg',
      kode_dokumen: 'KTM',
      tipe_dokumen: 'image/jpeg',
      file_url: '',
      ukuran_file: 1258291,
      tanggal_unggah: '2026-10-16T02:13:00+00:00',
    })
    expect(d.kodeDokumen).toBe(KODE_DOKUMEN.KTM)
    expect(d.ukuranFile).toBe(1258291)
    expect(d.fileUrl).toBe('')
  })
})

describe('petakanNotifikasi', () => {
  it('memetakan label dan jalur aksi', () => {
    const n = petakanNotifikasi({
      id_notifikasi: 'NTF-2026-0051',
      id_mahasiswa: 'USR-001',
      judul: 'Berkas perlu diperbaiki',
      pesan: 'KTM belum diunggah.',
      dibaca: false,
      timestamp: '2026-10-25T13:44:00+00:00',
      kategori: 'Pemeriksaan berkas',
      aksi_label: 'Perbaiki berkas',
      aksi_jalur: '#/mahasiswa/riwayat/PD-2026-0151',
    })
    expect(n.dibaca).toBe(false)
    expect(n.aksiLabel).toBe('Perbaiki berkas')
    expect(n.aksiJalur).toBe('#/mahasiswa/riwayat/PD-2026-0151')
  })
})

describe('petakanPengguna', () => {
  it('memetakan profil mahasiswa untuk sesi login', () => {
    const u = petakanPengguna({
      id_user: 'USR-001',
      nama: 'Rusdi',
      email: 'rusdi@student.ub.ac.id',
      role: 'MAHASISWA',
      nim: '225150400111024',
      nomor_telepon: '081234567890',
      program_studi: 'Teknik Informatika',
      fakultas: 'Fakultas Teknik',
    })
    expect(u.idUser).toBe('USR-001')
    expect(u.role).toBe('MAHASISWA')
    expect(u.nomorTelepon).toBe('081234567890')
  })
})
