/**
 * Entitas: UKM.
 *
 * Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 66-67
 *         "UKM | idUKM, namaUKM, idKategori, visiMisi, deskripsi,
 *          statusPendaftaran, tanggalBuka, tanggalTutup |
 *          Method: findByStatus(status:String): List<UKM>,
 *                  findById(idUKM:String): UKM,
 *                  updateStatus(idUKM:String, status:String): boolean,
 *                  countByKategori(idKategori:String): int,
 *                  queryDataUKM(): List<UKM>"
 * Sumber: Kelas Diagram Package (KD) hal. 1 — menambah `statusVerifikasi`.
 * Sumber: PRD v0.3 §6.4.
 * [USULAN] field `ikon` — ada di UI/UX Wireframe Brief §3.4 (kartu katalog)
 *         dan screenshot M-01, tidak ada di modul.
 * [USULAN] field `emailUKM` — ada di UI/UX Wireframe Brief §5 M-02
 *         (kartu "Ada pertanyaan?"), tidak ada di modul.
 * [USULAN] field `foto` — desain Hi-Fi `Katalog_UKM.svg` memakai foto kegiatan
 *         pada kartu katalog dan banner detail; tidak ada di modul.
 * [USULAN] field `langkahSelanjutnya` — keputusan G7 (panel "Langkah Selanjutnya"
 *         pada kartu DITERIMA di M-07): kontak penanggung jawab, grup WhatsApp,
 *         pertemuan perdana, dan lokasi; tidak ada di modul.
 * [USULAN] field `timeline` — keputusan G3 (`TimelinePendaftaran`): lima tahap
 *         pendaftaran bertanggal untuk M-02 dan M-06; tidak ada di modul.
 */

export const UKM_FIELDS = Object.freeze([
  'idUKM',
  'namaUKM',
  'idKategori',
  'visiMisi',
  'deskripsi',
  'statusPendaftaran',
  'statusVerifikasi',
  'tanggalBuka',
  'tanggalTutup',
  'ikon',
  'emailUKM',
  'foto',
  'langkahSelanjutnya',
  'timeline',
])

