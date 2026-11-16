/**
 * Tes: src/utils/permissions.js
 *
 * [DOKUMEN] AI.md §6 — aturan akses form dan pemetaan stepper riwayat
 *           (M-03, M-04, M-05, M-06).
 * [DOKUMEN] testing/README.md — rencana whitebox; setiap kasus di sini mengisi
 *           satu baris tabel "hasil" di dokumen tersebut.
 *
 * Semua fungsi di berkas ini murni: tidak menyentuh jaringan atau database.
 */

import { describe, it, expect } from 'vitest'
import {
  bolehAksesForm,
  dalamPeriodeAktif,
  bolehLanjutDataDiri,
  bolehLanjutDokumen,
  bolehKirimPendaftaran,
  bolehSubmitPendaftaran,
  tahapRiwayat,
  nomorTahapAktif,
  statusTahapTimeline,
  TAHAP_RIWAYAT,
  KETERANGAN_TAHAP,
} from '../src/utils/permissions.js'
import { STATUS_PENDAFTARAN } from '../src/enums/statusPendaftaran.js'
import { STATUS_BERKAS, STATUS_SELEKSI } from '../src/enums/statusBerkas.js'

const MB = 1024 * 1024

function berkas(tipe, byte) {
  return { name: 'dummy.pdf', type: tipe, size: byte }
}

const PDF_KECIL = berkas('application/pdf', 1 * MB)
const PDF_BESAR = berkas('application/pdf', 5 * MB + 1)

/** UKM contoh yang periodenya mengapit tanggal 20 Oktober 2026. */
const UKM_DIBUKA = {
  statusPendaftaran: STATUS_PENDAFTARAN.DIBUKA,
  tanggalBuka: '2026-10-14T17:00:00+00:00',
  tanggalTutup: '2026-10-30T16:59:00+00:00',
}

const DI_TENGAH_PERIODE = new Date('2026-10-20T00:00:00+00:00')
const SEBELUM_PERIODE = new Date('2026-10-01T00:00:00+00:00')
const SETELAH_PERIODE = new Date('2026-11-01T00:00:00+00:00')

describe('bolehAksesForm — V(G)=2', () => {
  it('menolak UKM yang tidak ada dan menandai tidakDitemukan', () => {
    expect(bolehAksesForm(null)).toEqual({ boleh: false, tidakDitemukan: true })
  })

  it('mengizinkan UKM berstatus DIBUKA', () => {
    expect(bolehAksesForm(UKM_DIBUKA)).toEqual({ boleh: true, tidakDitemukan: false })
  })

  it('menolak UKM berstatus DITUTUP', () => {
    const ukm = { ...UKM_DIBUKA, statusPendaftaran: STATUS_PENDAFTARAN.DITUTUP }
    expect(bolehAksesForm(ukm)).toEqual({ boleh: false, tidakDitemukan: false })
  })
})

describe('dalamPeriodeAktif — V(G)=7', () => {
  it('menganggap aktif bila tanggalBuka tidak ada', () => {
    expect(dalamPeriodeAktif({ tanggalTutup: UKM_DIBUKA.tanggalTutup }, DI_TENGAH_PERIODE)).toBe(true)
  })

  it('menganggap aktif bila tanggalTutup tidak ada', () => {
    expect(dalamPeriodeAktif({ tanggalBuka: UKM_DIBUKA.tanggalBuka }, DI_TENGAH_PERIODE)).toBe(true)
  })

  it('menganggap aktif bila tanggal tidak bisa di-parse', () => {
    const ukm = { tanggalBuka: 'bukan tanggal', tanggalTutup: '2026-10-30' }
    expect(dalamPeriodeAktif(ukm, DI_TENGAH_PERIODE)).toBe(true)
  })

  it('menolak tanggal sebelum periode dibuka', () => {
    expect(dalamPeriodeAktif(UKM_DIBUKA, SEBELUM_PERIODE)).toBe(false)
  })

  it('menerima tanggal di tengah periode', () => {
    expect(dalamPeriodeAktif(UKM_DIBUKA, DI_TENGAH_PERIODE)).toBe(true)
  })

  it('menolak tanggal setelah periode ditutup', () => {
    expect(dalamPeriodeAktif(UKM_DIBUKA, SETELAH_PERIODE)).toBe(false)
  })

  it('menerima tepat pada detik pembukaan (batas bawah inklusif)', () => {
    expect(dalamPeriodeAktif(UKM_DIBUKA, new Date(UKM_DIBUKA.tanggalBuka))).toBe(true)
  })

  it('menerima tepat pada detik penutupan (batas atas inklusif)', () => {
    expect(dalamPeriodeAktif(UKM_DIBUKA, new Date(UKM_DIBUKA.tanggalTutup))).toBe(true)
  })
})

