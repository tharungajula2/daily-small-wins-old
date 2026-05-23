'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { createClient } from '@/lib/supabase/client';
import { Heart, Activity, Check } from 'lucide-react';

const PILLARS = [
  { id: 'nutrition', label: 'N', fullName: 'Nutrition' },
  { id: 'movement', label: 'M', fullName: 'Movement' },
  { id: 'sleep', label: 'Sl', fullName: 'Sleep' },
  { id: 'stress_mental', label: 'St', fullName: 'Stress & Mental' },
  { id: 'social', label: 'So', fullName: 'Social' },
  { id: 'environment', label: 'E', fullName: 'Environment' }
];

export default function QuietPartner() {
  const supabase = createClient();
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null);
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pillarStatus, setPillarStatus] = useState<Array<{ id: string; label: string; fullName: string; completed: boolean }>>([]);
  const [receivedNudges, setReceivedNudges] = useState<any[]>([]);
  const [sentNudgeType, setSentNudgeType] = useState<'thinking' | 'proud' | 'walk' | null>(null);

  const loadPartnerPulse = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const uid = session.user.id;
      const uemail = session.user.email || '';

      // 1. Fetch active quiet partner relations
      const { data: qp } = await supabase
        .from('quiet_partners')
        .select('*')
        .eq('status', 'active');

      if (qp && qp.length > 0) {
        const partnerRow = qp.find(r => r.partner_email === uemail);
        const pUserId = partnerRow?.user_id;

        const ourRow = qp.find(r => r.user_id === uid);
        const pEmail = ourRow?.partner_email;

        if (pUserId && pEmail) {
          setPartnerEmail(pEmail);
          setPartnerUserId(pUserId);

          // 2. Fetch partner's active anchors
          const { data: anchors } = await supabase
            .from('user_anchors')
            .select('id, pillar_id')
            .eq('user_id', pUserId)
            .eq('is_active', true);

          // 3. Fetch partner's today's completed logs
          const todayStr = new Date().toLocaleDateString('en-CA');
          const { data: logs } = await supabase
            .from('anchor_logs')
            .select('anchor_id, completed')
            .eq('user_id', pUserId)
            .eq('date', todayStr);

          // Calculate MECE completion status
          const updatedPillars = PILLARS.map(pillar => {
            const pillarAnchors = anchors?.filter(a => a.pillar_id === pillar.id) || [];
            const hasAnchors = pillarAnchors.length > 0;
            
            const allCompleted = hasAnchors && pillarAnchors.every(anchor => {
              const log = logs?.find(l => l.anchor_id === anchor.id);
              return log?.completed === true;
            });

            return {
              ...pillar,
              completed: allCompleted
            };
          });

          setPillarStatus(updatedPillars);

          // 4. Fetch incoming unread nudges
          const { data: nudges } = await supabase
            .from('partner_nudges')
            .select('*')
            .eq('receiver_id', uid)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

          if (nudges) {
            setReceivedNudges(nudges);
          }
        }
      } else {
        setPartnerEmail(null);
        setPartnerUserId(null);
      }
    } catch (e) {
      console.error("Error loading partner pulse:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerPulse();
    
    // Set up slow interval to update (every 30 seconds)
    const interval = setInterval(loadPartnerPulse, 30000);
    return () => clearInterval(interval);
  }, []);

  const sendNudge = async (type: 'thinking' | 'proud' | 'walk') => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      if (!partnerUserId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('partner_nudges')
        .insert({
          sender_id: session.user.id,
          receiver_id: partnerUserId,
          nudge_type: type,
          is_read: false
        });

      if (!error) {
        setSentNudgeType(type);
        setTimeout(() => setSentNudgeType(null), 2000);
      }
    } catch (e) {
      console.error("Error sending nudge:", e);
    }
  };

  const dismissNudge = async (nudgeId: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      await supabase
        .from('partner_nudges')
        .update({ is_read: true })
        .eq('id', nudgeId);

      setReceivedNudges(prev => prev.filter(n => n.id !== nudgeId));
    } catch (e) {
      console.error("Error dismissing nudge:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <Activity className="w-5 h-5 text-accent-teal/40 animate-pulse" />
      </div>
    );
  }

  if (!partnerEmail || !partnerUserId) {
    return null; // Quiet presence; if not active, we step back silently.
  }

  const nudgeLabels: Record<string, string> = {
    thinking: "Thinking of you",
    proud: "Proud of you",
    walk: "Want to walk?"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] mt-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-accent-teal" />
          <span className="text-[9px] uppercase tracking-widest text-ink-secondary font-semibold">Partner's Pulse</span>
        </div>
        <span className="text-[9px] tracking-wider text-ink-secondary font-medium lowercase">
          {partnerEmail}
        </span>
      </div>

      {/* 6 Dots Row */}
      <div className="flex items-center justify-between bg-canvas px-4 py-3 rounded-xl border border-muted/30">
        {pillarStatus.map((pillar) => (
          <div key={pillar.id} className="flex flex-col items-center gap-1">
            <span className="text-[8px] text-ink-secondary font-semibold uppercase">{pillar.label}</span>
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all duration-500 flex items-center justify-center ${
                pillar.completed
                  ? 'bg-accent-teal shadow-[0_0_8px_rgba(42,127,127,0.3)]'
                  : 'border border-muted/80 bg-transparent'
              }`}
            >
              {pillar.completed && (
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nudge Incoming Alert */}
      <AnimatePresence>
        {receivedNudges.map((nudge) => (
          <motion.div
            key={nudge.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3 bg-accent-teal/5 border border-accent-teal/15 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">✨</span>
              <span className="text-[10px] font-semibold text-ink-primary">
                Partner nudge: <span className="text-accent-teal font-bold">{nudgeLabels[nudge.nudge_type]}</span>
              </span>
            </div>
            <button
              onClick={() => dismissNudge(nudge.id)}
              className="text-[9px] uppercase tracking-wider text-ink-secondary hover:text-ink-primary font-bold px-2 py-1 rounded bg-canvas border border-muted/30"
            >
              Okay
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Nudge Button grid */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[8px] uppercase tracking-wider text-ink-secondary font-semibold">Send Silent Nudge</span>
        <div className="grid grid-cols-3 gap-2">
          {(['thinking', 'proud', 'walk'] as const).map((type) => {
            const isSent = sentNudgeType === type;
            return (
              <motion.button
                key={type}
                whileTap={{ scale: 0.96 }}
                onClick={() => sendNudge(type)}
                className={`py-2.5 px-1 rounded-xl text-[9px] uppercase tracking-wider font-semibold border transition-all ${
                  isSent
                    ? 'bg-accent-teal border-accent-teal text-white shadow-[0_2px_8px_rgba(42,127,127,0.2)]'
                    : 'bg-canvas border-muted/50 text-ink-primary hover:bg-[#eae9e4] hover:border-muted'
                }`}
              >
                {isSent ? 'Sent' : nudgeLabels[type]}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
