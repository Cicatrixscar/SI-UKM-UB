/**
 * Data dummy: Pengguna (login mock).
 *
 * [DOKUMEN] MP2 §3.4.1 Gambar Diagram Kelas Utuh, hal. 65 — Pengguna:
 *           idUser, nama, email, password, role.
 *           Mahasiswa (hal. 65-66): nim, nomorTelepon, programStudi, fakultas.
 * [DOKUMEN] PRD v0.3 §5.2 (data dummy): "Nama dan NIM fiktif. Pola NIM boleh
 *           mengikuti dokumen (contoh `255150400111024`)."
 * [DOKUMEN] AI.md §9: "Jangan menyimpan password asli. Gunakan `dummy-password`."
 * [DOKUMEN] AI.md §5 — file ini dibatasi "hanya data untuk sprint ini".
 *
 * NIM fiktif, bukan data nyata.
 */

import { createMahasiswa } from '../../models/Mahasiswa.js'
import { ROLES } from '../../enums/roles.js'

/** @type {import('../../models/Mahasiswa.js').Mahasiswa[]} */
export const PENGGUNA_DUMMY = Object.freeze([
  Object.freeze(
    createMahasiswa({
      idUser: 'USR-001',
      nama: 'Rusdi',
      email: 'rusdi@student.ub.ac.id',
      password: 'dummy-password',
      role: ROLES.MAHASISWA,
      nim: '225150400111024',
      nomorTelepon: '081234567890',
      programStudi: 'Teknik Informatika',
      fakultas: 'Fakultas Teknik',
    })
  ),
  Object.freeze(
    createMahasiswa({
      idUser: 'USR-002',
      nama: 'Ayu Larasati',
      email: 'ayu@student.ub.ac.id',
      password: 'dummy-password',
      role: ROLES.MAHASISWA,
      nim: '225150400111037',
      nomorTelepon: '081298765432',
      programStudi: 'Manajemen',
      fakultas: 'Fakultas Ekonomi dan Bisnis',
    })
  ),
])
