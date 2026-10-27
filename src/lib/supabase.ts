/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Kunci simpanan setempat untuk konfigurasi runtime
const STORAGE_URL_KEY = 'silat_supabase_url_v1';
const STORAGE_KEY_KEY = 'silat_supabase_anon_key_v1';

/**
 * Pengesahan URL HTTP/HTTPS Supabase yang sah
 */
export function isValidHttpUrl(stringToTest: string | undefined | null): boolean {
  if (!stringToTest || typeof stringToTest !== 'string') return false;
  const trimmed = stringToTest.trim();
  if (
    trimmed === '' ||
    trimmed === 'MY_SUPABASE_URL' ||
    trimmed === 'https://your-project.supabase.co' ||
    trimmed === 'your-project.supabase.co' ||
    trimmed === 'undefined' ||
    trimmed === 'null'
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.length > 3;
  } catch {
    return false;
  }
}

/**
 * Pengesahan Anon Key Supabase yang sah
 */
export function isValidAnonKey(keyToTest: string | undefined | null): boolean {
  if (!keyToTest || typeof keyToTest !== 'string') return false;
  const trimmed = keyToTest.trim();
  if (
    trimmed === '' ||
    trimmed === 'MY_SUPABASE_ANON_KEY' ||
    trimmed === 'your-anon-key' ||
    trimmed === 'undefined' ||
    trimmed === 'null'
  ) {
    return false;
  }
  return trimmed.length > 10;
}

/**
 * Mendapatkan URL dan Publishable (Anon) Key Supabase sama ada daripada:
 * 1. Pembolehubah persekitaran Vite (import.meta.env.VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)
 * 2. Simpanan setempat (localStorage) sekiranya pengguna mengkonfigurasinya melalui UI aplikasi
 */
export function getSupabaseCredentials(): { url: string; anonKey: string; source: 'env' | 'storage' | 'none' } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (isValidHttpUrl(envUrl) && isValidAnonKey(envKey)) {
    return { url: (envUrl as string).trim(), anonKey: (envKey as string).trim(), source: 'env' };
  }

  try {
    const storedUrl = localStorage.getItem(STORAGE_URL_KEY);
    const storedKey = localStorage.getItem(STORAGE_KEY_KEY);
    if (isValidHttpUrl(storedUrl) && isValidAnonKey(storedKey)) {
      return { url: storedUrl!.trim(), anonKey: storedKey!.trim(), source: 'storage' };
    }
  } catch {
    // Abaikan ralat capaian localStorage
  }

  return { url: '', anonKey: '', source: 'none' };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  try {
    if (isValidHttpUrl(url) && isValidAnonKey(anonKey)) {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
      localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
  } catch {
    // Abaikan ralat capaian localStorage
  }
}

let activeClient: SupabaseClient | null = null;
let activeCreds = getSupabaseCredentials();

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getSupabaseCredentials();

  // Jika kredensial berubah atau belum diinisialisasi
  if (
    !activeClient ||
    creds.url !== activeCreds.url ||
    creds.anonKey !== activeCreds.anonKey
  ) {
    activeCreds = creds;
    if (isValidHttpUrl(creds.url) && isValidAnonKey(creds.anonKey)) {
      try {
        activeClient = createClient(creds.url, creds.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } catch (err) {
        console.warn('Amaran: Gagal memulakan Supabase Client:', err);
        activeClient = null;
      }
    } else {
      activeClient = null;
    }
  }

  return activeClient;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(getSupabaseClient() !== null);
};

export const supabase: SupabaseClient | null = getSupabaseClient();

/**
 * Keputusan Ujian Diagnostik Sambungan Jadual & RLS
 */
export interface TableDiagnosticResult {
  tableName: string;
  label: string;
  status: 'ok' | 'missing' | 'rls_restricted' | 'error';
  rowCount: number;
  message: string;
}

export interface SupabaseHealthReport {
  isConfigured: boolean;
  source: 'env' | 'storage' | 'none';
  url: string;
  authConnected: boolean;
  authMessage: string;
  tables: TableDiagnosticResult[];
  overallHealthy: boolean;
}

/**
 * Menguji sambungan Supabase dan menyemak integriti jadual serta polisi RLS
 */
