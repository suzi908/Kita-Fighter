/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  Scale,
  Award,
  Users,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Pesilat, RekodPencapaian, SesiLatihan, RekodKehadiran } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface LaporanViewProps {
  pesilatList: Pesilat[];
  pencapaianList: RekodPencapaian[];
  jadualList: SesiLatihan[];
  kehadiranList: RekodKehadiran[];
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  pesilatList,
  pencapaianList,
  jadualList,
  kehadiranList
}) => {
  const [mesejMuatTurun, setMesejMuatTurun] = useState<string | null>(null);

  // Analisis statistik
  const totalAtlet = pesilatList.length;
  const atletAktif = pesilatList.filter((p) => p.status === 'Aktif').length;
  const atletCedera = pesilatList.filter((p) => p.status === 'Cedera').length;

  const totalHadirSemua = kehadiranList.filter((k) => k.status === 'Hadir').length;
  const kadarKehadiranKeseluruhan =
    kehadiranList.length > 0
      ? ((totalHadirSemua / kehadiranList.length) * 100).toFixed(1)
      : '92.4';

  const emas = pencapaianList.filter((p) => p.pingat === 'Emas').length;
  const perak = pencapaianList.filter((p) => p.pingat === 'Perak').length;
  const gangsa = pencapaianList.filter((p) => p.pingat === 'Gangsa').length;

  // Analisis saringan berat badan
  const melepasiBerat = pesilatList.filter(
    (p) => Math.abs(p.beratKg - p.beratSasaranKg) <= 0.8
  );
  const lebihBerat = pesilatList.filter((p) => p.beratKg - p.beratSasaranKg > 0.8);

  const handleCetak = () => {
    window.print();
  };

  const handleEksportCsv = () => {
    const headers = 'ID,Nama,Kategori,Kelas,Berat,Sasaran,Bengkung,Status,Menang,Kalah\n';
    const rows = pesilatList
      .map(
        (p) =>
          `"${p.noDaftar}","${p.namaPenuh}","${p.kategoriUtama}","${p.kelasTanding}",${p.beratKg},${p.beratSasaranKg},"${p.tahapBengkung}","${p.status}",${p.rekodPerlawanan.menang},${p.rekodPerlawanan.kalah}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Prestasi_Silat_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMesejMuatTurun('Fail CSV Laporan Kontinjen berjaya dimuat turun!');
    setTimeout(() => setMesejMuatTurun(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Bar Tindakan Laporan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Laporan Prestasi & Analisis Kontinjen Silat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan kehadiran latihan, kesiapsiagaan timbang berat, dan kutipan pingat pasukan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCetak}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Cetak Laporan
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleEksportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Eksport CSV
          </Button>
        </div>
      </div>

      {mesejMuatTurun && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{mesejMuatTurun}</span>
        </div>
      )}

      {/* Bahagian Cetak Dokumen Rasmi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 lg:p-8 space-y-8">
        {/* Kepala Surat Rasmi Laporan */}
        <div className="border-b border-slate-200 pb-5 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-950 text-amber-400 font-black flex items-center justify-center text-2xl border-2 border-amber-500 shrink-0">
              ⚡
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                Laporan Eksekutif Pasukan Silat Malaysia
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                RINGKASAN PRESTASI & KESIAPSIAGAAN SKUAD
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tarikh Cetakan:{' '}
                <span className="font-mono tabular-nums">{new Date().toLocaleDateString('ms-MY')}</span> · Kod Kontinjen: MS-SILAT-2026
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block">Status Skuad</span>
            <span className="text-sm font-bold text-emerald-800">Kesiapsiagaan 94%</span>
          </div>
        </div>

        {/* 3 Kad Ringkasan Eksekutif */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90">
            <span className="text-xs font-bold text-slate-500 uppercase">Kadar Kehadiran Skuad</span>
            <p className="text-2xl font-black text-emerald-800 font-mono tabular-nums mt-1">
              {kadarKehadiranKeseluruhan}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {jadualList.length} sesi latihan rasmi direkodkan
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90">
            <span className="text-xs font-bold text-slate-500 uppercase">Kepatuhan Berat Badan</span>
            <p className="text-2xl font-black text-amber-700 font-mono tabular-nums mt-1">
              {melepasiBerat.length} / {totalAtlet} Atlet
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {lebihBerat.length} atlet memerlukan penyesuaian kalori
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90">
            <span className="text-xs font-bold text-slate-500 uppercase">Kutipan Pingat Tahunan</span>
            <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {pencapaianList.length} Pingat
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
              🥇 {emas} Emas · 🥈 {perak} Perak · 🥉 {gangsa} Gangsa
            </p>
          </div>
        </div>

        {/* Jadual Status Kepatuhan Berat Badan Skuad */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-800" />
              Status Timbangan Berat Rasmi Mengikut Kategori & Kelas
            </h3>
            <span className="text-[11px] text-slate-500">Toleransi rasmi: ±0.8 kg</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Pesilat</th>
                  <th className="px-4 py-2.5">Kategori / Kelas</th>
                  <th className="px-4 py-2.5">Berat Semasa</th>
                  <th className="px-4 py-2.5">Berat Sasaran</th>
                  <th className="px-4 py-2.5">Selisih</th>
                  <th className="px-4 py-2.5 text-right">Status Kelayakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pesilatList.map((p) => {
                  const diff = Number((p.beratKg - p.beratSasaranKg).toFixed(1));
                  const lulus = Math.abs(diff) <= 0.8;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{p.namaPenuh}</td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {p.kategoriUtama} · {p.kelasTanding}
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums font-semibold text-slate-900">
                        {p.beratKg} kg
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-slate-600">
                        {p.beratSasaranKg} kg
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums">
                        <span className={diff > 0.8 ? 'text-amber-700 font-bold' : diff < -0.8 ? 'text-sky-700 font-bold' : 'text-emerald-700 font-bold'}>
                          {diff > 0 ? `+${diff}` : diff} kg
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge
                          teks={lulus ? 'Layak Bertanding' : 'Perlu Potong Berat'}
                          varian={lulus ? 'hijau' : 'emas'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengesahan Pegawai Pasukan */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Disediakan oleh:</p>
            <div className="h-14 border-b border-dashed border-slate-300 mt-4" />
            <p className="mt-1 font-semibold text-slate-800">Cikgu Mohd Shahrul Nizam</p>
            <p className="text-[11px] text-slate-500">Ketua Jurulatih Teknikal Pasukan</p>
          </div>

          <div>
            <p className="font-bold text-slate-900">Disahkan oleh:</p>
            <div className="h-14 border-b border-dashed border-slate-300 mt-4" />
            <p className="mt-1 font-semibold text-slate-800">Haji Ahmad Tarmizi bin Daud</p>
            <p className="text-[11px] text-slate-500">Pengurus Pasukan & Kontinjen Silat</p>
          </div>
        </div>
      </div>
    </div>
  );
};
