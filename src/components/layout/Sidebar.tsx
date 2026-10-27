/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  User,
  Shield,
  ClipboardCheck,
  CalendarDays,
  Trophy,
  FileCheck2,
  Medal,
  BarChart3,
  UserCog,
  LogOut,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Peranan } from '../../types';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  akses: Peranan[];
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, akses: ['admin', 'jurulatih', 'ahli'] },
  { id: 'senarai-pesilat', label: 'Senarai Pesilat', icon: Users, akses: ['admin', 'jurulatih'] },
  { id: 'profil-pesilat', label: 'Profil Pesilat', icon: User, akses: ['ahli'] },
  { id: 'jurulatih', label: 'Jurulatih', icon: Shield, akses: ['admin'] },
  { id: 'kehadiran', label: 'Kehadiran Latihan', icon: ClipboardCheck, akses: ['admin', 'jurulatih', 'ahli'] },
  { id: 'jadual', label: 'Jadual Latihan', icon: CalendarDays, akses: ['admin', 'jurulatih', 'ahli'] },
  { id: 'kejohanan', label: 'Senarai Kejohanan', icon: Trophy, akses: ['admin', 'jurulatih', 'ahli'] },
  { id: 'pendaftaran', label: 'Pendaftaran Kejohanan', icon: FileCheck2, akses: ['admin', 'jurulatih', 'ahli'] },
  { id: 'pencapaian', label: 'Rekod Pencapaian', icon: Medal, akses: ['admin', 'jurulatih', 'ahli'] },
  { id: 'laporan', label: 'Laporan', icon: BarChart3, akses: ['admin', 'jurulatih'] },
  { id: 'pengguna', label: 'Pengurusan Pengguna', icon: UserCog, akses: ['admin'] }
];

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenDbConfig: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpenMobile,
  setIsOpenMobile,
  onOpenDbConfig
}) => {
  const { currentUser, logout } = useAuth();
  const peranan = currentUser?.peranan || 'ahli';

  const dibenarkan = NAV_ITEMS.filter((item) => item.akses.includes(peranan));

  return (
    <>
      {/* Tirai Mobil */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      {/* Bar Sisi Navigasi */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-emerald-950 text-slate-100 flex flex-col transition-transform duration-200 ease-out border-r border-emerald-900/80 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Kepala Bar Sisi */}
        <div className="p-5 border-b border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden shadow-sm border-2 border-amber-400 shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/ASOKBLT_6eea94db.jpeg"
                alt="Logo Akademi Silat Olahraga Kita Bayu"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white leading-tight">
                KITA FIGHTER
              </h1>
              <p className="text-[11px] text-amber-400 font-medium">Sistem Pengurusan Skuad</p>
            </div>
          </div>
        </div>

        {/* Senarai Navigasi */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
            Menu ({peranan.toUpperCase()})
          </div>

          {dibenarkan.map((nav) => {
            const Icon = nav.icon;
            const isActive = activeView === nav.id;

            return (
              <button
                key={nav.id}
                onClick={() => {
                  setActiveView(nav.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-emerald-950 shadow-xs font-bold'
                    : 'text-emerald-100/90 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-950' : 'text-emerald-300'}`} />
                <span className="truncate">{nav.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bahagian Bawah: Status Pangkalan Data & Profil */}
        <div className="p-3 border-t border-emerald-900/80 bg-emerald-950/90 space-y-2">
          <button
            onClick={onOpenDbConfig}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-900 text-[11px] text-amber-300 font-medium transition cursor-pointer border border-emerald-800"
          >
            <span className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Supabase & PostgreSQL
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
              Info
            </span>
          </button>

          <div className="px-3 py-2 rounded-lg bg-emerald-900/30 border border-emerald-900/60 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.nama}</p>
              <p className="text-[10px] text-amber-400 capitalize">{currentUser?.peranan}</p>
            </div>
            <button
              onClick={logout}
              title="Log Keluar"
              className="p-1.5 text-emerald-300 hover:text-rose-300 hover:bg-rose-950/40 rounded transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
