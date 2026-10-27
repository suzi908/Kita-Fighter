/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  Pesilat,
  Jurulatih,
  SesiLatihan,
  Kejohanan,
  PendaftaranAcara,
  RekodPencapaian,
  RekodKehadiran,
  Pengguna,
  Peranan
} from '../types';

import {
  INITIAL_PESILAT,
  INITIAL_JURULATIH,
  INITIAL_JADUAL,
  INITIAL_KEJOHANAN,
  INITIAL_PENDAFTARAN,
  INITIAL_PENCAPAIAN,
  INITIAL_KEHADIRAN,
  INITIAL_PENGGUNA
} from '../mock/data';

// Helper pemetaan ralat Supabase / RLS
export function formatSupabaseError(error: any): string {
  if (!error) return 'Ralat tidak diketahui';
  if (
    error.code === '42501' ||
    error.message?.toLowerCase().includes('row-level security') ||
    error.message?.toLowerCase().includes('permission denied')
  ) {
    return 'Sekatan RLS: Akaun anda tidak mempunyai kebenaran keselamatan untuk tindakan ini (Kebenaran terhad kepada Admin/Jurulatih).';
  }
  if (error.code === '23505') {
    return 'Ralat Duplikasi: Rekod dengan nombor pendaftaran atau kunci unik ini sudah wujud.';
  }
  if (error.code === '42P01' || error.code === 'PGRST205') {
    return 'Jadual pangkalan data belum dicipta dalam Supabase. Sila jalankan skrip DDL SQL.';
  }
  return error.message || 'Ralat komunikasi pangkalan data.';
}

// ==============================================================================
// 1. PENGURUSAN PESILAT
// ==============================================================================

function mapDbToPesilat(row: any): Pesilat {
  return {
    id: row.id,
    namaPenuh: row.nama_penuh,
    noDaftar: row.no_daftar || `PS-${row.id.slice(0, 4)}`,
    noKadPengenalanSintetik: row.no_kad_pengenalan || '000000-00-XXXX',
    jantina: row.jantina || 'Lelaki',
    umur: Number(row.umur) || 20,
    beratKg: Number(row.berat_kg) || 54.0,
    beratSasaranKg: Number(row.berat_sasaran_kg) || 54.0,
    tinggiCm: Number(row.tinggi_cm) || 170,
    kategoriUtama: row.kategori_utama || 'Tanding',
    kelasTanding: row.kelas_tanding || 'Kelas B (50-55 kg)',
    tahapBengkung: row.tahap_bengkung || 'Coklat',
    status: row.status || 'Aktif',
    negeriAsal: row.negeri_asal || 'Malaysia',
    tarikhDaftar: row.created_at ? row.created_at.split('T')[0] : '2026-01-01',
    rekodPerlawanan: { menang: 0, kalah: 0, seri: 0 },
    catatanKesihatan: row.catatan_kesihatan || '',
    namaWaris: row.nama_waris || '',
    noTelWaris: row.no_tel_waris || ''
  };
}

export async function dbFetchPesilat(): Promise<{ data: Pesilat[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_PESILAT, error: null, isLive: false };
  }

  try {
    const { data, error } = await client
      .from('pesilat')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: INITIAL_PESILAT, error: formatSupabaseError(error), isLive: false };
    }

    if (!data || data.length === 0) {
      return { data: INITIAL_PESILAT, error: null, isLive: true };
    }

    return { data: data.map(mapDbToPesilat), error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_PESILAT, error: err.message, isLive: false };
  }
}

export async function dbInsertPesilat(p: Pesilat): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const { error } = await client.from('pesilat').insert({
      nama_penuh: p.namaPenuh,
      no_daftar: p.noDaftar,
      no_kad_pengenalan: p.noKadPengenalanSintetik,
      jantina: p.jantina,
      umur: p.umur,
      berat_kg: p.beratKg,
      berat_sasaran_kg: p.beratSasaranKg,
      tinggi_cm: p.tinggiCm,
      kategori_utama: p.kategoriUtama,
      kelas_tanding: p.kelasTanding,
      tahap_bengkung: p.tahapBengkung,
      status: p.status,
      negeri_asal: p.negeriAsal,
      catatan_kesihatan: p.catatanKesihatan,
      nama_waris: p.namaWaris,
      no_tel_waris: p.noTelWaris
    });

    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

