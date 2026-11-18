/**
 * Validator Form Data Diri Mahasiswa.
 *
 * Tanggung Jawab: Memvalidasi data form identitas mahasiswa (NIM, Alasan, Data Diri keseluruhan).
 */

import { PESAN } from './errors.js'
import { batasKarakterAlasan } from '../config.js'
import { validasiWajib } from './validatorDasar.js'
import { validasiEmail } from './validatorAuth.js'

/**
 * Cek NIM.
 * [DOKUMEN] AI.md §6 M-03 hanya mewajibkan NIM terisi.
 * @param {string} nim
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiNim(nim) {
  return validasiWajib(nim)
}

/**
 * Cek alasan bergabung.
 * [DOKUMEN] AI.md §6 M-03: "Alasan maksimal 500 karakter."
 * @param {string} alasan
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiAlasan(alasan) {
  const teks = String(alasan ?? '')
  const wajib = validasiWajib(teks)
  if (!wajib.valid) return wajib
  if (teks.length > batasKarakterAlasan) {
    return { valid: false, pesan: '' }
  }
  return { valid: true, pesan: '' }
}

/**
 * Validasi seluruh form data diri (M-03).
 * @param {object} data
 * @returns {{ valid: boolean, field: object, pesan: string }}
 */
export function validasiDataDiri(data) {
  const hasil = {
    nama: validasiWajib(data?.nama),
    nim: validasiNim(data?.nim),
    email: validasiEmail(data?.email),
    nomorTelepon: validasiWajib(data?.nomorTelepon),
    alasan: validasiAlasan(data?.alasan),
  }
  const valid = Object.values(hasil).every(h => h.valid)
  return { valid, field: hasil, pesan: valid ? '' : PESAN.FIELD_WAJIB }
}
