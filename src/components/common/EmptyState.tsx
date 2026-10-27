/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  tajuk: string;
  keterangan: string;
  tindakanLabel?: string;
  onTindakan?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  tajuk,
  keterangan,
  tindakanLabel,
  onTindakan,
  icon
}) => {
  return (
    <div className="text-center py-12 px-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
        {icon || <span className="text-2xl">🥋</span>}
      </div>
      <h3 className="text-sm font-bold text-slate-900">{tajuk}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
        {keterangan}
      </p>
      {tindakanLabel && onTindakan && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onTindakan}>
            {tindakanLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
