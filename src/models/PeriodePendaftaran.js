/**
 * Entitas: PeriodePendaftaran [USULAN].
 *
 * Sumber: Gambar SD-UC008 (MP2 hal. 38).
 * Sumber: PRD v0.3 §6.9.
 */

/**
 * @typedef {object} PeriodePendaftaran
 * @property {string} idPeriode
 * @property {string} idUKM
 * @property {string|Date} tanggalBuka
 * @property {string|Date} tanggalTutup
 * @property {Array|string} persyaratanDokumen
 * @property {string} deskripsi
 * @property {string} status   DIBUKA | DITUTUP
 */

/** Factory entitas PeriodePendaftaran. */
export function createPeriodePendaftaran(data) {
  return new PeriodePendaftaran(data)
}

/**
 * Sumber: SD-UC008, PRD v0.3 §6.9 — PeriodePendaftaran.getPeriodeByUKM(idUKM)
 * [USULAN] parameter `daftarPeriode`.
 */
export function getPeriodeByUKM(daftarPeriode, idUKM) {
  return (daftarPeriode ?? []).filter(p => p.idUKM === idUKM)
}

/**
 * Sumber: SD-UC008, PRD v0.3 §6.9 — PeriodePendaftaran.simpanPeriode(...)
 * [USULAN] parameter `daftarPeriode`.
 */
export function simpanPeriode(daftarPeriode, idUKM, tanggalMulai, tanggalTutup, persyaratanDokumen, deskripsi) {
  const idPeriode = `PRD-${Date.now()}`
  const periode = new PeriodePendaftaran({
    idPeriode,
    idUKM,
    tanggalBuka: tanggalMulai,
    tanggalTutup,
    persyaratanDokumen,
    deskripsi,
    status: 'DIBUKA',
  })
  if (Array.isArray(daftarPeriode)) {
    daftarPeriode.push(periode)
  }
  return idPeriode
}

/**
 * Kelas: PeriodePendaftaran
 * [DOKUMEN] SD-UC008, PRD v0.3 §6.9.
 */
export class PeriodePendaftaran {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    this.idPeriode = data.idPeriode
    this.idUKM = data.idUKM
    this.tanggalBuka = data.tanggalBuka ?? null
    this.tanggalTutup = data.tanggalTutup ?? null
    this.persyaratanDokumen = data.persyaratanDokumen ?? []
    this.deskripsi = data.deskripsi ?? ''
    this.status = data.status ?? 'DIBUKA'
  }

  /**
   * Static method: getPeriodeByUKM(daftarPeriode, idUKM)
   */
  static getPeriodeByUKM(daftarPeriode, idUKM) {
    return getPeriodeByUKM(daftarPeriode, idUKM)
  }

  /**
   * Static method: simpanPeriode(...)
   */
  static simpanPeriode(daftarPeriode, idUKM, tanggalMulai, tanggalTutup, persyaratanDokumen, deskripsi) {
    return simpanPeriode(daftarPeriode, idUKM, tanggalMulai, tanggalTutup, persyaratanDokumen, deskripsi)
  }
}
