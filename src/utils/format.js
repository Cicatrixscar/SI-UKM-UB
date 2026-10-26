/**
 * Fungsi format teks.
 *
 * [DOKUMEN] AI.md §5 daftar file yang boleh diubah (utils/format.js).
 * Sumber kebutuhan:
 *  - AI.md §6 M-03: counter `187/500 karakter`.
 *  - AI.md §6 M-04: ukuran file dalam MB pada kartu dokumen.
 *  - UI/UX Wireframe Brief M-01: kartu status pendaftaran menampilkan
 *    "Tanggal buka" dan "Tanggal tutup".
 *  - UI/UX Wireframe Brief §9 G17: inisial avatar diturunkan dari nama.
 */

import { batasKarakterAlasan } from '../config.js'

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/**
 * Format tanggal ISO 8601 menjadi "14 Mei 2025".
 * [USULAN] PRD tidak menetapkan format tampilan tanggal; Brief M-01 hanya
 *          menulis label "Tanggal buka"/"Tanggal tutup".
 */
export function formatTanggal(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

/** Format jam dari ISO 8601 menjadi "15.30". [USULAN] tampilan jam. */
export function formatJam(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}.${mm}`
}

/**
 * Format byte menjadi "2.4 MB" / "850 KB".
 * [DOKUMEN] UI/UX Wireframe Brief M-04 dan M-06: nama file, ukuran, tanggal unggah.
 */
export function formatUkuranFile(byte) {
  if (typeof byte !== 'number' || Number.isNaN(byte) || byte < 0) return '-'
  if (byte < 1024) return `${byte} B`
  const kb = byte / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

/**
 * Format counter karakter alasan: "187/500 karakter".
 * [DOKUMEN] AI.md §6 M-03: "Tampilkan `187/500 karakter` (contoh format)."
 *           UI/UX Wireframe Brief M-03: counter "187/500 karakter".
 */
export function formatKarakterDipakai(teks, maks = batasKarakterAlasan) {
  const n = String(teks ?? '').length
  return `${n}/${maks} karakter`
}

/**
 * Ambil inisial dari nama (maksimal 2 huruf kapital).
 * [DOKUMEN] UI/UX Wireframe Brief §9 G17: inisial avatar diturunkan dari nama.
 */
export function inisialDariNama(nama) {
  const potong = String(nama ?? '').trim().split(/\s+/).filter(Boolean)
  if (potong.length === 0) return '?'
  const huruf = potong.slice(0, 2).map(p => p[0].toUpperCase())
  return huruf.join('')
}
