/**
 * Komponen checkbox.
 *
 * [DOKUMEN] AI.md §5 daftar komponen: src/components/form/Checkbox.js.
 * [DOKUMEN] AI.md §3 keputusan sementara G5: "Checkbox pernyataan: Ya. Tombol
 *           Kirim nonaktif sampai dicentang."
 * [DOKUMEN] AI.md §6 M-05: checkbox "Saya menyatakan data yang diisi benar".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-05.
 *
 * [USULAN] API buatCheckbox/dicentangCheckbox/setCheckbox tidak ada di PRD.
 */

/**
 * @param {object} opsi
 * @param {string} opsi.id
 * @param {string} opsi.label teks penuh di samping checkbox
 * @param {string} [opsi.nama]
 * @param {boolean} [opsi.nilai]
 * @returns {HTMLElement}
 */
export function buatCheckbox(opsi) {
  const { id, label, nama = id, nilai = false } = opsi
  const wadah = document.createElement('div')
  wadah.className = 'checkbox'
  wadah.dataset.checkbox = nama
  wadah.innerHTML = `
    <input class="checkbox__input" id="${id}" name="${nama}" type="checkbox" ${nilai ? 'checked' : ''} />
    <label class="checkbox__label" for="${id}">${label}</label>
  `
  return wadah
}

/** @returns {boolean} */
export function dicentangCheckbox(el) {
  return el.querySelector('input').checked
}

export function setCheckbox(el, nilai) {
  el.querySelector('input').checked = Boolean(nilai)
}
