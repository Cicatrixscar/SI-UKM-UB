/**
 * Komponen field teks (satu baris).
 *
 * [DOKUMEN] AI.md §5 daftar komponen: src/components/form/TextField.js.
 * [DOKUMEN] UI/UX Wireframe Brief §3.4: "Field form | Label dengan tanda bintang
 *           merah untuk wajib, placeholder isi, counter karakter di bawah | M-03".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-03 — field: Nama Lengkap*, NIM*, Email*,
 *           Nomor Telepon*.
 *
 * [USULAN] API buatTextField/nilaiTextField/setErrorTextField tidak ada di PRD;
 *          komponen memakai HTML/CSS biasa (AI.md §4).
 */

/**
 * @param {object} opsi
 * @param {string} opsi.id
 * @param {string} opsi.label
 * @param {string} [opsi.nama]
 * @param {string} [opsi.tipe]
 * @param {string} [opsi.placeholder]
 * @param {boolean} [opsi.wajib]
 * @param {string} [opsi.nilai]
 * @param {string} [opsi.autocomplete]
 * @param {string} [opsi.bantuan]
 * @returns {HTMLElement}
 */
export function buatTextField(opsi) {
  const {
    id,
    label,
    nama = id,
    tipe = 'text',
    placeholder = '',
    wajib = false,
    nilai = '',
    autocomplete,
    bantuan = '',
  } = opsi

  const wadah = document.createElement('div')
  wadah.className = 'field'
  wadah.dataset.field = nama

  wadah.innerHTML = `
    <label class="field__label" for="${id}">${label}${wajib ? '<span class="field__wajib" aria-hidden="true">*</span>' : ''}</label>
    <input
      class="field__input"
      id="${id}"
      name="${nama}"
      type="${tipe}"
      value=""
      placeholder="${placeholder}"
      ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
      ${wajib ? 'aria-required="true"' : ''}
    />
    ${bantuan ? `<p class="field__bantuan">${bantuan}</p>` : ''}
    <p class="field__error" id="${id}-error" role="alert" hidden></p>
  `

  const input = wadah.querySelector('input')
  input.value = nilai
  input.addEventListener('input', () => {
    wadah.querySelector('.field__error').hidden = true
    wadah.classList.remove('field--error')
  })
  return wadah
}

/** @returns {string} */
export function nilaiTextField(el) {
  return el.querySelector('input').value
}

export function setNilaiTextField(el, nilai) {
  el.querySelector('input').value = nilai ?? ''
}

export function setErrorTextField(el, pesan) {
  const error = el.querySelector('.field__error')
  error.textContent = pesan
  error.hidden = !pesan
  el.classList.toggle('field--error', Boolean(pesan))
}

export function bersihkanErrorTextField(el) {
  setErrorTextField(el, '')
}
