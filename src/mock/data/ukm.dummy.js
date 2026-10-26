/**
 * Data dummy: UKM.
 *
 * [DOKUMEN] MP2 §3.4.1 Gambar Diagram Kelas Utuh, hal. 66-67 — atribut UKM:
 *           idUKM, namaUKM, idKategori, visiMisi, deskripsi, statusPendaftaran,
 *           tanggalBuka, tanggalTutup. Ditambah `statusVerifikasi` [DOKUMEN: KD].
 * [DOKUMEN] AI.md §5 — file ini dibatasi "hanya data untuk sprint ini".
 * [DOKUMEN] UI/UX Wireframe Brief §9 keputusan G2 — nama kategori sesuai screenshot.
 * [DOKUMEN] UI/UX Wireframe Brief §9 keputusan G501: "Data dummy konsisten dengan
 *           tanggal hari ini" — rentang 15-30 Oktober 2026 (hingga 2026-10-30).
 *
 * [USULAN] field `ikon` (Brief §3.4 kartu katalog) dan `emailUKM` (Brief §5 M-02
 *          kartu "Ada pertanyaan?") tidak ada di entitas modul.
 */

import { createUKM } from '../../models/UKM.js'
import { STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'

const PERIODE_DIBUKA = {
  tanggalBuka: '2026-10-15T00:00:00+07:00',
  tanggalTutup: '2026-10-30T23:59:00+07:00',
}

const PERIODE_DITUTUP = {
  tanggalBuka: '2026-10-01T00:00:00+07:00',
  tanggalTutup: '2026-10-20T23:59:00+07:00',
}

const dasar = {
  statusVerifikasi: 'TERVERIFIKASI',
}

/** @type {import('../../models/UKM.js').UKM[]} */
export const UKM_DUMMY = Object.freeze([
  Object.freeze(
    createUKM({
      idUKM: 'UKM-FOTO',
      namaUKM: 'UKM Fotografi',
      idKategori: 'KAT-SENI',
      deskripsi:
        'Belajar menangkap cerita melalui lensa dan karya fotografi.',
      visiMisi:
        'UKM Fotografi adalah ruang belajar dan berkarya bagi mahasiswa yang tertarik pada seni visual. Melalui kelas dasar, berburu foto, pameran, dan dokumentasi kegiatan kampus, kamu dapat mengembangkan teknik sekaligus menemukan sudut pandang baru.',
      emailUKM: 'fotografi@ukm.ub.ac.id',
      ikon: 'i-camera',
      statusPendaftaran: STATUS_PENDAFTARAN.DIBUKA,
      ...dasar,
      ...PERIODE_DIBUKA,
    })
  ),
  Object.freeze(
    createUKM({
      idUKM: 'UKM-BASKET',
      namaUKM: 'UKM Basket',
      idKategori: 'KAT-OLAHRAGA',
      deskripsi: 'Asah kemampuan, kekompakan tim, dan semangat kompetisi.',
      visiMisi:
        'UKM Basket mempertemukan mahasiswa yang senang bermain dan menonton bola basket. Latihan rutin, liga internal, dan pertandingan antar-fakultas menjadi ruang untuk melatih fisik, kerja sama tim, dan sportivitas.',
      emailUKM: 'basket@ukm.ub.ac.id',
      ikon: 'i-basketball',
      statusPendaftaran: STATUS_PENDAFTARAN.DIBUKA,
      ...dasar,
      ...PERIODE_DIBUKA,
    })
  ),
  Object.freeze(
    createUKM({
      idUKM: 'UKM-PADUANSUARA',
      namaUKM: 'UKM Paduan Suara',
      idKategori: 'KAT-SENI',
      deskripsi: 'Satukan suara dan tampil di panggung bersama tim kampus.',
      visiMisi:
        'UKM Paduan Suara melatih vokal, penampilan panggung, dan kekompakan kor. Kegiatan rutin meliputi latihan teknik vokal, rekaman, dan penampilan pada kegiatan universitas serta kompetisi paduan suara nasional.',
      emailUKM: 'paduansuara@ukm.ub.ac.id',
      ikon: 'i-music',
      statusPendaftaran: STATUS_PENDAFTARAN.DIBUKA,
      ...dasar,
      ...PERIODE_DIBUKA,
    })
  ),
  Object.freeze(
    createUKM({
      idUKM: 'UKM-PECINTAALAM',
      namaUKM: 'UKM Pecinta Alam',
      idKategori: 'KAT-ALAM',
      deskripsi: 'Jelajahi alam dan berkontribusi dalam kegiatan konservasi.',
      visiMisi:
        'UKM Pecinta Alam membawa mahasiswa mengenal alam sekaligus menjaganya. Kegiatan meliputi pelatihan dasar pendakian, ekspedisi, penanaman pohon, dan edukasi konservasi bersama komunitas sekitar kampus.',
      emailUKM: 'pecintaalam@ukm.ub.ac.id',
      ikon: 'i-mountain',
      statusPendaftaran: STATUS_PENDAFTARAN.DIBUKA,
      ...dasar,
      ...PERIODE_DIBUKA,
    })
  ),
  Object.freeze(
    createUKM({
      idUKM: 'UKM-TEATER',
      namaUKM: 'UKM Teater',
      idKategori: 'KAT-SENI',
      deskripsi:
        'Kembangkan ekspresi, akting, dan kreativitas di atas panggung.',
      visiMisi:
        'UKM Teater adalah ruang eksplorasi seni pertunjukan bagi mahasiswa. Melalui kelas akting, penulisan naskah, pementasan, dan festival teater kampus, anggota belajar berani tampil dan bercerita.',
      emailUKM: 'teater@ukm.ub.ac.id',
      ikon: 'i-palette',
      statusPendaftaran: STATUS_PENDAFTARAN.DIBUKA,
      ...dasar,
      ...PERIODE_DIBUKA,
    })
  ),
  Object.freeze(
    createUKM({
      idUKM: 'UKM-ROBOTIKA',
      namaUKM: 'UKM Robotika',
      idKategori: 'KAT-TEKNOLOGI',
      deskripsi: 'Rancang inovasi dan ikuti kompetisi robotika bersama tim.',
      visiMisi:
        'UKM Robotika mempertemukan mahasiswa yang gemar merakit dan memprogram. Kegiatan meliputi kelas dasar elektronika, pengembangan prototipe robot, dan persiapan kompetisi robotika nasional maupun internasional.',
      emailUKM: 'robotika@ukm.ub.ac.id',
      ikon: 'i-box',
      statusPendaftaran: STATUS_PENDAFTARAN.DIBUKA,
      ...dasar,
      ...PERIODE_DIBUKA,
    })
  ),
  Object.freeze(
    createUKM({
      idUKM: 'UKM-BADMINTON',
      namaUKM: 'UKM Badminton',
      idKategori: 'KAT-OLAHRAGA',
      deskripsi: 'Latihan rutin dan kompetisi untuk pecinta bulu tangkis.',
      visiMisi:
        'UKM Badminton menghimpun mahasiswa pecinta bulu tangkis. Latihan teknik dasar, sparring antar-divisi, dan turnamen internal menjadi agenda rutin untuk menjaga performa dan sportivitas.',
      emailUKM: 'badminton@ukm.ub.ac.id',
      ikon: 'i-trophy',
      statusPendaftaran: STATUS_PENDAFTARAN.DITUTUP,
      ...dasar,
      ...PERIODE_DITUTUP,
    })
  ),
  Object.freeze(
    createUKM({
      idUKM: 'UKM-DEBAT',
      namaUKM: 'UKM Debat',
      idKategori: 'KAT-PENALARAN',
      deskripsi: 'Latih berpikir kritis dan menyampaikan argumen yang kuat.',
      visiMisi:
        'UKM Debat melatih kemampuan berpikir kritis, menyusun argumen, dan berbicara di depan umum. Anggota berlatih debat parlementer dan bahasa Inggris, serta mengikuti kejuaraan debat antar-kampus.',
      emailUKM: 'debat@ukm.ub.ac.id',
      ikon: 'i-messages-square',
      statusPendaftaran: STATUS_PENDAFTARAN.DITUTUP,
      ...dasar,
      ...PERIODE_DITUTUP,
    })
  ),
])
