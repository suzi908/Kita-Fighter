/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  icon?: React.ReactNode;
  accent?: 'hijau' | 'emas' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  icon,
  accent = 'neutral'
}) => {
  const accentBorder = {
    hijau: 'hover:border-emerald-500/60',
    emas: 'hover:border-amber-500/60',
    neutral: 'hover:border-slate-300'
  }[accent];

  return (
    <div
      className={`bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs transition-all ${accentBorder} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </p>

        {(subtext || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            {trend && <span className="font-semibold text-emerald-700">{trend}</span>}
            {trend && subtext && <span aria-hidden="true">·</span>}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
