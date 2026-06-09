'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Cookie, Sparkles, Calendar as CalendarIcon, CheckCircle2, MessageSquareText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';

type VaultItem = {
  id: string;
  type: 'gather' | 'keep' | 'win' | 'reflection';
  title: string;
  description?: string;
  timestamp: string; // ISO string for sorting
};

export default function VaultPageClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [groupedItems, setGroupedItems] = useState<Record<string, VaultItem[]>>({});
  const [dates, setDates] = useState<string[]>([]);
  
  // For filter / cookie jar interaction
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

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
        // Parallel fetch for maximum speed
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

        // Process Gathers (Transactions)
        (gathers || []).forEach(g => {
          allItems.push({
            id: g.id,
            type: 'gather',
            title: anchorMap.get(g.anchor_id) || 'Unknown Anchor',
            description: g.label,
            timestamp: g.created_at || `${g.log_date}T12:00:00Z`
          });
        });

        // Process Keeps (Check-ins)
        (keeps || []).forEach(k => {
          allItems.push({
            id: k.id,
            type: 'keep',
            title: anchorMap.get(k.anchor_id) || 'Unknown Anchor',
            description: 'Anchor Kept',
            timestamp: k.created_at || `${k.log_date}T12:00:00Z`
          });
        });

        // Process Legacy Logs (Reflections & old Keeps)
        (legacyLogs || []).forEach(l => {
          allItems.push({
            id: l.id,
            type: l.reflection_text ? 'reflection' : 'keep',
            title: anchorMap.get(l.anchor_id) || 'Unknown Anchor',
            description: l.reflection_text || 'Anchor Kept',
            timestamp: l.created_at || `${l.date}T12:00:00Z`
          });
        });

        // Process Daily Rituals (Legacy Win of the Day)
        (rituals || []).forEach(r => {
          allItems.push({
            id: `win-${r.date}`,
            type: 'win',
            title: 'Win of the Day',
            description: r.win_of_the_day,
            timestamp: r.created_at || `${r.date}T22:00:00Z`
          });
        });

        // Sort all items descending by time
        allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Group by Date string (YYYY-MM-DD)
        const grouped: Record<string, VaultItem[]> = {};
        allItems.forEach(item => {
          const dateStr = item.timestamp.split('T')[0];
          if (!grouped[dateStr]) grouped[dateStr] = [];
          
          // Deduplicate keeps that might exist in both legacy logs and keeps
          if (item.type === 'keep' || item.type === 'reflection') {
             const exists = grouped[dateStr].find(i => i.title === item.title && (i.type === 'keep' || i.type === 'reflection'));
             if (exists) {
                // If the new one is a reflection and the old is a keep, replace it
                if (item.type === 'reflection' && exists.type === 'keep') {
                   grouped[dateStr] = grouped[dateStr].filter(i => i.id !== exists.id);
                } else {
                   return; // Skip duplicate keep
                }
             }
          }
          grouped[dateStr].push(item);
        });

        setGroupedItems(grouped);
        setDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      } catch (error) {
        console.error("Error fetching vault:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVault();
  }, [router]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'gather': return <Sparkles className="w-4 h-4 text-accent-teal" />;
      case 'win': return <Cookie className="w-4 h-4 text-amber-500" />;
      case 'reflection': return <MessageSquareText className="w-4 h-4 text-indigo-400" />;
      case 'keep': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

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
            <p className="text-[10px] text-ink-secondary tracking-widest uppercase font-semibold">
              Lifetime Wins & Logs
            </p>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
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
          {dates.map((dateStr) => {
            const dateObj = parseISO(dateStr);
            const displayDate = format(dateObj, 'EEEE, MMMM d, yyyy');
            const items = groupedItems[dateStr];

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                key={dateStr}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px bg-muted/50 flex-1" />
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-muted text-[10px] font-semibold text-ink-secondary uppercase tracking-widest">
                    <CalendarIcon className="w-3 h-3" />
                    {displayDate}
                  </div>
                  <div className="h-px bg-muted/50 flex-1" />
                </div>

                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-surface border border-muted/60 p-4 rounded-2xl shadow-sm flex gap-4 items-start"
                    >
                      <div className="mt-0.5 p-2 rounded-xl bg-canvas border border-muted/30">
                        {getIconForType(item.type)}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-ink-tertiary font-semibold uppercase tracking-widest whitespace-nowrap">
                            {format(parseISO(item.timestamp), 'HH:mm')}
                          </span>
                        </div>
                        {item.description && item.description !== 'Anchor Kept' && (
                          <p className={`text-sm font-medium leading-relaxed ${item.type === 'win' ? 'italic text-amber-600 dark:text-amber-500' : 'text-ink-primary'}`}>
                            {item.description}
                          </p>
                        )}
                        {item.description === 'Anchor Kept' && (
                          <p className="text-xs font-semibold text-ink-secondary/70">
                            Completed successfully.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
