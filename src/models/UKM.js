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
])

/** Factory entitas UKM. Atribut sesuai MP2 §3.4.1 hal. 66-67 + KD (statusVerifikasi). */
export function createUKM(data) {
  return {
    idUKM: data.idUKM,
    namaUKM: data.namaUKM,
    idKategori: data.idKategori,
    visiMisi: data.visiMisi ?? '',
    deskripsi: data.deskripsi ?? '',
    statusPendaftaran: data.statusPendaftaran,
    statusVerifikasi: data.statusVerifikasi ?? 'TERVERIFIKASI',
    tanggalBuka: data.tanggalBuka ?? null,
    tanggalTutup: data.tanggalTutup ?? null,
    // [USULAN] ikon kartu katalog — UIX §3.4, bukan atribut modul.
    ikon: data.ikon ?? 'i-award',
    // [USULAN] alamat email pengurus — UIX §5 M-02, bukan atribut modul.
    emailUKM: data.emailUKM ?? '',
  }
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.findByStatus(status): List<UKM>
 *         Juga dipakai di MP2 §3.3 SD-UC003 pesan 4 (status = "DIBUKA")
 *         dan §3.6 PC-01 hal. 83.
 * [USULAN] parameter `daftarUKM` karena method pada modul bersifat class-level.
 */
export function findByStatus(daftarUKM, status) {
  return daftarUKM.filter(u => u.statusPendaftaran === status)
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.findById(idUKM): UKM
 *         Juga dipakai di MP2 §3.3 SD-UC003 pesan 9 dan §3.6 PC-02 hal. 83.
 * [USULAN] parameter `daftarUKM` karena method pada modul bersifat class-level.
 */
export function findById(daftarUKM, idUKM) {
  return daftarUKM.find(u => u.idUKM === idUKM) ?? null
}

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
  return daftarUKM.filter(u => u.idKategori === idKategori).length
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — UKM.queryDataUKM(): List<UKM>
 * [USULAN] parameter `daftarUKM`.
 */
export function queryDataUKM(daftarUKM) {
  return [...daftarUKM]
}
