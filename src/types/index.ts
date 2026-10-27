/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Peranan = 'admin' | 'jurulatih' | 'ahli';

export type KategoriSilat = 'Tanding' | 'Tunggal' | 'Ganda' | 'Regu' | 'Solo Kreatif';

export type KelasTanding =
  | 'Bebas (Seni / Terbuka)'
  | 'Kelas A (45-50 kg)'
  | 'Kelas B (50-55 kg)'
  | 'Kelas C (55-60 kg)'
  | 'Kelas D (60-65 kg)'
  | 'Kelas E (65-70 kg)'
  | 'Kelas F (70-75 kg)'
  | 'Kelas G (75-80 kg)'
  | 'Kelas H (80-85 kg)'
  | 'Kelas I (85-90 kg)';

export type TahapBengkung =
  | 'Kuning'
  | 'Hijau'
  | 'Biru'
  | 'Coklat'
  | 'Hitam'
  | 'Hitam Pendekar'
  | 'Hitam Jurulatih Kanan'
  | 'Bengkung Merah';

export type StatusPesilat = 'Aktif' | 'Cedera' | 'Rehat' | 'Alumni';

export type StatusKehadiran = 'Hadir' | 'Tidak Hadir' | 'Kebenaran (Cuti)' | 'Kecederaan';

export type Pingat = 'Emas' | 'Perak' | 'Gangsa' | 'Sijil Penghargaan';

export interface Pesilat {
  id: string;
  namaPenuh: string;
  noDaftar: string; // Nombor pendaftaran sintetik unik cth: PS-2026-088
  noKadPengenalanSintetik: string; // Format sintetik cth: 040512-10-XXXX
  jantina: 'Lelaki' | 'Wanita';
  umur: number;
  beratKg: number;
  beratSasaranKg: number;
  tinggiCm: number;
  kategoriUtama: KategoriSilat;
  kelasTanding: KelasTanding;
  tahapBengkung: TahapBengkung;
  status: StatusPesilat;
  negeriAsal: string;
  tarikhDaftar: string;
  rekodPerlawanan: {
    menang: number;
    kalah: number;
    seri: number;
  };
  catatanKesihatan?: string;
  namaWaris?: string;
  noTelWaris?: string;
}

export interface Jurulatih {
  id: string;
  namaPenuh: string;
  noTel: string;
  email: string;
  pengkhususan: 'Olahraga (Tanding)' | 'Seni Silat (Jurus)' | 'Kecergasan & Fizikal' | 'Ketua Jurulatih';
  tahapBengkung: TahapBengkung;
  gredKejurulatihan: 'Kebangsaan Tahap 1' | 'Kebangsaan Tahap 2' | 'Antarabangsa (PERSILAT)';
  status: 'Aktif' | 'Rehat';
  tahunPengalaman: number;
}

export interface SesiLatihan {
  id: string;
  tajuk: string;
  tarikh: string;
  masaMula: string;
  masaTamat: string;
  lokasi: string;
  jurulatihId: string;
  jurulatihNama: string;
  fokusLatihan: string;
  jenisSesi: 'Fizikal & Kardio' | 'Teknik Tanding & Sparring' | 'Kekemasan Jurus Seni' | 'Ujian Timbang Berat';
}

export interface RekodKehadiran {
  id: string;
  sesiLatihanId: string;
  pesilatId: string;
  status: StatusKehadiran;
  catatan?: string;
  tarikhCatat: string;
}

export interface Kejohanan {
  id: string;
  namaKejohanan: string;
  peringkat: 'Daerah' | 'Negeri' | 'Kebangsaan' | 'Antarabangsa';
  tarikhMula: string;
  tarikhTamat: string;
  lokasi: string;
  tarikhTutupDaftar: string;
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
  yuranPenyertaan: number; // RM
  maklumatTambahan?: string;
}

export interface PendaftaranAcara {
  id: string;
  kejohananId: string;
  namaKejohanan: string;
  pesilatId: string;
  namaPesilat: string;
  kategori: KategoriSilat;
  kelas: KelasTanding;
  statusKelulusan: 'Dalam Semakan' | 'Disahkan' | 'Ditolak';
  tarikhDaftar: string;
  catatanPengurus?: string;
}

export interface RekodPencapaian {
  id: string;
  kejohananId: string;
  namaKejohanan: string;
  pesilatId: string;
  namaPesilat: string;
  kategori: string;
  kelas: string;
  pingat: Pingat;
  tahun: number;
  tarikh: string;
  catatan?: string;
}

export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  peranan: Peranan;
  pesilatId?: string; // Jika peranan 'ahli'
  statusAkaun: 'Aktif' | 'Digantung';
  tarikhDaftar: string;
}
