/**
 * Status seleksi pendaftaran.
 * Sumber: KD hal. 1, PRD v0.3 §6.5.
 */

export const STATUS_SELEKSI = Object.freeze({
  PENDING: 'PENDING',
  DITERIMA: 'DITERIMA',
  DITOLAK: 'DITOLAK',
})

export const LABEL_STATUS_SELEKSI = Object.freeze({
  [STATUS_SELEKSI.PENDING]: 'MENUNGGU PENGUMUMAN',
  [STATUS_SELEKSI.DITERIMA]: 'DITERIMA',
  [STATUS_SELEKSI.DITOLAK]: 'DITOLAK',
})
