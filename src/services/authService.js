/**
 * Service: autentikasi.
 *
 * [DOKUMEN] PRD v0.3 §7.1 authService:
 *           | login(email, pass) | String, String | `{ berhasil, user, pesan }` |
 *           | logout() | — | void |
 * [DOKUMEN] AI.md §4: "Halaman tidak boleh import mock langsung" — pilih mock
 *           atau http lewat `config.USE_MOCK`.
 * [DOKUMEN] AI.md §9: "Jangan mengubah nama method, halaman, atau service dari PRD."
 */

import { config } from '../config.js'
import { mockLogin, mockLogout, mockLoginSebagaiMahasiswa } from '../mock/authMock.js'

/** @returns {Promise<{berhasil: boolean, user: object|null, pesan: string}>} */
export async function login(email, pass) {
  return mockLogin(email, pass)
}

/** @returns {Promise<void>} */
export async function logout() {
  return mockLogout()
}

/**
 * Login mock tanpa kredensial (tombol cepat mode mock).
 * [USULAN] UI/UX Wireframe Brief §10 M-02: "Di layar ini pilih role untuk mode mock."
 */
export async function loginSebagaiMahasiswa() {
  return mockLoginSebagaiMahasiswa()
}

/** [DOKUMEN] AI.md §4 — config dipakai pihak service, bukan halaman. */
export const authServiceConfig = config
