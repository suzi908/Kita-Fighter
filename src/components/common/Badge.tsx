/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BadgeProps {
  teks: string;
  varian?: 'hijau' | 'emas' | 'merah' | 'biru' | 'kelabu' | 'bengkung';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ teks, varian = 'hijau', className = '' }) => {
  const styles: Record<string, string> = {
    hijau: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    emas: 'bg-amber-50 text-amber-900 border-amber-300',
    merah: 'bg-rose-50 text-rose-800 border-rose-200',
    biru: 'bg-sky-50 text-sky-800 border-sky-200',
    kelabu: 'bg-slate-100 text-slate-700 border-slate-200',
    bengkung: 'bg-slate-900 text-amber-300 border-amber-500/40'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[varian] || styles.kelabu} ${className}`}
    >
      {teks}
    </span>
  );
};