export async function dbUpdatePesilat(p: Pesilat): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const { error } = await client
      .from('pesilat')
      .update({
        nama_penuh: p.namaPenuh,
        berat_kg: p.beratKg,
        berat_sasaran_kg: p.beratSasaranKg,
        tinggi_cm: p.tinggiCm,
        status: p.status,
        kategori_utama: p.kategoriUtama,
        kelas_tanding: p.kelasTanding,
        tahap_bengkung: p.tahapBengkung,
        catatan_kesihatan: p.catatanKesihatan
      })
      .eq('id', p.id);

    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

export async function dbDeletePesilat(id: string): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const { error } = await client.from('pesilat').delete().eq('id', id);
    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

// ==============================================================================
// 2. JADUAL LATIHAN & KEHADIRAN
// ==============================================================================

export async function dbFetchSesiLatihan(): Promise<{ data: SesiLatihan[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_JADUAL, error: null, isLive: false };
  }

  try {
    const { data, error } = await client
      .from('sesi_latihan')
      .select('*, jurulatih:jurulatih_id(nama_penuh)')
      .order('tarikh', { ascending: false });

    if (error) return { data: INITIAL_JADUAL, error: formatSupabaseError(error), isLive: false };
    if (!data || data.length === 0) return { data: INITIAL_JADUAL, error: null, isLive: true };

    const mapped: SesiLatihan[] = data.map((row: any) => ({
      id: row.id,
      tajuk: row.tajuk,
      tarikh: row.tarikh,
      masaMula: row.masa_mula?.slice(0, 5) || '17:00',
      masaTamat: row.masa_tamat?.slice(0, 5) || '19:00',
      lokasi: row.lokasi,
      jurulatihId: row.jurulatih_id || '',
      jurulatihNama: row.jurulatih?.nama_penuh || 'Pegawai Jurulatih',
      fokusLatihan: row.fokus_latihan,
      jenisSesi: row.jenis_sesi || 'Teknik Tanding & Sparring'
    }));

    return { data: mapped, error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_JADUAL, error: err.message, isLive: false };
  }
}

export async function dbInsertSesiLatihan(s: SesiLatihan): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const payload: any = {
      tajuk: s.tajuk,
      tarikh: s.tarikh,
      masa_mula: s.masaMula,
      masa_tamat: s.masaTamat,
      lokasi: s.lokasi,
      fokus_latihan: s.fokusLatihan,
      jenis_sesi: s.jenisSesi
    };
    if (s.jurulatihId && s.jurulatihId.startsWith('jrl-')) {
      // jika mock ID, jangan hantar foreign key UUID melainkan valid
    } else if (s.jurulatihId) {
      payload.jurulatih_id = s.jurulatihId;
    }

    const { error } = await client.from('sesi_latihan').insert(payload);
    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

export async function dbFetchRekodKehadiran(): Promise<{ data: RekodKehadiran[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_KEHADIRAN, error: null, isLive: false };
  }

  try {
    const { data, error } = await client.from('rekod_kehadiran').select('*');
    if (error) return { data: INITIAL_KEHADIRAN, error: formatSupabaseError(error), isLive: false };
    if (!data || data.length === 0) return { data: INITIAL_KEHADIRAN, error: null, isLive: true };

    const mapped: RekodKehadiran[] = data.map((r: any) => ({
      id: r.id,
      sesiLatihanId: r.sesi_latihan_id,
      pesilatId: r.pesilat_id,
      status: r.status,
      catatan: r.catatan,
      tarikhCatat: r.created_at ? r.created_at.split('T')[0] : '2026-10-28'
    }));

    return { data: mapped, error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_KEHADIRAN, error: err.message, isLive: false };
  }
}

export async function dbSaveRekodKehadiran(
  records: RekodKehadiran[]
): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const rows = records.map((r) => ({
      sesi_latihan_id: r.sesiLatihanId,
      pesilat_id: r.pesilatId,
      status: r.status,
      catatan: r.catatan || null
    }));

    const { error } = await client
      .from('rekod_kehadiran')
      .upsert(rows, { onConflict: 'sesi_latihan_id,pesilat_id' });

    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

