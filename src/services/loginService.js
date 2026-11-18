/**
 * Service: Login & Autentikasi Pengguna.
 *
 * Tanggung Jawab (Single Responsibility):
 * - Memverifikasi kredensial login pengguna terhadap database Supabase
 * - Memeriksa password hash SHA-512 + Salt email
 * - Mengelola logout dan login demo mahasiswa
 */

import { config } from '../config.js'
import { ambilSupabase, pastikan } from './supabaseClient.js'
import { petakanPengguna } from './pemetaanBaris.js'
import { logout as logoutPengguna } from '../models/Pengguna.js'
import { verifikasiPassword } from '../utils/crypto.js'

/**
 * Login mahasiswa.
 * Wajib terdaftar di database Supabase dan kata sandi cocok dengan password_hash.
 * @param {string} email
 * @param {string} pass
 * @returns {Promise<{berhasil: boolean, user: object|null, pesan: string}>}
 */
export async function login(email, pass) {
  const emailBersih = String(email ?? '').trim().toLowerCase()
  const passwordInput = String(pass ?? '')

  try {
    // Cari data pengguna yang sudah terdaftar di Supabase
    const { data, error } = await ambilSupabase()
      .from('pengguna')
      .select('*')
      .ilike('email', emailBersih)
      .maybeSingle()
    pastikan(error)

    if (!data) {
      return {
        berhasil: false,
        user: null,
        pesan: 'Akun belum terdaftar. Silakan daftar akun mahasiswa terlebih dahulu.',
      }
    }

    // Jika pengguna memiliki password_hash, verifikasi dengan SHA-512 + Salt email
    if (data.password_hash) {
      const cocok = await verifikasiPassword(passwordInput, data.password_hash, emailBersih)
      if (!cocok) {
        return {
          berhasil: false,
          user: null,
          pesan: 'Kata sandi salah. Silakan periksa kembali.',
        }
      }
    }

    return { berhasil: true, user: petakanPengguna(data), pesan: '' }
  } catch (err) {
    console.error(err)
    return { berhasil: false, user: null, pesan: 'Terjadi kesalahan saat memproses login.' }
  }
}

/** @returns {Promise<void>} */
export async function logout() {
  logoutPengguna()
}

/**
 * Login cepat untuk mode demo (tombol pada layar Masuk).
 * [USULAN] UI/UX Wireframe Brief §10 M-02: "Di layar ini pilih role untuk mode mock."
 */
export async function loginSebagaiMahasiswa() {
  try {
    const { data, error } = await ambilSupabase()
      .from('pengguna')
      .select('*')
      .eq('role', 'MAHASISWA')
      .limit(1)
      .maybeSingle()
    pastikan(error)
    return { berhasil: Boolean(data), user: petakanPengguna(data), pesan: '' }
  } catch (err) {
    console.error(err)
    return { berhasil: false, user: null, pesan: '' }
  }
}

/** [DOKUMEN] AI.md §4 — config dipakai pihak service, bukan halaman. */
export const authServiceConfig = config

/**
 * Service: AuthService
 * [DOKUMEN] PRD v0.3 §7.1.
 */
export class AuthService {
  static async login(email, pass) {
    return login(email, pass)
  }

  static async logout() {
    return logout()
  }

  static async loginSebagaiMahasiswa() {
    return loginSebagaiMahasiswa()
  }
}
