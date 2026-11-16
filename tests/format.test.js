/**
 * Tes: src/utils/format.js
 *
 * [DOKUMEN] AI.md §6 M-03 (counter karakter), M-04 (ukuran file),
 *           Brief §5 M-06 (tanggal daftar), Brief §9 G17 (inisial avatar),
 *           desain Hi-Fi layar Notifikasi (waktu relatif).
 * [DOKUMEN] testing/README.md — format.js sebelumnya 0% cakupan.
 *
 * Zona waktu dipaku ke Asia/Jakarta lewat `test.env` di `vite.config.js`,
 * supaya hasil `getHours()` tidak bergantung pada mesin yang menjalankan tes.
 */

import { describe, it, expect } from 'vitest'
import {
  formatTanggal,
  formatJam,
  formatUkuranFile,
  formatKarakterDipakai,
  inisialDariNama,
  formatTanggalWaktu,
  formatSisaWaktu,
  formatWaktuRelatif,
} from '../src/utils/format.js'

/** Jam demo aplikasi: 25 Oktober 2026, 20.59 WIB. */
const JAM_DEMO = '2026-10-25T20:59:00+07:00'

describe('formatTanggal — V(G)=3', () => {
  it('mengembalikan "-" untuk nilai kosong', () => {
    expect(formatTanggal(null)).toBe('-')
    expect(formatTanggal('')).toBe('-')
  })

  it('mengembalikan "-" untuk tanggal tidak sah', () => {
    expect(formatTanggal('bukan tanggal')).toBe('-')
  })

  it('memformat "25 Oktober 2026"', () => {
    expect(formatTanggal(JAM_DEMO)).toBe('25 Oktober 2026')
  })
})

describe('formatJam — V(G)=3', () => {
  it('mengembalikan "-" untuk nilai kosong atau tidak sah', () => {
    expect(formatJam(null)).toBe('-')
    expect(formatJam('bukan tanggal')).toBe('-')
  })

  it('memformat jam dan menit dengan titik', () => {
    expect(formatJam(JAM_DEMO)).toBe('20.59')
    expect(formatJam('2026-10-25T08:05:00+07:00')).toBe('08.05')
  })
})

describe('formatUkuranFile — V(G)=4', () => {
  it('mengembalikan "-" untuk nilai bukan angka, NaN, atau negatif', () => {
    expect(formatUkuranFile('1024')).toBe('-')
    expect(formatUkuranFile(NaN)).toBe('-')
    expect(formatUkuranFile(-1)).toBe('-')
  })

  it('memakai satuan byte di bawah 1 KB', () => {
    expect(formatUkuranFile(850)).toBe('850 B')
    expect(formatUkuranFile(0)).toBe('0 B')
  })

  it('memakai satuan KB dengan satu desimal berkoma', () => {
    expect(formatUkuranFile(1024)).toBe('1,0 KB')
    expect(formatUkuranFile(1536)).toBe('1,5 KB')
  })

  it('memakai satuan MB dengan satu desimal berkoma', () => {
    expect(formatUkuranFile(1024 * 1024)).toBe('1,0 MB')
    expect(formatUkuranFile(Math.round(2.4 * 1024 * 1024))).toBe('2,4 MB')
  })
})

describe('formatKarakterDipakai — V(G)=2', () => {
  it('menghitung panjang teks terhadap batas bawaan 500', () => {
    expect(formatKarakterDipakai('abc')).toBe('3/500 karakter')
  })

  it('memakai batas khusus dan menangani nilai kosong', () => {
    expect(formatKarakterDipakai('abc', 100)).toBe('3/100 karakter')
    expect(formatKarakterDipakai(null)).toBe('0/500 karakter')
  })
})

