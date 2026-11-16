/**
 * Entitas: Jawaban.
 *
 * Sumber: Kelas Diagram Package (KD) hal. 1.
 * Sumber: PRD v0.3 §6.8.
 */

/**
 * @typedef {object} Jawaban
 * @property {string} idJawaban
 * @property {string} idPertanyaan
 * @property {string} idAdmin
 * @property {string} teksJawaban
 * @property {string} timestamp
 */

/** Factory entitas Jawaban. */
export function createJawaban(data) {
  return new Jawaban(data)
}

/**
 * Sumber: KD hal. 1, PRD v0.3 §6.8 — Jawaban.saveJawaban(idPertanyaan, teksJawaban, timestamp)
 * [USULAN] parameter `daftarJawaban`.
 */
export function saveJawaban(daftarJawaban, idPertanyaan, teksJawaban, timestamp = new Date().toISOString(), idAdmin = '') {
  const idJawaban = `JWB-${Date.now()}`
  const jawaban = new Jawaban({
    idJawaban,
    idPertanyaan,
    idAdmin,
    teksJawaban,
    timestamp,
  })
  if (Array.isArray(daftarJawaban)) {
    daftarJawaban.push(jawaban)
  }
  return true
}

/**
 * Kelas: Jawaban
 * [DOKUMEN] KD hal. 1, PRD v0.3 §6.8.
 */
export class Jawaban {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    this.idJawaban = data.idJawaban
    this.idPertanyaan = data.idPertanyaan
    this.idAdmin = data.idAdmin ?? ''
    this.teksJawaban = data.teksJawaban
    this.timestamp = data.timestamp ?? new Date().toISOString()
  }

  /**
   * Static method: saveJawaban(daftarJawaban, idPertanyaan, teksJawaban, timestamp, idAdmin)
   */
  static saveJawaban(daftarJawaban, idPertanyaan, teksJawaban, timestamp, idAdmin) {
    return saveJawaban(daftarJawaban, idPertanyaan, teksJawaban, timestamp, idAdmin)
  }
}
