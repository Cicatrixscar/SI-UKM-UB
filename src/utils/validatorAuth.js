/**
 * Validator Autentikasi & Akun.
 *
 * Tanggung Jawab: Memvalidasi kredensial (email, password, domain kampus).
 */

import { PESAN } from './errors.js'

const EMAIL_SAH = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_STUDENT_UB = /^[a-zA-Z0-9._%+-]+@student\.ub\.ac\.id$/i
const EMAIL_ADMIN_UB = /^[a-zA-Z0-9._%+-]+@ub\.ac\.id$/i

/**
 * Cek format email umum.
 * @param {string} email
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiEmail(email) {
  const terisi = String(email ?? '').trim().length > 0
  if (!terisi) return { valid: false, pesan: PESAN.FIELD_WAJIB }
  return EMAIL_SAH.test(String(email).trim())
    ? { valid: true, pesan: '' }
    : { valid: false, pesan: '' }
}

/**
 * Cek format email khusus Mahasiswa.
 * Wajib berakhiran @student.ub.ac.id (contoh: akumahasiswa@student.ub.ac.id).
 * @param {string} email
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiEmailMahasiswa(email) {
  const teks = String(email ?? '').trim()
  if (!teks) return { valid: false, pesan: PESAN.FIELD_WAJIB }
  if (!EMAIL_SAH.test(teks) || !EMAIL_STUDENT_UB.test(teks)) {
    return {
      valid: false,
      pesan: 'Email mahasiswa wajib berakhiran @student.ub.ac.id (contoh: akumahasiswa@student.ub.ac.id)',
    }
  }
  return { valid: true, pesan: '' }
}

/**
 * Cek format email khusus Admin UKM.
 * Wajib berakhiran @ub.ac.id (contoh: admin@ub.ac.id).
 * @param {string} email
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiEmailAdmin(email) {
  const teks = String(email ?? '').trim()
  if (!teks) return { valid: false, pesan: PESAN.FIELD_WAJIB }
  if (!EMAIL_SAH.test(teks) || !EMAIL_ADMIN_UB.test(teks)) {
    return {
      valid: false,
      pesan: 'Email admin wajib berakhiran @ub.ac.id (contoh: admin@ub.ac.id)',
    }
  }
  return { valid: true, pesan: '' }
}

/**
 * Validasi kekuatan kata sandi:
 * Minimal 8 karakter, wajib mengandung huruf kecil, huruf besar, dan angka.
 * @param {string} password
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiKekuatanPassword(password) {
  const teks = String(password ?? '')
  if (!teks) {
    return { valid: false, pesan: PESAN.FIELD_WAJIB }
  }
  if (teks.length < 8) {
    return { valid: false, pesan: 'Kata sandi minimal 8 karakter' }
  }
  if (!/[a-z]/.test(teks)) {
    return { valid: false, pesan: 'Kata sandi wajib mengandung setidaknya satu huruf kecil (a-z)' }
  }
  if (!/[A-Z]/.test(teks)) {
    return { valid: false, pesan: 'Kata sandi wajib mengandung setidaknya satu huruf besar (A-Z)' }
  }
  if (!/[0-9]/.test(teks)) {
    return { valid: false, pesan: 'Kata sandi wajib mengandung setidaknya satu angka (0-9)' }
  }
  return { valid: true, pesan: '' }
}

/** Alias untuk login mahasiswa */
export const validasiEmailUB = validasiEmailMahasiswa
