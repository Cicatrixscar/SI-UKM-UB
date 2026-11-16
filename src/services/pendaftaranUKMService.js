/**
 * Service: pendaftaran UKM.
 *
 * [DOKUMEN] PRD v0.3 §7.2 (dua tabel: PendaftaranUKMController dan
 *           PendaftaranUKMService). Karena AI.md §5 hanya memuat satu file
 *           service, nama dari kedua tabel diekspor di sini dan tiap method
 *           diberi komentar asal tabelnya.
 *
 * PendaftaranUKMController [DOKUMEN: MP2 §3.4.3 hal. 74-75 / PRD §7.2]
 *   | getKatalogUKM()                            | —   | UKM[] (status DIBUKA) |
 *   | getDetailUKM(idUKM)                        | String | UKM + periode aktif |
 *   | validasiDokumen(dataMahasiswa, dokumen)    | Object, File | `{ valid, pesan }` |
 *   | submitPendaftaran(dataForm, file)          | Object, File | `{ berhasil, pesan }` |
 *
 * PendaftaranUKMService [DOKUMEN: MP2 §3.4.3 hal. 75 / PRD §7.2]
 *   | getUKMdibuka()                             | —   | UKM[] |
 *   | getDetailUKM(idUKM)                        | String | UKM |
 *   | validasiDokumen(dataMahasiswa, dokumen)    | Object, File | `{ valid, pesan }` |
 *   | simpanPendaftaran(dataForm, file)          | Object, File | `{ berhasil, idPendaftaran }` |
 *   | saveData(dataForm)                         | Object | idPendaftaran |
 *   | saveDokumen(idPendaftaran, file)           | String, File | boolean |
 *
 * Pengecualian signature [DOKUMEN: AI.md §3]:
 *   - `submitPendaftaran(dataForm, berkas[])` — berkas berisi `{ kode, file }`.
 *   - `simpanPendaftaran(dataForm, berkas[])` — mengikuti signature submit.
 *   - `validasiDokumen(file)` untuk satu file; `validasiSemuaBerkas(berkas[])`
 *     untuk kelengkapan.
 * [DOKUMEN] AI.md §4: setiap service mengembalikan Promise.
 */

import {
  mockGetKatalogUKM,
  mockGetUKMdibuka,
  mockGetDetailUKM,
  mockValidasiDokumen,
  mockValidasiSemuaBerkas,
  mockSimpanPendaftaran,
  mockSaveData,
  mockSaveDokumen,
  mockGetRiwayatPendaftaran,
  mockGetDetailPendaftaran,
} from '../mock/pendaftaranUKMMock.js'

/**
 * Controller — `getKatalogUKM()`.
 * [DOKUMEN] MP2 §3.4.3 hal. 74 dan §3.6 PC-01 hal. 83.
 * @returns {Promise<import('../models/UKM.js').UKM[]>}
 */
export async function getKatalogUKM() {
  return mockGetKatalogUKM()
}

/**
 * Service — `getUKMdibuka()`.
 * [DOKUMEN] MP2 §3.4.3 hal. 75.
 * @returns {Promise<import('../models/UKM.js').UKM[]>}
 */
export async function getUKMdibuka() {
  return mockGetUKMdibuka()
}

/**
 * Controller dan Service — `getDetailUKM(idUKM)`.
 * [DOKUMEN] MP2 §3.4.3 hal. 74-75 dan §3.6 PC-02 hal. 83.
 * [USULAN] mengembalikan UKM + `periodeAktif` (PRD §7.2).
 * @returns {Promise<object|null>}
 */
export async function getDetailUKM(idUKM) {
  return mockGetDetailUKM(idUKM)
}

/**
 * Controller dan Service — `validasiDokumen(file)`.
 * [DOKUMEN] MP2 §3.4.3 hal. 74-75 dan §3.6 PC-03 hal. 83-84.
 * [DOKUMEN] AI.md §3: signature diubah dari `validasiDokumen(dataMahasiswa, dokumen)`.
 * @returns {Promise<{valid: boolean, pesan: string}>}
 */
export async function validasiDokumen(file) {
  return mockValidasiDokumen(file)
}

/**
 * Service — `validasiSemuaBerkas(berkas[])`.
 * [DOKUMEN] AI.md §3: "validasiSemuaBerkas(berkas[]) untuk memeriksa kelengkapan."
 * @param {Array<{kode: string, file: File}>} berkas
 * @returns {Promise<{valid: boolean, pesan: string}>}
 */
export async function validasiSemuaBerkas(berkas) {
  return mockValidasiSemuaBerkas(berkas)
}

/**
 * Controller — `submitPendaftaran(dataForm, berkas[])`.
 * [DOKUMEN] MP2 §3.4.3 hal. 74 dan SD-UC003 (hal. 34-37).
 * [DOKUMEN] PRD §7.2: "submitPendaftaran ... `[ALIAS]` buatPendaftaran di gambar
 *           SD-UC003"; §5.2 keputusan [PERBAIKAN]: "Pakai `submitPendaftaran` (KD)".
 * [DOKUMEN] AI.md §3: "signature baru: submitPendaftaran(dataForm, berkas[])".
 * // USULAN: sebelumnya satu file
 * @param {object} dataForm
 * @param {Array<{kode: string, file: File}>} berkas
 * @returns {Promise<{berhasil: boolean, idPendaftaran: string|null, pesan: string}>}
 */
