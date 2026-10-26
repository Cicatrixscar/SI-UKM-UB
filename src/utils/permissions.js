/**
 * Hak akses yang dipakai form pendaftaran (sprint UC003/UC004).
 *
 * [DOKUMEN] AI.md §5: "src/utils/permissions.js (hanya fungsi yang dipakai form)".
 * Sumber aturan:
 *  - AI.md §6 Katalog dan detail (stub): "UKM berstatus DITUTUP: tombol 'Daftar'
 *    nonaktif, dan form tidak bisa dibuka (akses langsung ke URL form juga harus
 *    menampilkan pesan dan redirect)."
 *  - AI.md §3 keputusan sementara G5: "Checkbox pernyataan: Ya. Tombol Kirim
 *    nonaktif sampai dicentang."
 *  - PRD v0.3 §11.1: "Submit hanya jika UKM DIBUKA dan hari ini berada dalam
 *    rentang periode aktif."
 */

import { STATUS_PENDAFTARAN, adalahDibuka } from '../enums/statusPendaftaran.js'
import { semuaBerkasValid } from './validators.js'

/**
 * Apakah UKM boleh dibuka formnya?
 * [DOKUMEN] AI.md §6: "UKM berstatus DITUTUP: tombol 'Daftar' nonaktif, dan form
 *           tidak bisa dibuka (akses langsung ke URL form juga harus menampilkan
 *           pesan dan redirect)."
 * @param {object|null} ukm
 * @returns {{boleh: boolean, tidakDitemukan: boolean}}
 */
export function bolehAksesForm(ukm) {
  if (!ukm) return { boleh: false, tidakDitemukan: true }
  return { boleh: adalahDibuka(ukm.statusPendaftaran), tidakDitemukan: false }
}

/**
 * Apakah hari ini masih dalam rentang periode aktif (tanggal buka s.d. tanggal tutup)?
 * [DOKUMEN] PRD v0.3 §11.1: "Submit hanya jika UKM DIBUKA dan hari ini berada
 *           dalam rentang periode aktif. [USULAN] di mock."
 * [USULAN] Dihitung di sini agar halaman tidak berisi logika bisnis.
 */
export function dalamPeriodeAktif(ukm, sekarang = new Date()) {
  if (!ukm?.tanggalBuka || !ukm?.tanggalTutup) return true
  const t = sekarang.getTime()
  const buka = new Date(ukm.tanggalBuka).getTime()
  const tutup = new Date(ukm.tanggalTutup).getTime()
  if (Number.isNaN(buka) || Number.isNaN(tutup)) return true
  return t >= buka && t <= tutup
}

/**
 * Apakah langkah 1 (Isi Data) boleh dilanjutkan?
 * [DOKUMEN] AI.md §6 M-03: "Tombol 'Lanjut' aktif hanya jika semua field wajib valid."
 */
export function bolehLanjutDataDiri(validDataDiri) {
  return Boolean(validDataDiri)
}

/**
 * Apakah langkah 2 (Unggah Dokumen) boleh dilanjutkan?
 * [DOKUMEN] AI.md §6 M-04: "Ketiga dokumen wajib (KTM, Transkrip, CV) harus valid
 *           sebelum tombol 'Lanjut' aktif." + "Teks 'Lengkapi unggahan untuk
 *           melanjutkan.' tampil selama belum lengkap."
 * @param {Array<{kode: string, file: File}>} daftarBerkas
 * @param {number} jumlahDokumenWajib jumlah persyaratan wajib dari UKM terkait
 *        (diambil dari `detail.periodeAktif.persyaratanDokumen.length`).
 */
export function bolehLanjutDokumen(daftarBerkas, jumlahDokumenWajib) {
  const daftarFile = (daftarBerkas ?? []).map(b => b?.file ?? b)
  if (daftarFile.length < jumlahDokumenWajib) return false
  return semuaBerkasValid(daftarFile)
}

/**
 * Apakah tombol "Kirim Pendaftaran" aktif?
 * [DOKUMEN] AI.md §6 M-05: "Tombol 'Kirim Pendaftaran' nonaktif sampai checkbox
 *           'Saya menyatakan data yang diisi benar' dicentang." (keputusan G5)
 */
export function bolehKirimPendaftaran(checkboxPernyataan) {
  return checkboxPernyataan === true
}

/**
 * Apakah UKM bisa disubmit (DIBUKA + dalam periode)?
 * [DOKUMEN] PRD v0.3 §11.1.
 */
export function bolehSubmitPendaftaran(ukm, sekarang = new Date()) {
  if (!ukm) return false
  if (ukm.statusPendaftaran !== STATUS_PENDAFTARAN.DIBUKA) return false
  return dalamPeriodeAktif(ukm, sekarang)
}