describe('bolehLanjutDataDiri — V(G)=1', () => {
  it('mengizinkan lanjut bila hasil validasi ada', () => {
    expect(bolehLanjutDataDiri({ valid: true })).toBe(true)
  })

  it('menolak lanjut bila hasil validasi kosong', () => {
    expect(bolehLanjutDataDiri(null)).toBe(false)
  })
})

describe('bolehLanjutDokumen — V(G)=2', () => {
  it('menolak bila jumlah berkas kurang dari jumlah wajib', () => {
    expect(bolehLanjutDokumen([{ file: PDF_KECIL }], 3)).toBe(false)
  })

  it('menolak bila salah satu berkas tidak valid', () => {
    const daftar = [{ file: PDF_KECIL }, { file: PDF_BESAR }, { file: PDF_KECIL }]
    expect(bolehLanjutDokumen(daftar, 3)).toBe(false)
  })

  it('menerima tiga berkas valid', () => {
    const daftar = [PDF_KECIL, PDF_KECIL, PDF_KECIL]
    expect(bolehLanjutDokumen(daftar, 3)).toBe(true)
  })

  it('menolak daftar kosong', () => {
    expect(bolehLanjutDokumen([], 0)).toBe(false)
  })

  it('menerima berkas yang dibungkus { kode, file }', () => {
    const daftar = [
      { kode: 'KTM', file: PDF_KECIL },
      { kode: 'TRANSKRIP', file: PDF_KECIL },
      { kode: 'CV', file: PDF_KECIL },
    ]
    expect(bolehLanjutDokumen(daftar, 3)).toBe(true)
  })

  it('menolak undefined tanpa melempar error', () => {
    expect(bolehLanjutDokumen(undefined, 0)).toBe(false)
  })
})

describe('bolehKirimPendaftaran — V(G)=1', () => {
  it('mengizinkan kirim bila checkbox pernyataan dicentang', () => {
    expect(bolehKirimPendaftaran(true)).toBe(true)
  })

  it('menolak kirim bila checkbox tidak dicentang', () => {
    expect(bolehKirimPendaftaran(false)).toBe(false)
  })

  it('menolak nilai selain boolean true', () => {
    expect(bolehKirimPendaftaran('ya')).toBe(false)
  })
})

describe('bolehSubmitPendaftaran — V(G)=3', () => {
  it('menolak bila UKM tidak ada', () => {
    expect(bolehSubmitPendaftaran(null, DI_TENGAH_PERIODE)).toBe(false)
  })

  it('menolak bila status pendaftaran DITUTUP', () => {
    const ukm = { ...UKM_DIBUKA, statusPendaftaran: STATUS_PENDAFTARAN.DITUTUP }
    expect(bolehSubmitPendaftaran(ukm, DI_TENGAH_PERIODE)).toBe(false)
  })

  it('menerima UKM DIBUKA di dalam periode', () => {
    expect(bolehSubmitPendaftaran(UKM_DIBUKA, DI_TENGAH_PERIODE)).toBe(true)
  })

  it('menolak UKM DIBUKA yang periodenya sudah lewat', () => {
    expect(bolehSubmitPendaftaran(UKM_DIBUKA, SETELAH_PERIODE)).toBe(false)
  })
})

/**
 * 16 kombinasi statusBerkas × statusSeleksi × terkunci.
 * Ekspektasi diturunkan dari tabel pemetaan Brief §5 M-06 (lihat JSDoc
 * `tahapRiwayat`), bukan dari hasil kode saat ini.
 */
const KOMBINASI_TAHAP = [
  // [berkas, seleksi, terkunci, tahap 2..5]
  ['MENUNGGU_VERIFIKASI_BERKAS', 'PENDING', false, ['aktif', 'belum', 'belum', 'belum']],
  ['MENUNGGU_VERIFIKASI_BERKAS', 'PENDING', true, ['aktif', 'belum', 'belum', 'selesai']],
  ['MENUNGGU_VERIFIKASI_BERKAS', 'DITERIMA', false, ['aktif', 'belum', 'selesai', 'aktif']],
  ['MENUNGGU_VERIFIKASI_BERKAS', 'DITERIMA', true, ['aktif', 'belum', 'selesai', 'selesai']],
  ['LENGKAP', 'PENDING', false, ['selesai', 'belum', 'belum', 'belum']],
  ['LENGKAP', 'PENDING', true, ['selesai', 'belum', 'belum', 'selesai']],
  ['LENGKAP', 'DITERIMA', false, ['selesai', 'belum', 'selesai', 'aktif']],
  ['LENGKAP', 'DITERIMA', true, ['selesai', 'belum', 'selesai', 'selesai']],
  ['TIDAK_LENGKAP', 'PENDING', false, ['aktif', 'belum', 'belum', 'belum']],
  ['TIDAK_LENGKAP', 'PENDING', true, ['aktif', 'belum', 'belum', 'selesai']],
  ['TIDAK_LENGKAP', 'DITERIMA', false, ['aktif', 'belum', 'selesai', 'aktif']],
  ['TIDAK_LENGKAP', 'DITERIMA', true, ['aktif', 'belum', 'selesai', 'selesai']],
  ['SIAP_SELEKSI', 'PENDING', false, ['selesai', 'selesai', 'aktif', 'belum']],
  ['SIAP_SELEKSI', 'PENDING', true, ['selesai', 'selesai', 'aktif', 'selesai']],
  ['SIAP_SELEKSI', 'DITERIMA', false, ['selesai', 'selesai', 'selesai', 'aktif']],
  ['SIAP_SELEKSI', 'DITERIMA', true, ['selesai', 'selesai', 'selesai', 'selesai']],
]

