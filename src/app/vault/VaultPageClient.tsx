'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Cookie, Sparkles, Calendar as CalendarIcon, CheckCircle2, MessageSquareText, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';

type VaultItem = {
  id: string;
  anchorId: string;
  type: 'gather' | 'keep' | 'win' | 'reflection';
  title: string;
  description?: string;
  timestamp: string;
};

type GroupedAnchor = {
  anchorId: string;
  title: string;
  isKept: boolean;
  keepTimestamp?: string;
  gathers: { id: string; description: string; timestamp: string; type: 'gather' | 'reflection' }[];
};

type VaultDay = {
  date: string;
  anchors: Record<string, GroupedAnchor>;
  wins: VaultItem[];
};

export default function VaultPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [groupedDays, setGroupedDays] = useState<Record<string, VaultDay>>({});
  const [dates, setDates] = useState<string[]>([]);
  const [visibleDays, setVisibleDays] = useState(7);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchVault() {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        const [
          { data: gathers },
          { data: keeps },
          { data: legacyLogs },
          { data: rituals },
          { data: anchors }
        ] = await Promise.all([
          supabase.from('anchor_gathers').select('*').eq('user_id', userId),
          supabase.from('anchor_keeps').select('*').eq('user_id', userId),
          supabase.from('anchor_logs').select('*').eq('user_id', userId).eq('completed', true),
          supabase.from('daily_rituals').select('date, win_of_the_day, created_at').eq('user_id', userId).not('win_of_the_day', 'is', null).neq('win_of_the_day', ''),
          supabase.from('user_anchors').select('id, title').eq('user_id', userId)
        ]);

        const anchorMap = new Map((anchors || []).map(a => [a.id, a.title]));
        const allItems: VaultItem[] = [];

        (gathers || []).forEach(g => {
          allItems.push({
            id: g.id,
            anchorId: g.anchor_id,
            type: 'gather',
            title: anchorMap.get(g.anchor_id) || 'Unknown Anchor',
            description: g.label,
            timestamp: g.created_at || `${g.log_date}T12:00:00Z`
          });
        });

        (keeps || []).forEach(k => {
          allItems.push({
            id: k.id,
            anchorId: k.anchor_id,
            type: 'keep',
            title: anchorMap.get(k.anchor_id) || 'Unknown Anchor',
            timestamp: k.created_at || `${k.log_date}T12:00:00Z`
          });
        });

        (legacyLogs || []).forEach(l => {
          // Add keep
          allItems.push({
            id: l.id + '-keep',
            anchorId: l.anchor_id,
            type: 'keep',
            title: anchorMap.get(l.anchor_id) || 'Unknown Anchor',
            timestamp: l.created_at || `${l.date}T12:00:00Z`
          });
          // If it has reflection, add as gather-like reflection
          if (l.reflection_text) {
            allItems.push({
              id: l.id + '-ref',
              anchorId: l.anchor_id,
              type: 'reflection',
              title: anchorMap.get(l.anchor_id) || 'Unknown Anchor',
              description: l.reflection_text,
              timestamp: l.created_at || `${l.date}T12:00:00Z`
            });
          }
        });

        (rituals || []).forEach(r => {
          allItems.push({
            id: `win-${r.date}`,
            anchorId: 'win',
            type: 'win',
            title: 'Win of the Day',
            description: r.win_of_the_day,
            timestamp: r.created_at || `${r.date}T22:00:00Z`
          });
        });

        setTotalCount(allItems.length);

        const grouped: Record<string, VaultDay> = {};

        allItems.forEach(item => {
          const dateStr = item.timestamp.split('T')[0];
          if (!grouped[dateStr]) {
            grouped[dateStr] = { date: dateStr, anchors: {}, wins: [] };
          }
          
          if (item.type === 'win') {
            grouped[dateStr].wins.push(item);
            return;
          }

          const aId = item.anchorId;
          if (!grouped[dateStr].anchors[aId]) {
            grouped[dateStr].anchors[aId] = {
              anchorId: aId,
              title: item.title,
              isKept: false,
              gathers: []
            };
          }

          if (item.type === 'keep') {
            grouped[dateStr].anchors[aId].isKept = true;
            // Only set keepTimestamp if we don't have one, or if this one is older (earliest keep wins)
            if (!grouped[dateStr].anchors[aId].keepTimestamp || new Date(item.timestamp) < new Date(grouped[dateStr].anchors[aId].keepTimestamp!)) {
              grouped[dateStr].anchors[aId].keepTimestamp = item.timestamp;
            }
          } else if (item.type === 'gather' || item.type === 'reflection') {
            grouped[dateStr].anchors[aId].gathers.push({
              id: item.id,
              description: item.description!,
              timestamp: item.timestamp,
              type: item.type
            });
          }
        });

        // Sort gathers within anchors
        Object.values(grouped).forEach(day => {
          Object.values(day.anchors).forEach(anchor => {
            anchor.gathers.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          });
        });

        setGroupedDays(grouped);
        setDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      } catch (error) {
        console.error("Error fetching vault:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVault();
  }, [router]);

  return (
    <div className="min-h-screen bg-canvas text-ink-primary font-sans selection:bg-accent-teal/20 pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-xl border-b border-muted/30">
        <div className="flex items-center justify-between p-4 px-6">
          <button 
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-muted hover:bg-muted/50 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-ink-secondary" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-bold uppercase tracking-widest text-ink-primary flex items-center gap-2">
              <Cookie className="w-4 h-4 text-amber-500" />
              The Vault
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <span className="text-[9px] text-amber-600 dark:text-amber-500 tracking-widest uppercase font-bold">
                {totalCount > 0 ? `${totalCount} Lifetime Logs` : 'Lifetime Wins & Logs'}
              </span>
            </div>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Cookie className="w-8 h-8 text-ink-tertiary" />
          </motion.div>
          <span className="text-xs uppercase tracking-widest text-ink-secondary font-semibold">Opening the jar...</span>
        </div>
      ) : dates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center gap-4 opacity-50">
          <Cookie className="w-12 h-12 text-ink-tertiary" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-ink-primary">The Jar is Empty</h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Your wins and logs will be safely stored here forever. Keep pushing.
          </p>
        </div>
      ) : (
        <div className="px-4 py-6 max-w-lg mx-auto">
          {dates.slice(0, visibleDays).map((dateStr) => {
            const dateObj = parseISO(dateStr);
            const displayDate = format(dateObj, 'EEEE, MMMM d, yyyy');
            const dayData = groupedDays[dateStr];
            const anchorBlocks = Object.values(dayData.anchors).sort((a, b) => a.title.localeCompare(b.title));

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                key={dateStr}
                className="mb-10"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px bg-muted/50 flex-1" />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-muted text-[10px] font-semibold text-ink-secondary uppercase tracking-widest shadow-sm">
                    <CalendarIcon className="w-3 h-3" />
                    {displayDate}
                  </div>
                  <div className="h-px bg-muted/50 flex-1" />
                </div>

                <div className="flex flex-col gap-4">
                  {/* Render Legacy Wins of the Day */}
                  {dayData.wins.map(win => (
                    <div key={win.id} className="bg-surface border border-muted/60 p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex gap-4 items-start">
                      <div className="mt-0.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Cookie className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                          {win.title}
                        </span>
                        <p className="text-sm font-medium leading-relaxed italic text-amber-600 dark:text-amber-500">
                          "{win.description}"
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Render Anchors and their Gathers */}
                  {anchorBlocks.map(anchor => (
                    <div key={anchor.anchorId} className="bg-surface border border-muted/60 p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-3">
                      {/* Anchor Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-full ${anchor.isKept ? 'bg-accent-teal/10 text-accent-teal' : 'bg-muted/30 text-ink-tertiary'}`}>
                            {anchor.isKept ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-widest ${anchor.isKept ? 'text-ink-primary' : 'text-ink-secondary'}`}>
                            {anchor.title}
                          </span>
                        </div>
                        {anchor.isKept && anchor.keepTimestamp && (
                          <span className="text-[9px] text-ink-tertiary font-semibold uppercase tracking-widest">
                            {format(parseISO(anchor.keepTimestamp), 'HH:mm')}
                          </span>
                        )}
                      </div>

                      {/* No logs, just kept */}
                      {anchor.gathers.length === 0 && anchor.isKept && (
                        <div className="pl-10">
                           <p className="text-xs font-semibold text-accent-teal/70 italic">
                             Completed successfully.
                           </p>
                        </div>
                      )}

                      {/* Gathers List */}
                      {anchor.gathers.length > 0 && (
                        <div className="flex flex-col gap-2 pl-10 mt-1">
                          {anchor.gathers.map((gather, index) => (
                            <div key={gather.id} className="relative">
                              {/* Connector line for multiple logs */}
                              {index !== anchor.gathers.length - 1 && (
                                <div className="absolute left-[7px] top-6 bottom-[-8px] w-px bg-muted/40" />
                              )}
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {gather.type === 'reflection' ? (
                                    <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
                                  ) : (
                                    <Sparkles className="w-3.5 h-3.5 text-accent-teal/60" />
                                  )}
                                </div>
                                <div className="flex flex-col flex-1">
                                  <p className="text-sm font-medium text-ink-primary leading-relaxed">
                                    {gather.description}
                                  </p>
                                  <span className="text-[9px] text-ink-tertiary font-semibold tracking-wider uppercase mt-0.5">
                                    {format(parseISO(gather.timestamp), 'HH:mm')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
          
          {visibleDays < dates.length && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setVisibleDays(prev => prev + 7)}
              className="w-full mt-4 bg-canvas border border-muted/80 text-ink-secondary py-4 rounded-2xl text-[10px] uppercase tracking-widest font-semibold hover:bg-surface hover:text-ink-primary hover:border-muted transition-all flex items-center justify-center gap-2"
            >
              <Cookie className="w-3 h-3" />
              Load More History
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}

