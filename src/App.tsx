/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DatabaseConfigModal } from './components/common/DatabaseConfigModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Loader2, Database, AlertCircle } from 'lucide-react';

// 12 Paparan / Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PesilatListView } from './views/PesilatListView';
import { PesilatProfileView } from './views/PesilatProfileView';
import { JurulatihView } from './views/JurulatihView';
import { KehadiranView } from './views/KehadiranView';
import { JadualView } from './views/JadualView';
import { KejohananListView } from './views/KejohananListView';
import { PendaftaranView } from './views/PendaftaranView';
import { PencapaianView } from './views/PencapaianView';
import { LaporanView } from './views/LaporanView';
import { PenggunaView } from './views/PenggunaView';

// Perkhidmatan Pangkalan Data Supabase
import {
  dbFetchPesilat,
  dbInsertPesilat,
  dbUpdatePesilat,
  dbDeletePesilat,
  dbFetchSesiLatihan,
  dbInsertSesiLatihan,
  dbFetchRekodKehadiran,
  dbSaveRekodKehadiran,
  dbFetchKejohanan,
  dbFetchPendaftaran,
  dbInsertPendaftaran,
  dbUpdateStatusPendaftaran,
  dbFetchPencapaian,
  dbInsertPencapaian,
  dbFetchJurulatih,
  dbInsertJurulatih,
  dbFetchProfiles,
  dbUpdateProfileRole
} from './services/silatDb';

import { isSupabaseConfigured, getSupabaseCredentials } from './lib/supabase';

import {
  INITIAL_PESILAT,
  INITIAL_JURULATIH,
  INITIAL_JADUAL,
  INITIAL_KEJOHANAN,
  INITIAL_PENDAFTARAN,
  INITIAL_PENCAPAIAN,
  INITIAL_KEHADIRAN,
  INITIAL_PENGGUNA
} from './mock/data';

import {
  Pesilat,
  Jurulatih,
  SesiLatihan,
  Kejohanan,
  PendaftaranAcara,
  RekodPencapaian,
  RekodKehadiran,
  Pengguna,
  Peranan
} from './types';

