'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft, LogOut, ShieldAlert, Check } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { checkAndRequestPermissions, checkPermissionsGranted } from '@/lib/health/healthService';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { visionText, setVisionText, anchors, focusThreeIds, setFocusThree, isPremium } = useRitualStore();
  const [visionInput, setVisionInput] = useState(visionText);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [hardestPillar, setHardestPillar] = useState<string>('Nutrition');
  const [isClearing, setIsClearing] = useState(false);

  const [partnerRelation, setPartnerRelation] = useState<any | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerEmailInput, setPartnerEmailInput] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isRemovingPartner, setIsRemovingPartner] = useState(false);
  const [isHealthConnected, setIsHealthConnected] = useState(false);

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
          setIsPending(false);
          if (sent.status !== 'active') {
            await supabase
              .from('quiet_partners')
              .update({ status: 'active' })
              .eq('id', sent.id);
          }
        } else {
          setIsLinked(false);
          setIsPending(true);
        }
      } else {
        const { data: rx } = await supabase
          .from('quiet_partners')
          .select('*')
          .eq('partner_email', uemail)
          .maybeSingle();
          
        if (rx) {
          setPartnerRelation(null);
          setIsLinked(false);
          setIsPending(false);
        } else {
          setPartnerRelation(null);
          setIsLinked(false);
          setIsPending(false);
        }
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
      setIsPending(false);
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
          
          await loadPartnerInfo(session.user.id, session.user.email || '');

          // Check Health Connect status
          const connected = await checkPermissionsGranted();
          setIsHealthConnected(connected);
        }
      } catch (e) {
        console.error("Error loading profile or settings state:", e);
      }
    }
    loadProfile();
  }, []);

  const handleConnectHealth = async () => {
    const success = await checkAndRequestPermissions();
    setIsHealthConnected(success);
    if (success) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {}
    }
  };

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
    <main className="min-h-screen max-w-md mx-auto bg-transparent relative flex flex-col justify-between p-6 sm:border-x sm:border-muted shadow-sm select-none">
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
          {/* Trelis Plus Premium Membership Card */}
          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-[#2A7F7F] font-bold">Membership</span>
                <h3 className="text-sm font-semibold text-ink-primary mt-1">Trelis Plus</h3>
              </div>
              {isPremium ? (
                <span className="flex items-center gap-1 text-[10px] text-accent-teal font-semibold bg-accent-teal/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Check className="w-3 h-3 text-accent-teal stroke-[3]" />
                  <span>Active</span>
                </span>
              ) : (
                <span className="text-[10px] text-ink-secondary bg-canvas px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                  Standard
                </span>
              )}
            </div>
            
            <p className="text-[11px] text-ink-secondary leading-relaxed font-sans mt-0.5">
              {isPremium 
                ? "Your life operating system is fully upgraded to Premium. Uninterrupted access is active."
                : "Unlock full health connect automations, local neural echo assistant, and custom anchors."}
            </p>

            {!isPremium && (
              <button
                onClick={() => {
                  try { Haptics.vibrate(); } catch {}
                  router.push('/plus');
                }}
                className="w-full mt-2 bg-[#2A7F7F] text-white text-xs font-semibold py-3 px-4 rounded-xl hover:bg-opacity-95 transition-all text-center active:scale-[0.98] shadow-sm shadow-[#2A7F7F]/5 flex items-center justify-center gap-1.5"
              >
                <span>Upgrade to Plus</span>
              </button>
            )}
          </div>

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
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold block">Focus Three Priority</span>
            <p className="text-[10px] text-ink-secondary leading-relaxed font-serif italic mb-1">
              Select up to three anchors to prioritize. The rest will quietly step back.
            </p>
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {anchors.map((anchor) => {
                const isSelected = focusThreeIds.includes(anchor.id);
                return (
                  <button
                    key={anchor.id}
                    onClick={() => {
                      if (isSelected) {
                        setFocusThree(focusThreeIds.filter(id => id !== anchor.id));
                      } else {
                        if (focusThreeIds.length < 3) {
                          setFocusThree([...focusThreeIds, anchor.id]);
                        }
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-accent-teal/40 bg-accent-teal/5 text-ink-primary font-semibold'
                        : 'border-muted text-ink-secondary hover:bg-canvas'
                    }`}
                  >
                    <span className="text-xs">{anchor.title}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-accent-teal bg-accent-teal' : 'border-muted'
                    }`}>
                      {isSelected && <span className="text-[8px] text-white">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold block">Quiet Partner</span>
            
            {partnerEmail ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-canvas rounded-xl border border-muted/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">
                      {isLinked ? 'Active Connection' : 'Pending Verification'}
                    </span>
                    <span className="text-xs font-semibold text-ink-primary mt-0.5">{partnerEmail}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isLinked ? 'bg-accent-teal/10 text-accent-teal' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {isLinked ? 'Linked' : 'Pending'}
                  </span>
                </div>
                
                <button
                  onClick={handleRemovePartner}
                  disabled={isRemovingPartner}
                  className="w-full py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold border border-red-500/20 text-red-500 hover:bg-red-500/[0.02] transition-all flex items-center justify-center gap-1 active:scale-98 disabled:opacity-50"
                >
                  {isRemovingPartner ? 'Removing...' : 'Remove Partner'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[10px] text-ink-secondary leading-relaxed font-serif italic">
                  Invite one person to silently share your journey. No scores, no details. Just presence.
                </p>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-ink-secondary font-medium">Partner's Email Address</label>
                  <input
                    type="email"
                    value={partnerEmailInput}
                    onChange={(e) => setPartnerEmailInput(e.target.value)}
                    placeholder="partner@trelis.life"
                    className="w-full bg-[#F7F6F2] border border-muted rounded-xl p-2.5 text-xs text-ink-primary focus:outline-none focus:border-accent-teal transition-all font-medium"
                  />
                </div>
                
                <button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite || !partnerEmailInput.trim()}
                  className="w-full py-3 bg-accent-teal text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-accent-teal/95 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isSendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold block">Device Integration</span>
            <p className="text-[10px] text-ink-secondary leading-relaxed font-serif italic">
              Allow Trelis to silently read your movement and rest. We never sell or export your health data.
            </p>
            {isHealthConnected ? (
              <div className="w-full py-3 bg-[#F7F6F2] rounded-xl flex items-center justify-center gap-2 border border-muted/50 transition-all select-none">
                <Check className="w-4 h-4 text-accent-teal stroke-[3px]" />
                <span className="text-xs uppercase tracking-wider font-semibold text-accent-teal">Connected</span>
              </div>
            ) : (
              <button
                onClick={handleConnectHealth}
                className="w-full py-3 bg-accent-teal text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-accent-teal/95 active:scale-98 transition-all"
              >
                Connect Android Health
              </button>
            )}
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
