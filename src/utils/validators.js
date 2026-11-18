/**
 * Barrel re-export untuk fungsi validasi.
 *
 * Memisahkan tanggung jawab (Atomicity / SRP):
 * - Validator Dasar: `utils/validatorDasar.js` (validasiWajib)
 * - Validator Autentikasi: `utils/validatorAuth.js` (email, password)
 * - Validator Form: `utils/validatorForm.js` (NIM, alasan, data diri)
 * - Validator Berkas: `utils/validatorBerkas.js` (format & ukuran PDF/JPEG)
 *
 * File ini bertindak sebagai fasad (Facade / Barrel) agar kompatibel
 * dengan semua kode dan unit test yang telah ada.
 */

export * from './validatorDasar.js'
export * from './validatorAuth.js'
export * from './validatorForm.js'
export * from './validatorBerkas.js'
