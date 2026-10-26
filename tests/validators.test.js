/**
 * Tes: src/utils/validators.js
 *
 * [DOKUMEN] AI.md §6 — aturan bisnis yang harus diuji (M-03, M-04).
 * [DOKUMEN] AI.md §10 DoD: "npm test lulus, dan tes mencakup validasi file
 *           (format, ukuran, batas) dan validasi form (wajib, email, 500 karakter)."
 * [DOKUMEN] AI.md §11 T3: "Tulis tes ... dulu berdasarkan bagian 6."
 */

import { describe, it, expect } from 'vitest'
import {
  validasiWajib,
  validasiEmail,
  validasiNim,
  validasiAlasan,
  validasiDataDiri,
  validasiFormatBerkas,
  validasiUkuranBerkas,
  validasiBerkas,
  semuaBerkasValid,
} from '../src/utils/validators.js'
import { PESAN } from '../src/utils/errors.js'
import { config } from '../src/config.js'

const MB = 1024 * 1024

function berkas(tipe, byte) {
  return { name: 'dummy', type: tipe, size: byte }
}

describe('validasiWajib', () => {
  it('menolak nilai kosong dengan pesan "Field ini wajib diisi"', () => {
    expect(validasiWajib('')).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
    expect(validasiWajib('   ')).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
    expect(validasiWajib(null)).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
    expect(validasiWajib(undefined)).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
  })

  it('menerima nilai terisi', () => {
    expect(validasiWajib('Rusdi').valid).toBe(true)
  })
})

describe('validasiEmail', () => {
  it('menolak email kosong dengan pesan "Field ini wajib diisi"', () => {
    expect(validasiEmail('')).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
  })

  it('menolak format email yang tidak sah', () => {
    expect(validasiEmail('bukan-email').valid).toBe(false)
    expect(validasiEmail('rusdi@').valid).toBe(false)
    expect(validasiEmail('@ub.ac.id').valid).toBe(false)
    expect(validasiEmail('rusdi @student.ub.ac.id').valid).toBe(false)
  })

  it('menerima email mahasiswa UB', () => {
    expect(validasiEmail('rusdi@student.ub.ac.id').valid).toBe(true)
    expect(validasiEmail('dosen@ub.ac.id').valid).toBe(true)
  })
})

describe('validasiNim', () => {
  it('menolak NIM kosong', () => {
    expect(validasiNim('')).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
  })

  it('menerima NIM terisi (tidak ada aturan pola di dokumen sumber)', () => {
    expect(validasiNim('225150400111024').valid).toBe(true)
  })
})

describe('validasiAlasan', () => {
  it('menolak alasan kosong', () => {
    expect(validasiAlasan('')).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
  })

  it('menerima alasan tepat 500 karakter (batas keputusan G6)', () => {
    const tepat = 'a'.repeat(config.batasKarakterAlasan)
    expect(tepat.length).toBe(500)
    expect(validasiAlasan(tepat).valid).toBe(true)
  })

  it('menolak alasan 501 karakter', () => {
    const lewat = 'a'.repeat(config.batasKarakterAlasan + 1)
    expect(validasiAlasan(lewat).valid).toBe(false)
  })
})

describe('validasiDataDiri', () => {
  const lengkap = {
    nama: 'Rusdi',
    nim: '225150400111024',
    email: 'rusdi@student.ub.ac.id',
    nomorTelepon: '081234567890',
    alasan: 'Ingin belajar fotografi bersama teman-teman kampus.',
  }

  it('menerima data diri lengkap', () => {
    const hasil = validasiDataDiri(lengkap)
    expect(hasil.valid).toBe(true)
    expect(hasil.pesan).toBe('')
  })

  it('menandai setiap field yang kosong dengan "Field ini wajib diisi"', () => {
    const hasil = validasiDataDiri({ ...lengkap, nama: '', nomorTelepon: '  ' })
    expect(hasil.valid).toBe(false)
    expect(hasil.field.nama).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
    expect(hasil.field.nomorTelepon).toEqual({ valid: false, pesan: PESAN.FIELD_WAJIB })
    expect(hasil.field.nim.valid).toBe(true)
  })

  it('menandai email tidak sah sebagai tidak valid', () => {
    const hasil = validasiDataDiri({ ...lengkap, email: 'salah' })
    expect(hasil.valid).toBe(false)
    expect(hasil.field.email.valid).toBe(false)
  })

  it('menandai alasan melebihi 500 karakter sebagai tidak valid', () => {
    const hasil = validasiDataDiri({ ...lengkap, alasan: 'a'.repeat(501) })
    expect(hasil.valid).toBe(false)
    expect(hasil.field.alasan.valid).toBe(false)
  })
})

