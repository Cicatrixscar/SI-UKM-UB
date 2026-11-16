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

import { Pengguna, createPengguna } from './Pengguna.js'

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
  return new Mahasiswa(data)
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

/**
 * Kelas: Mahasiswa (extends Pengguna)
 * [DOKUMEN] KD hal. 1, MP2 §3.4.1 hal. 65-66, PRD v0.3 §6.2.
 */
export class Mahasiswa extends Pengguna {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    super(data)
    this.nim = data.nim
    this.nomorTelepon = data.nomorTelepon ?? ''
    this.programStudi = data.programStudi ?? ''
    this.fakultas = data.fakultas ?? ''
  }

  /**
   * Sumber: MP2 §3.4.1 hal. 66 — Mahasiswa.getDetailMahasiswa(): Mahasiswa
   * @returns {Mahasiswa}
   */
  getDetailMahasiswa() {
    return { ...this }
  }

  /**
   * Sumber: MP2 §3.4.1 hal. 66 — Mahasiswa.updateProfil(dataBaru: Object): boolean
   * @param {object} dataBaru
   * @returns {boolean}
   */
  updateProfil(dataBaru) {
    return updateProfil(this, dataBaru)
  }

  /**
   * Class-level helper.
   * @param {Mahasiswa} mahasiswa
   * @returns {Mahasiswa|null}
   */
  static getDetailMahasiswa(mahasiswa) {
    return getDetailMahasiswa(mahasiswa)
  }

  /**
   * Class-level helper.
   * @param {Mahasiswa} mahasiswa
   * @param {object} dataBaru
   * @returns {boolean}
   */
  static updateProfil(mahasiswa, dataBaru) {
    return updateProfil(mahasiswa, dataBaru)
  }
}