export async function testSupabaseHealth(): Promise<SupabaseHealthReport> {
  const creds = getSupabaseCredentials();
  const client = getSupabaseClient();

  if (!client || !creds.url || !creds.anonKey) {
    return {
      isConfigured: false,
      source: 'none',
      url: creds.url,
      authConnected: false,
      authMessage: 'Kredensial URL atau Publishable Key Supabase belum dikonfigurasikan.',
      tables: [],
      overallHealthy: false
    };
  }

  // 1. Uji Supabase Auth Ping
  let authConnected = false;
  let authMessage = '';
  try {
    const { data, error } = await client.auth.getSession();
    if (error) {
      authConnected = false;
      authMessage = `Ralat Auth: ${error.message}`;
    } else {
      authConnected = true;
      authMessage = data.session
        ? `Sesi aktif: ${data.session.user.email}`
        : 'Perkhidmatan Auth responsif (tiada sesi pengguna aktif).';
    }
  } catch (err: any) {
    authConnected = false;
    authMessage = err.message || 'Gagal menghubungi pelayan Supabase Auth.';
  }

  // 2. Senarai jadual yang diuji
  const tablesToProbe = [
    { name: 'profiles', label: 'Profil Pengguna & Peranan' },
    { name: 'pesilat', label: 'Maklumat & Rekod Pesilat' },
    { name: 'jurulatih', label: 'Pegawai Kejurulatihan' },
    { name: 'sesi_latihan', label: 'Jadual Sesi Latihan' },
    { name: 'rekod_kehadiran', label: 'Rekod Kehadiran Latihan' },
    { name: 'kejohanan', label: 'Kalendar Kejohanan' },
    { name: 'pendaftaran_kejohanan', label: 'Pendaftaran Acara' },
    { name: 'rekod_pencapaian', label: 'Rekod Pencapaian & Pingat' }
  ];

  const tableResults: TableDiagnosticResult[] = [];

  for (const t of tablesToProbe) {
    try {
      const { data, error, count } = await client
        .from(t.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (
          error.code === '42P01' ||
          error.message?.toLowerCase().includes('does not exist') ||
          error.message?.toLowerCase().includes('relation') ||
          error.code === 'PGRST205'
        ) {
          tableResults.push({
            tableName: t.name,
            label: t.label,
            status: 'missing',
            rowCount: 0,
            message: `Jadual tidak wujud dalam skema public (Kod: ${error.code}). Sila jalankan skrip SQL.`
          });
        } else if (
          error.code === '42501' ||
          error.message?.toLowerCase().includes('row-level security') ||
          error.message?.toLowerCase().includes('permission denied')
        ) {
          tableResults.push({
            tableName: t.name,
            label: t.label,
            status: 'rls_restricted',
            rowCount: 0,
            message: `Polisi RLS mengehadkan capaian pengguna awam/belum disahkan (Kod: ${error.code}). Sila log masuk.`
          });
        } else {
          tableResults.push({
            tableName: t.name,
            label: t.label,
            status: 'error',
            rowCount: 0,
            message: error.message || 'Ralat pertanyaan pangkalan data.'
          });
        }
      } else {
        tableResults.push({
          tableName: t.name,
          label: t.label,
          status: 'ok',
          rowCount: count ?? (Array.isArray(data) ? data.length : 0),
          message: 'Jadual wujud dan boleh diakses mengikut polisi RLS.'
        });
      }
    } catch (err: any) {
      tableResults.push({
        tableName: t.name,
        label: t.label,
        status: 'error',
        rowCount: 0,
        message: err.message || 'Ralat tidak dijangka.'
      });
    }
  }

  const overallHealthy =
    authConnected &&
    tableResults.every((t) => t.status === 'ok' || t.status === 'rls_restricted');

  return {
    isConfigured: true,
    source: creds.source,
    url: creds.url,
    authConnected,
    authMessage,
    tables: tableResults,
    overallHealthy
  };
}

/**
 * Skrip DDL PostgreSQL & Polisi Row Level Security (RLS) Idempotent.
 */
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- SKRIP PANGKALAN DATA POSTGRESQL & ROW LEVEL SECURITY (RLS)
-- SISTEM PENGURUSAN PASUKAN SILAT MALAYSIA
-- ==============================================================================

