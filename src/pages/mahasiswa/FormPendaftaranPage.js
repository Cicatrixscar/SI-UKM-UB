/**
 * Halaman: Form Pendaftaran (tiga langkah: Isi Data, Unggah Dokumen, Review dan Kirim).
 *
 * [DOKUMEN] AI.md §1 & §5: "src/pages/mahasiswa/FormPendaftaranPage.js (utama, tiga langkah)".
 * [DOKUMEN] UI/UX Wireframe Brief §4.3 hal. 145-147 — route:
 *           `#/mahasiswa/daftar/:id/data`, `.../dokumen`, `.../review`.
 * [DOKUMEN] Brief §5 M-03 (Data Diri), M-04 (Unggah Dokumen), M-05 (Review dan Kirim).
 * [DOKUMEN] Wireframe: Pendaftaran · Data diri.png, Pendaftaran · Unggah dokumen.png, Pendaftaran · Review dan kirim.png.
 * [DOKUMEN] AI.md §6 aturan bisnis form data diri, unggah dokumen, review dan kirim.
 */

import { pasang } from '../../layouts/AppShell.js'
import { getDetailUKM, submitPendaftaran } from '../../services/pendaftaranUKMService.js'
import { bolehAksesForm } from '../../utils/permissions.js'
import { LABEL_STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'
import { buatStepper } from '../../components/ui/Stepper.js'
import { bukaDialogKonfirmasi } from '../../components/ui/ConfirmDialog.js'
import { navigasi } from '../../router.js'
import { validasiDataDiri, validasiBerkas, validasiWajib, validasiNim, validasiEmail, validasiAlasan } from '../../utils/validators.js'
import { getSesi } from '../../state/session.js'
import { KODE_DOKUMEN } from '../../models/PersyaratanDokumen.js'

// Penyimpanan draf formulir per UKM in-memory
const drafPendaftaran = {}

function getDraf(idUKM) {
  if (!drafPendaftaran[idUKM]) {
    const sesi = getSesi()
    drafPendaftaran[idUKM] = {
      dataDiri: {
        nama: sesi?.nama ?? 'Rusdi',
        nim: sesi?.nim ?? '255150400111024',
        email: sesi?.email ?? 'rusdi@student.ub.ac.id',
        nomorTelepon: sesi?.nomorTelepon ?? '0812 3456 7890',
        alasan: 'Saya ingin mengembangkan kemampuan fotografi dan belajar bercerita melalui gambar. Saya pernah menjadi anggota tim dokumentasi acara sekolah dan ingin berkontribusi dalam kegiatan kampus.',
      },
      berkas: {
        [KODE_DOKUMEN.KTM]: null,
        [KODE_DOKUMEN.TRANSKRIP]: null,
        [KODE_DOKUMEN.CV]: null,
      },
      pernyataanBenar: false,
    }
  }
  return drafPendaftaran[idUKM]
}

function formatUkuran(byte) {
  if (!byte) return '0 B'
  const mb = byte / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1).replace('.', ',')} MB`
  const kb = byte / 1024
  return `${kb.toFixed(0)} KB`
}

/** Dua kemungkinan penolakan akses form (UKM Ditutup atau tidak ditemukan). */
function stateDitolak({ ukm, tidakDitemukan }) {
  const judul = tidakDitemukan
    ? PESAN.UKM_TIDAK_DITEMUKAN
    : LABEL_STATUS_PENDAFTARAN[ukm?.statusPendaftaran] ?? ukm?.statusPendaftaran ?? ''

  return `
    <div class="state">
      <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-lock"></use></svg>
      <p>${judul}</p>
      <a class="tombol tombol--utama" href="#/mahasiswa/katalog">Kembali ke Katalog UKM</a>
    </div>
  `
}

/** Render Langkah 1: Data Diri */
function renderLangkahDataDiri(wadah, ukm, draf) {
  const data = draf.dataDiri
  wadah.innerHTML = `
    <div class="form-halaman__langkah-kepala">
      <h2 class="form-halaman__langkah-judul">Data Diri</h2>
      <span class="form-halaman__langkah-urutan">Langkah 1 dari 3</span>
    </div>

    <form class="form-kartu" id="form-data-diri" novalidate>
      <p class="form-kartu__catatan">Kolom bertanda * wajib diisi. Gunakan data sesuai identitas mahasiswa.</p>

      <div class="form-grid-2">
        <div class="field" data-field="nama">
          <label class="field__label" for="inp-nama">Nama Lengkap<span class="field__wajib" aria-hidden="true">*</span></label>
          <input class="field__input" id="inp-nama" name="nama" type="text" value="${data.nama ?? ''}" required />
          <p class="field__error" id="err-nama" role="alert" hidden></p>
        </div>

        <div class="field" data-field="nim">
          <label class="field__label" for="inp-nim">NIM<span class="field__wajib" aria-hidden="true">*</span></label>
          <input class="field__input" id="inp-nim" name="nim" type="text" value="${data.nim ?? ''}" required />
          <p class="field__error" id="err-nim" role="alert" hidden></p>
        </div>

        <div class="field" data-field="email">
          <label class="field__label" for="inp-email">Email<span class="field__wajib" aria-hidden="true">*</span></label>
          <input class="field__input" id="inp-email" name="email" type="email" value="${data.email ?? ''}" required />
          <p class="field__error" id="err-email" role="alert" hidden></p>
        </div>

        <div class="field" data-field="nomorTelepon">
          <label class="field__label" for="inp-telp">Nomor Telepon<span class="field__wajib" aria-hidden="true">*</span></label>
          <input class="field__input" id="inp-telp" name="nomorTelepon" type="tel" value="${data.nomorTelepon ?? ''}" required />
          <p class="field__error" id="err-telp" role="alert" hidden></p>
        </div>
      </div>

      <div class="form-baris-penuh">
        <div class="field" data-field="alasan">
          <label class="field__label" for="inp-alasan">Alasan bergabung / pengalaman organisasi<span class="field__wajib" aria-hidden="true">*</span></label>
          <textarea class="field__textarea" id="inp-alasan" name="alasan" rows="4" maxlength="600" required>${data.alasan ?? ''}</textarea>
          <div class="form-alasan__bawah">
            <span>Ceritakan minat dan pengalamanmu secara singkat.</span>
            <span class="form-alasan__counter" id="counter-alasan">${(data.alasan ?? '').length}/500 karakter</span>
          </div>
          <p class="field__error" id="err-alasan" role="alert" hidden></p>
        </div>
      </div>
    </form>

    <div class="form-bawah-aksi">
      <p class="form-bawah-aksi__keterangan">Data digunakan untuk proses pendaftaran UKM.</p>
      <button class="tombol tombol--utama" id="btn-lanjut-data" type="button">Lanjut</button>
    </div>
  `

  const form = wadah.querySelector('#form-data-diri')
  const inpNama = form.querySelector('#inp-nama')
  const inpNim = form.querySelector('#inp-nim')
  const inpEmail = form.querySelector('#inp-email')
  const inpTelp = form.querySelector('#inp-telp')
  const inpAlasan = form.querySelector('#inp-alasan')
  const counterAlasan = form.querySelector('#counter-alasan')
  const btnLanjut = wadah.querySelector('#btn-lanjut-data')

  function updateCounter() {
    const len = inpAlasan.value.length
    counterAlasan.textContent = `${len}/500 karakter`
    if (len > 500) {
      counterAlasan.classList.add('form-alasan__counter--bahaya')
    } else {
      counterAlasan.classList.remove('form-alasan__counter--bahaya')
    }
  }

  function validasiForm(tampilkanPesan = false) {
    const nNama = inpNama.value.trim()
    const nNim = inpNim.value.trim()
    const nEmail = inpEmail.value.trim()
    const nTelp = inpTelp.value.trim()
    const nAlasan = inpAlasan.value.trim()

    const vNama = validasiWajib(nNama)
    const vNim = validasiNim(nNim)
    const vEmail = validasiEmail(nEmail)
    const vTelp = validasiWajib(nTelp)
    const vAlasan = validasiAlasan(nAlasan)

    if (tampilkanPesan) {
      setFieldError(inpNama, 'err-nama', vNama)
      setFieldError(inpNim, 'err-nim', vNim)
      setFieldError(inpEmail, 'err-email', vEmail)
      setFieldError(inpTelp, 'err-telp', vTelp)
      setFieldError(inpAlasan, 'err-alasan', vAlasan)
    }

    const semuaValid = vNama.valid && vNim.valid && vEmail.valid && vTelp.valid && vAlasan.valid
    btnLanjut.disabled = !semuaValid
    return semuaValid
  }

  function setFieldError(inputEl, errId, validasi) {
    const errEl = form.querySelector(`#${errId}`)
    const fieldEl = inputEl.closest('.field')
    if (!validasi.valid && validasi.pesan) {
      errEl.textContent = validasi.pesan
      errEl.hidden = false
      fieldEl?.classList.add('field--error')
    } else {
      errEl.textContent = ''
      errEl.hidden = true
      fieldEl?.classList.remove('field--error')
    }
  }

  // Event listener input
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('input', () => {
      data[el.name] = el.value
      updateCounter()
      validasiForm(false)
    })
  })

  updateCounter()
  validasiForm(false)

  btnLanjut.addEventListener('click', () => {
    if (validasiForm(true)) {
      data.nama = inpNama.value.trim()
      data.nim = inpNim.value.trim()
      data.email = inpEmail.value.trim()
      data.nomorTelepon = inpTelp.value.trim()
      data.alasan = inpAlasan.value.trim()
      navigasi(`/mahasiswa/daftar/${ukm.idUKM}/dokumen`)
    }
  })
}

