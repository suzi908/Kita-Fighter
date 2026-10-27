/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Check,
  Copy,
  ShieldAlert,
  Key,
  ExternalLink,
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Server
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseHealth,
  SupabaseHealthReport,
  SUPABASE_SQL_SCHEMA,
  isValidHttpUrl,
  isValidAnonKey
} from '../../lib/supabase';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated?: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated
}) => {
  const [tab, setTab] = useState<'status' | 'kunci' | 'diagnostik' | 'sql'>('status');

  const [creds, setCreds] = useState(getSupabaseCredentials());
  const [inputUrl, setInputUrl] = useState(creds.url);
  const [inputKey, setInputKey] = useState(creds.anonKey);

  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Health report state
  const [report, setReport] = useState<SupabaseHealthReport | null>(null);
  const [testingHealth, setTestingHealth] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseCredentials();
      setCreds(current);
      setInputUrl(current.url);
      setInputKey(current.anonKey);
      setValidationError(null);
      runHealthCheck();
    }
  }, [isOpen]);

  const runHealthCheck = async () => {
    setTestingHealth(true);
    try {
      const res = await testSupabaseHealth();
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTestingHealth(false);
    }
  };

  const handleSimpanKredensial = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanUrl = inputUrl.trim();
    const cleanKey = inputKey.trim();

    if (!isValidHttpUrl(cleanUrl)) {
      setValidationError(
        'URL tidak sah. Sila pastikan format URL bermula dengan https:// (cth: https://projek-anda.supabase.co).'
      );
      return;
    }

    if (!isValidAnonKey(cleanKey)) {
      setValidationError(
        'Publishable/Anon Key tidak sah. Sila pastikan anda memasukkan kunci awam (anon) yang sah dari Supabase Dashboard.'
      );
      return;
    }

    saveSupabaseCredentials(cleanUrl, cleanKey);
    setCreds(getSupabaseCredentials());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    runHealthCheck();
    if (onCredentialsUpdated) onCredentialsUpdated();
  };

  const handlePadamKredensial = () => {
    saveSupabaseCredentials('', '');
    setCreds(getSupabaseCredentials());
    setInputUrl('');
    setInputKey('');
    setValidationError(null);
    runHealthCheck();
    if (onCredentialsUpdated) onCredentialsUpdated();
  };

  const copyToClipboard = (text: string, type: 'sql' | 'env') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } else {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2500);
    }
  };

  const envSnippet = `# Masukkan dalam fail .env pada punca projek:
VITE_SUPABASE_URL="${creds.url || 'https://[projek-anda].supabase.co'}"
VITE_SUPABASE_ANON_KEY="${creds.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}"`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfigurasi Supabase & PostgreSQL"
      subtitle="Pengurusan kredensial, ujian integriti jadual, dan semakan polisi RLS"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-sm text-slate-700">
        {/* Tab Navigasi Modal */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setTab('status')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              tab === 'status' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ringkasan Status
          </button>
          <button
            onClick={() => setTab('diagnostik')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              tab === 'diagnostik' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ujian Diagnostik Jadual
          </button>
          <button
            onClick={() => setTab('kunci')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              tab === 'kunci' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tetapan Kunci
          </button>
          <button
            onClick={() => setTab('sql')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              tab === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Skrip SQL & RLS
          </button>
        </div>

        {/* =========================================================================
            TAB 1: STATUS RINGKASAN
           ========================================================================= */}
        {tab === 'status' && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                report?.isConfigured && report?.overallHealthy
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : report?.isConfigured
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    report?.isConfigured && report?.overallHealthy
                      ? 'bg-emerald-200 text-emerald-950'
                      : 'bg-amber-200 text-amber-950'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {report?.isConfigured && report?.overallHealthy
                      ? 'Supabase Tersambung & Sihat'
                      : report?.isConfigured
                      ? 'Kredensial Dikesan (Perlu Semakan Skema)'
                      : 'Mod Prototaip Simulative (Data Sintetik)'}
                  </p>
                  <p className="text-xs opacity-90 mt-0.5">
                    Sumber Konfigurasi: <strong>{creds.source.toUpperCase()}</strong> ·{' '}
                    {creds.url ? creds.url : 'URL projek belum dimasukkan.'}
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={runHealthCheck}
                disabled={testingHealth}
                icon={<RefreshCw className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />}
              >
                Uji Semula
              </Button>
            </div>

            {/* Peringatan Sekuriti Mandatori */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                Garis Panduan Keselamatan Kunci API
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. <strong>Hanya gunakan Project URL dan Publishable (Anon) Key:</strong> Kunci ini selamat digunakan di kod pelayar kerana keselamatan pangkalan data dilindungi oleh <strong>Row Level Security (RLS)</strong>.
              </p>
              <p className="text-xs text-rose-300 leading-relaxed font-semibold">
                2. JANGAN sesekali memasukkan `service_role key` atau kata laluan pangkalan data ke dalam kod ini.
              </p>
            </div>

            {/* Panduan Lokasi Konfigurasi */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-700" />
                Di Mana Hendak Mendapatkan Kredensial?
              </h4>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <li>Buka papan pemuka <strong>Supabase Dashboard</strong> anda.</li>
                <li>Pilih projek anda &rarr; klik ikon <strong>Project Settings</strong> (ikon gear di bahagian bawah kiri).</li>
                <li>Klik pada tab <strong>API</strong> &rarr; cari bahagian <strong>Project URL</strong> dan <strong>Project API Keys</strong>.</li>
                <li>Salin <strong>Project URL</strong> dan kunci yang berlabel <strong>`anon` `public`</strong>.</li>
                <li>Tampal pada tab <strong>"Tetapan Kunci"</strong> di atas atau letakkan dalam fail <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono">.env</code>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: UJIAN DIAGNOSTIK JADUAL & RLS
           ========================================================================= */}
        {tab === 'diagnostik' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Status Integriti 8 Jadual Utama
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menyemak kewujudan jadual fizikal dan status kebenaran dasar RLS
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={runHealthCheck}
                disabled={testingHealth}
                icon={<RefreshCw className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />}
              >
                {testingHealth ? 'Menguji...' : 'Jalankan Ujian'}
              </Button>
            </div>

            {report?.tables && report.tables.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {report.tables.map((t) => (
                  <div key={t.tableName} className="p-3 flex items-start justify-between gap-3 bg-white hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-mono">{t.tableName}</strong>
                        <span className="text-slate-400">({t.label})</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{t.message}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {t.status === 'ok' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Wujud ({t.rowCount} baris)
                        </span>
                      ) : t.status === 'rls_restricted' ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold text-[11px]">
                          <ShieldAlert className="w-3 h-3 text-amber-600" /> RLS Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold text-[11px]">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Hilang (Missing)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Sila masukkan kredensial Supabase untuk memulakan diagnostik.
              </div>
            )}

            {report?.tables.some((t) => t.status === 'missing') && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Jadual Belum Dicipta Dalam Supabase
                </p>
                <p>
                  Satu atau lebih jadual belum wujud dalam pangkalan data. Sila pergi ke tab <strong>"Skrip SQL & RLS"</strong>, salin kod DDL, dan jalankan di SQL Editor Supabase anda.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: TETAPAN KUNCI (CREDENTIAL CONFIG)
           ========================================================================= */}
        {tab === 'kunci' && (
          <form onSubmit={handleSimpanKredensial} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda boleh memasukkan URL dan Publishable Key di sini untuk menguji projek Supabase anda secara langsung dalam pelayar, atau menyimpannya dalam fail <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env</code>.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Supabase Anon / Publishable Key
              </label>
              <textarea
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            {validationError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-700" />
                Kredensial berjaya disimpan dan klien Supabase telah dimuat semula!
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handlePadamKredensial}
                className="text-rose-600 hover:text-rose-800"
              >
                Kosongkan & Kembali ke Mod Simulasi
              </Button>

              <Button variant="primary" size="sm" type="submit">
                Simpan & Sambungkan Klien
              </Button>
            </div>
          </form>
        )}

        {/* =========================================================================
            TAB 4: SKRIP SQL & POLISI RLS
           ========================================================================= */}
        {tab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Skrip DDL & Polisi Row Level Security (RLS)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salin skrip ini ke <strong>SQL Editor</strong> di papan pemuka Supabase anda
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => copyToClipboard(SUPABASE_SQL_SCHEMA, 'sql')}
                icon={copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedSql ? 'Disalin!' : 'Salin Skrip Penuh'}
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto p-3.5 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg border border-slate-800 leading-relaxed">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        )}

        {/* Bahagian Footer Modal */}
        <div className="pt-3 flex justify-between items-center border-t border-slate-100">
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            Dokumentasi Rasmi Supabase <ExternalLink className="w-3 h-3" />
          </a>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
