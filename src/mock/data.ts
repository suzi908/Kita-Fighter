/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Pesilat,
  Jurulatih,
  SesiLatihan,
  Kejohanan,
  PendaftaranAcara,
  RekodPencapaian,
  Pengguna,
  RekodKehadiran
} from '../types';

export const INITIAL_PESILAT: Pesilat[] = [
  {
    id: 'pslt-001',
    namaPenuh: 'Muhammad Danial bin Razak',
    noDaftar: 'PS-2024-001',
    noKadPengenalanSintetik: '040512-10-8811',
    jantina: 'Lelaki',
    umur: 22,
    beratKg: 54.2,
    beratSasaranKg: 54.0,
    tinggiCm: 173,
    kategoriUtama: 'Tanding',
    kelasTanding: 'Kelas B (50-55 kg)',
    tahapBengkung: 'Coklat',
    status: 'Aktif',
    negeriAsal: 'Selangor',
    tarikhDaftar: '2023-01-15',
    rekodPerlawanan: { menang: 14, kalah: 3, seri: 0 },
    catatanKesihatan: 'Tiada alahan. Kecederaan otot hamstring sembuh sepenuhnya (Dis 2025).',
    namaWaris: 'Razak bin Mahmud (Bapa)',
    noTelWaris: '+6012-398-1122'
  },
  {
    id: 'pslt-002',
    namaPenuh: 'Nurul Hidayah binti Azman',
    noDaftar: 'PS-2023-018',
    noKadPengenalanSintetik: '050823-14-7220',
    jantina: 'Wanita',
    umur: 21,
    beratKg: 48.6,
    beratSasaranKg: 49.0,
    tinggiCm: 164,
    kategoriUtama: 'Tunggal',
    kelasTanding: 'Bebas (Seni / Terbuka)',
    tahapBengkung: 'Hitam',
    status: 'Aktif',
    negeriAsal: 'Perak',
    tarikhDaftar: '2022-06-10',
    rekodPerlawanan: { menang: 18, kalah: 2, seri: 0 },
    catatanKesihatan: 'Keadaan fizikal optima. Rekod timbangan konsisten.',
    namaWaris: 'Azman bin Sulaiman (Bapa)',
    noTelWaris: '+6019-445-8833'
  },
  {
    id: 'pslt-003',
    namaPenuh: 'Muhammad Firdaus bin Mokhtar',
    noDaftar: 'PS-2024-045',
    noKadPengenalanSintetik: '031102-08-5431',
    jantina: 'Lelaki',
    umur: 23,
    beratKg: 64.1,
    beratSasaranKg: 63.5,
    tinggiCm: 179,
    kategoriUtama: 'Tanding',
    kelasTanding: 'Kelas D (60-65 kg)',
    tahapBengkung: 'Biru',
    status: 'Cedera',
    negeriAsal: 'Kedah',
    tarikhDaftar: '2023-03-20',
    rekodPerlawanan: { menang: 9, kalah: 5, seri: 0 },
    catatanKesihatan: 'Terseliuh buku lali kiri semasa sparring. Sedang menjalani fisioterapi ISN.',
    namaWaris: 'Mokhtar bin Harun (Bapa)',
    noTelWaris: '+6013-772-9011'
  },
  {
    id: 'pslt-004',
    namaPenuh: 'Siti Aminah binti Zulkharnain',
    noDaftar: 'PS-2024-062',
    noKadPengenalanSintetik: '060218-01-9042',
    jantina: 'Wanita',
    umur: 20,
    beratKg: 52.3,
    beratSasaranKg: 52.0,
    tinggiCm: 161,
    kategoriUtama: 'Ganda',
    kelasTanding: 'Bebas (Seni / Terbuka)',
    tahapBengkung: 'Hijau',
    status: 'Aktif',
    negeriAsal: 'Johor',
    tarikhDaftar: '2024-01-05',
    rekodPerlawanan: { menang: 7, kalah: 2, seri: 0 },
    catatanKesihatan: 'Tahap kecergasan kardio tinggi.',
    namaWaris: 'Zulkharnain bin Daud (Bapa)',
    noTelWaris: '+6017-662-1200'
  },
  {
    id: 'pslt-005',
    namaPenuh: 'Megat Amirul Asyraf bin Megat Khalid',
    noDaftar: 'PS-2023-009',
    noKadPengenalanSintetik: '020715-03-6119',
    jantina: 'Lelaki',
    umur: 24,
    beratKg: 68.8,
    beratSasaranKg: 69.0,
    tinggiCm: 181,
    kategoriUtama: 'Tanding',
    kelasTanding: 'Kelas E (65-70 kg)',
    tahapBengkung: 'Hitam',
    status: 'Aktif',
    negeriAsal: 'Kelantan',
    tarikhDaftar: '2022-02-14',
    rekodPerlawanan: { menang: 21, kalah: 4, seri: 0 },
    catatanKesihatan: 'Kapten Skuad Putra. Kecergasan puncak.',
    namaWaris: 'Megat Khalid (Bapa)',
    noTelWaris: '+6011-282-9901'
  },
  {
    id: 'pslt-006',
    namaPenuh: 'Wan Zulaikha binti Wan Baharuddin',
    noDaftar: 'PS-2024-080',
    noKadPengenalanSintetik: '051201-02-3342',
    jantina: 'Wanita',
    umur: 21,
    beratKg: 58.4,
    beratSasaranKg: 58.0,
    tinggiCm: 168,
    kategoriUtama: 'Tanding',
    kelasTanding: 'Kelas C (55-60 kg)',
    tahapBengkung: 'Biru',
    status: 'Aktif',
    negeriAsal: 'Kedah',
    tarikhDaftar: '2024-02-18',
    rekodPerlawanan: { menang: 6, kalah: 3, seri: 0 },
    catatanKesihatan: 'Prestasi elakan sangat tangkas.',
    namaWaris: 'Wan Baharuddin (Bapa)',
    noTelWaris: '+6014-902-1833'
  }
];

