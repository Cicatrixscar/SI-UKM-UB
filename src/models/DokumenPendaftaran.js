/**
 * Entitas: DokumenPendaftaran (komposisi milik Pendaftaran).
 *
 * Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 68
 *         "DokumenPendaftaran | idDokumen, idPendaftaran, namaFile,
 *          tipeDokumen, fileUrl, ukuranFile : int |
 *          Method: saveDokumen(idPendaftaran: String, file: File): boolean,
 *                  getDokumenByID(idPendaftaran: String): List<DokumenPendaftaran>,
 *                  cekFormatDanUkuran(file: File): boolean"
 * Sumber: Kelas Diagram Package (KD) hal. 1 (PRD §6.6 — ejaan `getDokumenByID`).
 * Sumber: PRD v0.3 §6.6.
 * [USULAN] field `tanggalUnggah` — dibutuhkan layar M-06 (UIX §5) untuk
 *          menampilkan tanggal unggah; tidak ada di modul.
 */

import { validasiFormatBerkas, validasiUkuranBerkas } from '../utils/validators.js'

let penghitungId = 0

/**
 * @typedef {object} DokumenPendaftaran
 * @property {string} idDokumen
 * @property {string} idPendaftaran
 * @property {string} namaFile
 * @property {string} tipeDokumen
 * @property {string} fileUrl
 * @property {number} ukuranFile   byte
 * @property {string} tanggalUnggah ISO 8601 [USULAN]
 */

/** Factory entitas DokumenPendaftaran. Atribut sesuai MP2 §3.4.1 hal. 68. */
export function createDokumenPendaftaran(data) {
  return {
    idDokumen: data.idDokumen,
    idPendaftaran: data.idPendaftaran,
    namaFile: data.namaFile,
    tipeDokumen: data.tipeDokumen,
    fileUrl: data.fileUrl ?? '',
    ukuranFile: data.ukuranFile,
    // [USULAN] PRD tidak memuat field ini; dibutuhkan UIX §5 M-06.
    tanggalUnggah: data.tanggalUnggah ?? new Date().toISOString(),
  }
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 68 —
 *         DokumenPendaftaran.cekFormatDanUkuran(file): boolean
 *         Sumber: MP2 §3.3 SD-UC003 pesan 17 (hal. 36) dan §3.6 PC-03 hal. 84.
 *         Logika: "cek format PDF/JPEG dan ukuran maksimal 5 MB" (PC-03 hal. 84).
 */
export function cekFormatDanUkuran(file) {
  return validasiFormatBerkas(file).valid && validasiUkuranBerkas(file).valid
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 68 —
 *         DokumenPendaftaran.saveDokumen(idPendaftaran, file): boolean
 *         Sumber: MP2 §3.3 SD-UC003 pesan 24 (hal. 37), §3.6 PC-04 hal. 84.
 * [USULAN] parameter `daftarDokumen` karena method pada modul bersifat class-level.
 * [USULAN] `fileUrl` diisi dari URL objek lokal (mock, tanpa backend).
 */
export function saveDokumen(daftarDokumen, idPendaftaran, file) {
  if (!idPendaftaran || !file) return false
  if (!cekFormatDanUkuran(file)) return false
  penghitungId += 1
  daftarDokumen.push(
    createDokumenPendaftaran({
      idDokumen: `DKM-${Date.now()}-${String(penghitungId).padStart(3, '0')}`,
      idPendaftaran,
      namaFile: file.name,
      tipeDokumen: file.type,
      fileUrl: typeof URL !== 'undefined' && file instanceof File ? URL.createObjectURL(file) : '',
      ukuranFile: file.size,
      tanggalUnggah: new Date().toISOString(),
    })
  )
  return true
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 68 —
 *         DokumenPendaftaran.getDokumenByID(idPendaftaran): List<DokumenPendaftaran>
 *         Juga dipakai MP2 §3.6 PC-32 hal. 88.
 * [USULAN] parameter `daftarDokumen` karena method pada modul bersifat class-level.
 */
export function getDokumenByID(daftarDokumen, idPendaftaran) {
  return daftarDokumen.filter(d => d.idPendaftaran === idPendaftaran)
}
