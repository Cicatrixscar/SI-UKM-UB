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
import { STATUS_BERKAS, STATUS_SELEKSI } from '../enums/statusBerkas.js'
import { semuaBerkasValid } from './validators.js'
import { config } from '../config.js'

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

/* ===========================================================================
   Stepper riwayat 5 tahap (M-06)
   =========================================================================== */

/**
 * Nama tahap stepper riwayat.
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-06 butir 3: "Terdaftar, Verifikasi
 *           Berkas, Siap Seleksi, Seleksi, Pengumuman".
 */
export const TAHAP_RIWAYAT = Object.freeze([
  'Terdaftar',
  'Verifikasi Berkas',
  'Siap Seleksi',
  'Seleksi',
  'Pengumuman',
])

/** Keterangan status tahap pada desain Hi-Fi. */
export const KETERANGAN_TAHAP = Object.freeze({
  selesai: 'Selesai',
  aktif: 'Sedang berlangsung',
  belum: 'Belum dimulai',
})

/**
 * Pemetaan status pendaftaran ke lima tahap stepper riwayat.
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-06 tabel "Pemetaan stepper ke data":
 *   | 1 Terdaftar      | selesai: pendaftaran tersimpan | aktif: tidak pernah |
 *   | 2 Verifikasi     | selesai: statusBerkas LENGKAP/SIAP_SELEKSI | aktif:
 *                      | MENUNGGU_VERIFIKASI_BERKAS/TIDAK_LENGKAP |
 *   | 3 Siap Seleksi   | selesai: statusBerkas SIAP_SELEKSI |
 *   | 4 Seleksi        | selesai: statusSeleksi bukan PENDING | aktif:
 *                      | statusSeleksi PENDING setelah berkas lengkap |
 *   | 5 Pengumuman     | selesai: terkunci = true | aktif: terkunci = false |
 * [DOKUMEN] Brief §5 M-06 butir 92: pemetaan ditulis sebagai fungsi di
 *           `utils/permissions.js` — "Jangan menghitung ulang di setiap
 *           komponen."
 * [USULAN] Pemetaan tidak ada di PRD (keputusan G10).
 *
 * @param {object} pendaftaran
 * @returns {Array<{nama: string, status: 'selesai'|'aktif'|'belum',
 *                  keterangan: string}>}
 */
export function tahapRiwayat(pendaftaran) {
  const berkas = pendaftaran?.statusBerkas
  const seleksi = pendaftaran?.statusSeleksi
  const terkunci = Boolean(pendaftaran?.terkunci)

  const berkasSelesai = berkas === STATUS_BERKAS.LENGKAP || berkas === STATUS_BERKAS.SIAP_SELEKSI
  const siapSeleksi = berkas === STATUS_BERKAS.SIAP_SELEKSI
  const seleksiSelesai = seleksi !== STATUS_SELEKSI.PENDING

  /** @type {Array<'selesai'|'aktif'|'belum'>} */
  const status = [
    'selesai', // 1 Terdaftar — selalu selesai setelah tersimpan
    berkasSelesai ? 'selesai' : 'aktif', // 2 Verifikasi Berkas
    siapSeleksi ? 'selesai' : 'belum', // 3 Siap Seleksi
    seleksiSelesai ? 'selesai' : siapSeleksi ? 'aktif' : 'belum', // 4 Seleksi
    terkunci ? 'selesai' : seleksiSelesai ? 'aktif' : 'belum', // 5 Pengumuman
  ]

  return TAHAP_RIWAYAT.map((nama, i) => ({
    nama,
    status: status[i],
    keterangan: KETERANGAN_TAHAP[status[i]],
  }))
}

/**
 * Nomor tahap yang sedang berlangsung (untuk `aria-current`).
 * @param {object} pendaftaran
 * @returns {number} 1–5, atau 0 bila tidak ada tahap berjalan (semua selesai)
 */
export function nomorTahapAktif(pendaftaran) {
  const idx = tahapRiwayat(pendaftaran).findIndex(t => t.status === 'aktif')
  return idx === -1 ? 0 : idx + 1
}

/**
 * Status satu tahap timeline pendaftaran UKM (M-02 dan M-06).
 * [DOKUMEN] Desain Hi-Fi: tahap berjalan diberi lingkaran navy, tahap lewat
 *           diberi centang, tahap mendatang abu.
 * [USULAN] `TimelinePendaftaran` diusulkan keputusan G3; PRD tidak memuat
 *          aturan status tampilannya.
 * @param {{mulai?: string, selesai?: string}} tahap
 * @param {Date} [sekarang] default jam demo (`config.tanggalDemo`)
 * @returns {'selesai'|'aktif'|'belum'}
 */
export function statusTahapTimeline(tahap, sekarang = new Date(config.tanggalDemo)) {
  const mulai = tahap?.mulai ? new Date(tahap.mulai).getTime() : NaN
  const selesai = tahap?.selesai ? new Date(tahap.selesai).getTime() : NaN
  if (Number.isNaN(mulai)) return 'belum'
  const t = sekarang.getTime()
  if (!Number.isNaN(selesai) && t >= selesai) return 'selesai'
  return t >= mulai ? 'aktif' : 'belum'
}