// ==============================================================================
// 3. KEJOHANAN & PENDAFTARAN ACARA
// ==============================================================================

export async function dbFetchKejohanan(): Promise<{ data: Kejohanan[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_KEJOHANAN, error: null, isLive: false };
  }

  try {
    const { data, error } = await client
      .from('kejohanan')
      .select('*')
      .order('tarikh_mula', { ascending: true });

    if (error) return { data: INITIAL_KEJOHANAN, error: formatSupabaseError(error), isLive: false };
    if (!data || data.length === 0) return { data: INITIAL_KEJOHANAN, error: null, isLive: true };

    const mapped: Kejohanan[] = data.map((k: any) => ({
      id: k.id,
      namaKejohanan: k.nama_kejohanan,
      peringkat: k.peringkat,
      tarikhMula: k.tarikh_mula,
      tarikhTamat: k.tarikh_tamat,
      lokasi: k.lokasi,
      tarikhTutupDaftar: k.tarikh_tutup_daftar,
      status: k.status,
      yuranPenyertaan: Number(k.yuran_penyertaan) || 0,
      maklumatTambahan: k.maklumat_tambahan
    }));

    return { data: mapped, error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_KEJOHANAN, error: err.message, isLive: false };
  }
}

export async function dbFetchPendaftaran(): Promise<{ data: PendaftaranAcara[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_PENDAFTARAN, error: null, isLive: false };
  }

  try {
    const { data, error } = await client
      .from('pendaftaran_kejohanan')
      .select('*, kejohanan:kejohanan_id(nama_kejohanan), pesilat:pesilat_id(nama_penuh)')
      .order('created_at', { ascending: false });

    if (error) return { data: INITIAL_PENDAFTARAN, error: formatSupabaseError(error), isLive: false };
    if (!data || data.length === 0) return { data: INITIAL_PENDAFTARAN, error: null, isLive: true };

    const mapped: PendaftaranAcara[] = data.map((r: any) => ({
      id: r.id,
      kejohananId: r.kejohanan_id,
      namaKejohanan: r.kejohanan?.nama_kejohanan || 'Kejohanan Silat',
      pesilatId: r.pesilat_id,
      namaPesilat: r.pesilat?.nama_penuh || 'Pesilat Skuad',
      kategori: r.kategori,
      kelas: r.kelas,
      statusKelulusan: r.status_kelulusan,
      tarikhDaftar: r.created_at ? r.created_at.split('T')[0] : '2026-10-20',
      catatanPengurus: r.catatan_pengurus
    }));

    return { data: mapped, error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_PENDAFTARAN, error: err.message, isLive: false };
  }
}

export async function dbInsertPendaftaran(p: PendaftaranAcara): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const { error } = await client.from('pendaftaran_kejohanan').insert({
      kejohanan_id: p.kejohananId,
      pesilat_id: p.pesilatId,
      kategori: p.kategori,
      kelas: p.kelas,
      status_kelulusan: p.statusKelulusan,
      catatan_pengurus: p.catatanPengurus
    });

    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

export async function dbUpdateStatusPendaftaran(
  id: string,
  status: 'Disahkan' | 'Dalam Semakan' | 'Ditolak'
): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const { error } = await client
      .from('pendaftaran_kejohanan')
      .update({ status_kelulusan: status })
      .eq('id', id);

    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

// ==============================================================================
// 4. REKOD PENCAPAIAN & PINGAT
// ==============================================================================

export async function dbFetchPencapaian(): Promise<{ data: RekodPencapaian[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_PENCAPAIAN, error: null, isLive: false };
  }

  try {
    const { data, error } = await client
      .from('rekod_pencapaian')
      .select('*, pesilat:pesilat_id(nama_penuh), kejohanan:kejohanan_id(nama_kejohanan)')
      .order('tahun', { ascending: false });

    if (error) return { data: INITIAL_PENCAPAIAN, error: formatSupabaseError(error), isLive: false };
    if (!data || data.length === 0) return { data: INITIAL_PENCAPAIAN, error: null, isLive: true };

    const mapped: RekodPencapaian[] = data.map((r: any) => ({
      id: r.id,
      kejohananId: r.kejohanan_id || '',
      namaKejohanan: r.kejohanan?.nama_kejohanan || r.catatan || 'Kejohanan Silat',
      pesilatId: r.pesilat_id,
      namaPesilat: r.pesilat?.nama_penuh || 'Pesilat Skuad',
      kategori: r.kategori,
      kelas: r.kelas,
      pingat: r.pingat,
      tahun: Number(r.tahun),
      tarikh: r.tarikh,
      catatan: r.catatan
    }));

    return { data: mapped, error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_PENCAPAIAN, error: err.message, isLive: false };
  }
}

