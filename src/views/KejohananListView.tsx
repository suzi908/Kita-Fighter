/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, Plus, MapPin, Calendar, AlertTriangle, ArrowRight, Trash2, Filter } from 'lucide-react';
import { Kejohanan } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

interface KejohananListViewProps {
  kejohananList: Kejohanan[];
  onTambahKejohanan: (k: Kejohanan) => void;
  onPadamKejohanan: (id: string) => void;
  onPilihDaftarKejohanan: (kejohananId: string) => void;
}

export const KejohananListView: React.FC<KejohananListViewProps> = ({
  kejohananList,
  onTambahKejohanan,
  onPadamKejohanan,
  onPilihDaftarKejohanan
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehUrus = peranan === 'admin';

  const [filterPeringkat, setFilterPeringkat] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [modalBuka, setModalBuka] = useState(false);

  // Form states
  const [namaKejohanan, setNamaKejohanan] = useState('');
  const [peringkat, setPeringkat] = useState<'Daerah' | 'Negeri' | 'Kebangsaan' | 'Antarabangsa'>('Kebangsaan');
  const [tarikhMula, setTarikhMula] = useState('');
  const [tarikhTamat, setTarikhTamat] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tarikhTutupDaftar, setTarikhTutupDaftar] = useState('');
  const [yuranPenyertaan, setYuranPenyertaan] = useState(100);
  const [maklumatTambahan, setMaklumatTambahan] = useState('');

  const [idUntukPadam, setIdUntukPadam] = useState<string | null>(null);

  const filtered = kejohananList.filter((k) => {
    const padanPeringkat = filterPeringkat === 'Semua' || k.peringkat === filterPeringkat;
    const padanStatus = filterStatus === 'Semua' || k.status === filterStatus;
    return padanPeringkat && padanStatus;
  });

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKejohanan.trim()) return;

    const dataBaru: Kejohanan = {
      id: `kjh-${Date.now()}`,
      namaKejohanan: namaKejohanan.trim(),
      peringkat,
      tarikhMula,
      tarikhTamat,
      lokasi: lokasi.trim(),
      tarikhTutupDaftar,
      status: 'Akan Datang',
      yuranPenyertaan: Number(yuranPenyertaan),
      maklumatTambahan: maklumatTambahan.trim() || undefined
    };

    onTambahKejohanan(dataBaru);
    setModalBuka(false);
    setNamaKejohanan('');
    setLokasi('');
  };

  return (
    <div className="space-y-6">
      {/* Bar Atas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Kalendar Kejohanan & Temasya Silat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyertaan rasmi skuad dalam sirkit kebangsaan, SUKMA, dan jemputan antarabangsa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPeringkat}
              onChange={(e) => setFilterPeringkat(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="Semua">Semua Peringkat</option>
              <option value="Kebangsaan">Kebangsaan</option>
              <option value="Negeri">Negeri (SUKMA)</option>
              <option value="Antarabangsa">Antarabangsa</option>
              <option value="Daerah">Daerah</option>
            </select>
          </div>

          {bolehUrus && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalBuka(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Kejohanan
            </Button>
          )}
        </div>
      </div>

      {/* Senarai Kad Kejohanan */}
      <div className="space-y-4">
        {filtered.map((k) => (
          <div
            key={k.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge teks={k.peringkat} varian="emas" />
                <Badge
                  teks={k.status}
                  varian={k.status === 'Akan Datang' ? 'hijau' : 'kelabu'}
                />
                <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Tutup Pendaftaran: {k.tarikhTutupDaftar}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {k.namaKejohanan}
              </h3>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-mono tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {k.tarikhMula} hingga {k.tarikhTamat}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {k.lokasi}
                </span>
                <span className="font-semibold text-slate-700">
                  Yuran: {k.yuranPenyertaan === 0 ? 'Ditaja Sepenuhnya' : `RM ${k.yuranPenyertaan}/atlet`}
                </span>
              </div>

              {k.maklumatTambahan && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {k.maklumatTambahan}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
              <Button
                variant="gold"
                size="sm"
                onClick={() => onPilihDaftarKejohanan(k.id)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Urus Pendaftaran Atlet
              </Button>

              {bolehUrus && (
                <button
                  onClick={() => setIdUntukPadam(k.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Padam Kejohanan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Kejohanan */}
      <Modal
        isOpen={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Daftar Kejohanan Baharu"
        subtitle="Masukkan butiran kalendar kejohanan dan tarikh penting penganjur"
        maxWidth="lg"
      >
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nama Kejohanan
            </label>
            <input
              type="text"
              value={namaKejohanan}
              onChange={(e) => setNamaKejohanan(e.target.value)}
              placeholder="cth: Kejohanan Silat Remaja Kebangsaan 2026"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Peringkat
              </label>
              <select
                value={peringkat}
                onChange={(e) => setPeringkat(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Daerah">Daerah</option>
                <option value="Negeri">Negeri</option>
                <option value="Kebangsaan">Kebangsaan</option>
                <option value="Antarabangsa">Antarabangsa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Yuran Penyertaan (RM)
              </label>
              <input
                type="number"
                value={yuranPenyertaan}
                onChange={(e) => setYuranPenyertaan(Number(e.target.value))}
                min={0}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tarikh Mula
              </label>
              <input
                type="date"
                value={tarikhMula}
                onChange={(e) => setTarikhMula(e.target.value)}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tarikh Tamat
              </label>
              <input
                type="date"
                value={tarikhTamat}
                onChange={(e) => setTarikhTamat(e.target.value)}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tutup Pendaftaran
              </label>
              <input
                type="date"
                value={tarikhTutupDaftar}
                onChange={(e) => setTarikhTutupDaftar(e.target.value)}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Lokasi / Gelanggang
            </label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="cth: Stadium Titiwangsa, Kuala Lumpur"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Catatan & Maklumat Tambahan
            </label>
            <textarea
              value={maklumatTambahan}
              onChange={(e) => setMaklumatTambahan(e.target.value)}
              placeholder="Syarat kelayakan, peraturan penganjur..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Kejohanan
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
            onPadamKejohanan(idUntukPadam);
            setIdUntukPadam(null);
          }
        }}
        tajuk="Padam Kejohanan"
        mesej="Adakah anda pasti ingin mengeluarkan kejohanan ini daripada kalendar pasukan?"
      />
    </div>
  );
};
