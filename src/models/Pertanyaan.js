/**
 * Entitas: Pertanyaan.
 *
 * Sumber: Kelas Diagram Package (KD) hal. 1.
 * Sumber: PRD v0.3 §6.8.
 */

/**
 * @typedef {object} Pertanyaan
 * @property {string} idPertanyaan
 * @property {string} idUKM
 * @property {string} idMahasiswa
 * @property {string} teksPertanyaan
 * @property {string} status   BELUM_TERJAWAB | TERJAWAB
 * @property {string} timestamp
 */

/** Factory entitas Pertanyaan. */
export function createPertanyaan(data) {
  return new Pertanyaan(data)
}

/**
 * Sumber: KD hal. 1, PRD v0.3 §6.8 — Pertanyaan.fetchPendingQuestions()
 * [USULAN] parameter `daftarPertanyaan`.
 */
export function fetchPendingQuestions(daftarPertanyaan) {
  return (daftarPertanyaan ?? []).filter(p => p.status === 'BELUM_TERJAWAB')
}

/**
 * Sumber: KD hal. 1, SD-UC017, PRD v0.3 §6.8 — Pertanyaan.updateStatusToTerjawab(idPertanyaan)
 * [USULAN] parameter `daftarPertanyaan`.
 */
export function updateStatusToTerjawab(daftarPertanyaan, idPertanyaan) {
  const item = (daftarPertanyaan ?? []).find(p => p.idPertanyaan === idPertanyaan)
  if (!item) return false
  item.status = 'TERJAWAB'
  return true
}

/**
 * Kelas: Pertanyaan
 * [DOKUMEN] KD hal. 1, PRD v0.3 §6.8.
 */
export class Pertanyaan {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    this.idPertanyaan = data.idPertanyaan
    this.idUKM = data.idUKM
    this.idMahasiswa = data.idMahasiswa
    this.teksPertanyaan = data.teksPertanyaan
    this.status = data.status ?? 'BELUM_TERJAWAB'
    this.timestamp = data.timestamp ?? new Date().toISOString()
  }

  /**
   * Static method: fetchPendingQuestions(daftarPertanyaan)
   */
  static fetchPendingQuestions(daftarPertanyaan) {
    return fetchPendingQuestions(daftarPertanyaan)
  }

  /**
   * Static method: updateStatusToTerjawab(daftarPertanyaan, idPertanyaan)
   */
  static updateStatusToTerjawab(daftarPertanyaan, idPertanyaan) {
    return updateStatusToTerjawab(daftarPertanyaan, idPertanyaan)
  }
}
