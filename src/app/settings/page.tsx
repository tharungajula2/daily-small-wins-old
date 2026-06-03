'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { visionText, setVisionText, isVisionEnabled, toggleVision } = useRitualStore();
  const [visionInput, setVisionInput] = useState(visionText);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const [partnerRelation, setPartnerRelation] = useState<any | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerEmailInput, setPartnerEmailInput] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isRemovingPartner, setIsRemovingPartner] = useState(false);

  const loadPartnerInfo = async (uid: string, uemail: string) => {
    try {
      const { data: sent } = await supabase
        .from('quiet_partners')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (sent) {
        setPartnerRelation(sent);
        setPartnerEmail(sent.partner_email);
        
        const { data: rx } = await supabase
          .from('quiet_partners')
          .select('*')
          .eq('partner_email', uemail)
          .maybeSingle();
          
        if (rx && rx.user_id !== uid) {
          setIsLinked(true);
          if (sent.status !== 'active') {
            await supabase
              .from('quiet_partners')
              .update({ status: 'active' })
              .eq('id', sent.id);
          }
        } else {
          setIsLinked(false);
        }
      } else {
        setPartnerRelation(null);
        setIsLinked(false);
        setPartnerEmail('');
      }
    } catch (e) {
      console.error("Error loading quiet partner info:", e);
    }
  };

  const handleSendInvite = async () => {
    if (!partnerEmailInput.trim() || !profileEmail) return;
    setIsSendingInvite(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { error } = await supabase
        .from('quiet_partners')
        .insert({
          user_id: session.user.id,
          partner_email: partnerEmailInput.toLowerCase().trim(),
          status: 'pending'
        });
      
      if (!error) {
        setPartnerEmailInput('');
        await loadPartnerInfo(session.user.id, session.user.email || '');
      } else {
        console.error("Error sending partner invite:", error);
      }
    } catch (e) {
      console.error("Error sending partner invite:", e);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleRemovePartner = async () => {
    setIsRemovingPartner(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      await supabase
        .from('quiet_partners')
        .delete()
        .eq('user_id', session.user.id);
        
      await supabase
        .from('quiet_partners')
        .delete()
        .eq('partner_email', session.user.email);
        
      setPartnerRelation(null);
      setIsLinked(false);
      setPartnerEmail('');
    } catch (e) {
      console.error("Error removing partner:", e);
    } finally {
      setIsRemovingPartner(false);
    }
  };

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
          await loadPartnerInfo(session.user.id, session.user.email || '');
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
    <main className="min-h-screen max-w-md mx-auto bg-transparent relative flex flex-col justify-between sm:border-x sm:border-muted shadow-sm select-none pb-6">
      <div className="flex flex-col">
        <header className="pt-10 pb-4 px-6 relative flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink-primary tracking-tight leading-relaxed">Settings</h1>
          <button 
            onClick={() => router.back()} 
            className="text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-surface border border-muted/30 px-3 py-1 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </header>

        {/* Configurations List */}
        <div className="px-6 flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-surface border border-muted/80 flex flex-col gap-1 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Profile</h3>
            <p className="text-sm text-ink-primary font-normal mt-0.5 leading-relaxed break-all">{profileEmail || 'Loading Profile...'}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-muted/80 flex flex-col gap-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Daily Structure</h3>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-ink-primary font-normal leading-relaxed">Wake Window</span>
              <span className="text-xs font-semibold text-ink-secondary bg-canvas px-2.5 py-1 rounded-md">07:00 AM</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-muted/40">
              <span className="text-xs text-ink-primary font-normal leading-relaxed">Sleep Window</span>
              <span className="text-xs font-semibold text-ink-secondary bg-canvas px-2.5 py-1 rounded-md">11:00 PM</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Vision</h3>
              <button 
                onClick={() => {
                  try { Haptics.vibrate(); } catch {}
                  toggleVision();
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isVisionEnabled ? 'bg-accent-teal' : 'bg-muted'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-surface transition duration-200 ease-in-out shadow-sm ${isVisionEnabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </button>
            </div>
            {isVisionEnabled && (
              <div className="flex flex-col gap-2 mt-1">
                <label className="text-[10px] text-ink-secondary uppercase tracking-wider font-semibold select-none leading-relaxed">Daily morning intention statement</label>
                <textarea
                  value={visionInput}
                  onChange={(e) => handleSaveVision(e.target.value)}
                  placeholder="E.g. Focus purely on what expands your power and clarity today."
                  className="w-full bg-canvas border border-muted rounded-xl p-3 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-all min-h-[60px] leading-relaxed resize-none font-normal"
                />
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Partner</h3>
            
            {partnerEmail ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-canvas rounded-xl border border-muted/50">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-ink-secondary font-semibold">
                      {isLinked ? 'Active Connection' : 'Pending Verification'}
                    </span>
                    <span className="text-xs font-semibold text-ink-primary mt-1 break-all leading-relaxed">{partnerEmail}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    isLinked ? 'bg-accent-teal/10 text-accent-teal' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {isLinked ? 'Linked' : 'Pending'}
                  </span>
                </div>
                
                <button
                  onClick={handleRemovePartner}
                  disabled={isRemovingPartner}
                  className="w-full py-2 rounded-xl text-xs uppercase tracking-wider font-semibold border border-red-500/20 text-red-500 hover:bg-red-500/[0.02] transition-all flex items-center justify-center gap-1 active:scale-98 disabled:opacity-50"
                >
                  {isRemovingPartner ? 'Removing...' : 'Remove Partner'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-ink-secondary leading-relaxed font-normal">
                  Invite one person to silently share your journey. No scores, no details. Just presence.
                </p>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-ink-secondary uppercase tracking-wider font-semibold">Partner's Email Address</label>
                  <input
                    type="email"
                    value={partnerEmailInput}
                    onChange={(e) => setPartnerEmailInput(e.target.value)}
                    placeholder="partner@trelis.life"
                    className="w-full bg-canvas border border-muted rounded-xl px-3 py-2 text-xs text-ink-primary focus:outline-none focus:border-accent-teal transition-all font-normal"
                  />
                </div>
                
                <button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite || !partnerEmailInput.trim()}
                  className="w-full py-2.5 bg-accent-teal text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-accent-teal/95 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isSendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Visualizations</h3>
            <button 
              onClick={() => router.push('/history')}
              className="flex justify-between items-center py-1 text-xs text-ink-primary hover:text-accent-teal transition-colors text-left font-semibold"
            >
              <span className="text-ink-primary font-normal leading-relaxed">📈 Pulse History & Quiet Tracks</span>
              <span className="text-xs text-ink-secondary font-normal">➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Footer with Muted Sign-Out */}
      <div className="mt-6 px-6 flex flex-col gap-4">
        <button
          onClick={handleNuclearSignOut}
          disabled={isClearing}
          className="w-full py-2.5 text-center text-xs font-semibold text-ink-tertiary hover:text-ink-primary transition-all active:scale-[0.98] focus:outline-none bg-transparent border-0"
        >
          {isClearing ? 'Purging Cache...' : 'Sign Out'}
        </button>

        {/* Google Play Medical Compliance */}
        <p className="mt-1 text-[10px] text-ink-secondary/70 text-center px-4 leading-relaxed select-none font-normal">
          Trelis is not a medical device and does not diagnose, treat, cure, or prevent any medical condition.
        </p>
      </div>
    </main>
  );
}