const MainApp: React.FC = () => {
  const { currentUser, isAuthed, authLoading } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';

  // State pengurusan data aplikasi
  const [pesilatList, setPesilatList] = useState<Pesilat[]>(INITIAL_PESILAT);
  const [jurulatihList, setJurulatihList] = useState<Jurulatih[]>(INITIAL_JURULATIH);
  const [jadualList, setJadualList] = useState<SesiLatihan[]>(INITIAL_JADUAL);
  const [kejohananList, setKejohananList] = useState<Kejohanan[]>(INITIAL_KEJOHANAN);
  const [pendaftaranList, setPendaftaranList] = useState<PendaftaranAcara[]>(INITIAL_PENDAFTARAN);
  const [pencapaianList, setPencapaianList] = useState<RekodPencapaian[]>(INITIAL_PENCAPAIAN);
  const [kehadiranList, setKehadiranList] = useState<RekodKehadiran[]>(INITIAL_KEHADIRAN);
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>(INITIAL_PENGGUNA);

  // Status Pemuatan Data
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Navigasi & Shell UI
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  // Pesilat terpilih untuk paparan profil
  const [pesilatDipilih, setPesilatDipilih] = useState<Pesilat>(INITIAL_PESILAT[0]);
  const [kejohananDipilihAwal, setKejohananDipilihAwal] = useState<string | undefined>(undefined);

  // Sistem Notifikasi Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Memuat turun semua data dari Supabase (atau fallback sintetik)
  const loadAllDataFromDatabase = useCallback(async () => {
    setDataLoading(true);
    const configured = isSupabaseConfigured();
    setIsLiveConnected(configured);

    try {
      const [
        pesilatRes,
        jurulatihRes,
        jadualRes,
        kehadiranRes,
        kejohananRes,
        pendaftaranRes,
        pencapaianRes,
        profilesRes
      ] = await Promise.all([
        dbFetchPesilat(),
        dbFetchJurulatih(),
        dbFetchSesiLatihan(),
        dbFetchRekodKehadiran(),
        dbFetchKejohanan(),
        dbFetchPendaftaran(),
        dbFetchPencapaian(),
        dbFetchProfiles()
      ]);

      setPesilatList(pesilatRes.data);
      setJurulatihList(jurulatihRes.data);
      setJadualList(jadualRes.data);
      setKehadiranList(kehadiranRes.data);
      setKejohananList(kejohananRes.data);
      setPendaftaranList(pendaftaranRes.data);
      setPencapaianList(pencapaianRes.data);
      setPenggunaList(profilesRes.data);

      if (pesilatRes.isLive) {
        addToast(
          'success',
          'Data rasmi berjaya diselaraskan dengan pangkalan data Supabase PostgreSQL.',
          'Pangkalan Data Aktif'
        );
      } else if (pesilatRes.error) {
        addToast(
          'error',
          pesilatRes.error,
          'Perhatian Skema Supabase'
        );
      }
    } catch (err: any) {
      console.error('Ralat memuat data:', err);
      addToast('error', 'Gagal menyelaraskan pangkalan data. Menggunakan data tempatan.');
    } finally {
      setDataLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllDataFromDatabase();
  }, [loadAllDataFromDatabase]);

  // Kemas kini pilihan pesilat automatik bila peranan 'ahli'
  useEffect(() => {
    if (peranan === 'ahli' && currentUser?.pesilatId) {
      const padan = pesilatList.find((p) => p.id === currentUser.pesilatId);
      if (padan) setPesilatDipilih(padan);
    } else if (pesilatList.length > 0 && !pesilatList.some((p) => p.id === pesilatDipilih.id)) {
      setPesilatDipilih(pesilatList[0]);
    }

    // Perlindungan laluan UI mengikut hak akses
    if (
      peranan === 'ahli' &&
      (activeView === 'senarai-pesilat' || activeView === 'jurulatih' || activeView === 'pengguna' || activeView === 'laporan')
    ) {
      setActiveView('dashboard');
    }
    if (peranan === 'jurulatih' && (activeView === 'jurulatih' || activeView === 'pengguna')) {
      setActiveView('dashboard');
    }
  }, [peranan, currentUser, activeView, pesilatList, pesilatDipilih.id]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-300">Menyemak Sesi Supabase Auth...</p>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <>
        <LoginView onOpenDbConfig={() => setDbModalOpen(true)} />
        <DatabaseConfigModal
          isOpen={dbModalOpen}
          onClose={() => setDbModalOpen(false)}
          onCredentialsUpdated={() => {
            loadAllDataFromDatabase();
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // ==============================================================================
  // PENGENDALI OPERASI (CRUD) DENGAN MAKLUM BALAS KEPUTUSAN & RLS
  // ==============================================================================

  const handleTambahPesilat = async (pBaru: Pesilat) => {
    const res = await dbInsertPesilat(pBaru);
    if (res.error) {
      addToast('error', res.error, 'Gagal Menyimpan Pesilat');
    } else {
      setPesilatList((prev) => [pBaru, ...prev]);
      addToast(
        'success',
        `Pesilat ${pBaru.namaPenuh} berjaya didaftarkan ke pangkalan data.`,
        'Pendaftaran Berjaya'
      );
    }
  };

  const handleKemasKiniPesilat = async (pKemaskini: Pesilat) => {
    const res = await dbUpdatePesilat(pKemaskini);
    if (res.error) {
      addToast('error', res.error, 'Gagal Mengemas Kini');
    } else {
      setPesilatList((prev) => prev.map((p) => (p.id === pKemaskini.id ? pKemaskini : p)));
      setPesilatDipilih(pKemaskini);
      addToast('success', 'Rekod pesilat berjaya dikemas kini.', 'Berjaya');
    }
  };

  const handlePadamPesilat = async (id: string) => {
    const res = await dbDeletePesilat(id);
    if (res.error) {
      addToast('error', res.error, 'Gagal Memadam Pesilat');
    } else {
      setPesilatList((prev) => prev.filter((p) => p.id !== id));
      addToast('info', 'Rekod pesilat telah dikeluarkan daripada pangkalan data.');
    }
  };

  const handleTambahJurulatih = async (jBaru: Jurulatih) => {
    const res = await dbInsertJurulatih(jBaru);
    if (res.error) {
      addToast('error', res.error, 'Gagal Mendaftar Jurulatih');
    } else {
      setJurulatihList((prev) => [jBaru, ...prev]);
      addToast('success', `Jurulatih ${jBaru.namaPenuh} berjaya didaftarkan.`);
    }
  };

  const handleTambahSesi = async (sesiBaru: SesiLatihan) => {
    const res = await dbInsertSesiLatihan(sesiBaru);
    if (res.error) {
      addToast('error', res.error, 'Gagal Menjadualkan Sesi');
    } else {
      setJadualList((prev) => [sesiBaru, ...prev]);
      addToast('success', 'Sesi latihan baharu berjaya disimpan.');
    }
  };

  const handleSimpanKehadiran = async (rekodBaru: RekodKehadiran[]) => {
    const res = await dbSaveRekodKehadiran(rekodBaru);
    if (res.error) {
      addToast('error', res.error, 'Gagal Merekodkan Kehadiran');
    } else {
      setKehadiranList((prev) => {
        const sesiId = rekodBaru[0]?.sesiLatihanId;
        const filtered = prev.filter((k) => k.sesiLatihanId !== sesiId);
        return [...filtered, ...rekodBaru];
      });
      addToast('success', 'Rekod kehadiran sesi latihan berjaya disimpan ke pangkalan data.');
    }
  };

  const handleTambahPendaftaran = async (pBaru: PendaftaranAcara) => {
    const res = await dbInsertPendaftaran(pBaru);
    if (res.error) {
      addToast('error', res.error, 'Gagal Mendaftar Acara');
    } else {
      setPendaftaranList((prev) => [pBaru, ...prev]);
      addToast('success', 'Pendaftaran acara kejohanan berjaya dihantar.');
    }
  };

  const handleKemasKiniStatusPendaftaran = async (
    id: string,
    status: 'Disahkan' | 'Dalam Semakan' | 'Ditolak'
  ) => {
    const res = await dbUpdateStatusPendaftaran(id, status);
    if (res.error) {
      addToast('error', res.error, 'Gagal Mengubah Status Kelulusan');
    } else {
      setPendaftaranList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, statusKelulusan: status } : item))
      );
      addToast('success', `Status pendaftaran acara ditukar kepada: ${status}`);
    }
  };

  const handleTambahPencapaian = async (pBaru: RekodPencapaian) => {
    const res = await dbInsertPencapaian(pBaru);
    if (res.error) {
      addToast('error', res.error, 'Gagal Merekod Pencapaian');
    } else {
      setPencapaianList((prev) => [pBaru, ...prev]);
      addToast('success', `Pingat ${pBaru.pingat} berjaya direkodkan ke dalam arkib pasukan!`);
    }
  };

  const handleTukarPerananPengguna = async (id: string, perananBaru: Peranan) => {
    const res = await dbUpdateProfileRole(id, perananBaru);
    if (res.error) {
      addToast('error', res.error, 'Gagal Menukar Peranan');
    } else {
      setPenggunaList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, peranan: perananBaru } : u))
      );
      addToast('success', `Peranan pengguna berjaya ditukar kepada ${perananBaru.toUpperCase()}.`);
    }
  };

  // Render Paparan Halaman Mengikut Tab Aktif
  const renderViewContent = () => {
    if (dataLoading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 text-emerald-800 animate-spin mb-3" />
          <p className="text-xs font-semibold">Memuat turun data kontinjen dari pangkalan data...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(viewId) => {
              setActiveView(viewId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'senarai-pesilat':
        return (
          <PesilatListView
            pesilatList={pesilatList}
            onPilihPesilat={(p) => {
              setPesilatDipilih(p);
              setActiveView('profil-pesilat');
            }}
            onTambahPesilat={handleTambahPesilat}
            onPadamPesilat={handlePadamPesilat}
          />
        );

      case 'profil-pesilat':
        return (
          <PesilatProfileView
            pesilat={pesilatDipilih}
            onKembali={() => setActiveView(peranan === 'ahli' ? 'dashboard' : 'senarai-pesilat')}
            onKemasKiniPesilat={handleKemasKiniPesilat}
            senaraiSemuaPesilat={pesilatList}
            onTukarPesilat={(p) => setPesilatDipilih(p)}
          />
        );

      case 'jurulatih':
        return (
          <JurulatihView
            jurulatihList={jurulatihList}
            onTambahJurulatih={handleTambahJurulatih}
            onPadamJurulatih={(id) => {
              setJurulatihList((prev) => prev.filter((j) => j.id !== id));
              addToast('info', 'Jurulatih dikeluarkan.');
            }}
          />
        );

      case 'kehadiran':
        return (
          <KehadiranView
            pesilatList={pesilatList}
            jadualList={jadualList}
            kehadiranList={kehadiranList}
            onSimpanKehadiran={handleSimpanKehadiran}
          />
        );

      case 'jadual':
        return (
          <JadualView
            jadualList={jadualList}
            jurulatihList={jurulatihList}
            onTambahSesi={handleTambahSesi}
            onPadamSesi={(id) => {
              setJadualList((prev) => prev.filter((s) => s.id !== id));
              addToast('info', 'Sesi latihan dipadam.');
            }}
            onPilihSesiKehadiran={() => {
              setActiveView('kehadiran');
            }}
          />
        );

      case 'kejohanan':
        return (
          <KejohananListView
            kejohananList={kejohananList}
            onTambahKejohanan={(k) => {
              setKejohananList((prev) => [k, ...prev]);
              addToast('success', 'Kejohanan berjaya didaftarkan.');
            }}
            onPadamKejohanan={(id) => {
              setKejohananList((prev) => prev.filter((k) => k.id !== id));
              addToast('info', 'Kejohanan dipadam.');
            }}
            onPilihDaftarKejohanan={(kId) => {
              setKejohananDipilihAwal(kId);
              setActiveView('pendaftaran');
            }}
          />
        );

      case 'pendaftaran':
        return (
          <PendaftaranView
            pendaftaranList={pendaftaranList}
            pesilatList={pesilatList}
            kejohananList={kejohananList}
            onTambahPendaftaran={handleTambahPendaftaran}
            onKemasKiniStatus={handleKemasKiniStatusPendaftaran}
            onPadamPendaftaran={(id) => {
              setPendaftaranList((prev) => prev.filter((p) => p.id !== id));
              addToast('info', 'Pendaftaran dibatalkan.');
            }}
            kejohananPilihanAwal={kejohananDipilihAwal}
          />
        );

      case 'pencapaian':
        return (
          <PencapaianView
            pencapaianList={pencapaianList}
            pesilatList={pesilatList}
            kejohananList={kejohananList}
            onTambahPencapaian={handleTambahPencapaian}
            onPadamPencapaian={(id) => {
              setPencapaianList((prev) => prev.filter((p) => p.id !== id));
              addToast('info', 'Rekod pencapaian dipadam.');
            }}
          />
        );

      case 'laporan':
        return (
          <LaporanView
            pesilatList={pesilatList}
            pencapaianList={pencapaianList}
            jadualList={jadualList}
            kehadiranList={kehadiranList}
          />
        );

      case 'pengguna':
        return (
          <PenggunaView
            penggunaList={penggunaList}
            onTukarPerananPengguna={handleTukarPerananPengguna}
            onTambahPengguna={(p) => {
              setPenggunaList((prev) => [p, ...prev]);
              addToast('success', `Pengguna ${p.nama} ditambah.`);
            }}
          />
        );

      default:
        return <DashboardView onNavigate={(viewId) => setActiveView(viewId)} />;
    }
  };

  const getTajukHalaman = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard Utama',
      'senarai-pesilat': 'Senarai Pesilat Kontinjen',
      'profil-pesilat': 'Profil Terperinci Pesilat',
      jurulatih: 'Barisan Jurulatih',
      kehadiran: 'Kehadiran Sesi Latihan',
      jadual: 'Jadual Latihan Mingguan',
      kejohanan: 'Senarai Kejohanan',
      pendaftaran: 'Pendaftaran Kejohanan',
      pencapaian: 'Rekod & Arkib Pencapaian',
      laporan: 'Laporan & Analisis Skuad',
      pengguna: 'Pengurusan Pengguna'
    };
    return titles[activeView] || 'Sistem Pengurusan Silat';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Bar Sisi Navigasi */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpenMobile={mobileMenuOpen}
        setIsOpenMobile={setMobileMenuOpen}
        onOpenDbConfig={() => setDbModalOpen(true)}
      />

      {/* Kawasan Utama */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Navbar
          tajukHalaman={getTajukHalaman()}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenDbConfig={() => setDbModalOpen(true)}
        />

        {/* Bar Status Sambungan Pangkalan Data Ringkas */}
        <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              {isLiveConnected
                ? 'Tersambung ke Supabase (Data Sebenar PostgreSQL)'
                : 'Mod Prototaip Simulative (Data Sintetik)'}
            </span>
          </div>

          <button
            onClick={() => setDbModalOpen(true)}
            className="text-amber-400 hover:text-white font-medium underline cursor-pointer"
          >
            Uji Sambungan & RLS &rarr;
          </button>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderViewContent()}
        </main>
      </div>

      {/* Modal Panduan & Diagnostik Supabase / PostgreSQL */}
      <DatabaseConfigModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
        onCredentialsUpdated={() => {
          loadAllDataFromDatabase();
        }}
      />

      {/* Notifikasi Toast */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
