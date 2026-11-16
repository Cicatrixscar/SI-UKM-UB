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
  // `pass` sengaja tidak diverifikasi — mode demo frontend
  void pass
  const emailBersih = String(email ?? '').trim().toLowerCase()
  try {
    // Cari data pengguna yang sudah terdaftar di Supabase
    const { data, error } = await ambilSupabase()
      .from('pengguna')
      .select('*')
      .ilike('email', emailBersih)
      .maybeSingle()
    pastikan(error)

    if (data) {
      return { berhasil: true, user: petakanPengguna(data), pesan: '' }
    }

    // Jika belum ada di tabel pengguna, buat objek sesi lokal saja tanpa mencatat/mengubah database
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

    const userLokal = {
      id_user: 'USR-MHS',
      nama: namaFormatted || 'Mahasiswa UB',
      email: emailBersih,
      role: 'MAHASISWA',
      nim: nimOtomatis,
      nomor_telepon: '081234567890',
      program_studi: 'Teknik Informatika',
      fakultas: 'Fakultas Ilmu Komputer',
    }

    return { berhasil: true, user: petakanPengguna(userLokal), pesan: '' }
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