/** Factory entitas UKM. Atribut sesuai MP2 §3.4.1 hal. 66-67 + KD (statusVerifikasi). */
export function createUKM(data) {
  return new UKM(data)
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.findByStatus(status): List<UKM>
 *         Juga dipakai di MP2 §3.3 SD-UC003 pesan 4 (status = "DIBUKA")
 *         dan §3.6 PC-01 hal. 83.
 * [USULAN] parameter `daftarUKM` karena method pada modul bersifat class-level.
 */
export function findByStatus(daftarUKM, status) {
  return (daftarUKM ?? []).filter(u => u.statusPendaftaran === status)
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.findById(idUKM): UKM
 *         Juga dipakai di MP2 §3.3 SD-UC003 pesan 9 dan §3.6 PC-02 hal. 83.
 * [USULAN] parameter `daftarUKM` karena method pada modul bersifat class-level.
 */
export function findById(daftarUKM, idUKM) {
  return (daftarUKM ?? []).find(u => u.idUKM === idUKM) ?? null
}
export const findByID = findById

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.updateStatus(idUKM, status): boolean
 * [USULAN] parameter `daftarUKM`. Tidak dipakai pada sprint UC003/UC004,
 *          dibuat karena tercantum pada modul dan PRD §6.4.
 */
export function updateStatus(daftarUKM, idUKM, status) {
  const ukm = findById(daftarUKM, idUKM)
  if (!ukm) return false
  ukm.statusPendaftaran = status
  return true
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.countByKategori(idKategori): int
 * [USULAN] parameter `daftarUKM`.
 */
export function countByKategori(daftarUKM, idKategori) {
  return (daftarUKM ?? []).filter(u => u.idKategori === idKategori).length
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.queryDataUKM(): List<UKM>
 * [USULAN] parameter `daftarUKM`.
 */
export function queryDataUKM(daftarUKM) {
  return [...(daftarUKM ?? [])]
}

/**
 * Sumber: SD-UC008, PRD v0.3 §6.4 — UKM.updateInfoUKM(idUKM, deskripsi, statusPendaftaran): boolean
 * [USULAN] parameter `daftarUKM`.
 */
export function updateInfoUKM(daftarUKM, idUKM, deskripsi, statusPendaftaran) {
  const ukm = findById(daftarUKM, idUKM)
  if (!ukm) return false
  if (deskripsi !== undefined) ukm.deskripsi = deskripsi
  if (statusPendaftaran !== undefined) ukm.statusPendaftaran = statusPendaftaran
  return true
}

/**
 * Kelas: UKM
 * [DOKUMEN] KD hal. 1, MP2 §3.4.1 hal. 66-67, PRD v0.3 §6.4.
 */
export class UKM {
  constructor(data = {}) {
    this.idUKM = data.idUKM
    this.namaUKM = data.namaUKM
    this.idKategori = data.idKategori
    this.visiMisi = data.visiMisi ?? ''
    this.deskripsi = data.deskripsi ?? ''
    this.statusPendaftaran = data.statusPendaftaran
    this.statusVerifikasi = data.statusVerifikasi ?? 'TERVERIFIKASI'
    this.tanggalBuka = data.tanggalBuka ?? null
    this.tanggalTutup = data.tanggalTutup ?? null
    // [USULAN] ikon kartu katalog — UIX §3.4, bukan atribut modul.
    this.ikon = data.ikon ?? 'i-award'
    // [USULAN] alamat email pengurus — UIX §5 M-02, bukan atribut modul.
    this.emailUKM = data.emailUKM ?? ''
    // [USULAN] foto kegiatan UKM untuk kartu katalog & banner (desain Hi-Fi).
    this.foto = data.foto ?? ''
    // [USULAN] panel "Langkah Selanjutnya" setelah DITERIMA (keputusan G7).
    this.langkahSelanjutnya = data.langkahSelanjutnya ?? null
    // [USULAN] timeline pendaftaran 5 tahap (keputusan G3 / Brief M-02).
    this.timeline = data.timeline ?? []
  }

  /**
   * Instance update status.
   * @param {string} status
   * @returns {boolean}
   */
  updateStatus(status) {
    this.statusPendaftaran = status
    return true
  }

  /**
   * Instance update info UKM.
   * @param {string} deskripsi
   * @param {string} statusPendaftaran
   * @returns {boolean}
   */
  updateInfoUKM(deskripsi, statusPendaftaran) {
    if (deskripsi !== undefined) this.deskripsi = deskripsi
    if (statusPendaftaran !== undefined) this.statusPendaftaran = statusPendaftaran
    return true
  }

  /**
   * Static method: findByStatus(daftarUKM, status)
   */
  static findByStatus(daftarUKM, status) {
    return findByStatus(daftarUKM, status)
  }

  /**
   * Static method: findById(daftarUKM, idUKM)
   */
  static findById(daftarUKM, idUKM) {
    return findById(daftarUKM, idUKM)
  }

  /**
   * Static method alias: findByID(daftarUKM, idUKM)
   * Sesuai label di Sequence Diagram 1
   */
  static findByID(daftarUKM, idUKM) {
    return findById(daftarUKM, idUKM)
  }

  /**
   * Static method: updateStatus(daftarUKM, idUKM, status)
   */
  static updateStatus(daftarUKM, idUKM, status) {
    return updateStatus(daftarUKM, idUKM, status)
  }

  /**
   * Static method: countByKategori(daftarUKM, idKategori)
   */
  static countByKategori(daftarUKM, idKategori) {
    return countByKategori(daftarUKM, idKategori)
  }

  /**
   * Static method: queryDataUKM(daftarUKM)
   */
  static queryDataUKM(daftarUKM) {
    return queryDataUKM(daftarUKM)
  }

  /**
   * Static method: updateInfoUKM(daftarUKM, idUKM, deskripsi, statusPendaftaran)
   */
  static updateInfoUKM(daftarUKM, idUKM, deskripsi, statusPendaftaran) {
    return updateInfoUKM(daftarUKM, idUKM, deskripsi, statusPendaftaran)
  }
}

