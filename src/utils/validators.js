/**
 * Logika validasi dipusatkan di sini (PRD v0.3 §5.1, §5.2, keputusan [PERBAIKAN]).
 *
 * Sumber aturan: AI.md §6 (Form data diri M-03, Unggah dokumen M-04),
 *                PRD v0.3 §11.1-11.2, SRS-MHS-NF-02.
 *
 * Bentuk hasil: `{ valid: boolean, pesan: string }`
 *   - `pesan` diambil dari `src/utils/errors.js` (PRD §14) — jangan membuat teks baru.
 *   - AI.md §2: jika dokumen sumber tidak menjawab, jangan menebak. Untuk format
 *     email, PRD §14 tidak memuat teks pesan khusus sehingga `pesan` dibiarkan
 *     kosong (field hanya ditandai merah). Diberitahukan ke user di laporan T3.
 */

import { PESAN } from './errors.js'
import { batasUkuranFile, batasKarakterAlasan, formatFileDiizinkan } from '../config.js'

const EMAIL_SAH = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Cek field wajib terisi.
 * [DOKUMEN] AI.md §6 M-03: "Wajib: Nama Lengkap, NIM, Email, Nomor Telepon,
 *           Alasan. Pesan kosong: 'Field ini wajib diisi'".
 */
export function validasiWajib(nilai) {
  const terisi = String(nilai ?? '').trim().length > 0
  return terisi ? { valid: true, pesan: '' } : { valid: false, pesan: PESAN.FIELD_WAJIB }
}

/**
 * Cek format email.
 * [DOKUMEN] AI.md §6 M-03: "Email harus format valid."
 *           BUC UC1 hal. 9 (form pendaftaran): placeholder "email@student.ub.ac.id"
 *           dan "validation format email" — hanya format, tanpa batasan domain.
 * [USULAN] `pesan` kosong karena PRD §14 tidak memuat teks pesan format email.
 *          AI.md §9 melarang membuat teks pesan sendiri.
 */
export function validasiEmail(email) {
  const terisi = String(email ?? '').trim().length > 0
  if (!terisi) return { valid: false, pesan: PESAN.FIELD_WAJIB }
  return EMAIL_SAH.test(String(email).trim())
    ? { valid: true, pesan: '' }
    : { valid: false, pesan: '' }
}

/**
 * Cek NIM.
 * [DOKUMEN] AI.md §6 M-03 hanya mewajibkan NIM terisi.
 *           PRD §6.2 / MP2 §3.4.1 hal. 65-66: `nim : String`.
 *           BUC UC1: placeholder contoh "255150400111024" — contoh, bukan aturan.
 * [USULAN] Tidak ada aturan panjang/pola NIM di dokumen sumber, jadi hanya cek wajib.
 */
export function validasiNim(nim) {
  return validasiWajib(nim)
}

/**
 * Cek alasan bergabung.
 * [DOKUMEN] AI.md §6 M-03: "Alasan maksimal 500 karakter."
 *           AI.md §3 keputusan sementara G6: "500 karakter.
 *           Counter berubah merah jika melewati batas."
 */
export function validasiAlasan(alasan) {
  const teks = String(alasan ?? '')
  const wajib = validasiWajib(teks)
  if (!wajib.valid) return wajib
  if (teks.length > batasKarakterAlasan) {
    // [USULAN] PRD §14 tidak memuat teks "alasan terlalu panjang"; pakai batas sebagai angka.
    return { valid: false, pesan: '' }
  }
  return { valid: true, pesan: '' }
}

/**
 * Validasi seluruh form data diri (M-03).
 * [DOKUMEN] MP2 §3.4.3 hal. 74-75 — PendaftaranUKMController.validasiDokumen
 *           memvalidasi data mahasiswa; PRD §5.2 keputusan [PERBAIKAN]:
 *           `validasiData` dijadikan fungsi di `utils/validators.js`.
 */
export function validasiDataDiri(data) {
  const hasil = {
    nama: validasiWajib(data?.nama),
    nim: validasiNim(data?.nim),
    email: validasiEmail(data?.email),
    nomorTelepon: validasiWajib(data?.nomorTelepon),
    alasan: validasiAlasan(data?.alasan),
  }
  const valid = Object.values(hasil).every(h => h.valid)
  return { valid, field: hasil, pesan: valid ? '' : PESAN.FIELD_WAJIB }
}

/**
 * Cek format berkas.
 * [DOKUMEN] AI.md §6 M-04: "hanya PDF (application/pdf) dan JPEG (image/jpeg)".
 *           PRD §11.2 / SRS-MHS-NF-02. Modul PC-03 hal. 84: "cek format PDF/JPEG".
 */
export function validasiFormatBerkas(file) {
  if (!file) return { valid: false, pesan: PESAN.FORMAT_FILE }
  const tipe = String(file.type ?? '').toLowerCase()
  if (formatFileDiizinkan.includes(tipe)) return { valid: true, pesan: PESAN.FORMAT_VALID }
  return { valid: false, pesan: PESAN.FORMAT_FILE }
}

/**
 * Cek ukuran berkas.
 * [DOKUMEN] AI.md §6 M-04: "maksimal 5 × 1024 × 1024 byte".
 *           PRD §11.2, SRS-MHS-NF-02, PRD §13 (5.2.1) "5 × 1024 × 1024 byte".
 */
export function validasiUkuranBerkas(file) {
  if (!file) return { valid: false, pesan: PESAN.UKURAN_FILE }
  if (typeof file.size !== 'number') return { valid: false, pesan: PESAN.UKURAN_FILE }
  if (file.size > batasUkuranFile) return { valid: false, pesan: PESAN.UKURAN_FILE }
  return { valid: true, pesan: PESAN.FORMAT_VALID }
}

/**
 * Validasi satu berkas (format lalu ukuran).
 * [DOKUMEN] AI.md §6 M-04 dan Modul PC-03 hal. 84.
 */
export function validasiBerkas(file) {
  const format = validasiFormatBerkas(file)
  if (!format.valid) return format
  const ukuran = validasiUkuranBerkas(file)
  if (!ukuran.valid) return ukuran
  return { valid: true, pesan: PESAN.FORMAT_VALID }
}

/**
 * Cek apakah seluruh berkas valid (format lalu ukuran).
 * [DOKUMEN] AI.md §6 M-04.
 * Catatan: aturan JUMLAH dokumen wajib (KTM, Transkrip, CV) tidak diperiksa di
 * sini karena pengetahuan tentang "berapa wajib" berasal dari entitas
 * PersyaratanDokumen, bukan dari utilitas. Aturan itu diterapkan di
 * `mockValidasiSemuaBerkas` / service `validasiSemuaBerkas(berkas[])`
 * (AI.md §3) dan diuji di tests/pendaftaranUKMService.test.js.
 */
export function semuaBerkasValid(daftarBerkas) {
  if (!Array.isArray(daftarBerkas) || daftarBerkas.length === 0) return false
  return daftarBerkas.every(b => validasiBerkas(b?.file ?? b).valid)
}
