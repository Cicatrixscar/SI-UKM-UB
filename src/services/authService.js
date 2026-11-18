/**
 * Barrel re-export untuk modul autentikasi dan registrasi.
 *
 * Memisahkan tanggung jawab (Atomicity / SRP):
 * - Logika Login & Sesi: `services/loginService.js`
 * - Logika Pendaftaran & OTP: `services/registrasiService.js`
 *
 * File ini tetap dipertahankan sebagai fasad (Facade / Barrel) agar kompatibel
 * dengan spesifikasi PRD v0.3 §7.1 dan impor modul yang sudah ada.
 */

export * from './loginService.js'
export * from './registrasiService.js'
