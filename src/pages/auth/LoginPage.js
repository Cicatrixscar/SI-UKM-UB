/**
 * Halaman: Masuk (LoginPage).
 *
 * Alur masuk:
 * 1. Layar awal: Memilih peran (Masuk sebagai Mahasiswa [aktif] atau Masuk sebagai Admin [segera hadir/disabled]).
 * 2. Form Mahasiswa: Input email dan kata sandi dengan validasi email domain UB (@ub.ac.id / @student.ub.ac.id).
 */

import { login } from '../../services/authService.js'
import { setSesi } from '../../state/session.js'
import { navigasi } from '../../router.js'
import { config } from '../../config.js'
import { validasiEmailMahasiswa, validasiWajib } from '../../utils/validators.js'
import {
  buatTextField,
  nilaiTextField,
  setErrorTextField,
  bersihkanErrorTextField,
} from '../../components/form/TextField.js'

let sedangProses = false
let modeSaatIni = 'PILIHAN' // 'PILIHAN' | 'FORM_MAHASISWA'

function logo() {
  return `<img class="masuk__logo" src="/img/logo-ub.png" alt="Logo Universitas Brawijaya" />`
}

function renderPilihanPeran(wadah) {
  wadah.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        ${logo()}
        <h1 class="masuk__judul">Masuk ke ${config.namaAplikasi}</h1>
        <p class="masuk__subjudul text-muted">Pilih peran Anda untuk melanjutkan</p>

        <div class="masuk__pilihan-peran">
          <button class="tombol tombol--utama tombol--blok" type="button" data-aksi="pilih-mahasiswa">
            Masuk sebagai Mahasiswa
          </button>
          <button class="tombol tombol--cadangan tombol--blok" type="button" disabled aria-disabled="true" title="Fitur login admin belum dibuka">
            Masuk sebagai Admin <span class="masuk__badge-segera">Segera Hadir</span>
          </button>
        </div>
      </div>
    </section>
  `

  wadah.querySelector('[data-aksi="pilih-mahasiswa"]').addEventListener('click', () => {
    modeSaatIni = 'FORM_MAHASISWA'
    renderIsi(wadah)
  })
}

function renderFormMahasiswa(wadah) {
  wadah.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        <button class="masuk__kembali" type="button" data-aksi="kembali">
          &larr; Kembali ke Pemilihan Peran
        </button>
        ${logo()}
        <h1 class="masuk__judul">Masuk sebagai Mahasiswa</h1>
        <p class="masuk__subjudul text-muted">Gunakan akun email @student.ub.ac.id</p>

        <form class="masuk__form" novalidate data-form></form>
      </div>
    </section>
  `

  const form = wadah.querySelector('[data-form]')
  const fieldEmail = buatTextField({
    id: 'email',
    label: 'Email Mahasiswa UB',
    nama: 'email',
    tipe: 'email',
    placeholder: 'contoh: akumahasiswa@student.ub.ac.id',
    bantuan: 'Wajib berakhiran @student.ub.ac.id',
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

  // Tombol Kembali
  wadah.querySelector('[data-aksi="kembali"]').addEventListener('click', () => {
    modeSaatIni = 'PILIHAN'
    renderIsi(wadah)
  })

  // Submit form
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangProses) return

    bersihkanErrorTextField(fieldEmail)
    bersihkanErrorTextField(fieldSandi)
    pesanUmum.hidden = true

    const email = nilaiTextField(fieldEmail).trim()
    const password = nilaiTextField(fieldSandi)

    // Validasi format email domain mahasiswa UB (@student.ub.ac.id)
    const cekEmail = validasiEmailMahasiswa(email)
    if (!cekEmail.valid) {
      setErrorTextField(fieldEmail, cekEmail.pesan)
      return
    }

    // Validasi kata sandi wajib diisi
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
}

function renderIsi(wadah) {
  if (modeSaatIni === 'FORM_MAHASISWA') {
    renderFormMahasiswa(wadah)
  } else {
    renderPilihanPeran(wadah)
  }
}

/** Dipanggil router. */
export function render(el) {
  el.innerHTML = ''
  renderIsi(el)
}
