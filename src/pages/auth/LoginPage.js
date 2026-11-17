/**
 * Halaman: Masuk & Pendaftaran Akun Mahasiswa (LoginPage).
 *
 * Alur:
 * 1. Layar Pilihan Peran: Masuk sebagai Mahasiswa / Admin (segera hadir).
 * 2. Layar Login Mahasiswa: Email @student.ub.ac.id + Password (verifikasi SHA-512).
 * 3. Layar Pendaftaran Mahasiswa: Form lengkap biodata mahasiswa UB.
 * 4. Layar Verifikasi OTP: Kode 6 digit dikirim via Supabase Auth ke email @student.ub.ac.id.
 */

import {
  login,
  kirimOtpPendaftaran,
  verifikasiOtpDanDaftar,
} from '../../services/authService.js'
import { setSesi } from '../../state/session.js'
import { navigasi } from '../../router.js'
import { config } from '../../config.js'
import { validasiEmailMahasiswa, validasiWajib, validasiKekuatanPassword } from '../../utils/validators.js'
import {
  buatTextField,
  nilaiTextField,
  setErrorTextField,
  bersihkanErrorTextField,
} from '../../components/form/TextField.js'

let sedangProses = false
let modeSaatIni = 'PILIHAN' // 'PILIHAN' | 'LOGIN_MAHASISWA' | 'DAFTAR_MAHASISWA' | 'VERIFIKASI_OTP'
let dataPendaftaranSementara = null
let pesanSuksesLogin = ''
let pesanInfoOtp = ''

function logo() {
  return `<img class="masuk__logo" src="/img/logo-ub.png" alt="Logo Universitas Brawijaya" />`
}

/* ==========================================================================
   1. TAMPILAN: PILIHAN PERAN
   ========================================================================== */
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
    modeSaatIni = 'LOGIN_MAHASISWA'
    renderIsi(wadah)
  })
}

/* ==========================================================================
   2. TAMPILAN: LOGIN MAHASISWA
   ========================================================================== */
