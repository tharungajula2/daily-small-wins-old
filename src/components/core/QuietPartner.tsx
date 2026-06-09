'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { createClient } from '@/lib/supabase/client';
import { Heart, Activity } from 'lucide-react';

export default function QuietPartner() {
  const supabase = createClient();
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null);
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerDots, setPartnerDots] = useState<boolean[]>([false, false, false, false, false, false]);
  const [receivedNudges, setReceivedNudges] = useState<any[]>([]);
  const [sentNudgeType, setSentNudgeType] = useState<'thinking' | 'proud' | 'walk' | null>(null);

  const loadPartnerPulse = async () => {
    try {
      const getSessionPromise = Promise.race([
        supabase.auth.getSession(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), 2500))
      ]);
      const { data: { session } } = await getSessionPromise;
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

          // 2. Fetch partner's active anchors (up to 6)
          const { data: anchors } = await supabase
            .from('user_anchors')
            .select('id')
            .eq('user_id', pUserId)
            .eq('is_active', true)
            .limit(6);

          // 3. Fetch partner's today's completed logs
          const todayStr = new Date().toLocaleDateString('en-CA');
          const { data: logs } = await supabase
            .from('anchor_logs')
            .select('anchor_id, completed')
            .eq('user_id', pUserId)
            .eq('date', todayStr);

          const dotStates = (anchors || []).map(anchor => {
            const log = logs?.find(l => l.anchor_id === anchor.id);
            return log ? !!log.completed : false;
          });

          // Pad to exactly 6 dots
          while (dotStates.length < 6) {
            dotStates.push(false);
          }

          setPartnerDots(dotStates);

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
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-5 rounded-2xl bg-surface border border-muted/80 flex flex-col gap-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] mt-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-accent-teal" />
          <span className="text-sm uppercase tracking-wider text-ink-secondary font-semibold">Partner Presence</span>
        </div>
        <span className="text-sm tracking-wider text-ink-secondary font-normal lowercase">
          {partnerEmail}
        </span>
      </div>

      {/* 6 Dots Row */}
      <div className="bg-canvas p-4 rounded-xl border border-muted/30 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-wider text-ink-secondary font-semibold">Today's Presence</span>
        <div className="flex gap-3 justify-center py-1">
          {partnerDots.map((completed, index) => (
            <div 
              key={index} 
              className={`h-4.5 w-4.5 rounded-full transition-all ${
                completed 
                  ? 'bg-teal-600 border border-teal-600' 
                  : 'bg-gray-300 border border-gray-300'
              }`}
              title={completed ? 'Anchor completed' : 'Anchor incomplete'}
            />
          ))}
        </div>
      </div>

      {/* Nudge Incoming Alert */}
      <AnimatePresence>
        {receivedNudges.map((nudge) => (
          <motion.div
            key={nudge.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="p-3 bg-accent-teal/5 border border-accent-teal/15 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-primary">
                Partner nudge: <span className="text-accent-teal font-semibold">{nudgeLabels[nudge.nudge_type]}</span>
              </span>
            </div>
            <button
              onClick={() => dismissNudge(nudge.id)}
              className="text-xs uppercase tracking-wider text-ink-secondary hover:text-ink-primary font-semibold px-3 py-1.5 rounded-xl bg-canvas border border-muted/30"
            >
              Okay
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Nudge Button grid */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-ink-secondary font-semibold">Send Silent Nudge</span>
        <div className="grid grid-cols-3 gap-2">
          {(['thinking', 'proud', 'walk'] as const).map((type) => {
            const isSent = sentNudgeType === type;
            return (
              <motion.button
                key={type}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => sendNudge(type)}
                className={`py-2.5 px-1 rounded-xl text-xs uppercase tracking-wider font-semibold border transition-all ${
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