export const INITIAL_JURULATIH: Jurulatih[] = [
  {
    id: 'jrl-01',
    namaPenuh: 'Cikgu Mohd Shahrul Nizam bin Kassim',
    noTel: '+6012-345-6789',
    email: 'shahrul.silat@gmail.com',
    pengkhususan: 'Olahraga (Tanding)',
    tahapBengkung: 'Hitam Jurulatih Kanan',
    gredKejurulatihan: 'Kebangsaan Tahap 2',
    status: 'Aktif',
    tahunPengalaman: 12
  },
  {
    id: 'jrl-02',
    namaPenuh: 'Pendekar Wan Ismail bin Wan Ahmad',
    noTel: '+6019-876-5432',
    email: 'wan.ismail@gmail.com',
    pengkhususan: 'Seni Silat (Jurus)',
    tahapBengkung: 'Bengkung Merah',
    gredKejurulatihan: 'Antarabangsa (PERSILAT)',
    status: 'Aktif',
    tahunPengalaman: 26
  },
  {
    id: 'jrl-03',
    namaPenuh: 'Puan Siti Norzafirah binti Idris',
    noTel: '+6017-554-3210',
    email: 'zafirah.conditioning@gmail.com',
    pengkhususan: 'Kecergasan & Fizikal',
    tahapBengkung: 'Hitam',
    gredKejurulatihan: 'Kebangsaan Tahap 1',
    status: 'Aktif',
    tahunPengalaman: 8
  }
];

