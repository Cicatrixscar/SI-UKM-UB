/**
 * Halaman: Masuk (LoginPage).
 *
 * [DOKUMEN] UI/UX Wireframe Brief §10 M-02: "Kartu di tengah dengan logo, judul
 *           'Masuk ke Portal UKM', field email dan password, tombol 'Masuk'."
 * [DOKUMEN] AI.md §1: "Login mock (pilih role Mahasiswa)".
 * [DOKUMEN] AI.md §11 T1: "Login mock Mahasiswa berhasil."
 * [DOKUMEN] AI.md §4: "Halaman tidak boleh ... memanggil mock langsung. Halaman
 *           hanya memanggil services/." + "Setiap halaman punya state loading,
 *           kosong, error, dan sukses."
 * [DOKUMEN] PRD v0.3 §7.1 authService.login → `{ berhasil, user, pesan }`.
 *
 * [USULAN] Tombol cepat "Masuk sebagai Mahasiswa" — Brief §10 M-02 membolehkan
 *          pemilihan role untuk mode mock.
 */

import { login, loginSebagaiMahasiswa } from '../../services/authService.js'
import { setSesi } from '../../state/session.js'
import { navigasi } from '../../router.js'
import { config } from '../../config.js'
import {
  buatTextField,
  nilaiTextField,
  setErrorTextField,
  bersihkanErrorTextField,
} from '../../components/form/TextField.js'

let sedangProses = false

function logo() {
  return `<svg class="ikon ikon--logo-besar" aria-hidden="true"><use href="#i-graduation-cap"></use></svg>`
}

function renderIsi(wadah) {
  wadah.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        ${logo()}
        <h1 class="masuk__judul">Masuk ke ${config.namaAplikasi}</h1>
        <p class="masuk__subjudul text-muted">${config.institusi}</p>

        <form class="masuk__form" novalidate data-form></form>

        <p class="masuk__pembatas text-muted">atau</p>
        <button class="tombol tombol--cadangan" type="button" data-cepat>Masuk sebagai Mahasiswa</button>
      </div>
    </section>
  `

  const form = wadah.querySelector('[data-form]')
  const fieldEmail = buatTextField({
    id: 'email',
    label: 'Email',
    nama: 'email',
    tipe: 'email',
    placeholder: 'email@student.ub.ac.id',
    wajib: true,
    autocomplete: 'username',
  })
  const fieldSandi = buatTextField({
    id: 'password',
    label: 'Kata Sandi',
    nama: 'password',
    tipe: 'password',
    placeholder: 'Masukkan kata sandi',
    wajib: true,
    autocomplete: 'current-password',
  })

  const pesanUmum = document.createElement('p')
  pesanUmum.className = 'masuk__pesan'
  pesanUmum.setAttribute('role', 'alert')
  pesanUmum.hidden = true

  const tombol = document.createElement('button')
  tombol.className = 'tombol tombol--utama tombol--blok'
  tombol.type = 'submit'
  tombol.textContent = 'Masuk'

  form.append(fieldEmail, fieldSandi, pesanUmum, tombol)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangProses) return
    bersihkanErrorTextField(fieldEmail)
    bersihkanErrorTextField(fieldSandi)
    pesanUmum.hidden = true

    const email = nilaiTextField(fieldEmail).trim()
    const password = nilaiTextField(fieldSandi)

    sedangProses = true
    tombol.disabled = true
    tombol.textContent = 'Memproses…'
    try {
      const hasil = await login(email, password)
      if (hasil.berhasil) {
        setSesi(hasil.user)
        navigasi('/mahasiswa/katalog')
        return
      }
      // [USULAN] PRD §14 tidak memuat teks pesan "login gagal" dan AI.md §9
      //          melarang membuat teks pesan sendiri, sehingga hanya field yang
      //          ditandai merah (tanpa pesan). Perlu keputusan user.
      setErrorTextField(fieldEmail, ' ')
      setErrorTextField(fieldSandi, ' ')
      if (hasil.pesan) {
        pesanUmum.textContent = hasil.pesan
        pesanUmum.hidden = false
      }
    } finally {
      sedangProses = false
      tombol.disabled = false
      tombol.textContent = 'Masuk'
    }
  })

  wadah.querySelector('[data-cepat]').addEventListener('click', async () => {
    if (sedangProses) return
    sedangProses = true
    try {
      const hasil = await loginSebagaiMahasiswa()
      if (hasil.berhasil) {
        setSesi(hasil.user)
        navigasi('/mahasiswa/katalog')
      }
    } finally {
      sedangProses = false
    }
  })
}

/** Dipanggil router. */
export function render(el) {
  el.innerHTML = ''
  renderIsi(el)
}
