/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  LogIn,
  Key,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  UserPlus,
  ArrowLeft,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Peranan } from '../types';
import { Button } from '../components/common/Button';
import { isSupabaseConfigured } from '../lib/supabase';

interface LoginViewProps {
  onOpenDbConfig?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenDbConfig }) => {
  const {
    loginWithSupabase,
    loginDemo,
    resetPasswordWithSupabase,
    signUpWithSupabase,
    authLoading,
    authError,
    clearAuthError
  } = useAuth();

  const isLive = isSupabaseConfigured();

  // Mode: 'login' | 'reset' | 'signup'
  const [mode, setMode] = useState<'login' | 'reset' | 'signup'>('login');

  const [email, setEmail] = useState('admin@silatmelayu.org.my');
  const [password, setPassword] = useState('password123');
  const [namaPenuh, setNamaPenuh] = useState('');
  const [peranan, setPeranan] = useState<Peranan>('admin');

  const [mesejBerjaya, setMesejBerjaya] = useState<string | null>(null);
  const [sedangMemproses, setSedangMemproses] = useState(false);

  // Tukar kredensial pra-set demo
  const setPresetUser = (p: Peranan) => {
    setPeranan(p);
    if (p === 'admin') setEmail('admin@silatmelayu.org.my');
    else if (p === 'jurulatih') setEmail('shahrul.silat@gmail.com');
    else setEmail('danial.razak@pesilat.my');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setMesejBerjaya(null);
    setSedangMemproses(true);

    if (isLive) {
      const res = await loginWithSupabase(email, password);
      setSedangMemproses(false);
      if (!res.success && !res.error) {
        // Fallback jika pengguna ingin terus menggunakan sesi demo
        loginDemo(email, peranan);
      }
    } else {
      // Mod simulasi tempatan
      setTimeout(() => {
        loginDemo(email, peranan);
        setSedangMemproses(false);
      }, 300);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setSedangMemproses(true);

    const res = await resetPasswordWithSupabase(email);
    setSedangMemproses(false);

    if (res.success) {
      setMesejBerjaya('Pautan set semula kata laluan telah dihantar ke alamat e-mel anda.');
    } else {
      // jika belum ada konfigurasi Supabase
      if (!isLive) {
        setMesejBerjaya('Dalam mod prototaip, pautan set semula disimulasikan untuk e-mel ini.');
      }
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setSedangMemproses(true);

    if (isLive) {
      const res = await signUpWithSupabase(email, password, namaPenuh || email.split('@')[0], peranan);
      setSedangMemproses(false);
      if (res.success) {
        setMesejBerjaya(res.message || 'Pendaftaran akaun berjaya! Anda kini boleh log masuk.');
        setMode('login');
      }
    } else {
      setTimeout(() => {
        loginDemo(email, peranan);
        setSedangMemproses(false);
      }, 400);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-950 to-black">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden">
        {/* Kepala Kad */}
        <div className="bg-emerald-950 p-6 text-center text-white border-b-2 border-amber-500 relative">
          <div className="w-14 h-14 bg-amber-500 text-emerald-950 text-2xl font-black rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md border border-amber-300">
            ⚡
          </div>
          <h1 className="text-xl font-extrabold tracking-wide text-white">
            SISTEM PENGURUSAN SILAT
          </h1>
          <p className="text-xs text-amber-400 font-medium mt-1">
            Pengesahan Selamat Pasukan & Supabase Auth
          </p>

          {/* Status Penunjuk Sambungan */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                isLive
                  ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
            >
              <Database className="w-3 h-3" />
              {isLive ? 'Supabase Auth Aktif' : 'Mod Prototaip Simulative'}
            </span>
            {onOpenDbConfig && (
              <button
                type="button"
                onClick={onOpenDbConfig}
                className="text-[11px] text-amber-400 hover:text-white underline cursor-pointer"
              >
                Urus Kunci
              </button>
            )}
          </div>
        </div>

        {/* Mesej Ralat / Berjaya */}
        {authError && (
          <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{authError}</p>
            </div>
          </div>
        )}

        {mesejBerjaya && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{mesejBerjaya}</p>
            </div>
          </div>
        )}

        {/* =========================================================================
            BORANG LOG MASUK
           ========================================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat E-mel
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cth: pegawai@silat.org.my"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kata Laluan
                </label>
                <button
                  type="button"
                  onClick={() => {
                    clearAuthError();
                    setMesejBerjaya(null);
                    setMode('reset');
                  }}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer"
                >
                  Lupa Kata Laluan?
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            {/* Pemilih Pantas Peranan (Berguna untuk semakan pantas profil) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Pilih Akses Pengguna (Simulasi / Ujian Pantas)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPresetUser('admin')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                    peranan === 'admin'
                      ? 'bg-amber-500 text-emerald-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setPresetUser('jurulatih')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                    peranan === 'jurulatih'
                      ? 'bg-amber-500 text-emerald-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Jurulatih
                </button>
                <button
                  type="button"
                  onClick={() => setPresetUser('ahli')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition cursor-pointer ${
                    peranan === 'ahli'
                      ? 'bg-amber-500 text-emerald-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Pesilat
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={sedangMemproses || authLoading}
                className="w-full"
                icon={
                  sedangMemproses || authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )
                }
              >
                {sedangMemproses || authLoading ? 'Mengesahkan Akaun...' : 'Log Masuk ke Sistem'}
              </Button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>Belum mempunyai akaun?</span>
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setMesejBerjaya(null);
                  setMode('signup');
                }}
                className="text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
              >
                Daftar Akaun Baharu
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            BORANG SET SEMULA KATA LALUAN (PASSWORD RESET)
           ========================================================================= */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setMesejBerjaya(null);
                  setMode('login');
                }}
                className="p-1 text-slate-500 hover:text-slate-900 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-bold text-slate-900">Set Semula Kata Laluan</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Masukkan alamat e-mel berdaftar anda. Pautan pengesahan untuk menetapkan semula kata laluan akan dihantar melalui perkhidmatan Supabase Auth.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat E-mel Berdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cth: nama@silat.org.my"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={sedangMemproses}
              className="w-full"
              icon={
                sedangMemproses ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )
              }
            >
              {sedangMemproses ? 'Menghantar E-mel...' : 'Hantar Pautan Set Semula'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Kembali ke Halaman Log Masuk
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            BORANG DAFTAR AKAUN BAHARU
           ========================================================================= */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setMesejBerjaya(null);
                  setMode('login');
                }}
                className="p-1 text-slate-500 hover:text-slate-900 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-bold text-slate-900">Daftar Akaun Pasukan Baharu</h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Penuh
              </label>
              <input
                type="text"
                value={namaPenuh}
                onChange={(e) => setNamaPenuh(e.target.value)}
                placeholder="cth: Muhammad Danish bin Rosli"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
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
                placeholder="danish@pesilat.my"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kata Laluan (Minimum 6 aksara)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Peranan Pasukan
              </label>
              <select
                value={peranan}
                onChange={(e) => setPeranan(e.target.value as Peranan)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              >
                <option value="ahli">Ahli Pasukan (Pesilat)</option>
                <option value="jurulatih">Jurulatih Pasukan</option>
                <option value="admin">Pentadbir Pasukan</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={sedangMemproses}
              className="w-full"
              icon={
                sedangMemproses ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )
              }
            >
              {sedangMemproses ? 'Mendaftar...' : 'Daftar Akaun Sekarang'}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Sudah ada akaun? Log Masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
