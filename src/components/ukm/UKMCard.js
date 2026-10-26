/**
 * Komponen: kartu UKM untuk katalog (stub).
 *
 * [DOKUMEN] AI.md §5 daftar komponen: "src/components/ukm/UKMCard.js (dipakai
 *           stub katalog)".
 * [DOKUMEN] UI/UX Wireframe Brief §3.4: "Kartu UKM | Ikon, nama, badge kategori,
 *           badge status, deskripsi 2 baris, countdown, tombol Daftar dan
 *           Lihat Detail | M-01".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-01: chip kategori dan badge status
 *           ("Pendaftaran Dibuka" hijau, "Pendaftaran Ditutup" abu).
 * [DOKUMEN] AI.md §6: "UKM berstatus DITUTUP: tombol 'Daftar' nonaktif".
 * [DOKUMEN] AI.md §1: stub katalog "Tanpa ... countdown" — pengganti countdown
 *           memakai tanggal tutup (lihat [USULAN] di bawah).
 *
 * [USULAN] Brief M-01 menampilkan countdown "Tutup dalam 5 hari 3 jam", tetapi
 *          AI.md §1 melarang countdown pada sprint ini, sehingga kartu
 *          menampilkan tanggal tutup memakai utils/format.js.
 */

import { STATUS_PENDAFTARAN, LABEL_STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'
import { formatTanggal } from '../../utils/format.js'

function ikon(ukm) {
  return `<span class="kartu-ukm__ikon" aria-hidden="true"><svg class="ikon"><use href="#${ukm.ikon}"></use></svg></span>`
}

function badgeStatus(status) {
  const dibuka = status === STATUS_PENDAFTARAN.DIBUKA
  const ikonStatus = dibuka ? 'i-check-circle' : 'i-clock'
  return `
    <span class="badge ${dibuka ? 'badge--positif' : 'badge--netral'}">
      <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#${ikonStatus}"></use></svg>
      ${LABEL_STATUS_PENDAFTARAN[status] ?? status}
    </span>
  `
}

function barisTutup(ukm) {
  if (ukm.statusPendaftaran !== STATUS_PENDAFTARAN.DIBUKA) return ''
  if (!ukm.tanggalTutup) return ''
  return `
    <p class="kartu-ukm__tutup text-muted">
      <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-clock"></use></svg>
      Ditutup ${formatTanggal(ukm.tanggalTutup)}
    </p>
  `
}

/**
 * Bangun satu kartu UKM.
 * @param {object} ukm
 * @param {{namaKategori?: string}} [opsi]
 * @returns {HTMLElement}
 */
export function buatUKMCard(ukm, opsi = {}) {
  const dibuka = ukm.statusPendaftaran === STATUS_PENDAFTARAN.DIBUKA
  const el = document.createElement('article')
  el.className = 'kartu-ukm'
  el.dataset.idUkm = ukm.idUKM
  el.dataset.status = ukm.statusPendaftaran

  // [DOKUMEN] AI.md §6: tombol "Daftar" nonaktif untuk UKM DITUTUP.
  const tombolDaftar = dibuka
    ? `<a class="tombol tombol--utama" href="#/mahasiswa/daftar/${ukm.idUKM}/data">Daftar</a>`
    : `<span class="tombol tombol--utama" aria-disabled="true" data-daftar-nonaktif>Daftar</span>`

  el.innerHTML = `
    <div class="kartu-ukm__atas">
      ${ikon(ukm)}
      <div class="kartu-ukm__identitas">
        <h2 class="kartu-ukm__nama">${ukm.namaUKM}</h2>
        <div class="kartu-ukm__lencana">
          ${opsi.namaKategori ? `<span class="badge badge--chip">${opsi.namaKategori}</span>` : ''}
          ${badgeStatus(ukm.statusPendaftaran)}
        </div>
      </div>
    </div>

    <p class="kartu-ukm__deskripsi">${ukm.deskripsi ?? ''}</p>

    ${barisTutup(ukm)}

    <div class="kartu-ukm__aksi">
      ${tombolDaftar}
      <a class="kartu-ukm__detail" href="#/mahasiswa/ukm/${ukm.idUKM}">
        Lihat Detail
        <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
      </a>
    </div>
  `
  // [DOKUMEN] Brief §5 M-01 baris 191: "Klik kartu atau 'Lihat Detail': ke M-02."
  // Tautan di dalam kartu dibiarkan menangani navigasinya sendiri.
  el.addEventListener('click', (acara) => {
    if (acara.target.closest('a, [data-daftar-nonaktif]')) return
    location.hash = `#/mahasiswa/ukm/${ukm.idUKM}`
  })

  return el
}
