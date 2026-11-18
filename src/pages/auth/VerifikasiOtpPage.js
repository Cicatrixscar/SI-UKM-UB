/**
 * Halaman: Verifikasi OTP (VerifikasiOtpPage).
 *
 * Tanggung Jawab (Single Responsibility):
 * - Menampilkan formulir input kode OTP verifikasi
 * - Memverifikasi kode OTP yang dikirim ke email mahasiswa
 * - Menyediakan fitur kirim ulang kode OTP
 * - Menyelesaikan pendaftaran akun dan mengarahkan ke halaman login
 */

import { kirimOtpPendaftaran, verifikasiOtpDanDaftar } from '../../services/registrasiService.js'
import { navigasi } from '../../router.js'
import {
  ambilDataPendaftaranSementara,
  bersihkanDataPendaftaranSementara,
  setPesanSuksesLogin,
} from '../../state/registrasiTemp.js'

let sedangProses = false

function logo() {
  return `<img class="masuk__logo" src="/img/logo-ub.png" alt="Logo Universitas Brawijaya" />`
}

/**
 * Render halaman Verifikasi OTP.
 * @param {HTMLElement} el
 */
export function render(el) {
  const dataMahasiswa = ambilDataPendaftaranSementara()

  if (!dataMahasiswa || !dataMahasiswa.email) {
    navigasi('/daftar')
    return
  }

  const emailTujuan = dataMahasiswa.email

  el.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        <button class="masuk__kembali" type="button" data-aksi="kembali-daftar">
          &larr; Ubah Data Pendaftaran
        </button>
        ${logo()}
        <h1 class="masuk__judul">Verifikasi Kode OTP</h1>
        <p class="masuk__subjudul text-muted">Periksa email Anda untuk melanjutkan</p>

        <div class="masuk__info-email">
          Kode OTP verifikasi telah dikirim ke <strong>${emailTujuan}</strong>.<br />
          <small>Silakan periksa Kotak Masuk atau folder <em>Spam / Junk</em> email UB Anda.</small>
        </div>

        <form class="masuk__form" novalidate data-form-otp>
          <div class="field" data-field="otp">
            <label class="field__label" for="input-otp">Masukkan Kode OTP Verifikasi <span class="field__wajib">*</span></label>
            <input
              class="field__input masuk__input-otp"
              id="input-otp"
              name="otp"
              type="text"
              inputmode="numeric"
              maxlength="12"
              placeholder="contoh: 34602441"
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

  const form = el.querySelector('[data-form-otp]')
  const inputOtp = el.querySelector('#input-otp')
  const errorOtp = el.querySelector('#input-otp-error')
  const pesanUmum = el.querySelector('[data-pesan-otp]')
  const btnVerif = el.querySelector('[data-btn-verifikasi]')
  const btnResend = el.querySelector('[data-btn-resend]')

  el.querySelector('[data-aksi="kembali-daftar"]')?.addEventListener('click', () => {
    navigasi('/daftar')
  })

  inputOtp?.addEventListener('input', () => {
    errorOtp.hidden = true
    inputOtp.classList.remove('field--error')
  })

  // Submit verifikasi OTP
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangProses) return

    pesanUmum.hidden = true
    errorOtp.hidden = true
    const kode = inputOtp.value.trim()

    if (!kode || kode.length < 6) {
      errorOtp.textContent = 'Masukkan kode OTP verifikasi yang valid'
      errorOtp.hidden = false
      return
    }

    sedangProses = true
    btnVerif.disabled = true
    btnVerif.textContent = 'Memverifikasi…'

    try {
      const hasil = await verifikasiOtpDanDaftar(dataMahasiswa, kode)
      if (hasil.berhasil) {
        setPesanSuksesLogin(
          'Pendaftaran berhasil! Akun Anda telah aktif dan password dienkripsi dengan SHA-512. Silakan masuk.'
        )
        bersihkanDataPendaftaranSementara()
        navigasi('/masuk')
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
  btnResend?.addEventListener('click', async () => {
    if (sedangProses) return
    sedangProses = true
    btnResend.disabled = true
    btnResend.textContent = 'Mengirim ulang OTP…'
    pesanUmum.hidden = true

    try {
      const res = await kirimOtpPendaftaran(dataMahasiswa.email, dataMahasiswa.password)
      pesanUmum.textContent = res.pesan
      pesanUmum.className = res.berhasil ? 'masuk__info-sukses' : 'masuk__pesan'
      pesanUmum.hidden = false
      if (res.berhasil) {
        const infoEl = el.querySelector('.masuk__info-email')
        if (infoEl) infoEl.innerHTML = res.pesan
      }
    } finally {
      sedangProses = false
      btnResend.disabled = false
      btnResend.textContent = 'Kirim Ulang Kode OTP'
    }
  })
}
