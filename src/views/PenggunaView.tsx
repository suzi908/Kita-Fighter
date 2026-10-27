/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserCog, UserPlus, ShieldAlert, Check, Mail, UserCheck, Shield } from 'lucide-react';
import { Pengguna, Peranan } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

interface PenggunaViewProps {
  penggunaList: Pengguna[];
  onTukarPerananPengguna: (id: string, perananBaru: Peranan) => void;
  onTambahPengguna: (p: Pengguna) => void;
}

export const PenggunaView: React.FC<PenggunaViewProps> = ({
  penggunaList,
  onTukarPerananPengguna,
  onTambahPengguna
}) => {
  const [modalBuka, setModalBuka] = useState(false);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [peranan, setPeranan] = useState<Peranan>('ahli');

  const [mesejKemasKini, setMesejKemasKini] = useState<string | null>(null);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) return;

    const dataBaru: Pengguna = {
      id: `usr-${Date.now()}`,
      nama: nama.trim(),
      email: email.trim(),
      peranan,
      statusAkaun: 'Aktif',
      tarikhDaftar: new Date().toISOString().split('T')[0]
    };

    onTambahPengguna(dataBaru);
    setModalBuka(false);
    setNama('');
    setEmail('');
    setMesejKemasKini(`Pengguna ${dataBaru.nama} berjaya ditambah dengan peranan ${dataBaru.peranan}!`);
    setTimeout(() => setMesejKemasKini(null), 3000);
  };

  const handleChangeRole = (id: string, newRole: Peranan) => {
    onTukarPerananPengguna(id, newRole);
    setMesejKemasKini('Peranan pengguna berjaya dikemas kini!');
    setTimeout(() => setMesejKemasKini(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Peringatan Keselamatan Penting */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">
            Kawalan Akses Berperingkat & Dasar Keselamatan (RLS)
          </p>
          <p className="text-amber-800 leading-relaxed">
            Peranan pengguna menentukan menu dan antara muka yang boleh diakses. Sila pastikan bahawa dalam persekitaran Supabase PostgreSQL sebenar, dasar <strong>Row Level Security (RLS)</strong> telah diaktifkan untuk melindungi data daripada akses tanpa kebenaran di peringkat API.
          </p>
        </div>
      </div>

      {/* Bar Atas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pengurusan Akaun & Hak Akses Pasukan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Senarai akaun pentadbir, barisan jurulatih teknikal, dan ahli pesilat
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalBuka(true)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Jemput Pengguna Baharu
        </Button>
      </div>

      {mesejKemasKini && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{mesejKemasKini}</span>
        </div>
      )}

      {/* Jadual Senarai Pengguna */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-600">
              <tr>
                <th className="px-5 py-3">Nama & Alamat E-mel</th>
                <th className="px-4 py-3">Peranan Semasa</th>
                <th className="px-4 py-3">Status Akaun</th>
                <th className="px-4 py-3">Tarikh Berdaftar</th>
                <th className="px-4 py-3 text-right">Tukar Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penggunaList.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {usr.nama}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {usr.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      teks={
                        usr.peranan === 'admin'
                          ? 'Pentadbir (Admin)'
                          : usr.peranan === 'jurulatih'
                          ? 'Jurulatih'
                          : 'Ahli Pasukan'
                      }
                      varian={usr.peranan === 'admin' ? 'emas' : usr.peranan === 'jurulatih' ? 'hijau' : 'kelabu'}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge teks={usr.statusAkaun} varian="hijau" />
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600">
                    {usr.tarikhDaftar}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <select
                      value={usr.peranan}
                      onChange={(e) => handleChangeRole(usr.id, e.target.value as Peranan)}
                      className="text-xs font-semibold border border-slate-300 rounded px-2.5 py-1 bg-white text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="admin">Admin (Akses Penuh)</option>
                      <option value="jurulatih">Jurulatih (Latihan/Kejohanan)</option>
                      <option value="ahli">Ahli Pasukan (Pesilat)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Jemput Pengguna */}
      <Modal
        isOpen={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Jemput Pengguna Baharu ke Sistem"
        subtitle="Tetapkan e-mel dan hak akses peranan dalam pengurusan skuad"
        maxWidth="md"
      >
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nama Penuh
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="cth: Ustaz Wan Haris bin Hassan"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Alamat E-mel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@silat.org.my"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Peranan Pengguna
            </label>
            <select
              value={peranan}
              onChange={(e) => setPeranan(e.target.value as Peranan)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
            >
              <option value="ahli">Ahli Pasukan (Pesilat - Lihat Profil, Jadual & Kehadiran)</option>
              <option value="jurulatih">Jurulatih (Urus Latihan, Kehadiran & Skuad)</option>
              <option value="admin">Pentadbir (Admin - Kawalan Penuh Sistem)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<UserCheck className="w-3.5 h-3.5" />}>
              Hantar Jemputan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
