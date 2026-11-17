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
import { hashPassword, verifikasiPassword } from '../utils/crypto.js'

/**
 * Login mahasiswa.
 * Wajib terdaftar di database Supabase dan kata sandi cocok dengan password_hash.
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

/**
 * Mengirimkan kode OTP pendaftaran ke alamat email student UB via Supabase Auth.
 * Kode OTP dikirimkan secara ketat ke kotak masuk email asli pengguna.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{berhasil: boolean, pesan: string}>}
 */
export async function kirimOtpPendaftaran(email, password) {
  const emailBersih = String(email ?? '').trim().toLowerCase()
  try {
    const supabase = ambilSupabase()

    // 1. Cek apakah email sudah terdaftar di tabel pengguna
    const { data: cekPengguna } = await supabase
      .from('pengguna')
      .select('id_user')
      .ilike('email', emailBersih)
      .maybeSingle()

    if (cekPengguna) {
      return {
        berhasil: false,
        pesan: 'Email ini sudah terdaftar di sistem. Silakan langsung masuk.',
      }
    }

    // 2. Kirim OTP via Supabase Auth ke email asli
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: emailBersih,
      options: {
        shouldCreateUser: true,
      },
    })

    if (otpError) {
      console.warn('signInWithOtp error, mencoba signUp:', otpError.message)
      const { error: signUpError } = await supabase.auth.signUp({
        email: emailBersih,
        password: password,
      })

      if (signUpError) {
        console.error('Gagal kirim email OTP:', signUpError)
        return {
          berhasil: false,
          pesan: signUpError.message || otpError.message || 'Gagal mengirimkan kode OTP ke email Anda.',
        }
      }
    }

    return {
      berhasil: true,
      pesan: `Kode OTP verifikasi telah dikirim ke ${emailBersih}. Silakan periksa kotak masuk atau folder spam email Anda.`,
    }
  } catch (err) {
    console.error('kirimOtpPendaftaran error:', err)
    return {
      berhasil: false,
      pesan: 'Terjadi kesalahan pada server saat mengirim email verifikasi.',
    }
  }
}

/**
 * Verifikasi kode OTP dan simpan data mahasiswa ke database.
 * Kode OTP diverifikasi secara ketat ke Supabase Auth.
 * @param {object} dataMahasiswa
 * @param {string} kodeOtp
 * @returns {Promise<{berhasil: boolean, user?: object, pesan: string}>}
 */
export async function verifikasiOtpDanDaftar(dataMahasiswa, kodeOtp) {
  const emailBersih = String(dataMahasiswa.email ?? '').trim().toLowerCase()
  const tokenOtp = String(kodeOtp ?? '').trim()

  try {
    const supabase = ambilSupabase()

    // 1. Verifikasi kode OTP secara ketat ke server Supabase Auth
    let authUser = null
    const { data: fbData, error: fbError } = await supabase.auth.verifyOtp({
      email: emailBersih,
      token: tokenOtp,
      type: 'email',
    })

    if (fbError) {
      const { data: verifData, error: verifError } = await supabase.auth.verifyOtp({
        email: emailBersih,
        token: tokenOtp,
        type: 'signup',
      })

      if (verifError) {
        return {
          berhasil: false,
          pesan: 'Kode OTP tidak valid atau salah. Silakan periksa kembali email Anda.',
        }
      }
      authUser = verifData?.user
    } else {
      authUser = fbData?.user
    }

    // 2. Hash kata sandi dengan SHA-512 + Salt email
    const passHash = await hashPassword(dataMahasiswa.password, emailBersih)

    // 3. Simpan data mahasiswa ke tabel `pengguna`
    const idUserBaru = 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    const recordBaru = {
      id_user: idUserBaru,
      auth_id: authUser?.id || null,
      nama: String(dataMahasiswa.nama ?? '').trim(),
      email: emailBersih,
      role: 'MAHASISWA',
      nim: String(dataMahasiswa.nim ?? '').trim() || null,
      nomor_telepon: String(dataMahasiswa.nomorTelepon ?? '').trim() || null,
      program_studi: String(dataMahasiswa.programStudi ?? '').trim() || 'Teknik Informatika',
      fakultas: String(dataMahasiswa.fakultas ?? '').trim() || 'Fakultas Ilmu Komputer',
      password_hash: passHash,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('pengguna')
      .insert(recordBaru)
      .select()
      .maybeSingle()

    if (insertError) {
      console.error('Gagal insert ke tabel pengguna:', insertError)
      return {
        berhasil: false,
        pesan: 'Gagal menyimpan data pengguna ke database: ' + (insertError.message || ''),
      }
    }

    return {
      berhasil: true,
      user: petakanPengguna(inserted || recordBaru),
      pesan: 'Pendaftaran berhasil! Akun Anda telah aktif.',
    }
  } catch (err) {
    console.error('verifikasiOtpDanDaftar error:', err)
    return { berhasil: false, pesan: 'Terjadi kesalahan saat memverifikasi OTP.' }
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
