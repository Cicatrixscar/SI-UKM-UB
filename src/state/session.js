/**
 * Sesi login in-memory.
 *
 * [USULAN] Tidak ada kelas/entitas "Sesi" di modul (MP2 §3.4.1 maupun KD).
 *          Dibutuhkan agar guard router dan AppShell bisa membaca peran
 *          pengguna. Metode di bawah BUKAN method entitas modul, sehingga
 *          namanya bebas.
 *
 * Sumber entitas yang dipakai di dalamnya:
 *   Pengguna  -> Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 65
 *   Mahasiswa -> Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 65-66
 */

import { ROLES } from '../enums/roles.js'

let sesiAktif = null

/** @returns {{idUser:string,nama:string,email:string,role:string}|null} */
export function getSesi() {
  return sesiAktif
}

export function setSesi(pengguna) {
  sesiAktif = pengguna ? { ...pengguna } : null
  return sesiAktif
}

export function hapusSesi() {
  sesiAktif = null
}

export function sedangLogin() {
  return sesiAktif !== null
}

export function peranAktif() {
  return sesiAktif ? sesiAktif.role : null
}

export function adalahMahasiswa() {
  return sesiAktif !== null && sesiAktif.role === ROLES.MAHASISWA
}
