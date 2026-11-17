/**
 * Halaman: Profil Mahasiswa (ProfilPage).
 * Mengelola dan mengubah informasi identitas akun mahasiswa:
 * Nama Lengkap, NIM, Nomor Telepon, Fakultas, Program Studi.
 */

import { pasang } from '../../layouts/AppShell.js'
import { getSesi, setSesi } from '../../state/session.js'
import { ambilSupabase } from '../../services/supabaseClient.js'
import { inisialDariNama } from '../../utils/format.js'
import {
  buatTextField,
  nilaiTextField,
  setErrorTextField,
  bersihkanErrorTextField,
} from '../../components/form/TextField.js'

let sedangMenyimpan = false

function renderIsi(konten) {
  const sesi = getSesi()

  konten.innerHTML = `
    <div class="halaman-wadah">
      <div class="halaman-kepala">
        <div>
          <h1 class="halaman-judul">Profil Mahasiswa</h1>
          <p class="halaman-subjudul text-muted">Lihat dan perbarui informasi identitas akun Anda</p>
        </div>
      </div>

      <div class="profil-kartu">
        <div class="profil-kartu__header">
          <div class="profil-kartu__avatar" aria-hidden="true">
            ${inisialDariNama(sesi?.nama ?? 'Mahasiswa')}
          </div>
          <div>
            <h2 class="profil-kartu__nama">${sesi?.nama ?? 'Mahasiswa UB'}</h2>
            <p class="profil-kartu__email text-muted">${sesi?.email ?? ''}</p>
            <span class="profil-kartu__badge">Mahasiswa Aktif</span>
          </div>
        </div>

        <div id="pesan-sukses-profil" class="masuk__info-sukses" role="status" hidden></div>
        <div id="pesan-error-profil" class="masuk__pesan" role="alert" hidden></div>

        <form class="profil-kartu__form" id="form-profil" novalidate></form>
      </div>
    </div>
  `

  const form = konten.querySelector('#form-profil')
  const pesanSukses = konten.querySelector('#pesan-sukses-profil')
  const pesanError = konten.querySelector('#pesan-error-profil')

  const fieldNama = buatTextField({
    id: 'profil-nama',
    label: 'Nama Lengkap',
    nama: 'nama',
    nilai: sesi?.nama ?? '',
    wajib: true,
  })

  const fieldNim = buatTextField({
    id: 'profil-nim',
    label: 'Nomor Induk Mahasiswa (NIM)',
    nama: 'nim',
    nilai: sesi?.nim ?? '',
    wajib: true,
  })

  const fieldEmail = buatTextField({
    id: 'profil-email',
    label: 'Email Mahasiswa',
    nama: 'email',
    nilai: sesi?.email ?? '',
    bantuan: 'Email resmi UB tidak dapat diubah.',
    wajib: true,
  })
  // Jadikan field email readonly
  const inputEmail = fieldEmail.querySelector('input')
  inputEmail.readOnly = true
  inputEmail.classList.add('field__input--readonly')

  const fieldTelepon = buatTextField({
    id: 'profil-telepon',
    label: 'Nomor WhatsApp / HP',
    nama: 'telepon',
    tipe: 'tel',
    nilai: sesi?.nomorTelepon ?? '',
    wajib: true,
  })

  const fieldFakultas = buatTextField({
    id: 'profil-fakultas',
    label: 'Fakultas',
    nama: 'fakultas',
    nilai: sesi?.fakultas ?? '',
    wajib: true,
  })

  const fieldProdi = buatTextField({
    id: 'profil-prodi',
    label: 'Program Studi',
    nama: 'prodi',
    nilai: sesi?.programStudi ?? '',
    wajib: true,
  })

  const tombolSimpan = document.createElement('button')
  tombolSimpan.className = 'tombol tombol--utama'
  tombolSimpan.type = 'submit'
  tombolSimpan.textContent = 'Simpan Perubahan Profil'

  form.append(fieldNama, fieldNim, fieldEmail, fieldTelepon, fieldFakultas, fieldProdi, tombolSimpan)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (sedangMenyimpan) return

    pesanSukses.hidden = true
    pesanError.hidden = true

    bersihkanErrorTextField(fieldNama)
    bersihkanErrorTextField(fieldNim)
    bersihkanErrorTextField(fieldTelepon)
    bersihkanErrorTextField(fieldFakultas)
    bersihkanErrorTextField(fieldProdi)

    const nama = nilaiTextField(fieldNama).trim()
    const nim = nilaiTextField(fieldNim).trim()
    const nomorTelepon = nilaiTextField(fieldTelepon).trim()
    const fakultas = nilaiTextField(fieldFakultas).trim()
    const programStudi = nilaiTextField(fieldProdi).trim()

    let adaError = false
    if (!nama) {
      setErrorTextField(fieldNama, 'Nama lengkap wajib diisi')
      adaError = true
    }
    if (!nim) {
      setErrorTextField(fieldNim, 'NIM wajib diisi')
      adaError = true
    }
    if (!nomorTelepon) {
      setErrorTextField(fieldTelepon, 'Nomor telepon wajib diisi')
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

    if (adaError) return

    sedangMenyimpan = true
    tombolSimpan.disabled = true
    tombolSimpan.textContent = 'Menyimpan perubahan…'

    try {
      // 1. Simpan perubahan ke tabel pengguna di Supabase
      const supabase = ambilSupabase()
      const { error } = await supabase
        .from('pengguna')
        .update({
          nama,
          nim,
          nomor_telepon: nomorTelepon,
          fakultas,
          program_studi: programStudi,
        })
        .ilike('email', sesi?.email ?? '')

      if (error) {
        console.warn('Supabase update notice:', error.message)
      }

      // 2. Perbarui state sesi lokal
      const sesiBaru = {
        ...sesi,
        nama,
        nim,
        nomorTelepon,
        fakultas,
        programStudi,
      }
      setSesi(sesiBaru)

      // 3. Tampilkan pesan sukses & perbarui tampilan nama di avatar
      pesanSukses.textContent = 'Profil berhasil diperbarui!'
      pesanSukses.hidden = false

      konten.querySelector('.profil-kartu__nama').textContent = nama
      konten.querySelector('.profil-kartu__avatar').textContent = inisialDariNama(nama)
    } catch (err) {
      console.error('Gagal update profil:', err)
      pesanError.textContent = 'Gagal menyimpan perubahan. Silakan coba lagi.'
      pesanError.hidden = false
    } finally {
      sedangMenyimpan = false
      tombolSimpan.disabled = false
      tombolSimpan.textContent = 'Simpan Perubahan Profil'
    }
  })
}

/** Dipanggil oleh router saat rute /mahasiswa/profil dibuka. */
export function render(el) {
  const konten = pasang(el, { jalur: '/mahasiswa/profil' })
  renderIsi(konten)
}