export const INITIAL_JADUAL: SesiLatihan[] = [
  {
    id: 'sesi-1',
    tajuk: 'Ketangkasan Tendangan Sabit & Elakan Sasaran',
    tarikh: '2026-10-28',
    masaMula: '17:00',
    masaTamat: '19:00',
    lokasi: 'Gelanggang Utama MSN Bukit Jalil',
    jurulatihId: 'jrl-01',
    jurulatihNama: 'Cikgu Mohd Shahrul Nizam',
    fokusLatihan: 'Drill jatuhan pantas, serangan balas garisan 3 mata dan koordinasi gelanggang.',
    jenisSesi: 'Teknik Tanding & Sparring'
  },
  {
    id: 'sesi-2',
    tajuk: 'Pemantapan Pola Jurus Tunggal & Senjata Golok/Tongkat',
    tarikh: '2026-10-29',
    masaMula: '20:30',
    masaTamat: '22:30',
    lokasi: 'Pusat Latihan Seni Silat Kompleks Sukan Negara',
    jurulatihId: 'jrl-02',
    jurulatihNama: 'Pendekar Wan Ismail',
    fokusLatihan: 'Ketepatan ritma langkah, kelantangan suara tempur dan kestabilan kuda-kuda.',
    jenisSesi: 'Kekemasan Jurus Seni'
  },
  {
    id: 'sesi-3',
    tajuk: 'Kondisi Fizikal & Timbang Berat Pra-Kejohanan',
    tarikh: '2026-10-31',
    masaMula: '08:00',
    masaTamat: '10:30',
    lokasi: 'Gimnasium Prestasi Tinggi Institut Sukan Negara',
    jurulatihId: 'jrl-03',
    jurulatihNama: 'Puan Siti Norzafirah',
    fokusLatihan: 'Latihan litar HIIT, daya tahan anaerobik dan timbangan berat rasmi.',
    jenisSesi: 'Ujian Timbang Berat'
  },
  {
    id: 'sesi-4',
    tajuk: 'Simulasi Perlawanan Tertutup & Taktikal Pengadil',
    tarikh: '2026-11-03',
    masaMula: '16:30',
    masaTamat: '19:00',
    lokasi: 'Dewan Gelanggang Silat Hang Jebat',
    jurulatihId: 'jrl-01',
    jurulatihNama: 'Cikgu Mohd Shahrul Nizam',
    fokusLatihan: 'Simulasi 3 pusingan mengikut peraturan terkini PERSILAT dengan scoring digital.',
    jenisSesi: 'Teknik Tanding & Sparring'
  }
];

export const INITIAL_KEJOHANAN: Kejohanan[] = [
  {
    id: 'kjh-01',
    namaKejohanan: 'Kejohanan Silat Kebangsaan Terbuka Malaysia 2026',
    peringkat: 'Kebangsaan',
    tarikhMula: '2026-11-18',
    tarikhTamat: '2026-11-23',
    lokasi: 'Stadium Titiwangsa, Kuala Lumpur',
    tarikhTutupDaftar: '2026-11-05',
    status: 'Akan Datang',
    yuranPenyertaan: 120,
    maklumatTambahan: 'Kategori Senior Tanding dan Seni Baku di bawah naungan PESAKA.'
  },
  {
    id: 'kjh-02',
    namaKejohanan: 'Sukan Malaysia (SUKMA) 2026 - Acara Silat',
    peringkat: 'Negeri',
    tarikhMula: '2026-12-08',
    tarikhTamat: '2026-12-14',
    lokasi: 'Kompleks Sukan Negeri, Kota Bharu',
    tarikhTutupDaftar: '2026-11-20',
    status: 'Akan Datang',
    yuranPenyertaan: 0,
    maklumatTambahan: 'Pemilihan kontinjen akhir negeri bagi memburu pingat emas bertaraf kebangsaan.'
  },
  {
    id: 'kjh-03',
    namaKejohanan: 'Kejohanan Silat Jemputan Antarabangsa Melaka',
    peringkat: 'Antarabangsa',
    tarikhMula: '2027-01-14',
    tarikhTamat: '2027-01-19',
    lokasi: 'Pusat Dagangan Antarabangsa Melaka (MITC)',
    tarikhTutupDaftar: '2026-12-15',
    status: 'Akan Datang',
    yuranPenyertaan: 250,
    maklumatTambahan: 'Penyertaan pasukan dari Indonesia, Singapura, Thailand, Brunei dan Vietnam.'
  }
];

