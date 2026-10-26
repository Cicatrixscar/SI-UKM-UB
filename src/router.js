/**
 * Hash router sederhana.
 *
 * [DOKUMEN] AI.md §4: "Routing: hash router sederhana, `#/mahasiswa/...`."
 * [DOKUMEN] AI.md §5 daftar file yang boleh diubah.
 * [DOKUMEN] PRD v0.3 §5.1 (struktur folder) — src/router.js.
 *
 * [USULAN] API router (tambahRute, navigasi, mulaiRouter, paramRute) tidak ada di
 *          PRD; dipilih karena PRD hanya menyebut "hash router sederhana".
 */

import { getSesi } from './state/session.js'
import { PESAN, TEKS_TOMBOL } from './utils/errors.js'

/** @typedef {{jalur: string, halaman: () => Promise<{render: Function}>, judul?: string, perluLogin?: boolean, peran?: string}} Rute */

/** @type {Rute[]} */
export const daftarRute = []

/**
 * Daftarkan satu rute.
 * `jalur` memakai `:namaParam` untuk parameter, mis. `/mahasiswa/daftar/:idUKM/data`.
 */
export function tambahRute(rute) {
  daftarRute.push(rute)
  return rute
}

/** Ubah hash ke tujuan. */
export function navigasi(path) {
  const tujuan = path.startsWith('#') ? path : `#${path}`
  if (location.hash === tujuan) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    location.hash = tujuan
  }
}

/** Baca hash saat ini menjadi path tanpa tanda `#`. */
export function bacaHash() {
  const mentah = location.hash.replace(/^#/, '')
  return mentah === '' ? '/' : mentah
}

/**
 * Cocokkan path terhadap pola jalur rute.
 * @returns {object|null} parameter rute, atau null jika tidak cocok
 */
export function cocokkanJalur(jalur, path) {
  const pola = `^${jalur.replace(/:[^/]+/g, '([^/]+)')}$`
  const hasil = new RegExp(pola).exec(path)
  if (!hasil) return null
  const namaParam = [...jalur.matchAll(/:([^/]+)/g)].map(m => m[1])
  return Object.fromEntries(namaParam.map((n, i) => [n, decodeURIComponent(hasil[i + 1])]))
}

function cocokkanRute(path) {
  for (const rute of daftarRute) {
    const param = cocokkanJalur(rute.jalur, path)
    if (param) return { rute, param }
  }
  return null
}

/** Halaman cadangan ketika rute tidak dikenal. */
function halamanTidakDikenal(path) {
  return {
    render(el) {
      el.innerHTML = `
        <section class="halaman kosong">
          <h1 class="halaman__judul">Halaman tidak ditemukan</h1>
          <p class="halaman__subjudul">Rute <code>${path}</code> belum tersedia.</p>
          <p><a class="tombol tombol--utama" href="#/">${TEKS_TOMBOL.COBA_LAGI}</a></p>
        </section>
      `
    },
  }
}

/** Halaman cadangan ketika sesi habis / belum login. */
function halamanSesiHabis() {
  return {
    render(el) {
      el.innerHTML = `
        <section class="halaman kosong">
          <h1 class="halaman__judul">${PESAN.SESI_HABIS}</h1>
          <p><a class="tombol tombol--utama" href="#/">Masuk</a></p>
        </section>
      `
    },
  }
}

/**
 * Rutekan hash saat ini ke halaman yang sesuai lalu render ke `el`.
 * @param {HTMLElement} el
 */
export async function renderRute(el) {
  const path = bacaHash()
  const hasil = cocokkanRute(path)

  if (!hasil) {
    halamanTidakDikenal(path).render(el, {})
    return { path, param: {} }
  }

  const { rute, param } = hasil
  if (rute.perluLogin && !getSesi()) {
    halamanSesiHabis().render(el, {})
    return { path, param }
  }

  const modul = await rute.halaman()
  modul.render(el, { param, path })
  return { path, param }
}

/**
 * Mulai router pada elemen root.
 * @param {HTMLElement} el
 */
export function mulaiRouter(el) {
  const jalankan = () => {
    renderRute(el).catch(err => {
      console.error(err)
      el.innerHTML = `
        <section class="halaman kosong">
          <h1 class="halaman__judul">${PESAN.GAGAL_MEMUAT_DATA}</h1>
          <p><button class="tombol tombol--utama" type="button" onclick="location.reload()">${TEKS_TOMBOL.COBA_LAGI}</button></p>
        </section>
      `
    })
  }
  window.addEventListener('hashchange', jalankan)
  jalankan()
  return { berhenti: () => window.removeEventListener('hashchange', jalankan) }
}