-- 1. Jadual Profil Pengguna & Peranan
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nama_penuh TEXT NOT NULL,
  email TEXT NOT NULL,
  peranan TEXT NOT NULL CHECK (peranan IN ('admin', 'jurulatih', 'ahli')),
  pesilat_id UUID,
  status_akaun TEXT NOT NULL DEFAULT 'Aktif' CHECK (status_akaun IN ('Aktif', 'Digantung')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jadual Maklumat Pesilat
CREATE TABLE IF NOT EXISTS public.pesilat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_penuh TEXT NOT NULL,
  no_daftar TEXT UNIQUE NOT NULL,
  no_kad_pengenalan TEXT NOT NULL,
  jantina TEXT NOT NULL CHECK (jantina IN ('Lelaki', 'Wanita')),
  umur INT NOT NULL,
  berat_kg NUMERIC(5,2) NOT NULL,
  berat_sasaran_kg NUMERIC(5,2) NOT NULL,
  tinggi_cm NUMERIC(5,2) NOT NULL,
  kategori_utama TEXT NOT NULL,
  kelas_tanding TEXT NOT NULL,
  tahap_bengkung TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Cedera', 'Rehat', 'Alumni')),
  negeri_asal TEXT NOT NULL,
  catatan_kesihatan TEXT,
  nama_waris TEXT,
  no_tel_waris TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jadual Jurulatih
CREATE TABLE IF NOT EXISTS public.jurulatih (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_penuh TEXT NOT NULL,
  no_tel TEXT NOT NULL,
  email TEXT NOT NULL,
  pengkhususan TEXT NOT NULL,
  tahap_bengkung TEXT NOT NULL,
  gred_kejurulatihan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Jadual Sesi Latihan & Kehadiran
CREATE TABLE IF NOT EXISTS public.sesi_latihan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tajuk TEXT NOT NULL,
  tarikh DATE NOT NULL,
  masa_mula TIME NOT NULL,
  masa_tamat TIME NOT NULL,
  lokasi TEXT NOT NULL,
  jurulatih_id UUID REFERENCES public.jurulatih(id) ON DELETE SET NULL,
  fokus_latihan TEXT NOT NULL,
  jenis_sesi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rekod_kehadiran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesi_latihan_id UUID REFERENCES public.sesi_latihan(id) ON DELETE CASCADE,
  pesilat_id UUID REFERENCES public.pesilat(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Tidak Hadir', 'Kebenaran (Cuti)', 'Kecederaan')),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sesi_latihan_id, pesilat_id)
);

-- 5. Jadual Kejohanan & Pendaftaran
CREATE TABLE IF NOT EXISTS public.kejohanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kejohanan TEXT NOT NULL,
  peringkat TEXT NOT NULL,
  tarikh_mula DATE NOT NULL,
  tarikh_tamat DATE NOT NULL,
  lokasi TEXT NOT NULL,
  tarikh_tutup_daftar DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Akan Datang',
  yuran_penyertaan NUMERIC(7,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pendaftaran_kejohanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kejohanan_id UUID REFERENCES public.kejohanan(id) ON DELETE CASCADE,
  pesilat_id UUID REFERENCES public.pesilat(id) ON DELETE CASCADE,
  kategori TEXT NOT NULL,
  kelas TEXT NOT NULL,
  status_kelulusan TEXT NOT NULL DEFAULT 'Dalam Semakan' CHECK (status_kelulusan IN ('Dalam Semakan', 'Disahkan', 'Ditolak')),
  catatan_pengurus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Jadual Rekod Pencapaian & Pingat
CREATE TABLE IF NOT EXISTS public.rekod_pencapaian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kejohanan_id UUID REFERENCES public.kejohanan(id) ON DELETE SET NULL,
  pesilat_id UUID REFERENCES public.pesilat(id) ON DELETE CASCADE,
  kategori TEXT NOT NULL,
  kelas TEXT NOT NULL,
  pingat TEXT NOT NULL CHECK (pingat IN ('Emas', 'Perak', 'Gangsa', 'Sijil Penghargaan')),
  tahun INT NOT NULL,
  tarikh DATE NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PENGUATKUASAAN ROW LEVEL SECURITY (RLS)
-- Nota Keselamatan: Hanya gunakan anon / publishable key di frontend.
-- Jangan sesekali mendedahkan service_role key.
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesilat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurulatih ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesi_latihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rekod_kehadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kejohanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendaftaran_kejohanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rekod_pencapaian ENABLE ROW LEVEL SECURITY;

-- Helper function untuk semak peranan pengguna semasa
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
  SELECT peranan FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Polisi Profiles
DROP POLICY IF EXISTS "Pengguna boleh baca profil sendiri atau admin/jurulatih baca semua" ON public.profiles;
CREATE POLICY "Pengguna boleh baca profil sendiri atau admin/jurulatih baca semua"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR public.get_current_role() IN ('admin', 'jurulatih')
  );

DROP POLICY IF EXISTS "Pengguna kemas kini profil sendiri" ON public.profiles;
CREATE POLICY "Pengguna kemas kini profil sendiri"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.get_current_role() = 'admin');

-- Polisi Pesilat
DROP POLICY IF EXISTS "Semua pengguna disahkan boleh melihat pesilat" ON public.pesilat;
CREATE POLICY "Semua pengguna disahkan boleh melihat pesilat"
  ON public.pesilat FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin & Jurulatih urus pesilat" ON public.pesilat;
CREATE POLICY "Admin & Jurulatih urus pesilat"
  ON public.pesilat FOR ALL
  TO authenticated
  USING (public.get_current_role() IN ('admin', 'jurulatih'))
  WITH CHECK (public.get_current_role() IN ('admin', 'jurulatih'));

-- Polisi Jurulatih
DROP POLICY IF EXISTS "Semua pengguna boleh melihat jurulatih" ON public.jurulatih;
CREATE POLICY "Semua pengguna boleh melihat jurulatih"
  ON public.jurulatih FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin urus jurulatih" ON public.jurulatih;
CREATE POLICY "Admin urus jurulatih"
  ON public.jurulatih FOR ALL
  TO authenticated
  USING (public.get_current_role() = 'admin')
  WITH CHECK (public.get_current_role() = 'admin');

-- Polisi Sesi Latihan
DROP POLICY IF EXISTS "Semua pengguna boleh lihat jadual latihan" ON public.sesi_latihan;
CREATE POLICY "Semua pengguna boleh lihat jadual latihan"
  ON public.sesi_latihan FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin & Jurulatih urus jadual latihan" ON public.sesi_latihan;
CREATE POLICY "Admin & Jurulatih urus jadual latihan"
  ON public.sesi_latihan FOR ALL
  TO authenticated
  USING (public.get_current_role() IN ('admin', 'jurulatih'))
  WITH CHECK (public.get_current_role() IN ('admin', 'jurulatih'));

-- Polisi Kehadiran
DROP POLICY IF EXISTS "Semua pengguna boleh lihat rekod kehadiran" ON public.rekod_kehadiran;
CREATE POLICY "Semua pengguna boleh lihat rekod kehadiran"
  ON public.rekod_kehadiran FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin & Jurulatih kemas kini kehadiran" ON public.rekod_kehadiran;
CREATE POLICY "Admin & Jurulatih kemas kini kehadiran"
  ON public.rekod_kehadiran FOR ALL
  TO authenticated
  USING (public.get_current_role() IN ('admin', 'jurulatih'))
  WITH CHECK (public.get_current_role() IN ('admin', 'jurulatih'));

-- Polisi Kejohanan
DROP POLICY IF EXISTS "Semua pengguna boleh lihat kejohanan" ON public.kejohanan;
CREATE POLICY "Semua pengguna boleh lihat kejohanan"
  ON public.kejohanan FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin & Jurulatih urus kejohanan" ON public.kejohanan;
CREATE POLICY "Admin & Jurulatih urus kejohanan"
  ON public.kejohanan FOR ALL
  TO authenticated
  USING (public.get_current_role() IN ('admin', 'jurulatih'))
  WITH CHECK (public.get_current_role() IN ('admin', 'jurulatih'));

-- Polisi Pendaftaran Kejohanan
DROP POLICY IF EXISTS "Semua pengguna boleh lihat pendaftaran kejohanan" ON public.pendaftaran_kejohanan;
CREATE POLICY "Semua pengguna boleh lihat pendaftaran kejohanan"
  ON public.pendaftaran_kejohanan FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Ahli atau jurulatih boleh mendaftar kejohanan" ON public.pendaftaran_kejohanan;
CREATE POLICY "Ahli atau jurulatih boleh mendaftar kejohanan"
  ON public.pendaftaran_kejohanan FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin & Jurulatih urus kelulusan pendaftaran" ON public.pendaftaran_kejohanan;
CREATE POLICY "Admin & Jurulatih urus kelulusan pendaftaran"
  ON public.pendaftaran_kejohanan FOR UPDATE
  TO authenticated
  USING (public.get_current_role() IN ('admin', 'jurulatih'));

-- Polisi Rekod Pencapaian
DROP POLICY IF EXISTS "Semua pengguna boleh lihat rekod pencapaian" ON public.rekod_pencapaian;
CREATE POLICY "Semua pengguna boleh lihat rekod pencapaian"
  ON public.rekod_pencapaian FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin & Jurulatih urus pencapaian" ON public.rekod_pencapaian;
CREATE POLICY "Admin & Jurulatih urus pencapaian"
  ON public.rekod_pencapaian FOR ALL
  TO authenticated
  USING (public.get_current_role() IN ('admin', 'jurulatih'))
  WITH CHECK (public.get_current_role() IN ('admin', 'jurulatih'));
`;