export const INITIAL_PENDAFTARAN: PendaftaranAcara[] = [
  {
    id: 'pdft-001',
    kejohananId: 'kjh-01',
    namaKejohanan: 'Kejohanan Silat Kebangsaan Terbuka Malaysia 2026',
    pesilatId: 'pslt-001',
    namaPesilat: 'Muhammad Danial bin Razak',
    kategori: 'Tanding',
    kelas: 'Kelas B (50-55 kg)',
    statusKelulusan: 'Disahkan',
    tarikhDaftar: '2026-10-18',
    catatanPengurus: 'Lulus timbangan pra-pendaftaran. Borang perubatan lengkap.'
  },
  {
    id: 'pdft-002',
    kejohananId: 'kjh-01',
    namaKejohanan: 'Kejohanan Silat Kebangsaan Terbuka Malaysia 2026',
    pesilatId: 'pslt-002',
    namaPesilat: 'Nurul Hidayah binti Azman',
    kategori: 'Tunggal',
    kelas: 'Bebas (Seni / Terbuka)',
    statusKelulusan: 'Disahkan',
    tarikhDaftar: '2026-10-19',
    catatanPengurus: 'Kaset muzik seni baku telah disahkan oleh komiti teknikal.'
  },
  {
    id: 'pdft-003',
    kejohananId: 'kjh-01',
    namaKejohanan: 'Kejohanan Silat Kebangsaan Terbuka Malaysia 2026',
    pesilatId: 'pslt-005',
    namaPesilat: 'Megat Amirul Asyraf bin Megat Khalid',
    kategori: 'Tanding',
    kelas: 'Kelas E (65-70 kg)',
    statusKelulusan: 'Dalam Semakan',
    tarikhDaftar: '2026-10-22',
    catatanPengurus: 'Menunggu pengesahan pelepasan majikan/universiti.'
  },
  {
    id: 'pdft-004',
    kejohananId: 'kjh-02',
    namaKejohanan: 'Sukan Malaysia (SUKMA) 2026 - Acara Silat',
    pesilatId: 'pslt-004',
    namaPesilat: 'Siti Aminah binti Zulkharnain',
    kategori: 'Ganda',
    kelas: 'Bebas (Seni / Terbuka)',
    statusKelulusan: 'Dalam Semakan',
    tarikhDaftar: '2026-10-25'
  }
];

export const INITIAL_PENCAPAIAN: RekodPencapaian[] = [
  {
    id: 'pcp-001',
    kejohananId: 'kjh-hist-01',
    namaKejohanan: 'Kejohanan Silat Kebangsaan Sirkit 2 2025',
    pesilatId: 'pslt-001',
    namaPesilat: 'Muhammad Danial bin Razak',
    kategori: 'Tanding Putra',
    kelas: 'Kelas B (50-55 kg)',
    pingat: 'Emas',
    tahun: 2025,
    tarikh: '2025-09-14',
    catatan: 'Menewaskan wakil Terengganu dengan jatuhan mutlak di pusingan ke-3.'
  },
  {
    id: 'pcp-002',
    kejohananId: 'kjh-hist-01',
    namaKejohanan: 'Kejohanan Silat Kebangsaan Sirkit 2 2025',
    pesilatId: 'pslt-002',
    namaPesilat: 'Nurul Hidayah binti Azman',
    kategori: 'Seni Tunggal Putri',
    kelas: 'Bebas',
    pingat: 'Perak',
    tahun: 2025,
    tarikh: '2025-09-15',
    catatan: 'Mata juri: 9.940 berbanding 9.955 pemenang emas.'
  },
  {
    id: 'pcp-003',
    kejohananId: 'kjh-hist-02',
    namaKejohanan: 'Piala Timbalan Perdana Menteri 2025',
    pesilatId: 'pslt-005',
    namaPesilat: 'Megat Amirul Asyraf bin Megat Khalid',
    kategori: 'Tanding Putra',
    kelas: 'Kelas E (65-70 kg)',
    pingat: 'Emas',
    tahun: 2025,
    tarikh: '2025-05-22',
    catatan: 'Dinobatkan sebagai Pesilat Terbaik Lelaki Kejohanan.'
  },
  {
    id: 'pcp-004',
    kejohananId: 'kjh-hist-02',
    namaKejohanan: 'Piala Timbalan Perdana Menteri 2025',
    pesilatId: 'pslt-004',
    namaPesilat: 'Siti Aminah binti Zulkharnain',
    kategori: 'Seni Ganda Putri',
    kelas: 'Bebas',
    pingat: 'Gangsa',
    tahun: 2025,
    tarikh: '2025-05-23',
    catatan: 'Persembahan senjata tajam cemerlang di pentas separuh akhir.'
  }
];

