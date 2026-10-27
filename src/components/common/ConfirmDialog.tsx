/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onBatal: () => void;
  onSahkan: () => void;
  tajuk: string;
  mesej: string;
  labelSahkan?: string;
  labelBatal?: string;
  varian?: 'danger' | 'primary' | 'gold';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onBatal,
  onSahkan,
  tajuk,
  mesej,
  labelSahkan = 'Ya, Teruskan',
  labelBatal = 'Batal',
  varian = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onBatal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              varian === 'danger'
                ? 'bg-rose-100 text-rose-700'
                : varian === 'gold'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug">{tajuk}</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{mesej}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onBatal}>
            {labelBatal}
          </Button>
          <Button
            variant={varian === 'danger' ? 'danger' : varian === 'gold' ? 'gold' : 'primary'}
            size="sm"
            onClick={onSahkan}
          >
            {labelSahkan}
          </Button>
        </div>
      </div>
    </div>
  );
};
