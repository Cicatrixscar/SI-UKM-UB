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

const KUNCI_STORAGE = 'si_ukm_sesi'

let sesiAktif = null

function muatSesi() {
  if (sesiAktif) return sesiAktif
  try {
    if (typeof localStorage !== 'undefined') {
      const tersimpan = localStorage.getItem(KUNCI_STORAGE)
      if (tersimpan) {
        sesiAktif = JSON.parse(tersimpan)
      }
    }
  } catch (e) {
    console.error('Gagal membaca sesi dari storage:', e)
  }
  return sesiAktif
}

/** @returns {{idUser:string,nama:string,email:string,role:string}|null} */
export function getSesi() {
  return sesiAktif ?? muatSesi()
}

export function setSesi(pengguna) {
  sesiAktif = pengguna ? { ...pengguna } : null
  try {
    if (typeof localStorage !== 'undefined') {
      if (sesiAktif) {
        localStorage.setItem(KUNCI_STORAGE, JSON.stringify(sesiAktif))
      } else {
        localStorage.removeItem(KUNCI_STORAGE)
      }
    }
  } catch (e) {
    console.error('Gagal menyimpan sesi ke storage:', e)
  }
  return sesiAktif
}

export function hapusSesi() {
  sesiAktif = null
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(KUNCI_STORAGE)
    }
  } catch (e) {}
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
