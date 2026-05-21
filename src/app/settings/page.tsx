'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { visionText, setVisionText } = useRitualStore();
  const [visionInput, setVisionInput] = useState(visionText);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [hardestPillar, setHardestPillar] = useState<string>('Nutrition');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    setVisionInput(visionText);
  }, [visionText]);

  const handleSaveVision = (text: string) => {
    setVisionInput(text);
    setVisionText(text);
  };


  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setProfileEmail(session.user.email || 'user@trelis.life');
          
          // Load current hardest pillar if configured
          const { data } = await supabase
            .from('user_state')
            .select('hardest_pillar')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (data?.hardest_pillar) {
            const pillarMap: Record<string, string> = {
              nutrition: 'Nutrition',
              movement: 'Movement',
              sleep: 'Sleep',
              stress_mental: 'Stress & Mental',
              social: 'Social Connection',
              environment: 'Environment'
            };
            setHardestPillar(pillarMap[data.hardest_pillar] || data.hardest_pillar);
          }
        }
      } catch (e) {
        console.error("Error loading profile or settings state:", e);
      }
    }
    loadProfile();
  }, []);

  const handleNuclearSignOut = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // safe fallback on browser
    }

    setIsClearing(true);

    try {
      // 1. Supabase Session termination
      await supabase.auth.signOut();

      // 2. Channel squashing to prevent bleeding state triggers
      await supabase.removeAllChannels();

      // 3. Purging all caches and local key stores
      localStorage.clear();
      sessionStorage.clear();

      // 4. Force hard redirect to reload memory namespaces in WebViews
      window.location.href = '/login';
    } catch (error) {
      console.error("Nuclear sign out failure:", error);
      setIsClearing(false);
    }
  };

  return (
    <main className="min-h-screen max-w-md mx-auto bg-[#F7F6F2] relative flex flex-col justify-between p-6 sm:border-x sm:border-muted shadow-sm select-none">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between h-8 relative">
          <button 
            onClick={() => router.back()} 
            className="text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <span className="text-[10px] font-bold tracking-widest text-ink-secondary uppercase">
            Settings
          </span>
          <div className="w-8" />
        </header>

        {/* Configurations List */}
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-1 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">Profile Identity</span>
            <span className="text-sm font-semibold text-ink-primary mt-1">{profileEmail || 'Loading Profile...'}</span>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">Daily Structure</span>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-ink-primary font-normal">Wake Window</span>
              <span className="text-xs font-semibold text-ink-secondary bg-canvas px-2.5 py-1 rounded-md">07:00 AM</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-muted/40">
              <span className="text-xs text-ink-primary font-normal">Sleep Window</span>
              <span className="text-xs font-semibold text-ink-secondary bg-canvas px-2.5 py-1 rounded-md">11:00 PM</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">Priority System</span>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-ink-primary font-normal">Hardest Pillar Priority</span>
              <span className="text-xs font-semibold text-accent-teal bg-accent-teal/5 px-2.5 py-1 rounded-md uppercase">
                {hardestPillar}
              </span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">Vision Priming</span>
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-[10px] text-ink-secondary font-medium select-none">Daily morning intention string</label>
              <textarea
                value={visionInput}
                onChange={(e) => handleSaveVision(e.target.value)}
                placeholder="E.g. Focus purely on what expands your power and clarity today."
                className="w-full bg-[#F7F6F2] border border-muted rounded-lg p-2.5 text-xs text-ink-primary focus:outline-none focus:border-accent-teal transition-all min-h-[60px] leading-relaxed resize-none font-medium"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">Visualizations</span>
            <button 
              onClick={() => router.push('/history')}
              className="flex justify-between items-center py-2 text-xs text-ink-primary hover:text-accent-teal transition-colors text-left font-medium"
            >
              <span className="text-ink-primary font-medium">📈 Pulse History & Heatmap</span>
              <span className="text-[10px] text-ink-secondary">➔</span>
            </button>
            <button 
              onClick={() => router.push('/notes')}
              className="flex justify-between items-center py-2 border-t border-muted/40 text-xs text-ink-primary hover:text-accent-teal transition-colors text-left pt-3 font-medium"
            >
              <span className="text-ink-primary font-medium">📓 Reflection Journal Notes</span>
              <span className="text-[10px] text-ink-secondary">➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Footer with Nuclear Sign-Out */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="p-5 rounded-2xl bg-red-500/[0.02] border border-red-500/10 flex items-start gap-3 shadow-[0_2px_12px_rgba(239,68,68,0.02)]">
          <ShieldAlert className="w-5 h-5 text-red-500/60 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-red-500/60 leading-normal font-normal">
            Nuclear Sign-Out terminates all auth sessions, squashes active channels, and fully purges local Capacitor WebView states.
          </p>
        </div>

        <button
          onClick={handleNuclearSignOut}
          disabled={isClearing}
          className={`w-full py-4 rounded-2xl font-semibold text-sm uppercase tracking-widest border border-red-500/20 text-red-500 hover:bg-red-500/[0.02] transition-all flex items-center justify-center gap-2 active:scale-98 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.05)] ${
            isClearing ? 'opacity-70 cursor-wait' : ''
          }`}
        >
          <LogOut className="w-4 h-4" /> {isClearing ? 'Purging Cache...' : 'Nuclear Sign-Out'}
        </button>

        {/* Google Play Medical Compliance */}
        <p className="mt-4 text-[10px] text-ink-secondary/70 text-center px-4 leading-relaxed select-none">
          Trelis Life is not a medical device and does not diagnose, treat, cure, or prevent any medical condition.
        </p>
      </div>
    </main>
  );
}