describe('tahapRiwayat — V(G)=11, 16 kombinasi', () => {
  for (const [berkas, seleksi, terkunci, tahapLanjut] of KOMBINASI_TAHAP) {
    it(`${berkas} + ${seleksi} + terkunci=${terkunci}`, () => {
      const hasil = tahapRiwayat({
        statusBerkas: berkas,
        statusSeleksi: seleksi,
        terkunci,
      })

      expect(hasil).toHaveLength(5)
      expect(hasil.map(t => t.nama)).toEqual([...TAHAP_RIWAYAT])
      expect(hasil.map(t => t.status)).toEqual(['selesai', ...tahapLanjut])
      expect(hasil.map(t => t.keterangan)).toEqual(
        hasil.map(t => KETERANGAN_TAHAP[t.status])
      )
    })
  }

  it('menangani pendaftaran kosong tanpa melempar error', () => {
    const hasil = tahapRiwayat(undefined)
    expect(hasil.map(t => t.status)).toEqual(['selesai', 'aktif', 'belum', 'belum', 'belum'])
  })
})

describe('nomorTahapAktif — V(G)=2', () => {
  it('mengembalikan nomor tahap yang sedang berlangsung', () => {
    const p = { statusBerkas: STATUS_BERKAS.SIAP_SELEKSI, statusSeleksi: STATUS_SELEKSI.PENDING }
    expect(nomorTahapAktif(p)).toBe(4)
  })

  it('mengembalikan 0 bila semua tahap selesai', () => {
    const p = { statusBerkas: STATUS_BERKAS.SIAP_SELEKSI, statusSeleksi: STATUS_SELEKSI.DITERIMA, terkunci: true }
    expect(nomorTahapAktif(p)).toBe(0)
  })
})

describe('statusTahapTimeline — V(G)=7', () => {
  const TAHAP = { mulai: '2026-10-01T00:00:00+00:00', selesai: '2026-10-05T00:00:00+00:00' }

  it('mengembalikan "belum" bila tanggal mulai tidak ada', () => {
    expect(statusTahapTimeline({}, DI_TENGAH_PERIODE)).toBe('belum')
  })

  it('mengembalikan "belum" bila tanggal mulai tidak bisa di-parse', () => {
    expect(statusTahapTimeline({ mulai: 'bukan tanggal' }, DI_TENGAH_PERIODE)).toBe('belum')
  })

  it('mengembalikan "selesai" bila waktu sekarang melewati tanggal selesai', () => {
    expect(statusTahapTimeline(TAHAP, new Date('2026-10-06T00:00:00+00:00'))).toBe('selesai')
  })

  it('mengembalikan "selesai" tepat pada tanggal selesai (batas inklusif)', () => {
    expect(statusTahapTimeline(TAHAP, new Date('2026-10-05T00:00:00+00:00'))).toBe('selesai')
  })

  it('mengembalikan "aktif" bila waktu sekarang di dalam rentang', () => {
    expect(statusTahapTimeline(TAHAP, new Date('2026-10-03T00:00:00+00:00'))).toBe('aktif')
  })

  it('mengembalikan "belum" bila waktu sekarang sebelum tanggal mulai', () => {
    expect(statusTahapTimeline(TAHAP, new Date('2026-09-30T00:00:00+00:00'))).toBe('belum')
  })

  it('mengembalikan "aktif" bila tanggal selesai tidak diisi', () => {
    const tahap = { mulai: '2026-10-01T00:00:00+00:00' }
    expect(statusTahapTimeline(tahap, new Date('2026-10-20T00:00:00+00:00'))).toBe('aktif')
  })
})
