/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Check,
  Calendar,
  Clock,
  MapPin,
  UserCheck
} from 'lucide-react';
import { Pesilat, SesiLatihan, StatusKehadiran, RekodKehadiran } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

interface KehadiranViewProps {
  pesilatList: Pesilat[];
  jadualList: SesiLatihan[];
  kehadiranList: RekodKehadiran[];
  onSimpanKehadiran: (rekodBaru: RekodKehadiran[]) => void;
}

export const KehadiranView: React.FC<KehadiranViewProps> = ({
  pesilatList,
  jadualList,
  kehadiranList,
  onSimpanKehadiran
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehTanda = peranan === 'admin' || peranan === 'jurulatih';

  const [sesiDipilihId, setSesiDipilihId] = useState<string>(jadualList[0]?.id || '');
  const sesiSemasa = jadualList.find((s) => s.id === sesiDipilihId) || jadualList[0];

  // State kehadiran untuk sesi semasa
  const [kehadiranMap, setKehadiranMap] = useState<
    Record<string, { status: StatusKehadiran; catatan: string }>
  >(() => {
    const map: Record<string, { status: StatusKehadiran; catatan: string }> = {};
    pesilatList.forEach((p) => {
      const rekod = kehadiranList.find(
        (k) => k.sesiLatihanId === sesiDipilihId && k.pesilatId === p.id
      );
      map[p.id] = {
        status: rekod ? rekod.status : 'Hadir',
        catatan: rekod?.catatan || ''
      };
    });
    return map;
  });

  const [berjayaSimpan, setBerjayaSimpan] = useState(false);

  const handleTukarSesi = (sesiId: string) => {
    setSesiDipilihId(sesiId);
    const map: Record<string, { status: StatusKehadiran; catatan: string }> = {};
    pesilatList.forEach((p) => {
      const rekod = kehadiranList.find((k) => k.sesiLatihanId === sesiId && k.pesilatId === p.id);
      map[p.id] = {
        status: rekod ? rekod.status : 'Hadir',
        catatan: rekod?.catatan || ''
      };
    });
    setKehadiranMap(map);
  };

  const handleTukarStatus = (pesilatId: string, status: StatusKehadiran) => {
    if (!bolehTanda) return;
    setKehadiranMap((prev) => ({
      ...prev,
      [pesilatId]: {
        ...prev[pesilatId],
        status
      }
    }));
  };

  const handleTukarCatatan = (pesilatId: string, catatan: string) => {
    if (!bolehTanda) return;
    setKehadiranMap((prev) => ({
      ...prev,
      [pesilatId]: {
        ...prev[pesilatId],
        catatan
      }
    }));
  };

  const handleSimpan = () => {
    const senaraiBaru: RekodKehadiran[] = pesilatList.map((p) => ({
      id: `khd-${sesiSemasa.id}-${p.id}`,
      sesiLatihanId: sesiSemasa.id,
      pesilatId: p.id,
      status: kehadiranMap[p.id]?.status || 'Hadir',
      catatan: kehadiranMap[p.id]?.catatan || undefined,
      tarikhCatat: sesiSemasa.tarikh
    }));

    onSimpanKehadiran(senaraiBaru);
    setBerjayaSimpan(true);
    setTimeout(() => setBerjayaSimpan(false), 3000);
  };

  // Statistik kehadiran sesi semasa
  const totalAtlet = pesilatList.length;
  const hadirCount = Object.values(kehadiranMap).filter((k) => k.status === 'Hadir').length;
  const tidakHadirCount = Object.values(kehadiranMap).filter((k) => k.status === 'Tidak Hadir').length;
  const cutiCount = Object.values(kehadiranMap).filter(
    (k) => k.status === 'Kebenaran (Cuti)' || k.status === 'Kecederaan'
  ).length;
  const peratusHadir = totalAtlet > 0 ? ((hadirCount / totalAtlet) * 100).toFixed(0) : '0';

  // Jika ahli pasukan sedang log masuk, tapis senarai atau tandakan baris dirinya
  const pesilatTersenarai = peranan === 'ahli' && currentUser?.pesilatId
    ? pesilatList.filter((p) => p.id === currentUser.pesilatId)
    : pesilatList;

  return (
    <div className="space-y-6">
      {/* Pemilih Sesi & Maklumat Latihan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Borang Semakan Kehadiran Latihan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih sesi latihan rasmi untuk merekodkan status kehadiran setiap pesilat kontinjen
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">Sesi:</span>
            <select
              value={sesiSemasa?.id}
              onChange={(e) => handleTukarSesi(e.target.value)}
              className="w-full sm:w-72 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
            >
              {jadualList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tarikh} · {s.tajuk}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sesiSemasa && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-amber-800 font-bold uppercase tracking-wider text-[10px]">
                {sesiSemasa.jenisSesi}
              </span>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">
                {sesiSemasa.tajuk}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {sesiSemasa.tarikh}
                </span>
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {sesiSemasa.masaMula} - {sesiSemasa.masaTamat}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {sesiSemasa.lokasi}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 shrink-0">
              <div className="text-center">
                <span className="text-[11px] text-slate-500 block">Kadar Kehadiran</span>
                <span className="text-xl font-black text-emerald-800 font-mono tabular-nums">
                  {peratusHadir}%
                </span>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-slate-500 block">Hadir</span>
                <span className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                  {hadirCount}/{totalAtlet}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-slate-500 block">Tidak Hadir</span>
                <span className="text-sm font-bold text-rose-700 font-mono tabular-nums">
                  {tidakHadirCount}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-slate-500 block">Cuti / Cedera</span>
                <span className="text-sm font-bold text-amber-700 font-mono tabular-nums">
                  {cutiCount}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Makluman Berjaya Simpan */}
      {berjayaSimpan && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Rekod kehadiran bagi sesi ini berjaya disimpan!</span>
        </div>
      )}

      {/* Lembaran Semakan Kehadiran */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-800" />
            Senarai Semakan Pesilat Kontinjen
          </h3>
          {bolehTanda && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSimpan}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Simpan Kehadiran
            </Button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {pesilatTersenarai.map((p) => {
            const rekod = kehadiranMap[p.id] || { status: 'Hadir', catatan: '' };

            return (
              <div
                key={p.id}
                className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{p.namaPenuh}</h4>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {p.noDaftar}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.kategoriUtama} · {p.kelasTanding} · Bengkung {p.tahapBengkung}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  {/* Butang Pemilihan Status */}
                  <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                    {(['Hadir', 'Tidak Hadir', 'Kebenaran (Cuti)', 'Kecederaan'] as StatusKehadiran[]).map(
                      (st) => {
                        const isAktif = rekod.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={!bolehTanda}
                            onClick={() => handleTukarStatus(p.id, st)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-default ${
                              isAktif
                                ? st === 'Hadir'
                                  ? 'bg-emerald-900 text-white shadow-xs'
                                  : st === 'Tidak Hadir'
                                  ? 'bg-rose-700 text-white shadow-xs'
                                  : 'bg-amber-500 text-emerald-950 font-bold shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Input Catatan (Hanya jika bukan Hadir atau perlu nota) */}
                  {bolehTanda ? (
                    <input
                      type="text"
                      value={rekod.catatan}
                      onChange={(e) => handleTukarCatatan(p.id, e.target.value)}
                      placeholder="Catatan (cth: fisioterapi, kuarantin)..."
                      className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg w-full sm:w-56 text-slate-800 placeholder:text-slate-400"
                    />
                  ) : (
                    rekod.catatan && (
                      <span className="text-xs text-slate-500 italic bg-slate-50 px-2 py-1 rounded">
                        Catatan: {rekod.catatan}
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
