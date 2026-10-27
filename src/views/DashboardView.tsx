/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  Trophy,
  Calendar,
  Activity,
  ArrowRight,
  Clock,
  MapPin,
  AlertTriangle,
  Award,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  INITIAL_PESILAT,
  INITIAL_JADUAL,
  INITIAL_KEJOHANAN,
  INITIAL_PENCAPAIAN
} from '../mock/data';

interface DashboardViewProps {
  onNavigate: (viewId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';

  const pesilatAktif = INITIAL_PESILAT.filter((p) => p.status === 'Aktif').length;
  const pesilatCedera = INITIAL_PESILAT.filter((p) => p.status === 'Cedera').length;
  const jumlahPingatEmas = INITIAL_PENCAPAIAN.filter((p) => p.pingat === 'Emas').length;
  const sesiTerdekat = INITIAL_JADUAL.slice(0, 3);
  const kejohananAkanDatang = INITIAL_KEJOHANAN.slice(0, 2);

  // Analisis kesiapsiagaan timbang berat
  const pesilatCapaiSasaran = INITIAL_PESILAT.filter(
    (p) => Math.abs(p.beratKg - p.beratSasaranKg) <= 0.8
  ).length;

  return (
    <div className="space-y-6">
      {/* Banner Utama */}
      <div className="bg-emerald-950 rounded-2xl p-6 text-white border border-emerald-900 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <span>Sesi Latihan 2026</span>
            <span aria-hidden="true">·</span>
            <span>Kontinjen Kebangsaan & SUKMA</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-white">
            Selamat Datang, {currentUser?.nama}
          </h1>
          <p className="text-sm text-emerald-200 mt-1 max-w-2xl leading-relaxed">
            Peranan aktif: <strong className="text-amber-300 capitalize">{peranan}</strong>. Pantau kesiapsiagaan atlet, disiplin kehadiran, sasaran kelas berat badan, dan persediaan pendaftaran kejohanan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {peranan !== 'ahli' ? (
            <>
              <Button
                variant="gold"
                size="sm"
                onClick={() => onNavigate('kehadiran')}
                icon={<Activity className="w-4 h-4" />}
              >
                Catat Kehadiran
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('pendaftaran')}
                icon={<Trophy className="w-4 h-4" />}
              >
                Daftar Kejohanan
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="gold"
                size="sm"
                onClick={() => onNavigate('profil-pesilat')}
                icon={<Users className="w-4 h-4" />}
              >
                Buka Profil Saya
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('jadual')}
                icon={<Calendar className="w-4 h-4" />}
              >
                Lihat Jadual
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid Statistik Prestasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Jumlah Pesilat Skuad"
          value={INITIAL_PESILAT.length}
          trend={`${pesilatAktif} Aktif`}
          subtext={`${pesilatCedera} Cedera`}
          icon={<Users className="w-5 h-5 text-emerald-800" />}
          accent="hijau"
        />
        <StatCard
          label="Sasaran Berat Badan"
          value={`${pesilatCapaiSasaran}/${INITIAL_PESILAT.length}`}
          trend="83.3%"
          subtext="Lulus timbangan"
          icon={<Scale className="w-5 h-5 text-amber-700" />}
          accent="emas"
        />
        <StatCard
          label="Kadar Kehadiran Skuad"
          value="94.2%"
          trend="+2.1%"
          subtext="Bulan Oktober"
          icon={<Activity className="w-5 h-5 text-emerald-800" />}
          accent="hijau"
        />
        <StatCard
          label="Koleksi Pingat Emas"
          value={jumlahPingatEmas}
          trend={`${INITIAL_PENCAPAIAN.length} Jumlah`}
          subtext="Musim 2025/2026"
          icon={<Award className="w-5 h-5 text-amber-600" />}
          accent="emas"
        />
      </div>

      {/* Bahagian Dua Kolum: Jadual Latihan & Kejohanan Mendatang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolum 1 & 2: Jadual Latihan Terkini */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Jadual Sesi Latihan Terdekat
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latihan intensif persediaan taktikal dan fizikal
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('jadual')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Lihat Semua
              </Button>
            </div>

            <div className="space-y-3 mt-4">
              {sesiTerdekat.map((sesi) => (
                <div
                  key={sesi.id}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge teks={sesi.jenisSesi} varian="emas" />
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        {sesi.tarikh}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {sesi.tajuk}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono tabular-nums">{sesi.masaMula} - {sesi.masaTamat}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sesi.lokasi}</span>
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium">
                      Jurulatih: {sesi.jurulatihNama}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('kehadiran')}
                    >
                      Buka Kehadiran
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolum 3: Kejohanan Menjelang & Makluman Penting */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Kejohanan Menjelang
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('kejohanan')}
              >
                Kalendar
              </Button>
            </div>

            <div className="space-y-4 mt-4">
              {kejohananAkanDatang.map((k) => (
                <div key={k.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge teks={k.peringkat} varian="emas" />
                    <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Tutup: {k.tarikhTutupDaftar}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {k.namaKejohanan}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {k.lokasi}
                  </p>
                  <div className="pt-1 flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-mono tabular-nums text-[11px]">
                      {k.tarikhMula} - {k.tarikhTamat}
                    </span>
                    <button
                      onClick={() => onNavigate('pendaftaran')}
                      className="font-bold text-emerald-800 hover:text-emerald-950 text-xs cursor-pointer"
                    >
                      Daftar &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kad Kesiapsiagaan Skuad Silat */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Status Kesiapsiagaan
              </span>
              <span className="text-xs text-slate-400 font-mono tabular-nums">SUKMA 2026</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Semua atlet tanding Kelas B, C, dan E telah menjalani sesi saringan timbang berat rasmi. Sesi sparring simulasi dijadualkan pada minggu hadapan.
            </p>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-medium">
              <span className="text-emerald-400">95% Dokumentasi Lengkap</span>
              <span className="text-amber-400">4 Acara Didaftar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