/** Simulasi progres unggah: 0 → 35 → 60 → 85 → 100%, resolves saat selesai. */
function simulasiUpload(progressBarEl, persenEl, statusEl) {
  return new Promise((resolve) => {
    const tahapan = [15, 35, 60, 85, 100]
    let idx = 0
    if (statusEl) statusEl.textContent = 'Sedang mengunggah... Jangan tutup halaman ini.'
    const maju = () => {
      if (idx >= tahapan.length) {
        resolve()
        return
      }
      const val = tahapan[idx]
      if (progressBarEl) progressBarEl.style.width = `${val}%`
      if (persenEl) persenEl.textContent = `${val}%`
      idx++
      if (idx < tahapan.length) {
        setTimeout(maju, 220 + Math.random() * 150)
      } else {
        setTimeout(resolve, 250)
      }
    }
    maju()
  })
}

/** Render Langkah 2: Unggah Dokumen */
function renderLangkahDokumen(wadah, ukm, draf) {
  // Dokumen wajib ditentukan oleh Admin UKM — permanen dan tidak bisa dihapus
  const dokumenWajib = [
    { kode: KODE_DOKUMEN.KTM, nama: 'KTM', deskripsi: 'Kartu Tanda Mahasiswa' },
    { kode: KODE_DOKUMEN.TRANSKRIP, nama: 'Transkrip', deskripsi: 'Transkrip Nilai Akademik' },
    { kode: KODE_DOKUMEN.CV, nama: 'CV', deskripsi: 'Curriculum Vitae / Portofolio' },
  ]

  wadah.innerHTML = `
    <div class="form-halaman__langkah-kepala">
      <h2 class="form-halaman__langkah-judul">Unggah Dokumen</h2>
      <span class="form-halaman__langkah-urutan">Langkah 2 dari 3</span>
    </div>
    <p class="form-halaman__subketerangan">Unggah semua dokumen wajib. Format PDF atau JPEG, maks. 5MB per file.</p>

    <div class="form-halaman__berkas-list" id="berkas-list"></div>

    <div class="form-bawah-aksi">
      <button class="tombol tombol--cadangan" id="btn-kembali-dokumen" type="button">Kembali</button>
      <span class="form-bawah-aksi__keterangan" id="info-kelengkapan"></span>
      <button class="tombol tombol--utama" id="btn-lanjut-dokumen" type="button" disabled>Lanjut</button>
    </div>
  `

  const listWadah = wadah.querySelector('#berkas-list')
  const infoKelengkapan = wadah.querySelector('#info-kelengkapan')
  const btnLanjut = wadah.querySelector('#btn-lanjut-dokumen')
  const btnKembali = wadah.querySelector('#btn-kembali-dokumen')

  btnKembali.addEventListener('click', () => {
    navigasi(`/mahasiswa/daftar/${ukm.idUKM}/data`)
  })

  function periksaKelengkapan() {
    const semuaWajibValid = dokumenWajib.every((d) => draf.berkas[d.kode]?.status === 'valid')
    btnLanjut.disabled = !semuaWajibValid
    infoKelengkapan.textContent = semuaWajibValid ? '' : 'Lengkapi unggahan untuk melanjutkan.'
  }

  /**
   * Eksekusi animasi proses upload pada kartu, lalu jalankan validasi
   */
  async function jalankanUpload(kartu, file, kode) {
    if (!file) return

    // Tampilkan state sedang mengunggah
    kartu.classList.remove('berkas-kartu--error')
    const kanan = kartu.querySelector('.berkas-kartu__kanan')
    const meta = kartu.querySelector('.berkas-kartu__meta')
    const barisBawah = kartu.querySelector('.berkas-kartu__baris-bawah')

    if (meta) meta.textContent = `${file.name} · ${formatUkuran(file.size)}`
    kanan.innerHTML = `<span class="berkas-kartu__persen" id="persen-${kode}">0%</span>`
    barisBawah.innerHTML = `
      <div class="berkas-kartu__progress">
        <div class="berkas-kartu__progress-bar" id="pbar-${kode}" style="width: 0%"></div>
      </div>
      <p class="berkas-kartu__status-proses" id="sproses-${kode}">Sedang mengunggah... Jangan tutup halaman ini.</p>
    `

    const pBar = barisBawah.querySelector(`#pbar-${kode}`)
    const pPersen = kanan.querySelector(`#persen-${kode}`)
    const pStatus = barisBawah.querySelector(`#sproses-${kode}`)

    await simulasiUpload(pBar, pPersen, pStatus)

    // Validasi file setelah upload selesai
    const cek = validasiBerkas(file)
    if (cek.valid) {
      draf.berkas[kode] = { file, status: 'valid', pesan: PESAN.FORMAT_VALID }
    } else {
      draf.berkas[kode] = { file, status: 'error', pesan: cek.pesan }
    }
    renderSemuaKartu()
  }

  /** Pasang trigger klik, file input change, dan drag-and-drop */
  function pasangInteraksiKartu(kartu, kode) {
    const fileInput = kartu.querySelector('.berkas-kartu__input-sembunyi')
    const triggerBtn = kartu.querySelector('.btn-unggah-trigger')

    triggerBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      fileInput.click()
    })

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0]
      if (file) {
        jalankanUpload(kartu, file, kode)
      }
    })

    // Drag and drop interaktif
    kartu.addEventListener('dragover', (e) => {
      e.preventDefault()
      kartu.classList.add('berkas-kartu--dragover')
    })
    kartu.addEventListener('dragleave', () => {
      kartu.classList.remove('berkas-kartu--dragover')
    })
    kartu.addEventListener('drop', (e) => {
      e.preventDefault()
      kartu.classList.remove('berkas-kartu--dragover')
      const file = e.dataTransfer?.files?.[0]
      if (file) {
        jalankanUpload(kartu, file, kode)
      }
    })
  }

  function renderKartuWajib(doc) {
    const item = draf.berkas[doc.kode]
    const kartu = document.createElement('div')
    kartu.className = `berkas-kartu ${item?.status === 'error' ? 'berkas-kartu--error' : ''}`
    kartu.dataset.kode = doc.kode

    let metaHtml = ''
    let kananHtml = ''
    let bawahHtml = ''

    if (item?.status === 'valid') {
      metaHtml = `${item.file.name} · ${formatUkuran(item.file.size)}`
      // Hi-Fi valid: hanya centang hijau (Upload Ulang tersedia lewat klik meta/kartu).
      kananHtml = `
        <svg class="ikon ikon--besar berkas-kartu__centang" aria-hidden="true">
          <use href="#i-check-circle"></use>
        </svg>
        <button class="tombol tombol--cadangan tombol--konten btn-unggah-trigger" type="button">Upload Ulang</button>
      `
      bawahHtml = `
        <p class="berkas-kartu__status-valid">
          <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-check"></use></svg>
          Format dokumen valid
        </p>
      `
    } else if (item?.status === 'error') {
      metaHtml = `${item.file?.name ?? ''} · ${formatUkuran(item.file?.size ?? 0)}`
      kananHtml = `
        <button class="tombol tombol--cadangan tombol--konten btn-unggah-trigger" type="button">Upload Ulang</button>
      `
      bawahHtml = `
        <p class="berkas-kartu__status-error">
          <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
          ${item.pesan}
        </p>
      `
    } else {
      metaHtml = `${doc.deskripsi} · Format PDF atau JPEG, maks. 5MB`
      kananHtml = `
        <button class="tombol tombol--utama btn-unggah-trigger" type="button">Pilih File</button>
      `
      bawahHtml = ``
    }

    kartu.innerHTML = `
      <div class="berkas-kartu__baris-utama">
        <div class="berkas-kartu__kiri">
          <span class="berkas-kartu__ikon-wadah" aria-hidden="true">
            <svg class="ikon"><use href="#i-file-text"></use></svg>
          </span>
          <div class="berkas-kartu__info">
            <h3 class="berkas-kartu__nama-dokumen">${doc.nama}<span class="field__wajib" aria-hidden="true">*</span></h3>
            <p class="berkas-kartu__meta">${metaHtml}</p>
          </div>
        </div>
        <div class="berkas-kartu__kanan">
          ${kananHtml}
        </div>
      </div>
      <div class="berkas-kartu__baris-bawah">
        ${bawahHtml}
      </div>
      <input class="berkas-kartu__input-sembunyi" type="file" accept=".pdf,image/jpeg,image/jpg,image/png,application/pdf" />
    `

    pasangInteraksiKartu(kartu, doc.kode)
    return kartu
  }

  function renderSemuaKartu() {
    listWadah.innerHTML = ''
    dokumenWajib.forEach((d) => listWadah.appendChild(renderKartuWajib(d)))
    periksaKelengkapan()
  }

  renderSemuaKartu()

  btnLanjut.addEventListener('click', () => {
    navigasi(`/mahasiswa/daftar/${ukm.idUKM}/review`)
  })
}

