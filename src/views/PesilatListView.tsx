/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Filter, Trash2, Eye, UserPlus } from 'lucide-react';
import { Pesilat, KategoriSilat, KelasTanding, TahapBengkung } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

interface PesilatListViewProps {
  pesilatList: Pesilat[];
  onPilihPesilat: (pesilat: Pesilat) => void;
  onTambahPesilat: (pesilatBaru: Pesilat) => void;
  onPadamPesilat: (id: string) => void;
}

export const PesilatListView: React.FC<PesilatListViewProps> = ({
  pesilatList,
  onPilihPesilat,
  onTambahPesilat,
  onPadamPesilat
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehUrus = peranan === 'admin' || peranan === 'jurulatih';

  const [carian, setCarian] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterBengkung, setFilterBengkung] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Modal Tambah
  const [modalBuka, setModalBuka] = useState(false);
  const [namaPenuh, setNamaPenuh] = useState('');
  const [jantina, setJantina] = useState<'Lelaki' | 'Wanita'>('Lelaki');
  const [umur, setUmur] = useState(20);
  const [beratKg, setBeratKg] = useState(54.0);
  const [beratSasaranKg, setBeratSasaranKg] = useState(54.0);
  const [tinggiCm, setTinggiCm] = useState(172);
  const [kategoriUtama, setKategoriUtama] = useState<KategoriSilat>('Tanding');
  const [kelasTanding, setKelasTanding] = useState<KelasTanding>('Kelas B (50-55 kg)');
  const [tahapBengkung, setTahapBengkung] = useState<TahapBengkung>('Coklat');
  const [negeriAsal, setNegeriAsal] = useState('Selangor');
  const [namaWaris, setNamaWaris] = useState('');
  const [noTelWaris, setNoTelWaris] = useState('');

  // Dialog Padam
  const [idUntukPadam, setIdUntukPadam] = useState<string | null>(null);

  const filtered = pesilatList.filter((p) => {
    const padanTeks =
      p.namaPenuh.toLowerCase().includes(carian.toLowerCase()) ||
      p.noDaftar.toLowerCase().includes(carian.toLowerCase()) ||
      p.negeriAsal.toLowerCase().includes(carian.toLowerCase());
    const padanKategori = filterKategori === 'Semua' || p.kategoriUtama === filterKategori;
    const padanBengkung = filterBengkung === 'Semua' || p.tahapBengkung === filterBengkung;
    const padanStatus = filterStatus === 'Semua' || p.status === filterStatus;
    return padanTeks && padanKategori && padanBengkung && padanStatus;
  });

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPenuh.trim()) return;

    const noDaftarAuto = `PS-2026-${String(pesilatList.length + 1).padStart(3, '0')}`;
    const noIcSintetik = `0${Math.floor(Math.random() * 9 + 1)}0${Math.floor(
      Math.random() * 9 + 1
    )}12-10-${Math.floor(Math.random() * 8999 + 1000)}`;

    const dataBaru: Pesilat = {
      id: `pslt-${Date.now()}`,
      namaPenuh: namaPenuh.trim(),
      noDaftar: noDaftarAuto,
      noKadPengenalanSintetik: noIcSintetik,
      jantina,
      umur: Number(umur),
      beratKg: Number(beratKg),
      beratSasaranKg: Number(beratSasaranKg),
      tinggiCm: Number(tinggiCm),
      kategoriUtama,
      kelasTanding,
      tahapBengkung,
      status: 'Aktif',
      negeriAsal,
      tarikhDaftar: new Date().toISOString().split('T')[0],
      rekodPerlawanan: { menang: 0, kalah: 0, seri: 0 },
      catatanKesihatan: 'Kesihatan disahkan layak bertanding oleh panel perubatan kontinjen.',
      namaWaris: namaWaris || 'Waris Pesilat',
      noTelWaris: noTelWaris || '+6012-000-0000'
    };

    onTambahPesilat(dataBaru);
    setModalBuka(false);
    setNamaPenuh('');
  };

  return (
    <div className="space-y-6">
      {/* Bar Tindakan & Carian */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Pangkalan Data & Senarai Pesilat
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urus profil pesilat, kategori acara, dan status kelayakan kontinjen
            </p>
          </div>

          {bolehUrus && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalBuka(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Pesilat Baharu
            </Button>
          )}
        </div>

        {/* Input Carian dan Penapis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={carian}
              onChange={(e) => setCarian(e.target.value)}
              placeholder="Cari nama, no daftar, negeri..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Tanding">Tanding</option>
              <option value="Tunggal">Seni Tunggal</option>
              <option value="Ganda">Seni Ganda</option>
              <option value="Regu">Seni Regu</option>
              <option value="Solo Kreatif">Solo Kreatif</option>
            </select>
          </div>

          <div>
            <select
              value={filterBengkung}
              onChange={(e) => setFilterBengkung(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Bengkung</option>
              <option value="Kuning">Bengkung Kuning</option>
              <option value="Hijau">Bengkung Hijau</option>
              <option value="Biru">Bengkung Biru</option>
              <option value="Coklat">Bengkung Coklat</option>
              <option value="Hitam">Bengkung Hitam</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Cedera">Cedera</option>
              <option value="Rehat">Rehat</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jadual Senarai Pesilat */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              tajuk="Tiada pesilat dijumpai"
              keterangan="Sila laraskan semula kata kunci carian atau tetapan penapis anda."
              tindakanLabel={bolehUrus ? 'Tambah Pesilat Baharu' : undefined}
              onTindakan={bolehUrus ? () => setModalBuka(true) : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Nama & No. Daftar</th>
                  <th className="px-4 py-3">Kategori & Kelas</th>
                  <th className="px-4 py-3">Bengkung</th>
                  <th className="px-4 py-3">Berat / Sasaran</th>
                  <th className="px-4 py-3">Rekod Skuad</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const selisihBerat = (p.beratKg - p.beratSasaranKg).toFixed(1);
                  const isWeightOk = Math.abs(p.beratKg - p.beratSasaranKg) <= 0.8;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{p.namaPenuh}</div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {p.noDaftar} · {p.negeriAsal}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{p.kategoriUtama}</div>
                        <div className="text-[11px] text-slate-500">{p.kelasTanding}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge teks={p.tahapBengkung} varian="bengkung" />
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums text-slate-700">
                        <div>
                          <strong className="text-slate-900">{p.beratKg} kg</strong> / {p.beratSasaranKg} kg
                        </div>
                        <div className={`text-[10px] ${isWeightOk ? 'text-emerald-700' : 'text-amber-700 font-semibold'}`}>
                          {Number(selisihBerat) > 0 ? `+${selisihBerat} kg` : `${selisihBerat} kg`}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                        <span className="text-emerald-700 font-bold">{p.rekodPerlawanan.menang}M</span> -{' '}
                        <span className="text-rose-700">{p.rekodPerlawanan.kalah}K</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          teks={p.status}
                          varian={p.status === 'Aktif' ? 'hijau' : p.status === 'Cedera' ? 'merah' : 'kelabu'}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onPilihPesilat(p)}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Profil
                          </Button>
                          {bolehUrus && (
                            <button
                              onClick={() => setIdUntukPadam(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="Padam Pesilat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Pesilat */}
      <Modal
        isOpen={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Daftar Pesilat Baharu"
        subtitle="Masukkan butiran peribadi dan kategori sukan pesilat"
        maxWidth="xl"
      >
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nama Penuh Pesilat
            </label>
            <input
              type="text"
              value={namaPenuh}
              onChange={(e) => setNamaPenuh(e.target.value)}
              placeholder="cth: Muhammad Hariz bin Kamaruddin"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jantina
              </label>
              <select
                value={jantina}
                onChange={(e) => setJantina(e.target.value as 'Lelaki' | 'Wanita')}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Lelaki">Lelaki</option>
                <option value="Wanita">Wanita</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Umur (Tahun)
              </label>
              <input
                type="number"
                value={umur}
                onChange={(e) => setUmur(Number(e.target.value))}
                min={14}
                max={40}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Negeri Asal
              </label>
              <input
                type="text"
                value={negeriAsal}
                onChange={(e) => setNegeriAsal(e.target.value)}
                placeholder="cth: Selangor"
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Berat Semasa (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={beratKg}
                onChange={(e) => setBeratKg(Number(e.target.value))}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Sasaran Timbang (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={beratSasaranKg}
                onChange={(e) => setBeratSasaranKg(Number(e.target.value))}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Ketinggian (cm)
              </label>
              <input
                type="number"
                value={tinggiCm}
                onChange={(e) => setTinggiCm(Number(e.target.value))}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kategori Silat
              </label>
              <select
                value={kategoriUtama}
                onChange={(e) => setKategoriUtama(e.target.value as KategoriSilat)}
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
                value={kelasTanding}
                onChange={(e) => setKelasTanding(e.target.value as KelasTanding)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Bebas (Seni / Terbuka)">Bebas (Seni / Terbuka)</option>
                <option value="Kelas A (45-50 kg)">Kelas A (45-50 kg)</option>
                <option value="Kelas B (50-55 kg)">Kelas B (50-55 kg)</option>
                <option value="Kelas C (55-60 kg)">Kelas C (55-60 kg)</option>
                <option value="Kelas D (60-65 kg)">Kelas D (60-65 kg)</option>
                <option value="Kelas E (65-70 kg)">Kelas E (65-70 kg)</option>
                <option value="Kelas F (70-75 kg)">Kelas F (70-75 kg)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tahap Bengkung
              </label>
              <select
                value={tahapBengkung}
                onChange={(e) => setTahapBengkung(e.target.value as TahapBengkung)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Kuning">Kuning</option>
                <option value="Hijau">Hijau</option>
                <option value="Biru">Biru</option>
                <option value="Coklat">Coklat</option>
                <option value="Hitam">Hitam</option>
                <option value="Hitam Pendekar">Hitam Pendekar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Waris / Penjaga
              </label>
              <input
                type="text"
                value={namaWaris}
                onChange={(e) => setNamaWaris(e.target.value)}
                placeholder="cth: Kamaruddin bin Hassan"
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                No. Telefon Waris
              </label>
              <input
                type="text"
                value={noTelWaris}
                onChange={(e) => setNoTelWaris(e.target.value)}
                placeholder="cth: +6012-345-6789"
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<UserPlus className="w-3.5 h-3.5" />}>
              Daftar Pesilat
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog Pengesahan Padam */}
      <ConfirmDialog
        isOpen={idUntukPadam !== null}
        onBatal={() => setIdUntukPadam(null)}
        onSahkan={() => {
          if (idUntukPadam) {
            onPadamPesilat(idUntukPadam);
            setIdUntukPadam(null);
          }
        }}
        tajuk="Sahkan Pemadaman Rekod Pesilat"
        mesej="Adakah anda pasti ingin memadam rekod atlet ini daripada pangkalan data skuad? Tindakan ini tidak boleh diundur."
        labelSahkan="Padam Rekod"
      />
    </div>
  );
};