describe('validasiFormatBerkas', () => {
  it('menerima PDF (application/pdf)', () => {
    expect(validasiFormatBerkas(berkas('application/pdf', 1 * MB)).valid).toBe(true)
  })

  it('menerima JPEG (image/jpeg)', () => {
    expect(validasiFormatBerkas(berkas('image/jpeg', 1 * MB)).valid).toBe(true)
  })

  it('menolak format lain dengan pesan format PRD §14', () => {
    const hasil = validasiFormatBerkas(berkas('text/plain', 1 * MB))
    expect(hasil).toEqual({ valid: false, pesan: PESAN.FORMAT_FILE })
  })

  it('menolak berkas kosong', () => {
    expect(validasiFormatBerkas(null).valid).toBe(false)
    expect(validasiFormatBerkas(undefined).valid).toBe(false)
  })
})

describe('validasiUkuranBerkas', () => {
  it('menerima berkas tepat 5 MB', () => {
    expect(validasiUkuranBerkas(berkas('application/pdf', 5 * MB)).valid).toBe(true)
  })

  it('menolak berkas 5 MB + 1 byte dengan pesan ukuran PRD §14', () => {
    const hasil = validasiUkuranBerkas(berkas('application/pdf', 5 * MB + 1))
    expect(hasil).toEqual({ valid: false, pesan: PESAN.UKURAN_FILE })
  })

  it('menolak berkas berukuran 10 MB', () => {
    expect(validasiUkuranBerkas(berkas('application/pdf', 10 * MB)).valid).toBe(false)
  })
})

describe('validasiBerkas (format lalu ukuran)', () => {
  it('menerima PDF kecil dengan pesan "Format dokumen valid"', () => {
    expect(validasiBerkas(berkas('application/pdf', 1 * MB))).toEqual({
      valid: true,
      pesan: PESAN.FORMAT_VALID,
    })
  })

  it('menolak JPEG 10 MB dengan pesan ukuran', () => {
    const hasil = validasiBerkas(berkas('image/jpeg', 10 * MB))
    expect(hasil).toEqual({ valid: false, pesan: PESAN.UKURAN_FILE })
  })

  it('menolak format salah dengan pesan format', () => {
    const hasil = validasiBerkas(berkas('application/zip', 100))
    expect(hasil).toEqual({ valid: false, pesan: PESAN.FORMAT_FILE })
  })
})

describe('semuaBerkasValid', () => {
  const pdf = () => berkas('application/pdf', 1 * MB)
  const jpg = () => berkas('image/jpeg', 2 * MB)

  it('menerima tiga berkas valid (KTM, Transkrip, CV)', () => {
    expect(semuaBerkasValid([pdf(), jpg(), pdf()])).toBe(true)
  })

  it('menerima dua berkas valid (cakupan validator: seluruh berkas valid; aturan jumlah wajib ada di service)', () => {
    expect(semuaBerkasValid([pdf(), pdf()])).toBe(true)
  })

  it('menolak jika ada satu berkas tidak valid', () => {
    expect(semuaBerkasValid([pdf(), berkas('text/plain', 100), pdf()])).toBe(false)
    expect(semuaBerkasValid([pdf(), pdf(), berkas('application/pdf', 10 * MB)])).toBe(false)
  })

  it('menolak daftar kosong', () => {
    expect(semuaBerkasValid([])).toBe(false)
  })
})
