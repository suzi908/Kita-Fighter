/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Medal, Plus, Award, Calendar, Trash2, Filter } from 'lucide-react';
import { RekodPencapaian, Pesilat, Kejohanan, Pingat } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

interface PencapaianViewProps {
  pencapaianList: RekodPencapaian[];
  pesilatList: Pesilat[];
  kejohananList: Kejohanan[];
  onTambahPencapaian: (p: RekodPencapaian) => void;
  onPadamPencapaian: (id: string) => void;
}

export const PencapaianView: React.FC<PencapaianViewProps> = ({
  pencapaianList,
  pesilatList,
  kejohananList,
  onTambahPencapaian,
  onPadamPencapaian
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehUrus = peranan === 'admin' || peranan === 'jurulatih';

  const [filterPingat, setFilterPingat] = useState<string>('Semua');
  const [filterTahun, setFilterTahun] = useState<string>('Semua');
  const [modalBuka, setModalBuka] = useState(false);

  // Form states
  const [pesilatId, setPesilatId] = useState(pesilatList[0]?.id || '');
  const [kejohananNama, setKejohananNama] = useState(kejohananList[0]?.namaKejohanan || '');
  const [kategori, setKategori] = useState('Tanding Putra');
  const [kelas, setKelas] = useState('Kelas B (50-55 kg)');
  const [pingat, setPingat] = useState<Pingat>('Emas');
  const [tahun, setTahun] = useState(2026);
  const [tarikh, setTarikh] = useState(new Date().toISOString().split('T')[0]);
  const [catatan, setCatatan] = useState('');

  const [idUntukPadam, setIdUntukPadam] = useState<string | null>(null);

  // Kiraan Pingat
  const emasCount = pencapaianList.filter((p) => p.pingat === 'Emas').length;
  const perakCount = pencapaianList.filter((p) => p.pingat === 'Perak').length;
  const gangsaCount = pencapaianList.filter((p) => p.pingat === 'Gangsa').length;

  const filtered = pencapaianList.filter((item) => {
    const padanPingat = filterPingat === 'Semua' || item.pingat === filterPingat;
    const padanTahun = filterTahun === 'Semua' || String(item.tahun) === filterTahun;
    return padanPingat && padanTahun;
  });

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    const pslt = pesilatList.find((p) => p.id === pesilatId);
    if (!pslt) return;

    const dataBaru: RekodPencapaian = {
      id: `pcp-${Date.now()}`,
      kejohananId: `kjh-${Date.now()}`,
      namaKejohanan: kejohananNama.trim() || 'Kejohanan Silat Malaysia',
      pesilatId: pslt.id,
      namaPesilat: pslt.namaPenuh,
      kategori,
      kelas,
      pingat,
      tahun: Number(tahun),
      tarikh,
      catatan: catatan.trim() || undefined
    };

    onTambahPencapaian(dataBaru);
    setModalBuka(false);
    setCatatan('');
  };

  return (
    <div className="space-y-6">
      {/* Bar Statistik Koleksi Pingat */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase">Pingat Emas</span>
            <p className="text-3xl font-black text-amber-900 font-mono tabular-nums mt-1">{emasCount}</p>
          </div>
          <span className="text-3xl">🥇</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase">Pingat Perak</span>
            <p className="text-3xl font-black text-slate-800 font-mono tabular-nums mt-1">{perakCount}</p>
          </div>
          <span className="text-3xl">🥈</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-900/10 border border-amber-900/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase">Pingat Gangsa</span>
            <p className="text-3xl font-black text-amber-900 font-mono tabular-nums mt-1">{gangsaCount}</p>
          </div>
          <span className="text-3xl">🥉</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase">Jumlah Kejuaraan</span>
            <p className="text-3xl font-black text-emerald-950 font-mono tabular-nums mt-1">
              {pencapaianList.length}
            </p>
          </div>
          <span className="text-3xl">🏆</span>
        </div>
      </div>

      {/* Bar Penapis & Tambah */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Arkib Kejayaan & Rekod Pencapaian Skuad
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Senarai kejayaan atlet dalam kejohanan terbuka, sirkit kebangsaan dan antarabangsa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPingat}
              onChange={(e) => setFilterPingat(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="Semua">Semua Pingat</option>
              <option value="Emas">Emas</option>
              <option value="Perak">Perak</option>
              <option value="Gangsa">Gangsa</option>
            </select>
          </div>

          {bolehUrus && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalBuka(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Pencapaian
            </Button>
          )}
        </div>
      </div>

      {/* Grid Kad Pencapaian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const ikonPingat =
            item.pingat === 'Emas'
              ? '🥇'
              : item.pingat === 'Perak'
              ? '🥈'
              : item.pingat === 'Gangsa'
              ? '🥉'
              : '📜';

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex items-start gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="text-4xl shrink-0 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {ikonPingat}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.namaPesilat}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                      {item.namaKejohanan}
                    </p>
                  </div>
                  <Badge
                    teks={`Pingat ${item.pingat}`}
                    varian={item.pingat === 'Emas' ? 'emas' : item.pingat === 'Perak' ? 'kelabu' : 'emas'}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-mono tabular-nums">
                  <span>Kategori: {item.kategori}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.kelas}</span>
                  <span aria-hidden="true">·</span>
                  <span>Tahun {item.tahun}</span>
                </div>

                {item.catatan && (
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {item.catatan}
                  </p>
                )}

                {bolehUrus && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setIdUntukPadam(item.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Padam Rekod
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Pencapaian */}
      <Modal
        isOpen={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Rekod Kejayaan / Pingat Skuad"
        subtitle="Dokumentasikan kutipan pingat dan pengiktirafan kejohanan"
        maxWidth="lg"
      >
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Pilih Pesilat
            </label>
            <select
              value={pesilatId}
              onChange={(e) => setPesilatId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
            >
              {pesilatList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaPenuh} ({p.kelasTanding})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nama Kejohanan
            </label>
            <input
              type="text"
              value={kejohananNama}
              onChange={(e) => setKejohananNama(e.target.value)}
              placeholder="cth: Kejohanan Silat Kebangsaan Terbuka Malaysia 2026"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Tanding Putra"
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kelas
              </label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Kelas B (50-55 kg)"
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pingat
              </label>
              <select
                value={pingat}
                onChange={(e) => setPingat(e.target.value as Pingat)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              >
                <option value="Emas">Pingat Emas</option>
                <option value="Perak">Pingat Perak</option>
                <option value="Gangsa">Pingat Gangsa</option>
                <option value="Sijil Penghargaan">Sijil Penghargaan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tahun
              </label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                min={2000}
                max={2030}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tarikh Acara Akhir
              </label>
              <input
                type="date"
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Catatan Kemenangan / Pukulan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="cth: Menang mutlak 35-12 di perlawanan akhir..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Pencapaian
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog Padam */}
      <ConfirmDialog
        isOpen={idUntukPadam !== null}
        onBatal={() => setIdUntukPadam(null)}
        onSahkan={() => {
          if (idUntukPadam) {
            onPadamPencapaian(idUntukPadam);
            setIdUntukPadam(null);
          }
        }}
        tajuk="Padam Rekod Pencapaian"
        mesej="Adakah anda pasti ingin mengeluarkan rekod pingat ini daripada arkib pasukan?"
      />
    </div>
  );
};
