/**
 * Halaman: Katalog UKM (M-01).
 *
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-01 — banner "Katalog UKM" +
 *           "Temukan komunitas untuk mengembangkan minat dan potensimu.",
 *           baris pencarian + filter kategori + filter status + "Reset Filter",
 *           grid kartu berfoto, dan paginasi ("Menampilkan X dari Y UKM",
 *           "Per halaman", nomor halaman).
 * [DOKUMEN] Brief §8 G13 — pencarian dan filter status ditambahkan (BUC UC1
 *           extension 2a).
 * [DOKUMEN] AI.md §4: "Setiap halaman punya state loading, kosong, error, dan
 *           sukses." + "Halaman hanya memanggil services/."
 * [DOKUMEN] AI.md §9: "Jangan membuat teks pesan sendiri" — pesan kosong/filter
 *           diambil dari `utils/errors.js` (PRD §14).
 *
 * [USULAN] AI.md §1 sempat menahan search, filter, dan countdown pada sprint
 *          awal; lingkup diperluas user sehingga seluruh layar Hi-Fi dibuat.
 */

import { pasang } from '../../layouts/AppShell.js'
import { getKatalogUKM } from '../../services/pendaftaranUKMService.js'
import { getDaftarKategori } from '../../services/kategoriService.js'
import { buatUKMCard } from '../../components/ukm/UKMCard.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'
import { LABEL_STATUS_PENDAFTARAN, STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'

/** Status tampilan halaman (di-reset setiap render). */
const tampilan = {
  cari: '',
  idKategori: '',
  status: '',
  perHalaman: 8,
  halaman: 1,
}

/** Data mentah hasil service (di-reset setiap render). */
let daftarSemua = []
let kategoriSemua = []

function ikon(id) {
  return `<svg class="ikon" aria-hidden="true"><use href="#${id}"></use></svg>`
}

function banner() {
  return `
    <header class="banner banner--ringkas">
      <div>
        <h1 class="banner__judul">Katalog UKM</h1>
        <p class="banner__sub">Temukan komunitas untuk mengembangkan minat dan potensimu.</p>
      </div>
      <div class="banner__kanan">Periode pendaftaran · Oktober 2026</div>
    </header>
  `
}

function barisFilter() {
  const opsiKategori = kategoriSemua
    .map(
      k =>
        `<option value="${k.idKategori}"${tampilan.idKategori === k.idKategori ? ' selected' : ''}>${k.namaKategori}</option>`
    )
    .join('')

  const opsiStatus = Object.values(STATUS_PENDAFTARAN)
    .map(
      s =>
        `<option value="${s}"${tampilan.status === s ? ' selected' : ''}>${LABEL_STATUS_PENDAFTARAN[s] ?? s}</option>`
    )
    .join('')

  return `
    <div class="baris-filter">
      <div class="pencarian">
        <span class="pencarian__ikon">${ikon('i-search')}</span>
        <input class="pencarian__input" type="search" placeholder="Cari UKM..."
               aria-label="Cari UKM" data-cari value="${tampilan.cari}" />
      </div>

      <div class="pilih-wadah">
        <select class="pilih" aria-label="Pilih kategori" data-kategori>
          <option value="">Pilih Kategori</option>
          ${opsiKategori}
        </select>
        <span class="pilih-wadah__ikon">${ikon('i-chevron-down')}</span>
      </div>

      <div class="pilih-wadah">
        <select class="pilih" aria-label="Status pendaftaran" data-status>
          <option value="">Status Pendaftaran</option>
          ${opsiStatus}
        </select>
        <span class="pilih-wadah__ikon">${ikon('i-chevron-down')}</span>
      </div>

      <button class="tombol tombol--reset" type="button" data-filter-reset>${TEKS_TOMBOL.RESET_FILTER}</button>
    </div>
  `
}

/** Hasil setelah pencarian + filter diterapkan. */
function tersaring() {
  const kunci = tampilan.cari.trim().toLowerCase()
  return daftarSemua.filter((u) => {
    if (tampilan.idKategori && u.idKategori !== tampilan.idKategori) return false
    if (tampilan.status && u.statusPendaftaran !== tampilan.status) return false
    if (kunci && !String(u.namaUKM ?? '').toLowerCase().includes(kunci)) return false
    return true
  })
}

function paginasi(jumlah) {
  const per = tampilan.perHalaman
  const totalHalaman = Number.isFinite(per) ? Math.max(1, Math.ceil(jumlah / per)) : 1
  if (tampilan.halaman > totalHalaman) tampilan.halaman = totalHalaman

  const tombolPer = [8, 16, Infinity]
    .map((n) => {
      const label = n === Infinity ? 'Semua' : String(n)
      const aktif = tampilan.perHalaman === n
      return `<button type="button" aria-pressed="${aktif}" data-per="${n === Infinity ? 'semua' : n}">${label}</button>`
    })
    .join('')

  const nomor = []
  for (let i = 1; i <= totalHalaman; i += 1) {
    nomor.push(
      `<button class="paginasi__nomor" type="button" data-halaman="${i}"${
        i === tampilan.halaman ? ' aria-current="page"' : ''
      }>${i}</button>`
    )
  }

  return `
    <nav class="paginasi" aria-label="Paginasi katalog">
      <div class="paginasi__kiri">
        <span>Menampilkan ${jumlah} dari ${daftarSemua.length} UKM</span>
        <span>Per halaman</span>
        <span class="paginasi__segmen">${tombolPer}</span>
      </div>
      <div class="paginasi__kanan">
        <button class="paginasi__panah" type="button" aria-label="Halaman sebelumnya"
                data-halaman="${tampilan.halaman - 1}" ${tampilan.halaman <= 1 ? 'disabled' : ''}>
          ${ikon('i-chevron-left')}
        </button>
        ${nomor.join('')}
        <button class="paginasi__panah" type="button" aria-label="Halaman berikutnya"
                data-halaman="${tampilan.halaman + 1}" ${tampilan.halaman >= totalHalaman ? 'disabled' : ''}>
          ${ikon('i-chevron-right')}
        </button>
      </div>
    </nav>
  `
}

/** Wujud sukses: grid kartu + paginasi. */
function isiSukses(wadah) {
  const hasil = tersaring()

  if (!hasil.length) {
    wadah.innerHTML = `
      <div class="state">
        <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-inbox"></use></svg>
        <p>${PESAN.TIDAK_ADA_HASIL_FILTER}</p>
        <button class="tombol tombol--utama" type="button" data-hasil-reset>${TEKS_TOMBOL.RESET_FILTER}</button>
      </div>
    `
    return
  }

  const per = tampilan.perHalaman
  const mulai = Number.isFinite(per) ? (tampilan.halaman - 1) * per : 0
  const potongan = Number.isFinite(per) ? hasil.slice(mulai, mulai + per) : hasil

  const grid = document.createElement('div')
  grid.className = 'katalog-grid'
  for (const ukm of potongan) {
    const kat = kategoriSemua.find((k) => k.idKategori === ukm.idKategori)
    grid.appendChild(buatUKMCard(ukm, { namaKategori: kat?.namaKategori }))
  }

  wadah.replaceChildren(grid)
  wadah.insertAdjacentHTML('beforeend', paginasi(hasil.length))
}

/** Pasang handler baris filter (pencarian, kategori, status, reset). */
function pasangFilter(wadah, segarkan) {
  const inpCari = wadah.querySelector('[data-cari]')
  inpCari?.addEventListener('input', (e) => {
    tampilan.cari = e.target.value
    tampilan.halaman = 1
    segarkan()
    // Fokus kembali ke kolom pencarian agar mengetik tetap nyaman.
    const baru = wadah.querySelector('[data-cari]')
    if (baru) {
      baru.focus()
      baru.setSelectionRange(baru.value.length, baru.value.length)
    }
  })

  wadah.querySelector('[data-kategori]')?.addEventListener('change', (e) => {
    tampilan.idKategori = e.target.value
    tampilan.halaman = 1
    segarkan()
  })

  wadah.querySelector('[data-status]')?.addEventListener('change', (e) => {
    tampilan.status = e.target.value
    tampilan.halaman = 1
    segarkan()
  })

  wadah.querySelector('[data-filter-reset]')?.addEventListener('click', () => {
    resetFilter()
    segarkan()
  })
}

/** Pasang handler hasil: reset (state kosong), per halaman, nomor halaman. */
function pasangHasil(wadah, segarkan) {
  wadah.querySelector('[data-hasil-reset]')?.addEventListener('click', () => {
    resetFilter()
    segarkan()
  })

  wadah.querySelectorAll('[data-per]').forEach((t) =>
    t.addEventListener('click', () => {
      tampilan.perHalaman = t.dataset.per === 'semua' ? Infinity : Number(t.dataset.per)
      tampilan.halaman = 1
      segarkan()
    })
  )

  wadah.querySelectorAll('[data-halaman]').forEach((t) =>
    t.addEventListener('click', () => {
      const tujuan = Number(t.dataset.halaman)
      if (!Number.isFinite(tujuan) || tujuan < 1) return
      tampilan.halaman = tujuan
      segarkan()
    })
  )
}

function resetFilter() {
  tampilan.cari = ''
  tampilan.idKategori = ''
  tampilan.status = ''
  tampilan.halaman = 1
}

/** Dipanggil router. */
export async function render(el, ctx = {}) {
  const konten = pasang(el, { jalur: '/mahasiswa/katalog' })
  konten.innerHTML = `
    ${banner()}
    <div data-daftar></div>
  `

  const wadah = konten.querySelector('[data-daftar]')
  wadah.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat katalog UKM…</p></div>`

  try {
    // AI.md §4: halaman hanya memanggil services/, tidak mengimpor mock.
    const [daftar, kategori] = await Promise.all([getKatalogUKM(), getDaftarKategori()])
    daftarSemua = daftar
    kategoriSemua = kategori

    if (!daftar.length) {
      wadah.innerHTML = `
        <div class="state">
          <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-inbox"></use></svg>
          <p>${PESAN.BELUM_ADA_AKTIVITAS}</p>
          <button class="tombol tombol--cadangan" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
        </div>
      `
      wadah.querySelector('[data-coba-lagi]')?.addEventListener('click', () => render(el, ctx))
      return
    }

    wadah.innerHTML = `${barisFilter()}<div data-grid></div>`
    const wadahGrid = wadah.querySelector('[data-grid]')

    // Segarkan hanya isi hasil; baris filter tetap di DOM agar fokus terjaga.
    const segarkan = () => {
      isiSukses(wadahGrid)
      pasangFilter(wadah, segarkan)
      pasangHasil(wadahGrid, segarkan)
    }
    segarkan()
  } catch (err) {
    console.error(err)
    wadah.innerHTML = `
      <div class="state">
        <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
        <p>${PESAN.GAGAL_MEMUAT_DATA}</p>
        <button class="tombol tombol--utama" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
      </div>
    `
    wadah.querySelector('[data-coba-lagi]')?.addEventListener('click', () => render(el, ctx))
  }
}
