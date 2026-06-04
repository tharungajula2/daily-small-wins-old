'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft, ChevronUp, ChevronDown, Sparkles, LineChart, ChevronRight } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  MORNING_INTENTIONS, 
  MORNING_TAP_LINES, 
  ANCHOR_NAME_SUGGESTIONS, 
  MISSION_CODENAMES, 
  KEEP_DEFINITION_SUGGESTIONS 
} from '@/utils/prompts';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { 
    visionText, 
    setVisionText, 
    isVisionEnabled, 
    toggleVision,
    anchors,
    renameAnchor,
    setAnchorCodename,
    setAnchorKeepDefinition,
    toggleAnchorActive,
    reorderAnchors,
    morningTapText,
    setMorningTapText
  } = useRitualStore();
  const [visionInput, setVisionInput] = useState(visionText);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const [editingAnchorId, setEditingAnchorId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCodename, setEditCodename] = useState('');
  const [editKeepDef, setEditKeepDef] = useState('');

  const startEditing = (anchor: any) => {
    setEditingAnchorId(anchor.id);
    setEditTitle(anchor.title);
    setEditCodename(anchor.codename || '');
    setEditKeepDef(anchor.keepDefinition || '');
  };

  const saveAnchorEdits = (id: string) => {
    renameAnchor(id, editTitle.trim());
    setAnchorCodename(id, editCodename.trim() || null);
    setAnchorKeepDefinition(id, editKeepDef.trim());
    setEditingAnchorId(null);
  };

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
                {/* Suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {MORNING_INTENTIONS.map((intention) => (
                    <button
                      key={intention}
                      type="button"
                      onClick={() => handleSaveVision(intention)}
                      className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all text-left"
                    >
                      {intention}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Morning Tap Line Config */}
          <div className="p-4 rounded-xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Morning Tap Line</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-ink-secondary uppercase tracking-wider font-semibold select-none leading-relaxed">
                Text cycled on the Morning Tap button
              </label>
              <input
                type="text"
                value={morningTapText}
                onChange={(e) => setMorningTapText(e.target.value)}
                placeholder="E.g. I'm here. Let's begin."
                className="w-full bg-canvas border border-muted rounded-xl px-3 py-2 text-xs text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-teal transition-all font-normal"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MORNING_TAP_LINES.map((line) => (
                  <button
                    key={line}
                    type="button"
                    onClick={() => setMorningTapText(line)}
                    className={`px-2.5 py-1 text-[10px] rounded-md border transition-all text-left font-medium ${
                      morningTapText === line 
                        ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/30 font-semibold' 
                        : 'bg-canvas hover:bg-muted text-ink-primary border border-muted/90'
                    }`}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manage Anchors Panel */}
          <div className="p-4 rounded-xl bg-surface border border-muted/80 flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1">Manage Anchors</h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-normal mb-2">
              Personal active anchors are soft-capped at 5 (The Arc + 4 custom anchors). Move up/down to prioritize, edit properties, or retire them.
            </p>

            <div className="flex flex-col gap-4">
              {anchors.map((anchor, index) => {
                const isEditing = editingAnchorId === anchor.id;
                return (
                  <div key={anchor.id} className="p-3 bg-canvas border border-muted/50 rounded-xl flex flex-col gap-3">
                    
                    {/* Anchor Header Info / Non-editing state */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-ink-primary truncate">
                            {anchor.title}
                          </span>
                          {anchor.codename && (
                            <span className="text-[10px] bg-accent-teal/10 text-accent-teal px-1.5 py-0.5 rounded font-mono">
                              {anchor.codename}
                            </span>
                          )}
                          {anchor.isPermanent && (
                            <span className="text-[10px] bg-ink-primary/5 text-ink-secondary px-1.5 py-0.5 rounded">
                              Permanent
                            </span>
                          )}
                          {!anchor.isActive && (
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">
                              Retired
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-ink-secondary mt-1 block truncate">
                          {anchor.keepDefinition || 'No custom keep definition'}
                        </span>
                      </div>

                      {/* Reorder & Edit Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => reorderAnchors(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 rounded bg-surface border border-muted/40 text-ink-secondary hover:text-ink-primary disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderAnchors(index, index + 1)}
                          disabled={index === anchors.length - 1}
                          className="p-1 rounded bg-surface border border-muted/40 text-ink-secondary hover:text-ink-primary disabled:opacity-30 disabled:pointer-events-none"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Editor Form */}
                    {isEditing ? (
                      <div className="flex flex-col gap-3 mt-2 border-t border-muted/30 pt-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-ink-secondary font-bold uppercase tracking-wider">Anchor Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-surface border border-muted rounded px-2.5 py-1 text-xs text-ink-primary focus:outline-none focus:border-accent-teal"
                          />
                          {/* Anchor title suggestions */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {ANCHOR_NAME_SUGGESTIONS.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setEditTitle(name)}
                                className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-ink-secondary font-bold uppercase tracking-wider">Mission Codename</label>
                          <input
                            type="text"
                            value={editCodename}
                            onChange={(e) => setEditCodename(e.target.value)}
                            placeholder="E.g. Operation Daybreak"
                            className="bg-surface border border-muted rounded px-2.5 py-1 text-xs text-ink-primary focus:outline-none focus:border-accent-teal"
                          />
                          {/* Codename suggestions */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {MISSION_CODENAMES.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => setEditCodename(name)}
                                className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all"
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-ink-secondary font-bold uppercase tracking-wider">Keep Definition</label>
                          <input
                            type="text"
                            value={editKeepDef}
                            onChange={(e) => setEditKeepDef(e.target.value)}
                            className="bg-surface border border-muted rounded px-2.5 py-1 text-xs text-ink-primary focus:outline-none focus:border-accent-teal"
                          />
                          {/* Keep def suggestions */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {KEEP_DEFINITION_SUGGESTIONS.map((def) => (
                              <button
                                key={def}
                                type="button"
                                onClick={() => setEditKeepDef(def)}
                                className="px-2.5 py-1 text-[10px] bg-canvas hover:bg-muted text-ink-primary border border-muted/90 rounded-md font-medium hover:border-accent-teal transition-all text-left"
                              >
                                {def}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end mt-1">
                          <button
                            type="button"
                            onClick={() => setEditingAnchorId(null)}
                            className="px-3 py-1 bg-surface border border-muted rounded text-[10px] uppercase font-semibold text-ink-secondary hover:bg-canvas"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveAnchorEdits(anchor.id)}
                            className="px-3 py-1 bg-accent-teal text-white rounded-[10px] text-[10px] uppercase font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        {!anchor.isPermanent && (
                          <button
                            type="button"
                            onClick={() => {
                              try { Haptics.impact({ style: ImpactStyle.Light }); } catch {}
                              toggleAnchorActive(anchor.id);
                            }}
                            className={`px-3 py-1 border rounded text-[10px] uppercase font-semibold transition-colors ${
                              anchor.isActive 
                                ? 'border-red-500/20 text-red-500 hover:bg-red-500/[0.02]' 
                                : 'border-accent-teal/20 text-accent-teal hover:bg-accent-teal/[0.02]'
                            }`}
                          >
                            {anchor.isActive ? 'Retire' : 'Activate'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditing(anchor)}
                          className="px-3 py-1 bg-surface border border-muted text-ink-secondary hover:text-ink-primary rounded text-[10px] uppercase font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