export const INITIAL_KEHADIRAN: RekodKehadiran[] = [
  { id: 'khd-01', sesiLatihanId: 'sesi-1', pesilatId: 'pslt-001', status: 'Hadir', tarikhCatat: '2026-10-28' },
  { id: 'khd-02', sesiLatihanId: 'sesi-1', pesilatId: 'pslt-002', status: 'Hadir', tarikhCatat: '2026-10-28' },
  { id: 'khd-03', sesiLatihanId: 'sesi-1', pesilatId: 'pslt-003', status: 'Kecederaan', catatan: 'Rawatan fisioterapi', tarikhCatat: '2026-10-28' },
  { id: 'khd-04', sesiLatihanId: 'sesi-1', pesilatId: 'pslt-004', status: 'Hadir', tarikhCatat: '2026-10-28' },
  { id: 'khd-05', sesiLatihanId: 'sesi-1', pesilatId: 'pslt-005', status: 'Hadir', tarikhCatat: '2026-10-28' },
  { id: 'khd-06', sesiLatihanId: 'sesi-1', pesilatId: 'pslt-006', status: 'Kebenaran (Cuti)', catatan: 'Peperiksaan akhir semester', tarikhCatat: '2026-10-28' }
];

export const INITIAL_PENGGUNA: Pengguna[] = [
  {
    id: 'usr-001',
    nama: 'Haji Ahmad Tarmizi bin Daud',
    email: 'admin@silatmelayu.org.my',
    peranan: 'admin',
    statusAkaun: 'Aktif',
    tarikhDaftar: '2022-01-10'
  },
  {
    id: 'usr-002',
    nama: 'Cikgu Mohd Shahrul Nizam',
    email: 'shahrul.silat@gmail.com',
    peranan: 'jurulatih',
    statusAkaun: 'Aktif',
    tarikhDaftar: '2022-03-15'
  },
  {
    id: 'usr-003',
    nama: 'Pendekar Wan Ismail bin Wan Ahmad',
    email: 'wan.ismail@gmail.com',
    peranan: 'jurulatih',
    statusAkaun: 'Aktif',
    tarikhDaftar: '2022-03-20'
  },
  {
    id: 'usr-004',
    nama: 'Muhammad Danial bin Razak',
    email: 'danial.razak@pesilat.my',
    peranan: 'ahli',
    pesilatId: 'pslt-001',
    statusAkaun: 'Aktif',
    tarikhDaftar: '2023-01-15'
  },
  {
    id: 'usr-005',
    nama: 'Nurul Hidayah binti Azman',
    email: 'nurul.hidayah@pesilat.my',
    peranan: 'ahli',
    pesilatId: 'pslt-002',
    statusAkaun: 'Aktif',
    tarikhDaftar: '2022-06-10'
  }
];
