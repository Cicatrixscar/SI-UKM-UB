/**
 * Peran pengguna.
 *
 * Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 65
 *         entitas Pengguna, atribut `role : String`.
 * Sumber: PRD v0.3 §6.1 — nilai `MAHASISWA` / `ADMIN_UKM`.
 *         PRD v0.3 §3.1 aktor MHS dan ADM.
 */

export const ROLES = Object.freeze({
  MAHASISWA: 'MAHASISWA',
  ADMIN_UKM: 'ADMIN_UKM',
})

export const LABEL_ROLE = Object.freeze({
  [ROLES.MAHASISWA]: 'Mahasiswa',
  [ROLES.ADMIN_UKM]: 'Admin UKM',
})
