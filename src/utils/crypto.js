/**
 * Utilitas Kriptografi Kata Sandi.
 * Menggunakan Web Crypto API (SHA-512 dengan Cryptographic Salting).
 * Standar keamanan modern 512-bit (anti-collision, anti-rainbow table).
 */

const SALT_APLIKASI = 'SI_UKM_UB_2026_SECURITY_SALT_SHA512_STRONG'

/**
 * Menghasilkan hash SHA-512 dalam bentuk 128 karakter heksadesimal.
 * @param {string} password - Kata sandi teks polos.
 * @param {string} [saltUnik=''] - Salt tambahan (misalnya alamat email pengguna).
 * @returns {Promise<string>} String heksadesimal 128 karakter.
 */
export async function hashPassword(password, saltUnik = '') {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password wajib berupa teks dan tidak boleh kosong')
  }

  const saltBersih = String(saltUnik ?? '').trim().toLowerCase()
  const payload = `${SALT_APLIKASI}:${saltBersih}:${password}`

  const encoder = new TextEncoder()
  const data = encoder.encode(payload)

  const buffer = await crypto.subtle.digest('SHA-512', data)
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Memverifikasi apakah kata sandi input cocok dengan hash yang tersimpan.
 * @param {string} passwordInput - Kata sandi yang dimasukkan pengguna saat login.
 * @param {string} hashTersimpan - Hash 128 karakter yang tersimpan di database.
 * @param {string} [saltUnik=''] - Salt tambahan yang sama (email).
 * @returns {Promise<boolean>}
 */
export async function verifikasiPassword(passwordInput, hashTersimpan, saltUnik = '') {
  if (!passwordInput || !hashTersimpan) return false
  try {
    const hashHitung = await hashPassword(passwordInput, saltUnik)
    return hashHitung === hashTersimpan
  } catch {
    return false
  }
}
