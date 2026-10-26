/**
 * Komponen: stepper horizontal tiga langkah pendaftaran.
 *
 * [DOKUMEN] AI.md §5 daftar komponen: "src/components/ui/Stepper.js ([USULAN])"
 *           — stepper tidak ada sebagai komponen tersendiri di PRD, dipisah
 *           karena dipakai bersama oleh M-03, M-04, dan M-05.
 * [DOKUMEN] UI/UX Wireframe Brief §3.4: "Stepper horizontal | Lingkaran bernomor,
 *           garis penghubung, label dan keterangan. Status: selesai (centang),
 *           aktif (lingkaran gelap), belum dimulai (lingkaran abu)".
 * [DOKUMEN] Brief §5 M-03 baris 220: "Stepper 3 langkah: 1 Isi Data (aktif),
 *           2 Unggah Dokumen, 3 Review dan Kirim."
 * [DOKUMEN] Brief §5 M-04 baris 238: "Stepper dengan Langkah 1 selesai dan
 *           Langkah 2 aktif."
 *
 * Stepper bersifat tampilan saja (tanpa tautan langkah) karena perpindahan
 * langkah diatur oleh tombol "Lanjut" per halaman (AI.md §6 M-03/M-04).
 */

/** Label tiap langkah — sumber teks: Brief §5 M-03 baris 220. */
export const LABEL_LANGKAH = Object.freeze([
  'Isi Data',
  'Unggah Dokumen',
  'Review dan Kirim',
])

/**
 * @param {number} langkahAktif 1–3
 * @param {number} [jumlahLangkah]
 * @returns {HTMLElement}
 */
export function buatStepper(langkahAktif, jumlahLangkah = 3) {
  const el = document.createElement('ol')
  el.className = 'stepper'

  for (let i = 1; i <= jumlahLangkah; i += 1) {
    const selesai = i < langkahAktif
    const aktif = i === langkahAktif
    const status = selesai ? 'selesai' : aktif ? 'aktif' : 'belum'

    const li = document.createElement('li')
    li.className = `stepper__langkah stepper__langkah--${status}`
    li.dataset.status = status
    if (aktif) li.setAttribute('aria-current', 'step')

    li.innerHTML = `
      <span class="stepper__penanda" aria-hidden="true">
        ${
          selesai
            ? '<svg class="ikon ikon--kecil"><use href="#i-check"></use></svg>'
            : i
        }
      </span>
      <span class="stepper__label">${LABEL_LANGKAH[i - 1]}</span>
    `

    if (i < jumlahLangkah) {
      const garis = document.createElement('span')
      garis.className = 'stepper__garis'
      garis.setAttribute('aria-hidden', 'true')
      li.appendChild(garis)
    }

    el.appendChild(li)
  }

  return el
}
