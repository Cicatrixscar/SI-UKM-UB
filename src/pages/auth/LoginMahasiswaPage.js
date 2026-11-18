/**
 * Halaman: Masuk Mahasiswa (LoginMahasiswaPage).
 *
 * Tanggung Jawab (Single Responsibility):
 * - Menampilkan formulir login mahasiswa (Email UB + Kata Sandi)
 * - Memvalidasi input format email student UB dan password
 * - Memanggil service login dan menyimpan sesi saat berhasil
 * - Navigasi ke pendaftaran atau kembali ke pilihan peran
 */

import { login } from '../../services/loginService.js'
import { setSesi } from '../../state/session.js'
import { navigasi } from '../../router.js'
import { validasiEmailMahasiswa } from '../../utils/validatorAuth.js'
import { validasiWajib } from '../../utils/validatorDasar.js'
import {
  buatTextField,
  nilaiTextField,
  setErrorTextField,
  bersihkanErrorTextField,
} from '../../components/form/TextField.js'
import { ambilDanHapusPesanSuksesLogin } from '../../state/registrasiTemp.js'

let sedangProses = false

function logo() {
  return `<img class="masuk__logo" src="/img/logo-ub.png" alt="Logo Universitas Brawijaya" />`
}

/**
 * Render halaman Login Mahasiswa.
 * @param {HTMLElement} el
 */
export function render(el) {
  const pesanSukses = ambilDanHapusPesanSuksesLogin()

  el.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        <button class="masuk__kembali" type="button" data-aksi="kembali-peran">
          &larr; Kembali ke Pemilihan Peran
        </button>
        ${logo()}
        <h1 class="masuk__judul">Masuk sebagai Mahasiswa</h1>
        <p class="masuk__subjudul text-muted">Gunakan akun email @student.ub.ac.id</p>

        ${
          pesanSukses
            ? `<div class="masuk__info-sukses" role="status">${pesanSukses}</div>`
            : ''
        }

        <form class="masuk__form" novalidate data-form-login></form>

        <p class="masuk__tautan-bawah">
          Belum punya akun? <button type="button" data-aksi="ke-daftar">Daftar akun mahasiswa</button>
        </p>
      </div>
    </section>
  `

  const form = el.querySelector('[data-form-login]')
  const fieldEmail = buatTextField({
    id: 'login-email',
    label: 'Email Mahasiswa UB',
    nama: 'email',
    tipe: 'email',
    placeholder: 'contoh: akumahasiswa@student.ub.ac.id',
    bantuan: 'Wajib berakhiran @student.ub.ac.id',
    wajib: true,
    autocomplete: 'username',
  })

  const fieldSandi = buatTextField({
    id: 'login-password',
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

  el.querySelector('[data-aksi="kembali-peran"]')?.addEventListener('click', () => {
    navigasi('/')
  })

  el.querySelector('[data-aksi="ke-daftar"]')?.addEventListener('click', () => {
    navigasi('/daftar')
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangProses) return

    bersihkanErrorTextField(fieldEmail)
    bersihkanErrorTextField(fieldSandi)
    pesanUmum.hidden = true

    const email = nilaiTextField(fieldEmail).trim()
    const password = nilaiTextField(fieldSandi)

    const cekEmail = validasiEmailMahasiswa(email)
    if (!cekEmail.valid) {
      setErrorTextField(fieldEmail, cekEmail.pesan)
      return
    }

    const cekSandi = validasiWajib(password)
    if (!cekSandi.valid) {
      setErrorTextField(fieldSandi, cekSandi.pesan)
      return
    }

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
}
