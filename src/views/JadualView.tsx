/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin, Trash2, Filter } from 'lucide-react';
import { SesiLatihan, Jurulatih } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

interface JadualViewProps {
  jadualList: SesiLatihan[];
  jurulatihList: Jurulatih[];
  onTambahSesi: (sesi: SesiLatihan) => void;
  onPadamSesi: (id: string) => void;
  onPilihSesiKehadiran: (sesiId: string) => void;
}

export const JadualView: React.FC<JadualViewProps> = ({
  jadualList,
  jurulatihList,
  onTambahSesi,
  onPadamSesi,
  onPilihSesiKehadiran
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehUrus = peranan === 'admin' || peranan === 'jurulatih';

  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [modalBuka, setModalBuka] = useState(false);

  // Form states
  const [tajuk, setTajuk] = useState('');
  const [tarikh, setTarikh] = useState(new Date().toISOString().split('T')[0]);
  const [masaMula, setMasaMula] = useState('17:00');
  const [masaTamat, setMasaTamat] = useState('19:00');
  const [lokasi, setLokasi] = useState('Gelanggang Utama Kompleks Sukan');
  const [jurulatihId, setJurulatihId] = useState(jurulatihList[0]?.id || '');
  const [fokusLatihan, setFokusLatihan] = useState('');
  const [jenisSesi, setJenisSesi] = useState<
    'Fizikal & Kardio' | 'Teknik Tanding & Sparring' | 'Kekemasan Jurus Seni' | 'Ujian Timbang Berat'
  >('Teknik Tanding & Sparring');

  const [idUntukPadam, setIdUntukPadam] = useState<string | null>(null);

  const filtered = jadualList.filter((s) => {
    if (filterJenis === 'Semua') return true;
    return s.jenisSesi === filterJenis;
  });

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tajuk.trim()) return;

    const jrl = jurulatihList.find((j) => j.id === jurulatihId) || jurulatihList[0];

    const sesiBaru: SesiLatihan = {
      id: `sesi-${Date.now()}`,
      tajuk: tajuk.trim(),
      tarikh,
      masaMula,
      masaTamat,
      lokasi,
      jurulatihId: jrl?.id || 'jrl-01',
      jurulatihNama: jrl?.namaPenuh || 'Jurulatih Bertugas',
      fokusLatihan: fokusLatihan.trim() || 'Latihan intensif silat dan kecergasan',
      jenisSesi
    };

    onTambahSesi(sesiBaru);
    setModalBuka(false);
    setTajuk('');
    setFokusLatihan('');
  };

  return (
    <div className="space-y-6">
      {/* Bar Atas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Takwim & Jadual Latihan Pasukan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesi latihan fizikal, sparring perlawanan, seni jurus dan saringan berat badan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="Semua">Semua Jenis Sesi</option>
              <option value="Teknik Tanding & Sparring">Tanding & Sparring</option>
              <option value="Kekemasan Jurus Seni">Seni Jurus</option>
              <option value="Fizikal & Kardio">Fizikal & Kardio</option>
              <option value="Ujian Timbang Berat">Ujian Timbang Berat</option>
            </select>
          </div>

          {bolehUrus && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalBuka(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Sesi
            </Button>
          )}
        </div>
      </div>

      {/* Grid Sesi Latihan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <Badge teks={s.jenisSesi} varian="emas" />
                <span className="text-xs font-mono tabular-nums text-slate-600 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {s.tarikh}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                {s.tajuk}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono tabular-nums text-slate-700">
                    {s.masaMula} - {s.masaTamat}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-700">{s.lokasi}</span>
                </div>
                <div className="text-emerald-800 font-semibold pt-1">
                  Pegawai Bertugas: {s.jurulatihNama}
                </div>
              </div>

              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                <strong className="text-slate-900 block mb-0.5">Fokus Latihan:</strong>
                {s.fokusLatihan}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPilihSesiKehadiran(s.id)}
              >
                Lihat Kehadiran Sesi &rarr;
              </Button>

              {bolehUrus && (
                <button
                  onClick={() => setIdUntukPadam(s.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  title="Padam Sesi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Sesi */}
      <Modal
        isOpen={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Jadualkan Sesi Latihan Baharu"
        subtitle="Tetapkan tarikh, masa, lokasi, dan modul penekanan latihan"
        maxWidth="lg"
      >
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tajuk Sesi Latihan
            </label>
            <input
              type="text"
              value={tajuk}
              onChange={(e) => setTajuk(e.target.value)}
              placeholder="cth: Latihan Sparring & Taktikal Skor 3 Mata"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tarikh
              </label>
              <input
                type="date"
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Masa Mula
              </label>
              <input
                type="time"
                value={masaMula}
                onChange={(e) => setMasaMula(e.target.value)}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Masa Tamat
              </label>
              <input
                type="time"
                value={masaTamat}
                onChange={(e) => setMasaTamat(e.target.value)}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jenis Modul Sesi
              </label>
              <select
                value={jenisSesi}
                onChange={(e) => setJenisSesi(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Teknik Tanding & Sparring">Teknik Tanding & Sparring</option>
                <option value="Kekemasan Jurus Seni">Kekemasan Jurus Seni</option>
                <option value="Fizikal & Kardio">Fizikal & Kardio</option>
                <option value="Ujian Timbang Berat">Ujian Timbang Berat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jurulatih Bertugas
              </label>
              <select
                value={jurulatihId}
                onChange={(e) => setJurulatihId(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                {jurulatihList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.namaPenuh} ({j.pengkhususan})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Lokasi Gelanggang
            </label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="cth: Gelanggang Utama MSN Bukit Jalil"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Fokus & Arahan Latihan
            </label>
            <textarea
              value={fokusLatihan}
              onChange={(e) => setFokusLatihan(e.target.value)}
              placeholder="cth: Latihan teknik jatuhan susup dan tendangan sisi..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Sesi
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
            onPadamSesi(idUntukPadam);
            setIdUntukPadam(null);
          }
        }}
        tajuk="Padam Sesi Latihan"
        mesej="Adakah anda pasti ingin memadamkan sesi latihan ini daripada takwim pasukan?"
      />
    </div>
  );
};