export async function submitPendaftaran(dataForm, berkas) {
  return mockSimpanPendaftaran(dataForm, berkas)
}

/**
 * Service — `simpanPendaftaran(dataForm, berkas[])`.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 dan PRD §7.2: "simpanPendaftaran memanggil saveData
 *           lalu saveDokumen, sesuai PC-04" (§7.2 catatan).
 * // USULAN: sebelumnya satu file
 * @param {object} dataForm
 * @param {Array<{kode: string, file: File}>} berkas
 * @returns {Promise<{berhasil: boolean, idPendaftaran: string|null, pesan: string}>}
 */
export async function simpanPendaftaran(dataForm, berkas) {
  return mockSimpanPendaftaran(dataForm, berkas)
}

/**
 * Service — `saveData(dataForm)`.
 * [DOKUMEN] MP2 §3.4.3 hal. 75, §3.6 PC-04 hal. 84, dan entitas
 *           Pendaftaran.saveData(dataForm): String (MP2 §3.4.1 hal. 67).
 * @returns {Promise<string>} idPendaftaran
 */
export async function saveData(dataForm) {
  return mockSaveData(dataForm)
}

/**
 * Service — `saveDokumen(idPendaftaran, file)`.
 * [DOKUMEN] MP2 §3.4.3 hal. 75, §3.3 SD-UC003 pesan 24 (hal. 37), dan entitas
 *           DokumenPendaftaran.saveDokumen (MP2 §3.4.1 hal. 68).
 * [USULAN] parameter `kodeDokumen` (lihat models/DokumenPendaftaran.js).
 * @returns {Promise<boolean>}
 */
export async function saveDokumen(idPendaftaran, file, kodeDokumen) {
  return mockSaveDokumen(idPendaftaran, file, kodeDokumen)
}

/**
 * Riwayat pendaftaran milik mahasiswa (menu "Riwayat Pendaftaran", M-08).
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-08 dan BUC UC1 post condition.
 * [DOKUMEN] AI.md §4 — halaman hanya memanggil `services/`.
 * [USULAN] PRD tidak memuat nama method riwayat (Brief G11: layar M-08 baru).
 * @param {string} idMahasiswa
 * @returns {Promise<Array<object>>}
 */
export async function getRiwayatPendaftaran(idMahasiswa) {
  return mockGetRiwayatPendaftaran(idMahasiswa)
}

/**
 * Detail satu riwayat pendaftaran (M-06).
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-06 — route `#/mahasiswa/riwayat/:idPendaftaran`.
 * [USULAN] PRD tidak memuat method ini (Brief G11).
 * @param {string} idPendaftaran
 * @returns {Promise<object|null>}
 */
export async function getDetailPendaftaran(idPendaftaran) {
  return mockGetDetailPendaftaran(idPendaftaran)
}

/**
 * Controller: PendaftaranUKMController
 * [DOKUMEN] KD hal. 1, MP2 §3.4.3 hal. 74-75, PRD v0.3 §7.2.
 */
export class PendaftaranUKMController {
  static async getKatalogUKM() {
    return getKatalogUKM()
  }

  static async getDetailUKM(idUKM) {
    return getDetailUKM(idUKM)
  }

  static async validasiDokumen(file, dokumen) {
    return validasiDokumen(dokumen ?? file)
  }

  static async submitPendaftaran(dataForm, berkas) {
    return submitPendaftaran(dataForm, berkas)
  }

  /**
   * Alias: buatPendaftaran(dataForm, berkas)
   * Sesuai label pesan di Sequence Diagram 1
   */
  static async buatPendaftaran(dataForm, berkas) {
    return submitPendaftaran(dataForm, berkas)
  }
}

/**
 * Alias fungsi buatPendaftaran sesuai label pesan di Sequence Diagram 1
 */
export const buatPendaftaran = submitPendaftaran

/**
 * Service: PendaftaranUKMService
 * [DOKUMEN] MP2 §3.4.3 hal. 75, PRD v0.3 §7.2.
 */
export class PendaftaranUKMService {
  static async getUKMdibuka() {
    return getUKMdibuka()
  }

  static async getDetailUKM(idUKM) {
    return getDetailUKM(idUKM)
  }

  static async validasiDokumen(file, dokumen) {
    return validasiDokumen(dokumen ?? file)
  }

  static async validasiSemuaBerkas(berkas) {
    return validasiSemuaBerkas(berkas)
  }

  static async simpanPendaftaran(dataForm, berkas) {
    return simpanPendaftaran(dataForm, berkas)
  }

  static async saveData(dataForm) {
    return saveData(dataForm)
  }

  static async saveDokumen(idPendaftaran, file, kodeDokumen) {
    return saveDokumen(idPendaftaran, file, kodeDokumen)
  }
}