describe('inisialDariNama — V(G)=3', () => {
  it('mengembalikan "?" untuk nama kosong', () => {
    expect(inisialDariNama('')).toBe('?')
    expect(inisialDariNama(null)).toBe('?')
    expect(inisialDariNama('   ')).toBe('?')
  })

  it('mengambil dua huruf dari satu kata', () => {
    expect(inisialDariNama('Rusdi')).toBe('RU')
  })

  it('mengambil huruf awal dua kata pertama', () => {
    expect(inisialDariNama('Rusdi Hartono')).toBe('RH')
    expect(inisialDariNama('  rusdi   hartono  ')).toBe('RH')
    expect(inisialDariNama('Rusdi Hartono Wijaya')).toBe('RH')
  })
})

describe('formatTanggalWaktu — V(G)=3', () => {
  it('mengembalikan "-" untuk nilai kosong atau tidak sah', () => {
    expect(formatTanggalWaktu(null)).toBe('-')
    expect(formatTanggalWaktu('bukan tanggal')).toBe('-')
  })

  it('menggabungkan tanggal, jam, dan WIB', () => {
    expect(formatTanggalWaktu(JAM_DEMO)).toBe('25 Oktober 2026, 20.59 WIB')
  })
})

describe('formatSisaWaktu — V(G)=5', () => {
  it('mengembalikan "-" untuk nilai kosong atau tidak sah', () => {
    expect(formatSisaWaktu(null)).toBe('-')
    expect(formatSisaWaktu('bukan tanggal', JAM_DEMO)).toBe('-')
    expect(formatSisaWaktu(JAM_DEMO, 'bukan tanggal')).toBe('-')
  })

  it('mengembalikan "sudah ditutup" bila target sudah lewat atau tepat', () => {
    expect(formatSisaWaktu('2026-10-20T00:00:00+07:00', JAM_DEMO)).toBe('sudah ditutup')
    expect(formatSisaWaktu(JAM_DEMO, JAM_DEMO)).toBe('sudah ditutup')
  })

  it('menampilkan hari dan jam', () => {
    expect(formatSisaWaktu('2026-10-30T23:59:00+07:00', JAM_DEMO)).toBe('5 hari 3 jam')
  })

  it('menampilkan jam saja bila sisa kurang dari sehari', () => {
    expect(formatSisaWaktu('2026-10-26T00:59:00+07:00', JAM_DEMO)).toBe('4 jam')
  })

  it('menampilkan menit bila sisa kurang dari sejam', () => {
    expect(formatSisaWaktu('2026-10-25T21:19:00+07:00', JAM_DEMO)).toBe('20 menit')
  })

  it('menampilkan "kurang dari 1 menit" untuk sisa beberapa detik', () => {
    expect(formatSisaWaktu('2026-10-25T20:59:30+07:00', JAM_DEMO)).toBe('kurang dari 1 menit')
  })
})

describe('formatWaktuRelatif — V(G)=6', () => {
  it('mengembalikan "-" untuk nilai kosong atau tidak sah', () => {
    expect(formatWaktuRelatif(null)).toBe('-')
    expect(formatWaktuRelatif('bukan tanggal')).toBe('-')
  })

  it('memakai "Baru saja" untuk kurang dari satu menit', () => {
    expect(formatWaktuRelatif('2026-10-25T20:58:40+07:00')).toBe('Baru saja')
  })

  it('memakai "N menit lalu" untuk kurang dari satu jam', () => {
    expect(formatWaktuRelatif('2026-10-25T20:44:00+07:00')).toBe('15 menit lalu')
  })

  it('memakai "N jam lalu" untuk hari yang sama', () => {
    expect(formatWaktuRelatif('2026-10-25T18:59:00+07:00')).toBe('2 jam lalu')
  })

  it('memakai "Kemarin" untuk satu hari sebelumnya', () => {
    expect(formatWaktuRelatif('2026-10-24T14:30:00+07:00')).toBe('Kemarin, 14.30 WIB')
  })

  it('memakai tanggal penuh untuk dua hari atau lebih', () => {
    expect(formatWaktuRelatif('2026-10-20T15:00:00+07:00')).toBe('20 Oktober 2026, 15.00 WIB')
  })
})
