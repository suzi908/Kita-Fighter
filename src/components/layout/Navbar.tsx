/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Database, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Peranan } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  tajukHalaman: string;
  onOpenDbConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  tajukHalaman,
  onOpenDbConfig
}) => {
  const { currentUser, tukarPeranan } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8">
      {/* Kiri: Hamburger + Breadcrumb Tajuk */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Pengurusan Silat</span>
          <span className="text-xs text-slate-300 hidden sm:inline">/</span>
          <h2 className="text-base font-bold text-slate-900 tracking-tight truncate">
            {tajukHalaman}
          </h2>
        </div>
      </div>

      {/* Kanan: Penukar Peranan Pantas & Status Supabase */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Status Database Button */}
        <button
          onClick={onOpenDbConfig}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
            isSupabaseConfigured()
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
          title="Klik untuk panduan persediaan pangkalan data Supabase"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isSupabaseConfigured() ? 'Supabase Tersambung' : 'Mod Simulasi'}
          </span>
        </button>

        {/* Pemilih Peranan (Simulasi UI) */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/90 px-2 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
          <label htmlFor="peranan-select" className="text-xs font-medium text-slate-600 hidden md:block">
            Peranan:
          </label>
          <select
            id="peranan-select"
            value={currentUser?.peranan || 'admin'}
            onChange={(e) => tukarPeranan(e.target.value as Peranan)}
            className="text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 cursor-pointer"
          >
            <option value="admin">Admin (Pengurus Pasukan)</option>
            <option value="jurulatih">Jurulatih</option>
            <option value="ahli">Ahli Pasukan (Pesilat)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
