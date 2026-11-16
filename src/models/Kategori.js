/**
 * Entitas: Kategori.
 *
 * Sumber: Kelas Diagram Package (KD) hal. 1.
 * Sumber: PRD v0.3 §6.7.
 */

/**
 * @typedef {object} Kategori
 * @property {string} idKategori
 * @property {string} namaKategori
 * @property {string} deskripsi
 * @property {string} iconUrl
 */

/** Factory entitas Kategori. */
export function createKategori(data) {
  return new Kategori(data)
}

/**
 * Sumber: KD hal. 1, PRD v0.3 §6.7 — Kategori.findAll(): Kategori[]
 * [USULAN] parameter `daftarKategori`.
 */
export function findAll(daftarKategori) {
  return [...(daftarKategori ?? [])]
}

/**
 * Sumber: KD hal. 1, PRD v0.3 §6.7 — Kategori.findById(idKategori): Kategori
 * [USULAN] parameter `daftarKategori`.
 */
export function findById(daftarKategori, idKategori) {
  return (daftarKategori ?? []).find(k => k.idKategori === idKategori) ?? null
}

/**
 * Kelas: Kategori
 * [DOKUMEN] KD hal. 1, PRD v0.3 §6.7.
 */
export class Kategori {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    this.idKategori = data.idKategori
    this.namaKategori = data.namaKategori
    this.deskripsi = data.deskripsi ?? ''
    this.iconUrl = data.iconUrl ?? ''
  }

  /**
   * Static method: findAll(daftarKategori)
   */
  static findAll(daftarKategori) {
    return findAll(daftarKategori)
  }

  /**
   * Static method: findById(daftarKategori, idKategori)
   */
  static findById(daftarKategori, idKategori) {
    return findById(daftarKategori, idKategori)
  }
}