/** Render Langkah 3: Review dan Kirim */
function renderLangkahReview(wadah, ukm, draf) {
  const data = draf.dataDiri
  const berkasMap = draf.berkas

  wadah.innerHTML = `
    <div class="form-halaman__langkah-kepala">
      <h2 class="form-halaman__langkah-judul">Review dan Kirim</h2>
      <span class="form-halaman__langkah-urutan">Langkah 3 dari 3</span>
    </div>
    <p class="form-halaman__subketerangan">Periksa kembali data dan dokumenmu sebelum mengirim pendaftaran.</p>

    <div class="review-grid">
      <div class="review-kartu">
        <div class="review-kartu__kepala">
          <h3 class="review-kartu__judul">Data Diri</h3>
          <button class="review-kartu__edit" id="btn-edit-data" type="button">Edit</button>
        </div>
        <dl class="review-dl">
          <dt>Nama lengkap</dt>
          <dd>${data.nama ?? '-'}</dd>
          <dt>NIM</dt>
          <dd>${data.nim ?? '-'}</dd>
          <dt>Email</dt>
          <dd>${data.email ?? '-'}</dd>
          <dt>Nomor telepon</dt>
          <dd>${data.nomorTelepon ?? '-'}</dd>
        </dl>
        <div class="review-pembatas"></div>
        <p class="review-alasan-label">Alasan bergabung / pengalaman organisasi</p>
        <p class="review-alasan-isi">${data.alasan ?? '-'}</p>
      </div>

      <div class="review-kartu">
        <div class="review-kartu__kepala">
          <h3 class="review-kartu__judul">Dokumen</h3>
          <button class="review-kartu__edit" id="btn-edit-dokumen" type="button">Edit</button>
        </div>
        <div class="review-kartu__badge">
          <span class="badge badge--positif">
            <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-check"></use></svg>
            Berkas Lengkap
          </span>
        </div>
        <ul class="review-dokumen-daftar">
          <li class="review-dokumen-item">
            <div class="review-dokumen-kiri">
              <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-file-text"></use></svg>
              <span><strong>KTM</strong> <span class="text-muted">${berkasMap[KODE_DOKUMEN.KTM]?.file?.name ?? 'ktm.jpg'} · ${formatUkuran(berkasMap[KODE_DOKUMEN.KTM]?.file?.size)}</span></span>
            </div>
            <span class="review-dokumen-siap">
              <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-check"></use></svg>
              Siap dikirim
            </span>
          </li>
          <li class="review-dokumen-item">
            <div class="review-dokumen-kiri">
              <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-file-text"></use></svg>
              <span><strong>Transkrip</strong> <span class="text-muted">${berkasMap[KODE_DOKUMEN.TRANSKRIP]?.file?.name ?? 'transkrip.pdf'} · ${formatUkuran(berkasMap[KODE_DOKUMEN.TRANSKRIP]?.file?.size)}</span></span>
            </div>
            <span class="review-dokumen-siap">
              <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-check"></use></svg>
              Siap dikirim
            </span>
          </li>
          <li class="review-dokumen-item">
            <div class="review-dokumen-kiri">
              <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-file-text"></use></svg>
              <span><strong>CV</strong> <span class="text-muted">${berkasMap[KODE_DOKUMEN.CV]?.file?.name ?? 'cv.pdf'} · ${formatUkuran(berkasMap[KODE_DOKUMEN.CV]?.file?.size)}</span></span>
            </div>
            <span class="review-dokumen-siap">
              <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-check"></use></svg>
              Siap dikirim
            </span>
        </ul>
        <p class="form-bawah-aksi__keterangan review-kartu__catatan">Semua dokumen telah memenuhi format dan batas ukuran.</p>
      </div>
    </div>

    <div class="review-pernyataan-box">
      <div class="checkbox">
        <input class="checkbox__input" id="chk-pernyataan" type="checkbox" ${draf.pernyataanBenar ? 'checked' : ''} />
        <label class="checkbox__label" for="chk-pernyataan">Saya menyatakan data yang diisi benar</label>
      </div>
      <div class="review-pernyataan-box__aksi">
        <button class="tombol tombol--cadangan" id="btn-batal-bawah" type="button">Batal</button>
        <button class="tombol tombol--utama" id="btn-kirim" type="button" ${draf.pernyataanBenar ? '' : 'disabled'}>Kirim Pendaftaran</button>
      </div>
    </div>

    <p class="review-bawah-catatan">Setelah dikirim, perkembangan pendaftaran dapat dilihat pada menu Riwayat Pendaftaran.</p>
  `

  wadah.querySelector('#btn-edit-data').addEventListener('click', () => {
    navigasi(`/mahasiswa/daftar/${ukm.idUKM}/data`)
  })

  wadah.querySelector('#btn-edit-dokumen').addEventListener('click', () => {
    navigasi(`/mahasiswa/daftar/${ukm.idUKM}/dokumen`)
  })

  wadah.querySelector('#btn-batal-bawah').addEventListener('click', () => {
    bukaDialogKonfirmasi({
      onKonfirmasi: () => navigasi(`/mahasiswa/ukm/${ukm.idUKM}`),
    })
  })

  const chkPernyataan = wadah.querySelector('#chk-pernyataan')
  const btnKirim = wadah.querySelector('#btn-kirim')

  chkPernyataan.addEventListener('change', () => {
    draf.pernyataanBenar = chkPernyataan.checked
    btnKirim.disabled = !draf.pernyataanBenar
  })

  btnKirim.addEventListener('click', async () => {
    btnKirim.disabled = true
    btnKirim.textContent = 'Mengirim…'

    const berkasArr = [
      { kode: KODE_DOKUMEN.KTM, file: berkasMap[KODE_DOKUMEN.KTM]?.file },
      { kode: KODE_DOKUMEN.TRANSKRIP, file: berkasMap[KODE_DOKUMEN.TRANSKRIP]?.file },
      { kode: KODE_DOKUMEN.CV, file: berkasMap[KODE_DOKUMEN.CV]?.file },
    ]

    const dataForm = {
      idUKM: ukm.idUKM,
      idMahasiswa: getSesi()?.idUser ?? 'USR-001',
      nama: data.nama,
      nim: data.nim,
      email: data.email,
      nomorTelepon: data.nomorTelepon,
      alasan: data.alasan,
    }

    try {
      const hasil = await submitPendaftaran(dataForm, berkasArr)
      if (hasil.berhasil) {
        // [DOKUMEN] Brief §5 M-05: setelah sukses pindah ke detail riwayat (M-06).
        const tujuan = hasil.idPendaftaran
          ? `#/mahasiswa/riwayat/${hasil.idPendaftaran}`
          : '#/mahasiswa/riwayat'
        wadah.innerHTML = `
          <div class="state state--sukses">
            <svg class="ikon ikon--besar state__ikon--sukses" aria-hidden="true"><use href="#i-check-circle"></use></svg>
            <h2 class="form-halaman__langkah-judul">Pendaftaran Berhasil Dikirim</h2>
            <p class="state__pesan">${hasil.pesan}</p>
            <a class="tombol tombol--utama" href="${tujuan}">Lihat Status Pendaftaran</a>
          </div>
        `
        delete drafPendaftaran[ukm.idUKM]
      } else {
        wadah.innerHTML = `
          <div class="state state--gagal">
            <svg class="ikon ikon--besar state__ikon--gagal" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
            <p class="state__pesan state__pesan--gagal">${hasil.pesan || PESAN.GAGAL_SIMPAN}</p>
            <button class="tombol tombol--utama" id="btn-retry" type="button">${TEKS_TOMBOL.RETRY}</button>
          </div>
        `
        wadah.querySelector('#btn-retry')?.addEventListener('click', () => {
          renderLangkahReview(wadah, ukm, draf)
        })
      }
    } catch (err) {
      console.error(err)
      wadah.innerHTML = `
        <div class="state state--gagal">
          <svg class="ikon ikon--besar state__ikon--gagal" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
          <p class="state__pesan state__pesan--gagal">${PESAN.GAGAL_SIMPAN}</p>
          <button class="tombol tombol--utama" id="btn-retry" type="button">${TEKS_TOMBOL.RETRY}</button>
        </div>
      `
      wadah.querySelector('#btn-retry')?.addEventListener('click', () => {
        renderLangkahReview(wadah, ukm, draf)
      })
    }
  })
}

