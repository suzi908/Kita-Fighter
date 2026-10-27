/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Scale,
  Activity,
  HeartPulse,
  Phone,
  CheckCircle2,
  Calendar,
  Save,
  Trophy
} from 'lucide-react';
import { Pesilat } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

interface PesilatProfileViewProps {
  pesilat: Pesilat;
  onKembali: () => void;
  onKemasKiniPesilat: (pesilatDikemasKini: Pesilat) => void;
  senaraiSemuaPesilat?: Pesilat[];
  onTukarPesilat?: (pesilat: Pesilat) => void;
}

export const PesilatProfileView: React.FC<PesilatProfileViewProps> = ({
  pesilat,
  onKembali,
  onKemasKiniPesilat,
  senaraiSemuaPesilat = [],
  onTukarPesilat
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehEdit = peranan === 'admin' || peranan === 'jurulatih';

  // Status timbang
  const [beratBaru, setBeratBaru] = useState(pesilat.beratKg);
  const [mesejKemasKini, setMesejKemasKini] = useState<string | null>(null);

  // Pengiraan BMI
  const tinggiMeter = pesilat.tinggiCm / 100;
  const bmi = (pesilat.beratKg / (tinggiMeter * tinggiMeter)).toFixed(1);

  // Peratus kemenangan
  const totalPerlawanan = pesilat.rekodPerlawanan.menang + pesilat.rekodPerlawanan.kalah;
  const winRate =
    totalPerlawanan > 0
      ? ((pesilat.rekodPerlawanan.menang / totalPerlawanan) * 100).toFixed(0)
      : '0';

  const handleSimpanBerat = () => {
    onKemasKiniPesilat({
      ...pesilat,
      beratKg: Number(beratBaru)
    });
    setMesejKemasKini('Berat badan rasmi berjaya dikemas kini!');
    setTimeout(() => setMesejKemasKini(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Bar Atas & Pemilih Pesilat */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onKembali}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Kembali ke Senarai
        </Button>

        {peranan !== 'ahli' && senaraiSemuaPesilat.length > 0 && onTukarPesilat && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Pilih Pesilat:</span>
            <select
              value={pesilat.id}
              onChange={(e) => {
                const jumpa = senaraiSemuaPesilat.find((p) => p.id === e.target.value);
                if (jumpa) onTukarPesilat(jumpa);
              }}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
            >
              {senaraiSemuaPesilat.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaPenuh} ({p.kelasTanding})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Kad Profil Utama */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-emerald-950 text-amber-400 font-extrabold flex items-center justify-center text-3xl shadow-sm border-2 border-amber-500 shrink-0">
              {pesilat.namaPenuh.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {pesilat.namaPenuh}
                </h1>
                <Badge
                  teks={pesilat.status}
                  varian={pesilat.status === 'Aktif' ? 'hijau' : pesilat.status === 'Cedera' ? 'merah' : 'kelabu'}
                />
                <Badge teks={pesilat.tahapBengkung} varian="bengkung" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-mono tabular-nums">
                <span>No. Daftar: {pesilat.noDaftar}</span>
                <span aria-hidden="true">·</span>
                <span>IC: {pesilat.noKadPengenalanSintetik}</span>
                <span aria-hidden="true">·</span>
                <span>Asal: {pesilat.negeriAsal}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500">Kadar Kemenangan</span>
              <p className="text-2xl font-black text-emerald-800 font-mono tabular-nums">
                {winRate}%
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-xs text-slate-500">Perlawanan Skuad</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                {pesilat.rekodPerlawanan.menang}M - {pesilat.rekodPerlawanan.kalah}K
              </p>
            </div>
          </div>
        </div>

        {/* 3 Grid Bahagian Profil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Kad 1: Spesifikasi Fizikal & Timbang Berat */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              Fizikal & Timbang Berat
            </h3>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Berat Semasa</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                  {pesilat.beratKg} kg
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Berat Sasaran Acara</span>
                <span className="font-bold text-slate-700 font-mono tabular-nums">
                  {pesilat.beratSasaranKg} kg
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Ketinggian</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {pesilat.tinggiCm} cm
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Indeks Jisim Badan (BMI)</span>
                <span className="font-bold text-emerald-800 font-mono tabular-nums">
                  {bmi} (Normal)
                </span>
              </div>
            </div>

            {/* Kemas Kini Berat Badan Pantas (Untuk Jurulatih/Admin) */}
            {bolehEdit && (
              <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Timbangan Rasmi Hari Ini
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={beratBaru}
                    onChange={(e) => setBeratBaru(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded text-slate-900 font-mono"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSimpanBerat}
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    Simpan
                  </Button>
                </div>
                {mesejKemasKini && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {mesejKemasKini}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Kad 2: Kategori Silat & Bengkung */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              Kategori & Tahap Silat
            </h3>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Disiplin Utama</span>
                <span className="font-bold text-slate-900">{pesilat.kategoriUtama}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Kelas Tanding</span>
                <span className="font-bold text-slate-900">{pesilat.kelasTanding}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Tahap Bengkung</span>
                <Badge teks={pesilat.tahapBengkung} varian="bengkung" />
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Tarikh Pendaftaran</span>
                <span className="font-medium text-slate-700 font-mono tabular-nums">
                  {pesilat.tarikhDaftar}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-amber-200/70 bg-amber-50/50 space-y-1">
              <p className="text-xs font-bold text-amber-900">Penilaian Jurulatih</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Kekuatan utama pada teknik sepakan sabit kanan dan bantingan susup. Disyorkan fokus latihan kardio bagi mengekalkan kestabilan pusingan ketiga.
              </p>
            </div>
          </div>

          {/* Kad 3: Rekod Kesihatan & Waris */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Kesihatan & Hubungan Waris
            </h3>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 block">Catatan Perubatan & Kecederaan:</span>
                <p className="text-slate-800 mt-1 leading-relaxed font-medium">
                  {pesilat.catatanKesihatan || 'Tiada rekod kecederaan kronik. Sihat sepenuhnya.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                <span className="text-slate-500 block">Hubungan Kecemasan (Waris):</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{pesilat.namaWaris || 'Tiada maklumat'}</span>
                  <a
                    href={`tel:${pesilat.noTelWaris}`}
                    className="text-emerald-800 hover:text-emerald-950 font-mono tabular-nums font-semibold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {pesilat.noTelWaris || '-'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
