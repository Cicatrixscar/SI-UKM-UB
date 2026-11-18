/**
 * State sementara untuk alur pendaftaran dan verifikasi OTP.
 * Menyimpan data pendaftaran di memori & sessionStorage agar tidak hilang
 * saat navigasi antar halaman (#/daftar -> #/daftar/otp -> #/masuk).
 */

const KUNCI_STORAGE = 'si_ukm_daftar_temp'
const KUNCI_PESAN = 'si_ukm_login_sukses'

let dataPendaftaran = null

export function simpanDataPendaftaranSementara(data) {
  dataPendaftaran = data
  try {
    sessionStorage.setItem(KUNCI_STORAGE, JSON.stringify(data))
  } catch (err) {
    console.warn('Gagal menyimpan ke sessionStorage:', err)
  }
}

export function ambilDataPendaftaranSementara() {
  if (dataPendaftaran) return dataPendaftaran
  try {
    const raw = sessionStorage.getItem(KUNCI_STORAGE)
    if (raw) {
      dataPendaftaran = JSON.parse(raw)
      return dataPendaftaran
    }
  } catch (err) {
    console.warn('Gagal membaca dari sessionStorage:', err)
  }
  return null
}

export function bersihkanDataPendaftaranSementara() {
  dataPendaftaran = null
  try {
    sessionStorage.removeItem(KUNCI_STORAGE)
  } catch (err) {
    // abaikan
  }
}

export function setPesanSuksesLogin(pesan) {
  try {
    sessionStorage.setItem(KUNCI_PESAN, pesan)
  } catch (err) {
    // abaikan
  }
}

export function ambilDanHapusPesanSuksesLogin() {
  try {
    const pesan = sessionStorage.getItem(KUNCI_PESAN) || ''
    sessionStorage.removeItem(KUNCI_PESAN)
    return pesan
  } catch (err) {
    return ''
  }
}
