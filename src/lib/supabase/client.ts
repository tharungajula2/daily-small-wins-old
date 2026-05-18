import { createBrowserClient } from '@supabase/ssr';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const capacitorStorage = {
  getItem: async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: Capacitor.isNativePlatform() 
          ? capacitorStorage 
          : (typeof window !== 'undefined' ? window.localStorage : undefined),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      }
    }
  );
}
