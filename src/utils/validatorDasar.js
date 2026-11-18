/**
 * Validator Dasar / Umum.
 *
 * Tanggung Jawab: Memvalidasi ketersediaan nilai input wajib.
 */

import { PESAN } from './errors.js'

/**
 * Cek field wajib terisi.
 * [DOKUMEN] AI.md §6 M-03: "Wajib: Nama Lengkap, NIM, Email, Nomor Telepon,
 *           Alasan. Pesan kosong: 'Field ini wajib diisi'".
 * @param {unknown} nilai
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiWajib(nilai) {
  const terisi = String(nilai ?? '').trim().length > 0
  return terisi ? { valid: true, pesan: '' } : { valid: false, pesan: PESAN.FIELD_WAJIB }
}