function renderLoginMahasiswa(wadah) {
  wadah.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        <button class="masuk__kembali" type="button" data-aksi="kembali-peran">
          &larr; Kembali ke Pemilihan Peran
        </button>
        ${logo()}
        <h1 class="masuk__judul">Masuk sebagai Mahasiswa</h1>
        <p class="masuk__subjudul text-muted">Gunakan akun email @student.ub.ac.id</p>

        ${
          pesanSuksesLogin
            ? `<div class="masuk__info-sukses" role="status">${pesanSuksesLogin}</div>`
            : ''
        }

        <form class="masuk__form" novalidate data-form-login></form>

        <p class="masuk__tautan-bawah">
          Belum punya akun? <button type="button" data-aksi="ke-daftar">Daftar akun mahasiswa</button>
        </p>
      </div>
    </section>
  `

  pesanSuksesLogin = '' // reset pesan sukses setelah ditampilkan

  const form = wadah.querySelector('[data-form-login]')
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

  wadah.querySelector('[data-aksi="kembali-peran"]').addEventListener('click', () => {
    modeSaatIni = 'PILIHAN'
    renderIsi(wadah)
  })

  wadah.querySelector('[data-aksi="ke-daftar"]').addEventListener('click', () => {
    modeSaatIni = 'DAFTAR_MAHASISWA'
    renderIsi(wadah)
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

/* ==========================================================================
   3. TAMPILAN: PENDAFTARAN MAHASISWA
   ========================================================================== */
function renderDaftarMahasiswa(wadah) {
  wadah.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu masuk__kartu--lebar">
        <button class="masuk__kembali" type="button" data-aksi="kembali-login">
          &larr; Kembali ke Halaman Masuk
        </button>
        ${logo()}
        <h1 class="masuk__judul">Pendaftaran Mahasiswa</h1>
        <p class="masuk__subjudul text-muted">Daftarkan akun dengan email resmi Universitas Brawijaya</p>

        <form class="masuk__form" novalidate data-form-daftar></form>

        <p class="masuk__tautan-bawah">
          Sudah punya akun? <button type="button" data-aksi="ke-login">Masuk di sini</button>
        </p>
      </div>
    </section>
  `

  const form = wadah.querySelector('[data-form-daftar]')

  const fieldNama = buatTextField({
    id: 'daftar-nama',
    label: 'Nama Lengkap',
    nama: 'nama',
    placeholder: 'contoh: Ascarya Haldis',
    wajib: true,
  })

  const fieldNim = buatTextField({
    id: 'daftar-nim',
    label: 'Nomor Induk Mahasiswa (NIM)',
    nama: 'nim',
    placeholder: 'contoh: 225150400111024',
    wajib: true,
  })

  const fieldEmail = buatTextField({
    id: 'daftar-email',
    label: 'Email Mahasiswa (@student.ub.ac.id)',
    nama: 'email',
    tipe: 'email',
    placeholder: 'contoh: akumahasiswa@student.ub.ac.id',
    bantuan: 'Wajib berakhiran @student.ub.ac.id',
    wajib: true,
  })

  const fieldTelepon = buatTextField({
    id: 'daftar-telepon',
    label: 'Nomor WhatsApp / HP',
    nama: 'telepon',
    tipe: 'tel',
    placeholder: 'contoh: 081234567890',
    wajib: true,
  })

  const fieldFakultas = buatTextField({
    id: 'daftar-fakultas',
    label: 'Fakultas',
    nama: 'fakultas',
    placeholder: 'contoh: Fakultas Ilmu Komputer',
    wajib: true,
  })

  const fieldProdi = buatTextField({
    id: 'daftar-prodi',
    label: 'Program Studi',
    nama: 'prodi',
    placeholder: 'contoh: Teknik Informatika',
    wajib: true,
  })

  const fieldSandi = buatTextField({
    id: 'daftar-password',
    label: 'Kata Sandi',
    nama: 'password',
    tipe: 'password',
    placeholder: 'Minimal 8 karakter (huruf besar, kecil, angka)',
    bantuan: 'Wajib min. 8 karakter, kombinasi huruf besar, huruf kecil, dan angka. Di-hash dengan SHA-512.',
    wajib: true,
  })

  const fieldKonfirmasi = buatTextField({
    id: 'daftar-konfirmasi',
    label: 'Konfirmasi Kata Sandi',
    nama: 'konfirmasi',
    tipe: 'password',
    placeholder: 'Ketik ulang kata sandi',
    wajib: true,
  })

  const pesanUmum = document.createElement('p')
  pesanUmum.className = 'masuk__pesan'
  pesanUmum.setAttribute('role', 'alert')
  pesanUmum.hidden = true

  const tombol = document.createElement('button')
  tombol.className = 'tombol tombol--utama tombol--blok'
  tombol.type = 'submit'
  tombol.textContent = 'Daftar & Kirim Kode OTP'

  form.append(
    fieldNama,
    fieldNim,
    fieldEmail,
    fieldTelepon,
    fieldFakultas,
    fieldProdi,
    fieldSandi,
    fieldKonfirmasi,
    pesanUmum,
    tombol
  )

  const kembaliKeLogin = () => {
    modeSaatIni = 'LOGIN_MAHASISWA'
    renderIsi(wadah)
  }
  wadah.querySelector('[data-aksi="kembali-login"]').addEventListener('click', kembaliKeLogin)
  wadah.querySelector('[data-aksi="ke-login"]').addEventListener('click', kembaliKeLogin)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangProses) return

    // Bersihkan semua error
    const fields = [
      fieldNama,
      fieldNim,
      fieldEmail,
      fieldTelepon,
      fieldFakultas,
      fieldProdi,
      fieldSandi,
      fieldKonfirmasi,
    ]
    fields.forEach(bersihkanErrorTextField)
    pesanUmum.hidden = true

    const nama = nilaiTextField(fieldNama).trim()
    const nim = nilaiTextField(fieldNim).trim()
    const email = nilaiTextField(fieldEmail).trim()
    const nomorTelepon = nilaiTextField(fieldTelepon).trim()
    const fakultas = nilaiTextField(fieldFakultas).trim()
    const programStudi = nilaiTextField(fieldProdi).trim()
    const password = nilaiTextField(fieldSandi)
    const konfirmasi = nilaiTextField(fieldKonfirmasi)

    // Validasi field wajib
    let adaError = false
    if (!nama) {
      setErrorTextField(fieldNama, 'Nama lengkap wajib diisi')
      adaError = true
    }
    if (!nim) {
      setErrorTextField(fieldNim, 'NIM wajib diisi')
      adaError = true
    }

    const cekEmail = validasiEmailMahasiswa(email)
    if (!cekEmail.valid) {
      setErrorTextField(fieldEmail, cekEmail.pesan)
      adaError = true
    }

    if (!nomorTelepon) {
      setErrorTextField(fieldTelepon, 'Nomor WhatsApp / HP wajib diisi')
      adaError = true
    }
    if (!fakultas) {
      setErrorTextField(fieldFakultas, 'Fakultas wajib diisi')
      adaError = true
    }
    if (!programStudi) {
      setErrorTextField(fieldProdi, 'Program studi wajib diisi')
      adaError = true
    }

    const cekSandi = validasiKekuatanPassword(password)
    if (!cekSandi.valid) {
      setErrorTextField(fieldSandi, cekSandi.pesan)
      adaError = true
    }

    if (password && konfirmasi && password !== konfirmasi) {
      setErrorTextField(fieldKonfirmasi, 'Konfirmasi kata sandi tidak cocok')
      adaError = true
    } else if (!konfirmasi) {
      setErrorTextField(fieldKonfirmasi, 'Konfirmasi kata sandi wajib diisi')
      adaError = true
    }

    if (adaError) return

    // Siapkan data sementara untuk verifikasi OTP
    dataPendaftaranSementara = {
      nama,
      nim,
      email,
      nomorTelepon,
      fakultas,
      programStudi,
      password,
    }

    sedangProses = true
    tombol.disabled = true
    tombol.textContent = 'Mengirim kode OTP…'

    try {
      const hasil = await kirimOtpPendaftaran(email, password)
      if (hasil.berhasil) {
        pesanInfoOtp = hasil.pesan
        modeSaatIni = 'VERIFIKASI_OTP'
        renderIsi(wadah)
        return
      }

      if (hasil.pesan) {
        pesanUmum.textContent = hasil.pesan
        pesanUmum.hidden = false
      }
    } finally {
      sedangProses = false
      tombol.disabled = false
      tombol.textContent = 'Daftar & Kirim Kode OTP'
    }
  })
}

