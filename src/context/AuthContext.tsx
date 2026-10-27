/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pengguna, Peranan } from '../types';
import { INITIAL_PENGGUNA } from '../mock/data';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: Pengguna | null;
  tukarPeranan: (peranan: Peranan) => void;
  loginDemo: (email: string, peranan: Peranan) => void;
  loginWithSupabase: (email: string, kataLaluan: string) => Promise<{ success: boolean; error: string | null }>;
  signUpWithSupabase: (
    email: string,
    kataLaluan: string,
    namaPenuh: string,
    perananDipilih: Peranan
  ) => Promise<{ success: boolean; error: string | null; message?: string }>;
  resetPasswordWithSupabase: (email: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
  isAuthed: boolean;
  authLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  isRealSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'silat_auth_user_v2';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Pengguna | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRealSupabaseActive, setIsRealSupabaseActive] = useState<boolean>(false);

  // Helper untuk muat peranan pengguna daripada jadual public.profiles
  const loadProfileForUser = async (userId: string, userEmail: string): Promise<Pengguna> => {
    const client = getSupabaseClient();
    if (!client) {
      return {
        id: userId,
        nama: userEmail.split('@')[0],
        email: userEmail,
        peranan: 'ahli',
        statusAkaun: 'Aktif',
        tarikhDaftar: new Date().toISOString().split('T')[0]
      };
    }

    try {
      const { data: profile, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Abaikan jika tiada baris ditemui (PGRST116)
        console.warn('Amaran membaca public.profiles:', error.message);
      }

      if (profile) {
        return {
          id: profile.id,
          nama: profile.nama_penuh || userEmail.split('@')[0],
          email: profile.email || userEmail,
          peranan: (profile.peranan as Peranan) || 'ahli',
          pesilatId: profile.pesilat_id,
          statusAkaun: profile.status_akaun || 'Aktif',
          tarikhDaftar: profile.created_at ? profile.created_at.split('T')[0] : '2026-01-01'
        };
      }

      // Jika profil belum wujud dalam public.profiles, bina rekod profil lalai
      const defaultRole: Peranan = userEmail.includes('admin') ? 'admin' : userEmail.includes('jurulatih') ? 'jurulatih' : 'ahli';
      const newProfile = {
        id: userId,
        nama_penuh: userEmail.split('@')[0],
        email: userEmail,
        peranan: defaultRole,
        status_akaun: 'Aktif'
      };

      await client.from('profiles').insert(newProfile);

      return {
        id: userId,
        nama: newProfile.nama_penuh,
        email: userEmail,
        peranan: defaultRole,
        statusAkaun: 'Aktif',
        tarikhDaftar: new Date().toISOString().split('T')[0]
      };
    } catch (err: any) {
      return {
        id: userId,
        nama: userEmail.split('@')[0],
        email: userEmail,
        peranan: 'ahli',
        statusAkaun: 'Aktif',
        tarikhDaftar: new Date().toISOString().split('T')[0]
      };
    }
  };

  // Semakan permulaan sesi Supabase Auth & onAuthStateChange
  useEffect(() => {
    let isMounted = true;
    const client = getSupabaseClient();
    const hasConfig = isSupabaseConfigured();

    setIsRealSupabaseActive(hasConfig);

    if (client && hasConfig) {
      // Semak sesi sedia ada dari Supabase
      client.auth
        .getSession()
        .then(async ({ data: { session }, error }) => {
          if (!isMounted) return;
          if (error) {
            console.warn('Ralat mendapatkan sesi Supabase:', error.message);
            fallbackToLocalSession();
            setAuthLoading(false);
            return;
          }

          if (session?.user) {
            const profile = await loadProfileForUser(
              session.user.id,
              session.user.email || 'pengguna@silat.org.my'
            );
            if (isMounted) {
              setCurrentUser(profile);
              setAuthLoading(false);
            }
          } else {
            // Tiada sesi aktif di Supabase
            fallbackToLocalSession();
            setAuthLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            fallbackToLocalSession();
            setAuthLoading(false);
          }
        });

      // Langgan perubahan status pengesahan (Login, Logout, Token Refresh)
      const {
        data: { subscription }
      } = client.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setAuthLoading(true);
          const profile = await loadProfileForUser(
            session.user.id,
            session.user.email || 'pengguna@silat.org.my'
          );
          if (isMounted) {
            setCurrentUser(profile);
            setAuthLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setCurrentUser(null);
            localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            setAuthLoading(false);
          }
        } else if (event === 'USER_UPDATED' && session?.user) {
          const profile = await loadProfileForUser(
            session.user.id,
            session.user.email || 'pengguna@silat.org.my'
          );
          if (isMounted) setCurrentUser(profile);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Supabase belum dikonfigurasikan: Gunakan sesi demo setempat
      fallbackToLocalSession();
      setAuthLoading(false);
    }
  }, []);

  const fallbackToLocalSession = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        setCurrentUser(JSON.parse(saved));
        return;
      }
    } catch {
      // abaikan
    }
    // Lalai demo: Admin Skuad
    setCurrentUser(INITIAL_PENGGUNA[0]);
  };

  const tukarPeranan = (peranan: Peranan) => {
    let mockUser: Pengguna;
    if (peranan === 'admin') {
      mockUser = INITIAL_PENGGUNA[0];
    } else if (peranan === 'jurulatih') {
      mockUser = INITIAL_PENGGUNA[1];
    } else {
      mockUser = INITIAL_PENGGUNA[3];
    }
    setCurrentUser(mockUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
    } catch {
      // abaikan
    }
  };

  const loginDemo = (email: string, peranan: Peranan) => {
    const existing = INITIAL_PENGGUNA.find((u) => u.peranan === peranan);
    const userToSet: Pengguna = existing
      ? { ...existing, email: email || existing.email }
      : {
          id: `usr-${Date.now()}`,
          nama: email.split('@')[0],
          email,
          peranan,
          statusAkaun: 'Aktif',
          tarikhDaftar: new Date().toISOString().split('T')[0]
        };

    setCurrentUser(userToSet);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userToSet));
    } catch {
      // abaikan
    }
  };

  const loginWithSupabase = async (
    email: string,
    kataLaluan: string
  ): Promise<{ success: boolean; error: string | null }> => {
    setAuthLoading(true);
    setAuthError(null);

    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'Kredensial Supabase belum dikonfigurasikan. Sila semak fail .env atau buka panel tetapan pangkalan data.'
      };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: kataLaluan
      });

      if (error) {
        setAuthLoading(false);
        const mesej = error.message.includes('Invalid login credentials')
          ? 'E-mel atau kata laluan tidak sah. Sila cuba lagi.'
          : error.message.includes('Email not confirmed')
          ? 'E-mel anda belum disahkan. Sila semak peti masuk e-mel anda.'
          : error.message;

        setAuthError(mesej);
        return { success: false, error: mesej };
      }

      if (data.user) {
        const profile = await loadProfileForUser(data.user.id, data.user.email || email);
        setCurrentUser(profile);
        setAuthLoading(false);
        return { success: true, error: null };
      }

      setAuthLoading(false);
      return { success: false, error: 'Sesi pengguna tidak dapat dicipta.' };
    } catch (err: any) {
      setAuthLoading(false);
      const mesej = err.message || 'Ralat berlaku semasa log masuk.';
      setAuthError(mesej);
      return { success: false, error: mesej };
    }
  };

  const signUpWithSupabase = async (
    email: string,
    kataLaluan: string,
    namaPenuh: string,
    perananDipilih: Peranan
  ): Promise<{ success: boolean; error: string | null; message?: string }> => {
    setAuthLoading(true);
    setAuthError(null);

    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'Kredensial Supabase belum dikonfigurasikan.'
      };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: kataLaluan,
        options: {
          data: {
            nama_penuh: namaPenuh,
            peranan: perananDipilih
          }
        }
      });

      if (error) {
        setAuthLoading(false);
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Cipta baris dalam public.profiles
        await client.from('profiles').upsert({
          id: data.user.id,
          nama_penuh: namaPenuh,
          email: email.trim(),
          peranan: perananDipilih,
          status_akaun: 'Aktif'
        });

        setAuthLoading(false);
        return {
          success: true,
          error: null,
          message: data.session
            ? 'Akaun berjaya didaftarkan dan log masuk!'
            : 'Pendaftaran berjaya! Sila semak e-mel anda untuk mengesahkan akaun sebelum log masuk.'
        };
      }

      setAuthLoading(false);
      return { success: false, error: 'Pendaftaran tidak mengembalikan maklumat pengguna.' };
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPasswordWithSupabase = async (
    email: string
  ): Promise<{ success: boolean; error: string | null }> => {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Kredensial Supabase belum dikonfigurasikan.'
      };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghantar e-mel set semula kata laluan.' };
    }
  };

  const logout = async () => {
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Ralat log keluar Supabase:', err);
      }
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch {
      // abaikan
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        tukarPeranan,
        loginDemo,
        loginWithSupabase,
        signUpWithSupabase,
        resetPasswordWithSupabase,
        logout,
        isAuthed: currentUser !== null,
        authLoading,
        authError,
        clearAuthError,
        isRealSupabaseActive
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth mesti digunakan di dalam AuthProvider');
  }
  return context;
};
