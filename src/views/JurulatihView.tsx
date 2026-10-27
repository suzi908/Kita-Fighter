/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Plus, Phone, Mail, Award, Clock, UserCheck, Trash2 } from 'lucide-react';
import { Jurulatih, TahapBengkung } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

interface JurulatihViewProps {
  jurulatihList: Jurulatih[];
  onTambahJurulatih: (j: Jurulatih) => void;
  onPadamJurulatih: (id: string) => void;
}

export const JurulatihView: React.FC<JurulatihViewProps> = ({
  jurulatihList,
  onTambahJurulatih,
  onPadamJurulatih
}) => {
  const { currentUser } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';
  const bolehUrus = peranan === 'admin';

  const [modalBuka, setModalBuka] = useState(false);
  const [namaPenuh, setNamaPenuh] = useState('');
  const [noTel, setNoTel] = useState('');
  const [email, setEmail] = useState('');
  const [pengkhususan, setPengkhususan] = useState<
    'Olahraga (Tanding)' | 'Seni Silat (Jurus)' | 'Kecergasan & Fizikal' | 'Ketua Jurulatih'
  >('Olahraga (Tanding)');
  const [tahapBengkung, setTahapBengkung] = useState<TahapBengkung>('Hitam Jurulatih Kanan');
  const [gredKejurulatihan, setGredKejurulatihan] = useState<
    'Kebangsaan Tahap 1' | 'Kebangsaan Tahap 2' | 'Antarabangsa (PERSILAT)'
  >('Kebangsaan Tahap 2');
  const [tahunPengalaman, setTahunPengalaman] = useState(10);

  const [idUntukPadam, setIdUntukPadam] = useState<string | null>(null);

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPenuh.trim()) return;

    const dataBaru: Jurulatih = {
      id: `jrl-${Date.now()}`,
      namaPenuh: namaPenuh.trim(),
      noTel: noTel || '+6012-000-0000',
      email: email || 'jurulatih@silat.org.my',
      pengkhususan,
      tahapBengkung,
      gredKejurulatihan,
      status: 'Aktif',
      tahunPengalaman: Number(tahunPengalaman)
    };

    onTambahJurulatih(dataBaru);
    setModalBuka(false);
    setNamaPenuh('');
    setNoTel('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Tajuk & Butang Tindakan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Barisan Pegawai Kejurulatihan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tenaga pengajar bertauliah, sijil kejurulatihan kebangsaan dan persilatan antarabangsa
          </p>
        </div>

        {bolehUrus && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalBuka(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Jurulatih
          </Button>
        )}
      </div>

      {/* Grid Jurulatih */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {jurulatihList.map((j) => (
          <div
            key={j.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 text-amber-400 font-extrabold flex items-center justify-center text-lg border border-amber-500 shrink-0">
                    🥋
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {j.namaPenuh}
                    </h3>
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                      {j.pengkhususan}
                    </p>
                  </div>
                </div>

                <Badge
                  teks={j.status}
                  varian={j.status === 'Aktif' ? 'hijau' : 'kelabu'}
                />
              </div>

              <div className="py-3.5 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Gred Kejurulatihan:
                  </span>
                  <strong className="text-slate-900">{j.gredKejurulatihan}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    Tahap Bengkung:
                  </span>
                  <Badge teks={j.tahapBengkung} varian="bengkung" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Pengalaman:
                  </span>
                  <span className="font-mono tabular-nums text-slate-800 font-medium">
                    {j.tahunPengalaman} tahun
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <a
                  href={`tel:${j.noTel}`}
                  className="hover:text-emerald-800 flex items-center gap-1 font-mono tabular-nums"
                  title="Hubungi"
                >
                  <Phone className="w-3 h-3" />
                  <span>{j.noTel}</span>
                </a>
              </div>

              {bolehUrus && (
                <button
                  onClick={() => setIdUntukPadam(j.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  title="Padam Jurulatih"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Jurulatih */}
      <Modal
        isOpen={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Daftar Jurulatih Baharu"
        subtitle="Maklumat tauliah dan pengkhususan pegawai teknikal pasukan"
        maxWidth="lg"
      >
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nama Penuh Jurulatih
            </label>
            <input
              type="text"
              value={namaPenuh}
              onChange={(e) => setNamaPenuh(e.target.value)}
              placeholder="cth: Cikgu Ahmad Faiz bin Jamal"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                No. Telefon
              </label>
              <input
                type="text"
                value={noTel}
                onChange={(e) => setNoTel(e.target.value)}
                placeholder="+6012-345-6789"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
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
                placeholder="faiz.silat@gmail.com"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pengkhususan Latihan
              </label>
              <select
                value={pengkhususan}
                onChange={(e) => setPengkhususan(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Olahraga (Tanding)">Olahraga (Tanding)</option>
                <option value="Seni Silat (Jurus)">Seni Silat (Jurus)</option>
                <option value="Kecergasan & Fizikal">Kecergasan & Fizikal</option>
                <option value="Ketua Jurulatih">Ketua Jurulatih</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Gred Kejurulatihan
              </label>
              <select
                value={gredKejurulatihan}
                onChange={(e) => setGredKejurulatihan(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Kebangsaan Tahap 1">Kebangsaan Tahap 1</option>
                <option value="Kebangsaan Tahap 2">Kebangsaan Tahap 2</option>
                <option value="Antarabangsa (PERSILAT)">Antarabangsa (PERSILAT)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tahap Bengkung
              </label>
              <select
                value={tahapBengkung}
                onChange={(e) => setTahapBengkung(e.target.value as any)}
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
              >
                <option value="Hitam">Hitam</option>
                <option value="Hitam Pendekar">Hitam Pendekar</option>
                <option value="Hitam Jurulatih Kanan">Hitam Jurulatih Kanan</option>
                <option value="Bengkung Merah">Bengkung Merah</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pengalaman (Tahun)
              </label>
              <input
                type="number"
                value={tahunPengalaman}
                onChange={(e) => setTahunPengalaman(Number(e.target.value))}
                min={1}
                max={50}
                required
                className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<UserCheck className="w-3.5 h-3.5" />}>
              Daftar Jurulatih
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
            onPadamJurulatih(idUntukPadam);
            setIdUntukPadam(null);
          }
        }}
        tajuk="Padam Jurulatih"
        mesej="Adakah anda pasti ingin mengeluarkan jurulatih ini daripada senarai pasukan?"
      />
    </div>
  );
};