/* ==========================================================================
   4. TAMPILAN: VERIFIKASI KODE OTP
   ========================================================================== */
function renderVerifikasiOtp(wadah) {
  if (!dataPendaftaranSementara) {
    modeSaatIni = 'DAFTAR_MAHASISWA'
    renderIsi(wadah)
    return
  }

  const emailTujuan = dataPendaftaranSementara.email

  wadah.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        <button class="masuk__kembali" type="button" data-aksi="kembali-daftar">
          &larr; Ubah Data Pendaftaran
        </button>
        ${logo()}
        <h1 class="masuk__judul">Verifikasi Kode OTP</h1>
        <p class="masuk__subjudul text-muted">Periksa email Anda untuk melanjutkan</p>

        <div class="masuk__info-email">
          ${
            pesanInfoOtp
              ? pesanInfoOtp
              : `Kode 6 digit OTP telah dikirim ke <strong>${emailTujuan}</strong>.<br /><small>Periksa Kotak Masuk atau folder <em>Spam / Junk</em> email Anda.</small>`
          }
        </div>

        <form class="masuk__form" novalidate data-form-otp>
          <div class="field" data-field="otp">
            <label class="field__label" for="input-otp">Masukkan 6 Digit Kode OTP <span class="field__wajib">*</span></label>
            <input
              class="field__input masuk__input-otp"
              id="input-otp"
              name="otp"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="123456"
              autocomplete="one-time-code"
              required
            />
            <p class="field__error" id="input-otp-error" role="alert" hidden></p>
          </div>

          <p class="masuk__pesan" role="alert" data-pesan-otp hidden></p>

          <button class="tombol tombol--utama tombol--blok" type="submit" data-btn-verifikasi>
            Verifikasi & Selesaikan Pendaftaran
          </button>

          <button class="tombol tombol--cadangan tombol--blok" type="button" data-btn-resend>
            Kirim Ulang Kode OTP
          </button>
        </form>
      </div>
    </section>
  `

  const form = wadah.querySelector('[data-form-otp]')
  const inputOtp = wadah.querySelector('#input-otp')
  const errorOtp = wadah.querySelector('#input-otp-error')
  const pesanUmum = wadah.querySelector('[data-pesan-otp]')
  const btnVerif = wadah.querySelector('[data-btn-verifikasi]')
  const btnResend = wadah.querySelector('[data-btn-resend]')

  wadah.querySelector('[data-aksi="kembali-daftar"]').addEventListener('click', () => {
    modeSaatIni = 'DAFTAR_MAHASISWA'
    renderIsi(wadah)
  })

  inputOtp.addEventListener('input', () => {
    errorOtp.hidden = true
    inputOtp.classList.remove('field--error')
  })

  // Submit verifikasi OTP
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangProses) return

    pesanUmum.hidden = true
    errorOtp.hidden = true
    const kode = inputOtp.value.trim()

    if (!kode || kode.length < 6) {
      errorOtp.textContent = 'Masukkan 6 digit kode OTP yang valid'
      errorOtp.hidden = false
      return
    }

    sedangProses = true
    btnVerif.disabled = true
    btnVerif.textContent = 'Memverifikasi…'

    try {
      const hasil = await verifikasiOtpDanDaftar(dataPendaftaranSementara, kode)
      if (hasil.berhasil) {
        pesanSuksesLogin =
          'Pendaftaran berhasil! Akun Anda telah aktif dan password dienkripsi dengan SHA-512. Silakan masuk.'
        dataPendaftaranSementara = null
        modeSaatIni = 'LOGIN_MAHASISWA'
        renderIsi(wadah)
        return
      }

      if (hasil.pesan) {
        pesanUmum.textContent = hasil.pesan
        pesanUmum.hidden = false
      }
    } finally {
      sedangProses = false
      btnVerif.disabled = false
      btnVerif.textContent = 'Verifikasi & Selesaikan Pendaftaran'
    }
  })

  // Tombol Kirim Ulang OTP
  btnResend.addEventListener('click', async () => {
    if (sedangProses) return
    sedangProses = true
    btnResend.disabled = true
    btnResend.textContent = 'Mengirim ulang OTP…'
    pesanUmum.hidden = true

    try {
      const res = await kirimOtpPendaftaran(
        dataPendaftaranSementara.email,
        dataPendaftaranSementara.password
      )
      pesanInfoOtp = res.pesan
      pesanUmum.textContent = res.pesan
      pesanUmum.className = res.berhasil ? 'masuk__info-sukses' : 'masuk__pesan'
      pesanUmum.hidden = false
      if (res.berhasil) {
        wadah.querySelector('.masuk__info-email').innerHTML = res.pesan
      }
    } finally {
      sedangProses = false
      btnResend.disabled = false
      btnResend.textContent = 'Kirim Ulang Kode OTP'
    }
  })
}

/* ==========================================================================
   RENDER UTAMA
   ========================================================================== */
function renderIsi(wadah) {
  if (modeSaatIni === 'PILIHAN') {
    renderPilihanPeran(wadah)
  } else if (modeSaatIni === 'LOGIN_MAHASISWA') {
    renderLoginMahasiswa(wadah)
  } else if (modeSaatIni === 'DAFTAR_MAHASISWA') {
    renderDaftarMahasiswa(wadah)
  } else if (modeSaatIni === 'VERIFIKASI_OTP') {
    renderVerifikasiOtp(wadah)
  }
}

/** Dipanggil router saat rute /masuk dibuka. */
export function render(el) {
  el.innerHTML = ''
  renderIsi(el)
}
