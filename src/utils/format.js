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

import { config, batasKarakterAlasan } from '../config.js'

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
 * Format byte menjadi "2,4 MB" / "850 KB".
 * [DOKUMEN] UI/UX Wireframe Brief M-04 dan M-06: nama file, ukuran, tanggal unggah.
 * [USULAN] Desain Hi-Fi memakai pemisah desimal koma ("2,4 MB").
 */
export function formatUkuranFile(byte) {
  if (typeof byte !== 'number' || Number.isNaN(byte) || byte < 0) return '-'
  if (byte < 1024) return `${byte} B`
  const kb = byte / 1024
  if (kb < 1024) return `${kb.toFixed(1).replace('.', ',')} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1).replace('.', ',')} MB`
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
  // [DOKUMEN] Brief §9 G17: "Rusdi" → "RU" (dua huruf dari satu kata).
  if (potong.length === 1) {
    return potong[0].slice(0, 2).toUpperCase()
  }
  return potong
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('')
}

/** Teks acuan waktu aplikasi (jam demo, lihat `config.tanggalDemo`). */
function acuanWaktu() {
  const acuan = new Date(config.tanggalDemo).getTime()
  return Number.isNaN(acuan) ? Date.now() : acuan
}

/**
 * Format "25 Oktober 2026, 14.30 WIB".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-06 butir 2: "Tanggal daftar: 25 Oktober
 *           2026, 14.30 WIB · No. UKM-2026-0142"; M-06 butir 4: "Diperiksa pada
 *           [tanggal, jam]".
 * [USULAN] PRD tidak menetapkan format tampilan tanggal jam.
 */
export function formatTanggalWaktu(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return `${formatTanggal(iso)}, ${formatJam(iso)} WIB`
}

/**
 * Sisa waktu menuju `iso` dari waktu sekarang (atau acuan yang ditentukan), mis. "10 hari 9 jam".
 * Dihitung dinamis dan faktual terhadap waktu perangkat (real-time).
 * @param {string} iso
 * @param {string|Date} [acuan] waktu acuan; default `new Date()` (faktual saat ini)
 * @returns {string} contoh "10 hari 9 jam", "3 jam", "20 menit", "sudah ditutup"
 */
export function formatSisaWaktu(iso, acuan = new Date()) {
  if (!iso) return '-'
  const target = new Date(iso).getTime()
  const dasar = new Date(acuan).getTime()
  if (Number.isNaN(target) || Number.isNaN(dasar)) return '-'

  let selisih = target - dasar
  if (selisih <= 0) return 'sudah ditutup'

  const hari = Math.floor(selisih / 86400000)
  selisih -= hari * 86400000
  const jam = Math.floor(selisih / 3600000)
  selisih -= jam * 3600000
  const menit = Math.floor(selisih / 60000)

  const bagian = []
  if (hari > 0) bagian.push(`${hari} hari`)
  if (jam > 0) bagian.push(`${jam} jam`)
  if (hari === 0 && jam === 0 && menit > 0) bagian.push(`${menit} menit`)
  if (bagian.length === 0) return 'kurang dari 1 menit'
  return bagian.join(' ')
}

/**
 * Jarak waktu relatif terhadap acuan jam demo: "15 menit lalu",
 * "Kemarin, 14.30 WIB", "20 Oktober 2026, 15.00 WIB".
 * [DOKUMEN] Desain Hi-Fi layar Notifikasi (kolom waktu per baris).
 * [USULAN] PRD tidak memuat format waktu notifikasi.
 */
export function formatWaktuRelatif(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const acuan = new Date(acuanWaktu())

  const mulaiHari = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime()
  const bedaHari = Math.round((mulaiHari(acuan) - mulaiHari(d)) / 86400000)

  if (bedaHari === 0) {
    const menit = Math.max(0, Math.round((acuan.getTime() - d.getTime()) / 60000))
    if (menit < 1) return 'Baru saja'
    if (menit < 60) return `${menit} menit lalu`
    return `${Math.floor(menit / 60)} jam lalu`
  }
  if (bedaHari === 1) return `Kemarin, ${formatJam(iso)} WIB`
  return formatTanggalWaktu(iso)
}
