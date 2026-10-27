/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileCheck2, Plus, CheckCircle, XCircle, Clock, Trash2, Filter, AlertCircle } from 'lucide-react';
import { PendaftaranAcara, Pesilat, Kejohanan, KategoriSilat, KelasTanding } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

interface PendaftaranViewProps {
  pendaftaranList: PendaftaranAcara[];
  pesilatList: Pesilat[];
  kejohananList: Kejohanan[];
  onTambahPendaftaran: (p: PendaftaranAcara) => void;
  onKemasKiniStatus: (id: string, status: 'Disahkan' | 'Dalam Semakan' | 'Ditolak') => void;
  onPadamPendaftaran: (id: string) => void;
  kejohananPilihanAwal?: string;
}

export const PendaftaranView: React.FC<PendaftaranViewProps> = ({
  pendaftaranList,
  pesilatList,
  kejohananList,
  onTambahPendaftaran,
  onKemasKiniStatus,
  onPadamPendaftaran,
  kejohananPilihanAwal
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehKelulusan = peranan === 'admin' || peranan === 'jurulatih';

  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [modalBuka, setModalBuka] = useState(false);

  // Form states
  const [kejohananId, setKejohananId] = useState(kejohananPilihanAwal || kejohananList[0]?.id || '');
  const [pesilatId, setPesilatId] = useState(
    peranan === 'ahli' && currentUser?.pesilatId
      ? currentUser.pesilatId
      : pesilatList[0]?.id || ''
  );
  const [kategori, setKategori] = useState<KategoriSilat>('Tanding');
  const [kelas, setKelas] = useState<KelasTanding>('Kelas B (50-55 kg)');
  const [catatan, setCatatan] = useState('');

  const [idUntukPadam, setIdUntukPadam] = useState<string | null>(null);

  // Jika ahli log masuk, paparkan pendaftaran peribadi sahaja melainkan admin/jurulatih
  const filtered = pendaftaranList.filter((item) => {
    if (peranan === 'ahli' && currentUser?.pesilatId && item.pesilatId !== currentUser.pesilatId) {
      return false;
    }
    if (filterStatus !== 'Semua' && item.statusKelulusan !== filterStatus) {
      return false;
    }
    return true;
  });

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    const kjh = kejohananList.find((k) => k.id === kejohananId);
    const pslt = pesilatList.find((p) => p.id === pesilatId);

    if (!kjh || !pslt) return;

    const dataBaru: PendaftaranAcara = {
      id: `pdft-${Date.now()}`,
      kejohananId: kjh.id,
      namaKejohanan: kjh.namaKejohanan,
      pesilatId: pslt.id,
      namaPesilat: pslt.namaPenuh,
      kategori,
      kelas,
      statusKelulusan: peranan === 'admin' ? 'Disahkan' : 'Dalam Semakan',
      tarikhDaftar: new Date().toISOString().split('T')[0],
      catatanPengurus: catatan.trim() || undefined
    };

    onTambahPendaftaran(dataBaru);
    setModalBuka(false);
    setCatatan('');
  };

  return (
    <div className="space-y-6">
      {/* Bar Atas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pendaftaran Acara & Kejohanan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pesilat mengikut kategori tanding atau seni, dan urus kelulusan penyertaan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Disahkan">Disahkan</option>
              <option value="Dalam Semakan">Dalam Semakan</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalBuka(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Daftar Acara
          </Button>
        </div>
      </div>

      {/* Jadual Pendaftaran */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              tajuk="Tiada rekod pendaftaran acara"
              keterangan="Belum ada penyertaan atlet yang didaftarkan bagi kriteria yang dipilih."
              tindakanLabel="Daftar Acara Sekarang"
              onTindakan={() => setModalBuka(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Kejohanan</th>
                  <th className="px-4 py-3">Pesilat</th>
                  <th className="px-4 py-3">Kategori & Kelas</th>
                  <th className="px-4 py-3">Tarikh Daftar</th>
                  <th className="px-4 py-3">Status Pengesahan</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {item.namaKejohanan}
                      </div>
                      {item.catatanPengurus && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Nota: {item.catatanPengurus}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {item.namaPesilat}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{item.kategori}</div>
                      <div className="text-[11px] text-slate-500">{item.kelas}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                      {item.tarikhDaftar}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        teks={item.statusKelulusan}
                        varian={
                          item.statusKelulusan === 'Disahkan'
                            ? 'hijau'
                            : item.statusKelulusan === 'Ditolak'
                            ? 'merah'
                            : 'emas'
                        }
                      />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {bolehKelulusan && item.statusKelulusan !== 'Disahkan' && (
                          <button
                            onClick={() => onKemasKiniStatus(item.id, 'Disahkan')}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer"
                            title="Sahkan Pendaftaran"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {bolehKelulusan && item.statusKelulusan !== 'Ditolak' && (
                          <button
                            onClick={() => onKemasKiniStatus(item.id, 'Ditolak')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Tolak Pendaftaran"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(bolehKelulusan || peranan === 'ahli') && (
                          <button
                            onClick={() => setIdUntukPadam(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Batal Pendaftaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Borang Pendaftaran */}
      <Modal
        isOpen={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Borang Pendaftaran Atlet ke Kejohanan"
        subtitle="Pilih temasya kejohanan, atlet kontinjen, dan kategori acara"
        maxWidth="lg"
      >
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Pilih Kejohanan
            </label>
            <select
              value={kejohananId}
              onChange={(e) => setKejohananId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
            >
              {kejohananList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKejohanan} ({k.peringkat})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Pilih Pesilat
            </label>
            <select
              value={pesilatId}
              onChange={(e) => {
                setPesilatId(e.target.value);
                const p = pesilatList.find((item) => item.id === e.target.value);
                if (p) {
                  setKategori(p.kategoriUtama);
                  setKelas(p.kelasTanding);
                }
              }}
              disabled={peranan === 'ahli'}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 disabled:bg-slate-100"
            >
              {pesilatList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.namaPenuh} ({p.kelasTanding} · {p.beratKg} kg)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kategori Acara
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as KategoriSilat)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Tanding">Tanding (Olahraga)</option>
                <option value="Tunggal">Seni Tunggal Baku</option>
                <option value="Ganda">Seni Ganda Kreatif</option>
                <option value="Regu">Seni Regu Jurus Wajib</option>
                <option value="Solo Kreatif">Solo Kreatif</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kelas Tanding
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value as KelasTanding)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Bebas (Seni / Terbuka)">Bebas (Seni / Terbuka)</option>
                <option value="Kelas A (45-50 kg)">Kelas A (45-50 kg)</option>
                <option value="Kelas B (50-55 kg)">Kelas B (50-55 kg)</option>
                <option value="Kelas C (55-60 kg)">Kelas C (55-60 kg)</option>
                <option value="Kelas D (60-65 kg)">Kelas D (60-65 kg)</option>
                <option value="Kelas E (65-70 kg)">Kelas E (65-70 kg)</option>
                <option value="Kelas F (70-75 kg)">Kelas F (70-75 kg)</option>
                <option value="Kelas G (75-80 kg)">Kelas G (75-80 kg)</option>
                <option value="Kelas H (80-85 kg)">Kelas H (80-85 kg)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Catatan Pengurus / Pesilat
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="cth: Telah melepasi ujian saringan perubatan awal..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Hantar Pendaftaran
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
            onPadamPendaftaran(idUntukPadam);
            setIdUntukPadam(null);
          }
        }}
        tajuk="Batal Pendaftaran"
        mesej="Adakah anda pasti ingin membatalkan penyertaan acara ini?"
      />
    </div>
  );
};
