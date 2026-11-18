/**
 * Fasad Halaman Masuk (LoginPage).
 *
 * Refaktor Atomicity / Single Responsibility Principle (SRP):
 * Halaman masuk yang sebelumnya monolitik (585 baris) telah dipisahkan menjadi
 * komponen-komponen independen dengan rute masing-masing:
 * 1. `PilihPeranPage.js`        -> Rute `#/`
 * 2. `LoginMahasiswaPage.js`    -> Rute `#/masuk`
 * 3. `DaftarMahasiswaPage.js`   -> Rute `#/daftar`
 * 4. `VerifikasiOtpPage.js`     -> Rute `#/daftar/otp`
 *
 * File ini meneruskan render ke `PilihPeranPage` untuk menjaga kompatibilitas impor lama.
 */

export { render } from './PilihPeranPage.js'
