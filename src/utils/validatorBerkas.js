/**
 * Validator Berkas Dokumen Unggahan.
 *
 * Tanggung Jawab: Memvalidasi tipe MIME, ekstensi berkas, dan ukuran berkas PDF/JPEG.
 */

import { PESAN } from './errors.js'
import { batasUkuranFile, formatFileDiizinkan } from '../config.js'

/**
 * Cek format berkas.
 * [DOKUMEN] AI.md §6 M-04: "hanya PDF (application/pdf) dan JPEG (image/jpeg)".
 * @param {File} file
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiFormatBerkas(file) {
  if (!file) return { valid: false, pesan: PESAN.FORMAT_FILE }
  const tipe = String(file.type ?? '').toLowerCase()
  if (formatFileDiizinkan.includes(tipe)) return { valid: true, pesan: PESAN.FORMAT_VALID }
  return { valid: false, pesan: PESAN.FORMAT_FILE }
}

/**
 * Cek ukuran berkas.
 * [DOKUMEN] AI.md §6 M-04: "maksimal 5 × 1024 × 1024 byte".
 * @param {File} file
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiUkuranBerkas(file) {
  if (!file) return { valid: false, pesan: PESAN.UKURAN_FILE }
  if (typeof file.size !== 'number') return { valid: false, pesan: PESAN.UKURAN_FILE }
  if (file.size > batasUkuranFile) return { valid: false, pesan: PESAN.UKURAN_FILE }
  return { valid: true, pesan: PESAN.FORMAT_VALID }
}

/**
 * Validasi satu berkas (format lalu ukuran).
 * [DOKUMEN] AI.md §6 M-04 dan Modul PC-03 hal. 84.
 * @param {File} file
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiBerkas(file) {
  const format = validasiFormatBerkas(file)
  if (!format.valid) return format
  const ukuran = validasiUkuranBerkas(file)
  if (!ukuran.valid) return ukuran
  return { valid: true, pesan: PESAN.FORMAT_VALID }
}

/**
 * Cek apakah seluruh berkas valid (format lalu ukuran).
 * [DOKUMEN] AI.md §6 M-04.
 * @param {Array<{file?: File}|File>} daftarBerkas
 * @returns {boolean}
 */
export function semuaBerkasValid(daftarBerkas) {
  if (!Array.isArray(daftarBerkas) || daftarBerkas.length === 0) return false
  return daftarBerkas.every(b => validasiBerkas(b?.file ?? b).valid)
}
