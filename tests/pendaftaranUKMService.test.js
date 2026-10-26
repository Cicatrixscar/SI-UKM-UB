/**
 * Tes: src/services/pendaftaranUKMService.js
 *
 * [DOKUMEN] AI.md §6 — aturan bisnis yang harus diuji (katalog/detail stub,
 *           M-04, M-05).
 * [DOKUMEN] AI.md §10 DoD: "Alur katalog (stub) → detail (stub) → form →
 *           unggah → review → kirim berjalan ... Kirim sukses menyimpan
 *           Pendaftaran dengan statusBerkas = MENUNGGU_VERIFIKASI_BERKAS."
 * [DOKUMEN] AI.md §11 T3.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getKatalogUKM,
  getUKMdibuka,
  getDetailUKM,
  validasiDokumen,
  validasiSemuaBerkas,
  submitPendaftaran,
  simpanPendaftaran,
} from '../src/services/pendaftaranUKMService.js'
import { resetStore, store } from '../src/mock/store.js'
import { config } from '../src/config.js'
import { PESAN } from '../src/utils/errors.js'
import { STATUS_PENDAFTARAN } from '../src/enums/statusPendaftaran.js'
import { STATUS_BERKAS } from '../src/enums/statusBerkas.js'
import { KODE_DOKUMEN } from '../src/models/PersyaratanDokumen.js'

const MB = 1024 * 1024
const WAKTU_UJI = new Date('2026-10-26T10:00:00+07:00')

function berkas(tipe, byte, nama = 'dummy.pdf') {
  return { name: nama, type: tipe, size: byte }
}

const DATA_DIRI = {
  idUKM: 'UKM-FOTO',
  idMahasiswa: 'USR-001',
  nama: 'Rusdi',
  nim: '225150400111024',
  email: 'rusdi@student.ub.ac.id',
  nomorTelepon: '081234567890',
  alasan: 'Ingin belajar fotografi bersama teman-teman kampus.',
}

const BERKAS_LENGKAP = [
  { kode: KODE_DOKUMEN.KTM, file: berkas('application/pdf', 1 * MB, 'ktm.pdf') },
  { kode: KODE_DOKUMEN.TRANSKRIP, file: berkas('application/pdf', 2 * MB, 'transkrip.pdf') },
  { kode: KODE_DOKUMEN.CV, file: berkas('image/jpeg', 1 * MB, 'cv.jpg') },
]

beforeEach(() => {
  // shouldAdvanceTime: Date dibekukan di WAKTU_UJI, tetapi setTimeout pada
  // `delay(...)` mock tetap berjalan secara nyata.
  vi.useFakeTimers({ now: WAKTU_UJI, shouldAdvanceTime: true })
  resetStore()
  config.paksaGagalSimpan = false
})

afterEach(() => {
  vi.useRealTimers()
  config.paksaGagalSimpan = false
})

describe('getKatalogUKM', () => {
  it('mengembalikan UKM TERVERIFIKASI (DIBUKA dan DITUTUP)', async () => {
    const daftar = await getKatalogUKM()
    expect(daftar).toHaveLength(8)
    expect(daftar.every(u => u.statusVerifikasi === 'TERVERIFIKASI')).toBe(true)
    expect(daftar.some(u => u.statusPendaftaran === STATUS_PENDAFTARAN.DITUTUP)).toBe(true)
  })
})

describe('getUKMdibuka', () => {
  it('mengembalikan hanya UKM berstatus DIBUKA (MP2 PC-01)', async () => {
    const daftar = await getUKMdibuka()
    expect(daftar).toHaveLength(6)
    expect(daftar.every(u => u.statusPendaftaran === STATUS_PENDAFTARAN.DIBUKA)).toBe(true)
  })
})

describe('getDetailUKM', () => {
  it('mengembalikan UKM + periodeAktif dengan tiga persyaratan wajib', async () => {
    const detail = await getDetailUKM('UKM-FOTO')
    expect(detail.namaUKM).toBe('UKM Fotografi')
    expect(detail.periodeAktif.tanggalBuka).toBe('2026-10-15T00:00:00+07:00')
    expect(detail.periodeAktif.persyaratanDokumen).toHaveLength(3)
    expect(
      detail.periodeAktif.persyaratanDokumen.every(p => p.wajib)
    ).toBe(true)
  })

  it('mengembalikan null untuk UKM tidak ditemukan', async () => {
    expect(await getDetailUKM('TIDAK-ADA')).toBeNull()
  })
})

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

describe('submitPendaftaran', () => {
  it('menyimpan Pendaftaran dengan statusBerkas MENUNGGU_VERIFIKASI_BERKAS', async () => {
    const sebelum = store.pendaftaran.length
    const hasil = await submitPendaftaran(DATA_DIRI, BERKAS_LENGKAP)

    expect(hasil.berhasil).toBe(true)
    expect(hasil.pesan).toBe(PESAN.PENDAFTARAN_BERHASIL)
    expect(hasil.idPendaftaran).toMatch(/^PD-/)

    expect(store.pendaftaran).toHaveLength(sebelum + 1)
    const baru = store.pendaftaran.find(p => p.idPendaftaran === hasil.idPendaftaran)
    expect(baru.statusBerkas).toBe(STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS)
    expect(baru.idUKM).toBe('UKM-FOTO')
    expect(baru.idMahasiswa).toBe('USR-001')
  })

  it('menyimpan tiga DokumenPendaftaran terkait', async () => {
    const sebelum = store.dokumen.length
    const hasil = await submitPendaftaran(DATA_DIRI, BERKAS_LENGKAP)

    const milik = store.dokumen.filter(d => d.idPendaftaran === hasil.idPendaftaran)
    expect(milik).toHaveLength(3)
    expect(store.dokumen.length).toBe(sebelum + 3)
    expect(milik.map(d => d.namaFile).sort()).toEqual(['cv.jpg', 'ktm.pdf', 'transkrip.pdf'])
  })

  it('menolak UKM tidak ditemukan', async () => {
    const hasil = await submitPendaftaran({ ...DATA_DIRI, idUKM: 'TIDAK-ADA' }, BERKAS_LENGKAP)
    expect(hasil).toEqual({
      berhasil: false,
      idPendaftaran: null,
      pesan: PESAN.UKM_TIDAK_DITEMUKAN,
    })
  })

  it('menolak UKM berstatus DITUTUP (AI.md §6 katalog dan detail)', async () => {
    const hasil = await submitPendaftaran({ ...DATA_DIRI, idUKM: 'UKM-BADMINTON' }, BERKAS_LENGKAP)
    expect(hasil.berhasil).toBe(false)
    expect(hasil.pesan).toBe(PESAN.UKM_TIDAK_DITEMUKAN)
  })

  it('menolak data diri yang tidak lengkap', async () => {
    const hasil = await submitPendaftaran({ ...DATA_DIRI, nama: '' }, BERKAS_LENGKAP)
    expect(hasil.berhasil).toBe(false)
    expect(hasil.pesan).toBe(PESAN.FIELD_WAJIB)
  })

  it('menolak berkas yang tidak valid', async () => {
    const berkasSalah = [
      BERKAS_LENGKAP[0],
      { kode: KODE_DOKUMEN.TRANSKRIP, file: berkas('application/pdf', 10 * MB) },
      BERKAS_LENGKAP[2],
    ]
    const hasil = await submitPendaftaran(DATA_DIRI, berkasSalah)
    expect(hasil.berhasil).toBe(false)
    expect(hasil.pesan).toBe(PESAN.UKURAN_FILE)
  })

  it('mengembalikan pesan gagal dan idPendaftaran null saat mock dipaksa gagal (Retry)', async () => {
    config.paksaGagalSimpan = true
    const sebelum = store.pendaftaran.length
    const hasil = await submitPendaftaran(DATA_DIRI, BERKAS_LENGKAP)

    expect(hasil).toEqual({
      berhasil: false,
      idPendaftaran: null,
      pesan: PESAN.GAGAL_SIMPAN,
    })
    expect(store.pendaftaran).toHaveLength(sebelum)

    // Retry: setelah sakelar dimatikan, submit berhasil.
    config.paksaGagalSimpan = false
    const ulang = await submitPendaftaran(DATA_DIRI, BERKAS_LENGKAP)
    expect(ulang.berhasil).toBe(true)
  })
})

describe('simpanPendaftaran (alias service)', () => {
  it('menyimpan pendaftaran seperti submitPendaftaran', async () => {
    const hasil = await simpanPendaftaran(DATA_DIRI, BERKAS_LENGKAP)
    expect(hasil.berhasil).toBe(true)
    expect(store.pendaftaran.some(p => p.idPendaftaran === hasil.idPendaftaran)).toBe(true)
  })
})