/** Titik masuk render halaman FormPendaftaranPage */
export async function render(el, ctx = {}) {
  const idUKM = ctx.param?.idUKM
  const tahap = ctx.path?.endsWith('/dokumen')
    ? 'dokumen'
    : ctx.path?.endsWith('/review')
      ? 'review'
      : 'data'

  const konten = pasang(el, { jalur: '/mahasiswa/katalog' })
  const ulang = () => render(el, ctx)

  konten.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat form pendaftaran…</p></div>`

  try {
    const ukm = await getDetailUKM(idUKM)

    const akses = bolehAksesForm(ukm)
    if (!akses.boleh) {
      konten.innerHTML = stateDitolak({ ukm, tidakDitemukan: akses.tidakDitemukan })
      return
    }

    const draf = getDraf(ukm.idUKM)
    const langkah = tahap === 'dokumen' ? 2 : tahap === 'review' ? 3 : 1

    // [DOKUMEN] Hi-Fi Form: judul + Batal; bar konteks memakai ikon UKM; stepper di kartu.
    konten.innerHTML = `
      <div class="form-halaman">
        <header class="form-halaman__kepala">
          <h1 class="form-halaman__judul">Form Pendaftaran</h1>
          <button type="button" class="form-halaman__batal" data-batal>Batal</button>
        </header>

        <div class="form-bar">
          <span>Pendaftaran untuk</span>
          <span class="form-bar__nama">
            <span class="form-bar__ikon" aria-hidden="true">
              <svg class="ikon"><use href="#${ukm.ikon ?? 'i-camera'}"></use></svg>
            </span>
            ${ukm.namaUKM}
          </span>
          <span class="form-bar__kunci">Tidak dapat diubah</span>
        </div>

        <div class="form-kolom">
          <div class="form-stepper-kartu" data-stepper></div>

          <div class="form-halaman__isi" data-langkah></div>
        </div>
      </div>
    `

    konten.querySelector('[data-stepper]')?.appendChild(buatStepper(langkah))

    // Tombol Batal
    konten.querySelector('[data-batal]')?.addEventListener('click', () => {
      bukaDialogKonfirmasi({
        onKonfirmasi: () => navigasi(`/mahasiswa/ukm/${ukm.idUKM}`),
      })
    })

    const wadahLangkah = konten.querySelector('[data-langkah]')
    if (tahap === 'data') {
      renderLangkahDataDiri(wadahLangkah, ukm, draf)
    } else if (tahap === 'dokumen') {
      renderLangkahDokumen(wadahLangkah, ukm, draf)
    } else if (tahap === 'review') {
      renderLangkahReview(wadahLangkah, ukm, draf)
    }
  } catch (err) {
    console.error(err)
    konten.innerHTML = `
      <div class="state">
        <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
        <p>${PESAN.GAGAL_MEMUAT_DATA}</p>
        <button class="tombol tombol--utama" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
      </div>
    `
    konten.querySelector('[data-coba-lagi]')?.addEventListener('click', ulang)
  }
}
