/**
 * Service: autentikasi.
 *
 * [DOKUMEN] PRD v0.3 §7.1 authService:
 *           | login(email, pass) | String, String | `{ berhasil, user, pesan }` |
 *           | logout() | — | void |
 * [DOKUMEN] AI.md §9: "Jangan mengubah nama method, halaman, atau service dari PRD."
 *
 * Data pengguna dibaca dari tabel `pengguna` di Supabase.
 *
 * shortcut: password belum diverifikasi — Supabase Auth belum disambungkan, jadi
 * login hanya mencocokkan email. Ganti ke `signInWithPassword` saat login nyata
 * dipakai (dan isi kolom `pengguna.auth_id`).
 */

import { config } from '../config.js'
import { ambilSupabase, pastikan } from './supabaseClient.js'
import { petakanPengguna } from './pemetaanBaris.js'
import { logout as logoutPengguna } from '../models/Pengguna.js'

/** @returns {Promise<{berhasil: boolean, user: object|null, pesan: string}>} */
export async function login(email, pass) {
  // `pass` sengaja tidak dipakai — lihat catatan shortcut di atas.
  void pass
  try {
    const { data, error } = await ambilSupabase()
      .from('pengguna')
      .select('*')
      .ilike('email', String(email ?? '').trim())
      .maybeSingle()
    pastikan(error)
    if (!data) return { berhasil: false, user: null, pesan: '' }
    return { berhasil: true, user: petakanPengguna(data), pesan: '' }
  } catch (err) {
    console.error(err)
    // [USULAN] PRD §14 tidak memuat teks "login gagal"; halaman menandai field merah.
    return { berhasil: false, user: null, pesan: '' }
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
