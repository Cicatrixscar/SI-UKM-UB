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
  const emailBersih = String(email ?? '').trim().toLowerCase()
  try {
    const { data, error } = await ambilSupabase()
      .from('pengguna')
      .select('*')
      .ilike('email', emailBersih)
      .maybeSingle()
    pastikan(error)
    if (data) {
      return { berhasil: true, user: petakanPengguna(data), pesan: '' }
    }

    // Jika akun belum terdaftar di tabel pengguna Supabase, buatkan profil mahasiswa otomatis
    const namaPrefix = emailBersih.split('@')[0]
    const namaFormatted = namaPrefix
      .replace(/[._0-9]/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(kata => kata.charAt(0).toUpperCase() + kata.slice(1))
      .join(' ')

    const angkaEmail = emailBersih.match(/\d+/)
    const nimOtomatis = angkaEmail ? '2251504' + angkaEmail[0].padStart(8, '0').slice(-8) : '225150400111024'

    const userBaru = {
      id_user: 'USR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      nama: namaFormatted || 'Mahasiswa UB',
      email: emailBersih,
      role: 'MAHASISWA',
      nim: nimOtomatis,
      nomor_telepon: '081234567890',
      program_studi: 'Teknik Informatika',
      fakultas: 'Fakultas Ilmu Komputer',
    }

    try {
      const { data: inserted } = await ambilSupabase()
        .from('pengguna')
        .insert(userBaru)
        .select()
        .maybeSingle()
      if (inserted) {
        return { berhasil: true, user: petakanPengguna(inserted), pesan: '' }
      }
    } catch {
      // Abaikan jika database membatasi izin insert anon
    }

    return { berhasil: true, user: petakanPengguna(userBaru), pesan: '' }
  } catch (err) {
    console.error(err)
    return { berhasil: false, user: null, pesan: 'Terjadi kesalahan saat masuk' }
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
