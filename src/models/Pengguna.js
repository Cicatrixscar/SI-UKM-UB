/**
 * Entitas: Pengguna (superclass).
 *
 * Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 65
 *         "Pengguna | idUser, nama, email, password, role |
 *          Method: login(email:String, pass:String):boolean, logout():void"
 * Sumber: Kelas Diagram Package (KD) hal. 1 — generalisasi Pengguna <- Mahasiswa, AdminUKM.
 * Sumber: PRD v0.3 §6.1.
 *
 * Catatan implementasi [USULAN]:
 *   Method entitas yang pada modul bersifat class-level/static (butuh daftar data)
 *   menerima parameter koleksi pertama. NAMA method tidak diubah.
 */

import { hapusSesi } from '../state/session.js'

/**
 * @typedef {object} Pengguna
 * @property {string} idUser
 * @property {string} nama
 * @property {string} email
 * @property {string} password   // modul: String; mock memakai "dummy-password" (AI.md §9)
 * @property {string} role       // MAHASISWA | ADMIN_UKM
 */

/** Factory entitas Pengguna. Atribut sesuai MP2 §3.4.1 hal. 65. */
export function createPengguna(data) {
  return {
    idUser: data.idUser,
    nama: data.nama,
    email: data.email,
    password: data.password ?? 'dummy-password',
    role: data.role,
  }
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 65 — Pengguna.login(email, pass): boolean
 * [USULAN] parameter `daftarPengguna` karena method pada modul bersifat class-level.
 */
export function login(daftarPengguna, email, pass) {
  if (!email || !pass) return false
  return daftarPengguna.some(
    p => p.email.toLowerCase() === String(email).toLowerCase() && p.password === pass
  )
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 65 — Pengguna.logout(): void
 * [USULAN] modul tidak menentukan tempat penyimpanan sesi; sesi ditangani
 *          di src/state/session.js.
 */
export function logout() {
  hapusSesi()
}
