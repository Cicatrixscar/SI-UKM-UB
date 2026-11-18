/**
 * Halaman: Pendaftaran Akun Mahasiswa (DaftarMahasiswaPage).
 *
 * Tanggung Jawab (Single Responsibility):
 * - Menampilkan formulir pendaftaran akun mahasiswa UB
 * - Memvalidasi format isian data diri dan kata sandi
 * - Mengirim kode OTP verifikasi ke email mahasiswa melalui service
 * - Menyimpan data sementara dan melanjutkan ke halaman verifikasi OTP
 */

import { kirimOtpPendaftaran } from '../../services/registrasiService.js'
import { navigasi } from '../../router.js'
import { validasiEmailMahasiswa, validasiKekuatanPassword } from '../../utils/validatorAuth.js'
import {
  buatTextField,
  nilaiTextField,
  setErrorTextField,
  bersihkanErrorTextField,
} from '../../components/form/TextField.js'
import {
  simpanDataPendaftaranSementara,
  ambilDataPendaftaranSementara,
} from '../../state/registrasiTemp.js'

let sedangProses = false

function logo() {
  return `<img class="masuk__logo" src="/img/logo-ub.png" alt="Logo Universitas Brawijaya" />`
}

/**
 * Render halaman Pendaftaran Mahasiswa.
 * @param {HTMLElement} el
 */
export function render(el) {
  const dataLama = ambilDataPendaftaranSementara() || {}

  el.innerHTML = `
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

  const form = el.querySelector('[data-form-daftar]')

  const fieldNama = buatTextField({
    id: 'daftar-nama',
    label: 'Nama Lengkap',
    nama: 'nama',
    nilai: dataLama.nama || '',
    placeholder: 'contoh: Ascarya Haldis',
    wajib: true,
  })

  const fieldNim = buatTextField({
    id: 'daftar-nim',
    label: 'Nomor Induk Mahasiswa (NIM)',
    nama: 'nim',
    nilai: dataLama.nim || '',
    placeholder: 'contoh: 225150400111024',
    wajib: true,
  })

  const fieldEmail = buatTextField({
    id: 'daftar-email',
    label: 'Email Mahasiswa (@student.ub.ac.id)',
    nama: 'email',
    tipe: 'email',
    nilai: dataLama.email || '',
    placeholder: 'contoh: akumahasiswa@student.ub.ac.id',
    bantuan: 'Wajib berakhiran @student.ub.ac.id',
    wajib: true,
  })

  const fieldTelepon = buatTextField({
    id: 'daftar-telepon',
    label: 'Nomor WhatsApp / HP',
    nama: 'telepon',
    tipe: 'tel',
    nilai: dataLama.nomorTelepon || '',
    placeholder: 'contoh: 081234567890',
    wajib: true,
  })

  const fieldFakultas = buatTextField({
    id: 'daftar-fakultas',
    label: 'Fakultas',
    nama: 'fakultas',
    nilai: dataLama.fakultas || '',
    placeholder: 'contoh: Fakultas Ilmu Komputer',
    wajib: true,
  })

  const fieldProdi = buatTextField({
    id: 'daftar-prodi',
    label: 'Program Studi',
    nama: 'prodi',
    nilai: dataLama.programStudi || '',
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

  const kembaliKeLogin = () => navigasi('/masuk')
  el.querySelector('[data-aksi="kembali-login"]')?.addEventListener('click', kembaliKeLogin)
  el.querySelector('[data-aksi="ke-login"]')?.addEventListener('click', kembaliKeLogin)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangProses) return

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

    const dataPendaftaranSementara = {
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
        simpanDataPendaftaranSementara(dataPendaftaranSementara)
        navigasi('/daftar/otp')
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
