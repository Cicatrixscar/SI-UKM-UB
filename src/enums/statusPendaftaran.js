/**
 * Status pendaftaran UKM — dipakai field `UKM.statusPendaftaran`.
 *
 * Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 67
 *         entitas UKM, atribut `statusPendaftaran : String`.
 * Sumber: PRD v0.3 §6.4 — nilai `DIBUKA` / `DITUTUP`.
 */

export const STATUS_PENDAFTARAN = Object.freeze({
  DIBUKA: 'DIBUKA',
  DITUTUP: 'DITUTUP',
})

export const LABEL_STATUS_PENDAFTARAN = Object.freeze({
  [STATUS_PENDAFTARAN.DIBUKA]: 'Pendaftaran Dibuka',
  [STATUS_PENDAFTARAN.DITUTUP]: 'Pendaftaran Ditutup',
})

export function adalahDibuka(status) {
  return status === STATUS_PENDAFTARAN.DIBUKA
}
