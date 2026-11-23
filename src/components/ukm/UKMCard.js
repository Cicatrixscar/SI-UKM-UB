/**
 * Komponen: kartu UKM untuk katalog.
 *
 * [DOKUMEN] AI.md §5 daftar komponen: "src/components/ukm/UKMCard.js".
 * [DOKUMEN] UI/UX Wireframe Brief §3.4: "Kartu UKM | Ikon, nama, badge kategori,
 *           badge status, deskripsi 2 baris, countdown, tombol Daftar dan
 *           Lihat Detail | M-01".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-01: chip kategori dan badge status
 *           ("Pendaftaran Dibuka" hijau, "Pendaftaran Ditutup" abu).
 * [DOKUMEN] AI.md §6: "UKM berstatus DITUTUP: tombol 'Daftar' nonaktif".
 * [DOKUMEN] Desain Hi-Fi `Katalog_UKM.svg`: foto kegiatan memenuhi bagian atas
 *           kartu dengan overlay hitung mundur "Tutup dalam 5 hari 3 jam",
 *           kategori sebagai teks kecil di samping badge status.
 *
 * [USULAN] Countdown sebelumnya ditahan oleh AI.md §1; lingkup diperluas user
 *          (seluruh layar Hi-Fi) sehingga hitung mundur kini ditampilkan.
 *          Acuan waktunya `config.tanggalDemo` (lihat utils/format.js).
 */

import { STATUS_PENDAFTARAN, LABEL_STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'
import { formatSisaWaktu } from '../../utils/format.js'

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

/** Overlay hitung mundur pada foto (Hi-Fi: "Tutup dalam 5 hari 3 jam"). */
function media(ukm, dibuka) {
  const alt = `Kegiatan ${ukm.namaUKM}`
  const foto = ukm.foto
    ? `<img class="kartu-ukm__foto" src="${ukm.foto}" alt="${alt}" loading="lazy" />`
    : `<div class="kartu-ukm__foto" role="img" aria-label="${alt}"></div>`

  const hitung = dibuka && ukm.tanggalTutup
    ? `<span class="kartu-ukm__hitung">
        <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-clock"></use></svg>
        Tutup dalam ${formatSisaWaktu(ukm.tanggalTutup)}
      </span>`
    : ''

  return `<div class="kartu-ukm__media">${foto}${hitung}</div>`
}

/**
 * Bangun satu kartu UKM.
 * @param {object} ukm
 * @param {{namaKategori?: string}} [opsi]
 * @returns {HTMLElement}
 */
export function buatUKMCard(ukm, opsi = {}) {
  const dibuka = ukm.statusPendaftaran === STATUS_PENDAFTARAN.DIBUKA
  const sudahTerdaftar = Boolean(opsi.sudahTerdaftar)
  const el = document.createElement('article')
  el.className = 'kartu-ukm'
  el.dataset.idUkm = ukm.idUKM
  el.dataset.status = ukm.statusPendaftaran

  // [DOKUMEN] AI.md §6: tombol "Daftar" nonaktif untuk UKM DITUTUP atau jika mahasiswa sudah terdaftar.
  let tombolDaftar
  if (sudahTerdaftar) {
    tombolDaftar = `<span class="tombol" aria-disabled="true" data-terdaftar title="Anda sudah mendaftar di UKM ini">Sudah Terdaftar</span>`
  } else if (dibuka) {
    tombolDaftar = `<a class="tombol tombol--utama" href="#/mahasiswa/daftar/${ukm.idUKM}/data">Daftar</a>`
  } else {
    tombolDaftar = `<span class="tombol tombol--utama" aria-disabled="true" data-daftar-nonaktif>Daftar</span>`
  }

  el.innerHTML = `
    ${media(ukm, dibuka)}

    <div class="kartu-ukm__isi">
      <div class="kartu-ukm__atas">
        ${ikon(ukm)}
        <div class="kartu-ukm__identitas">
          <h2 class="kartu-ukm__nama">${ukm.namaUKM}</h2>
          <div class="kartu-ukm__lencana">
            ${opsi.namaKategori ? `<span class="kartu-ukm__kategori">${opsi.namaKategori}</span>` : ''}
            ${badgeStatus(ukm.statusPendaftaran)}
          </div>
        </div>
      </div>

      <p class="kartu-ukm__deskripsi">${ukm.deskripsi ?? ''}</p>

      <div class="kartu-ukm__aksi">
        ${tombolDaftar}
        <a class="kartu-ukm__detail" href="#/mahasiswa/ukm/${ukm.idUKM}">
          Lihat Detail
          <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-arrow-right"></use></svg>
        </a>
      </div>
    </div>
  `
  // [DOKUMEN] Brief §5 M-01: "Klik kartu atau 'Lihat Detail': ke M-02."
  el.addEventListener('click', (acara) => {
    if (acara.target.closest('a, [data-daftar-nonaktif], [data-terdaftar]')) return
    location.hash = `#/mahasiswa/ukm/${ukm.idUKM}`
  })

  return el
}
