/**
 * Entitas: AdminUKM (extends Pengguna).
 *
 * Sumber: Kelas Diagram Package (KD) hal. 1.
 * Sumber: PRD v0.3 §6.3.
 */

import { Pengguna, createPengguna } from './Pengguna.js'

/**
 * @typedef {object} AdminUKM
 * @property {string} idUser
 * @property {string} nama
 * @property {string} email
 * @property {string} password
 * @property {string} role
 * @property {string} idAdmin
 * @property {string} idUKM
 * @property {string} nipNim
 * @property {string} statusAkun
 */

/** Factory entitas AdminUKM. */
export function createAdminUKM(data) {
  return new AdminUKM(data)
}

/**
 * Sumber: KD hal. 1, PRD v0.3 §6.3 — AdminUKM.findById(idAdmin): AdminUKM
 * [USULAN] parameter `daftarAdmin`.
 */
export function findById(daftarAdmin, idAdmin) {
  return (daftarAdmin ?? []).find(a => a.idAdmin === idAdmin) ?? null
}

/**
 * Kelas: AdminUKM (extends Pengguna)
 * [DOKUMEN] KD hal. 1, PRD v0.3 §6.3.
 */
export class AdminUKM extends Pengguna {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    super(data)
    this.idAdmin = data.idAdmin
    this.idUKM = data.idUKM
    this.nipNim = data.nipNim
    this.statusAkun = data.statusAkun ?? 'AKTIF'
  }

  /**
   * Static method: findById(daftarAdmin, idAdmin)
   */
  static findById(daftarAdmin, idAdmin) {
    return findById(daftarAdmin, idAdmin)
  }
}
