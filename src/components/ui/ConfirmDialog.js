/**
 * Komponen: Dialog Konfirmasi.
 *
 * [DOKUMEN] AI.md §5: src/components/ui/ConfirmDialog.js.
 * [DOKUMEN] AI.md §6 M-03: "Tautan 'Batal' menampilkan dialog:
 *           'Apakah Anda yakin ingin membatalkan pendaftaran?'. Jika dibatalkan, data tidak disimpan."
 * [DOKUMEN] PRD v0.3 §14: PESAN.BATAL_PENDAFTARAN.
 */

import { PESAN } from '../../utils/errors.js'

/**
 * Tampilkan dialog konfirmasi pembatalan.
 * @param {object} opsi
 * @param {string} [opsi.pesan]
 * @param {string} [opsi.teksBatal]
 * @param {string} [opsi.teksKonfirmasi]
 * @param {Function} opsi.onKonfirmasi
 * @param {Function} [opsi.onBatal]
 */
export function bukaDialogKonfirmasi(opsi = {}) {
  const {
    pesan = PESAN.BATAL_PENDAFTARAN,
    teksBatal = 'Kembali',
    teksKonfirmasi = 'Ya, Batalkan',
    onKonfirmasi,
    onBatal,
  } = opsi

  const latar = document.createElement('div')
  latar.className = 'modal-latar'
  latar.setAttribute('role', 'dialog')
  latar.setAttribute('aria-modal', 'true')

  latar.innerHTML = `
    <div class="modal-kotak">
      <h2 class="modal-judul">Konfirmasi Pembatalan</h2>
      <p class="modal-pesan">${pesan}</p>
      <div class="modal-aksi">
        <button class="tombol tombol--cadangan" type="button" data-batal>${teksBatal}</button>
        <button class="tombol tombol--utama" type="button" data-konfirmasi>${teksKonfirmasi}</button>
      </div>
    </div>
  `

  function tutup() {
    latar.remove()
    document.removeEventListener('keydown', onKeyDown)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      tutup()
      onBatal?.()
    }
  }

  latar.querySelector('[data-batal]').addEventListener('click', () => {
    tutup()
    onBatal?.()
  })

  latar.querySelector('[data-konfirmasi]').addEventListener('click', () => {
    tutup()
    onKonfirmasi?.()
  })

  latar.addEventListener('click', (e) => {
    if (e.target === latar) {
      tutup()
      onBatal?.()
    }
  })

  document.addEventListener('keydown', onKeyDown)
  document.body.appendChild(latar)
  latar.querySelector('[data-konfirmasi]').focus()
}
