/**
 * Entitas: Mahasiswa (extends Pengguna).
 *
 * Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 65-66
 *         "Mahasiswa | nim, nomorTelepon, programStudi, fakultas |
 *          Method: getDetailMahasiswa(): Mahasiswa,
 *                  updateProfil(dataBaru: Object): boolean"
 * Sumber: Kelas Diagram Package (KD) hal. 1.
 * Sumber: PRD v0.3 §6.2.
 */

import { createPengguna } from './Pengguna.js'

/**
 * @typedef {object} Mahasiswa
 * @property {string} idUser
 * @property {string} nama
 * @property {string} email
 * @property {string} password
 * @property {string} role
 * @property {string} nim
 * @property {string} nomorTelepon
 * @property {string} programStudi
 * @property {string} fakultas
 */

/** Factory entitas Mahasiswa. Atribut sesuai MP2 §3.4.1 hal. 65-66. */
export function createMahasiswa(data) {
  return {
    ...createPengguna(data),
    nim: data.nim,
    nomorTelepon: data.nomorTelepon ?? '',
    programStudi: data.programStudi ?? '',
    fakultas: data.fakultas ?? '',
  }
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 66 — Mahasiswa.getDetailMahasiswa(): Mahasiswa
 * [USULAN] parameter `mahasiswa` karena method pada modul bersifat class-level.
 */
export function getDetailMahasiswa(mahasiswa) {
  return mahasiswa ? { ...mahasiswa } : null
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 66 — Mahasiswa.updateProfil(dataBaru): boolean
 * [USULAN] parameter `mahasiswa` dan pembaruan dilakukan in-memory pada objek yang diberikan.
 */
export function updateProfil(mahasiswa, dataBaru) {
  if (!mahasiswa || !dataBaru) return false
  const bolehDiubah = ['nama', 'nomorTelepon', 'programStudi', 'fakultas', 'email']
  for (const kunci of bolehDiubah) {
    if (kunci in dataBaru) mahasiswa[kunci] = dataBaru[kunci]
  }
  return true
}