export async function dbInsertPencapaian(p: RekodPencapaian): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const payload: any = {
      pesilat_id: p.pesilatId,
      kategori: p.kategori,
      kelas: p.kelas,
      pingat: p.pingat,
      tahun: p.tahun,
      tarikh: p.tarikh,
      catatan: p.catatan || p.namaKejohanan
    };
    if (p.kejohananId && !p.kejohananId.startsWith('kjh-')) {
      payload.kejohanan_id = p.kejohananId;
    }

    const { error } = await client.from('rekod_pencapaian').insert(payload);
    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

// ==============================================================================
// 5. JURULATIH
// ==============================================================================

export async function dbFetchJurulatih(): Promise<{ data: Jurulatih[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_JURULATIH, error: null, isLive: false };
  }

  try {
    const { data, error } = await client.from('jurulatih').select('*');
    if (error) return { data: INITIAL_JURULATIH, error: formatSupabaseError(error), isLive: false };
    if (!data || data.length === 0) return { data: INITIAL_JURULATIH, error: null, isLive: true };

    const mapped: Jurulatih[] = data.map((j: any) => ({
      id: j.id,
      namaPenuh: j.nama_penuh,
      noTel: j.no_tel,
      email: j.email,
      pengkhususan: j.pengkhususan,
      tahapBengkung: j.tahap_bengkung,
      gredKejurulatihan: j.gred_kejurulatihan,
      status: j.status || 'Aktif',
      tahunPengalaman: 10
    }));

    return { data: mapped, error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_JURULATIH, error: err.message, isLive: false };
  }
}

export async function dbInsertJurulatih(j: Jurulatih): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const { error } = await client.from('jurulatih').insert({
      nama_penuh: j.namaPenuh,
      no_tel: j.noTel,
      email: j.email,
      pengkhususan: j.pengkhususan,
      tahap_bengkung: j.tahapBengkung,
      gred_kejurulatihan: j.gredKejurulatihan,
      status: j.status
    });

    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}

// ==============================================================================
// 6. PROFIL & PENGURUSAN PENGGUNA
// ==============================================================================

export async function dbFetchProfiles(): Promise<{ data: Pengguna[]; error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { data: INITIAL_PENGGUNA, error: null, isLive: false };
  }

  try {
    const { data, error } = await client.from('profiles').select('*');
    if (error) return { data: INITIAL_PENGGUNA, error: formatSupabaseError(error), isLive: false };
    if (!data || data.length === 0) return { data: INITIAL_PENGGUNA, error: null, isLive: true };

    const mapped: Pengguna[] = data.map((p: any) => ({
      id: p.id,
      nama: p.nama_penuh || p.email?.split('@')[0] || 'Pengguna Silat',
      email: p.email || '',
      peranan: p.peranan || 'ahli',
      pesilatId: p.pesilat_id,
      statusAkaun: p.status_akaun || 'Aktif',
      tarikhDaftar: p.created_at ? p.created_at.split('T')[0] : '2026-01-01'
    }));

    return { data: mapped, error: null, isLive: true };
  } catch (err: any) {
    return { data: INITIAL_PENGGUNA, error: err.message, isLive: false };
  }
}

export async function dbUpdateProfileRole(
  profileId: string,
  newRole: Peranan
): Promise<{ error: string | null; isLive: boolean }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    return { error: null, isLive: false };
  }

  try {
    const { error } = await client
      .from('profiles')
      .update({ peranan: newRole })
      .eq('id', profileId);

    if (error) return { error: formatSupabaseError(error), isLive: true };
    return { error: null, isLive: true };
  } catch (err: any) {
    return { error: err.message, isLive: true };
  }
}
