'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Search, Calendar, SlidersHorizontal, Tag, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalEntry {
  id: string;
  date: string;
  reflection_text: string;
  anchor_title: string;
  anchor_prompt: string;
  pillar_id: string;
}

const PILLARS = [
  { id: 'all', title: 'All Pillars', icon: '✨' },
  { id: 'nutrition', title: 'Nutrition', icon: '🥑' },
  { id: 'movement', title: 'Movement', icon: '💪' },
  { id: 'sleep', title: 'Sleep', icon: '🌙' },
  { id: 'stress_mental', title: 'Stress & Mental', icon: '🧘' },
  { id: 'social', title: 'Social', icon: '🤝' },
  { id: 'environment', title: 'Environment', icon: '🌱' }
];

const PRESET_TAGS = ['#wins', '#drains', '#ideas', '#lessons'];

export default function NotesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    async function loadNotes() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }
        
        const { data } = await supabase
          .from('anchor_logs')
          .select('id, date, reflection_text, user_anchors(title, prompt, pillar_id)')
          .eq('user_id', session.user.id)
          .not('reflection_text', 'is', null)
          .neq('reflection_text', '')
          .order('date', { ascending: false });

        const mapped: JournalEntry[] = [];
        if (data) {
          data.forEach((d: any) => {
            if (d.reflection_text) {
              mapped.push({
                id: d.id,
                date: d.date,
                reflection_text: d.reflection_text,
                anchor_title: d.user_anchors?.title || 'Reflection',
                anchor_prompt: d.user_anchors?.prompt || 'Logged',
                pillar_id: d.user_anchors?.pillar_id || 'stress_mental'
              });
            }
          });
        }

        // Fallbacks for demo journals if history is fresh
        if (mapped.length === 0) {
          mapped.push(
            {
              id: 'mock-j1',
              date: new Date().toLocaleDateString('en-CA'),
              reflection_text: "Conquered 7,000 steps during morning sprint. Water intake steady, feeling centered. #wins",
              anchor_title: "Evening Reflection",
              anchor_prompt: "Three lines: win, drain, tomorrow's priority.",
              pillar_id: 'stress_mental'
            },
            {
              id: 'mock-j2',
              date: new Date(Date.now() - 86400000).toLocaleDateString('en-CA'),
              reflection_text: "Had a genuine, real dialogue with Mark. Focused deeply on present conversation. #lessons",
              anchor_title: "Social Connection Log",
              anchor_prompt: "What was the most meaningful part of today?",
              pillar_id: 'social'
            },
            {
              id: 'mock-j3',
              date: new Date(Date.now() - 172800000).toLocaleDateString('en-CA'),
              reflection_text: "Need to optimize the desk height. Feeling slight lower back strain after 3 cycles of desk rule. #drains",
              anchor_title: "Movement Desk Check",
              anchor_prompt: "Current physical strain level?",
              pillar_id: 'movement'
            }
          );
        }

        setEntries(mapped);
      } catch (err) {
        console.error("Error loading notes:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotes();
  }, []);

  // Extract all unique hashtags appearing in any loaded logs
  const getDynamicTags = () => {
    const tags = new Set<string>();
    entries.forEach(e => {
      const matches = e.reflection_text.match(/#[a-zA-Z0-9_]+/g);
      if (matches) {
        matches.forEach(t => tags.add(t.toLowerCase()));
      }
    });
    // Merge with presets to ensure robust defaults
    PRESET_TAGS.forEach(pt => tags.add(pt));
    return Array.from(tags);
  };

  const dynamicTags = getDynamicTags();

  // Filter & Sort Application
  const filteredEntries = entries
    .filter(e => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' || 
        e.reflection_text.toLowerCase().includes(query) ||
        e.anchor_title.toLowerCase().includes(query) ||
        e.anchor_prompt.toLowerCase().includes(query);

      const matchesPillar = selectedPillar === 'all' || e.pillar_id === selectedPillar;

      const matchesTag = selectedTag === 'all' || 
        e.reflection_text.toLowerCase().includes(selectedTag.toLowerCase());

      return matchesSearch && matchesPillar && matchesTag;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const getPillarIcon = (pillarId: string) => {
    return PILLARS.find(p => p.id === pillarId)?.icon || '⚓';
  };

  const getPillarTitle = (pillarId: string) => {
    return PILLARS.find(p => p.id === pillarId)?.title || 'Reflection';
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <main className="min-h-screen max-w-md mx-auto bg-[#F7F6F2] relative flex flex-col justify-between p-6 sm:border-x sm:border-muted shadow-sm select-none">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between h-8 relative">
          <button 
            onClick={() => router.back()} 
            className="text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-[10px] font-bold tracking-widest text-ink-secondary uppercase">
            Reflection Journals
          </span>
          <div className="w-8" />
        </header>

        {/* Brand Banner */}
        <section className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-teal" />
            <h2 className="text-2xl font-bold tracking-tight text-ink-primary">Notes of Life</h2>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-ink-secondary mt-0.5">
            Your Clinical Stoic Journal & Intention Archives
          </p>
        </section>

        {/* Minimalist Search & Sort Control Panel */}
        <section className="flex flex-col gap-3.5 bg-surface border border-muted/80 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Search Input Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-ink-secondary/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts, anchors, or priorities..."
              className="w-full bg-[#F7F6F2] border border-muted rounded-xl pl-9 pr-4 py-2.5 text-xs text-ink-primary focus:outline-none focus:border-accent-teal/50 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-[10px] font-bold text-ink-secondary/60 hover:text-ink-primary"
              >
                Clear
              </button>
            )}
          </div>

          {/* Double-Row Filter System */}
          <div className="flex flex-col gap-3 pt-1">
            {/* Pillar Filter Scroll */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] uppercase tracking-widest text-ink-secondary/80 font-bold px-0.5">
                Filter by Pillar
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
                {PILLARS.map(p => {
                  const isSelected = selectedPillar === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPillar(p.id)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap snap-center transition-all flex items-center gap-1.5 border ${
                        isSelected 
                          ? 'bg-accent-teal text-surface border-accent-teal shadow-xs' 
                          : 'bg-surface text-ink-secondary border-muted hover:border-muted/80'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Perspective Tags Filter Scroll */}
            <div className="flex flex-col gap-1.5 border-t border-muted/30 pt-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[9px] uppercase tracking-widest text-ink-secondary/80 font-bold flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> Perspective Tags
                </span>
                {selectedTag !== 'all' && (
                  <button 
                    onClick={() => setSelectedTag('all')}
                    className="text-[9px] font-semibold text-accent-teal hover:underline"
                  >
                    Reset Tag
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap snap-center transition-all border ${
                    selectedTag === 'all'
                      ? 'bg-ink-primary text-surface border-ink-primary'
                      : 'bg-canvas text-ink-secondary border-muted hover:border-muted/80'
                  }`}
                >
                  All Tags
                </button>
                {dynamicTags.map(tag => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold tracking-wide whitespace-nowrap snap-center transition-all border ${
                        isSelected
                          ? 'bg-accent-teal/15 text-accent-teal border-accent-teal/30 font-bold'
                          : 'bg-canvas text-ink-secondary border-muted/80 hover:border-muted'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sort Controller bar */}
          <div className="flex justify-between items-center border-t border-muted/30 pt-3">
            <span className="text-[10px] font-semibold text-ink-secondary">
              Showing {filteredEntries.length} reflection{filteredEntries.length === 1 ? '' : 's'}
            </span>

            <div className="flex items-center gap-1 bg-[#F7F6F2] p-0.5 rounded-lg border border-muted">
              <button
                onClick={() => setSortBy('newest')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                  sortBy === 'newest'
                    ? 'bg-surface text-ink-primary shadow-xs font-bold'
                    : 'text-ink-secondary/70 hover:text-ink-primary'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy('oldest')}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                  sortBy === 'oldest'
                    ? 'bg-surface text-ink-primary shadow-xs font-bold'
                    : 'text-ink-secondary/70 hover:text-ink-primary'
                }`}
              >
                Oldest
              </button>
            </div>
          </div>
        </section>

        {/* Scrollable Journal List */}
        <section className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <div className="h-28 w-full bg-surface animate-pulse rounded-2xl border" />
              <div className="h-28 w-full bg-surface animate-pulse rounded-2xl border" />
              <div className="h-28 w-full bg-surface animate-pulse rounded-2xl border" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-surface border border-muted rounded-2xl p-6 shadow-sm"
            >
              <span className="text-2xl">📓</span>
              <div className="flex flex-col">
                <h4 className="text-xs font-bold text-ink-primary">No Matching Reflections</h4>
                <p className="text-[10px] text-ink-secondary mt-1">
                  Adjust your search keyword, tag filters, or pillar selections.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[58vh] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map(e => (
                  <motion.div 
                    layout
                    key={e.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={springTransition}
                    className="p-5 rounded-2xl bg-surface border border-muted flex flex-col gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)]"
                  >
                    {/* Header bar */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm select-none" title={getPillarTitle(e.pillar_id)}>
                          {getPillarIcon(e.pillar_id)}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-ink-secondary/90 leading-none">
                            {getPillarTitle(e.pillar_id)}
                          </span>
                          <span className="text-[8px] font-bold text-accent-teal uppercase tracking-widest mt-0.5 leading-none">
                            {e.anchor_title}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-ink-secondary/70 select-none bg-[#F7F6F2] px-2 py-0.5 rounded-md border border-muted/50">
                        <Calendar className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-bold tracking-widest uppercase mt-0.5">
                          {e.date}
                        </span>
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="px-3 py-2 border-l border-muted/80 bg-canvas/30 rounded-r-lg">
                      <p className="text-[10px] text-ink-secondary leading-relaxed font-normal italic select-none">
                        "{e.anchor_prompt}"
                      </p>
                    </div>

                    {/* Reflection Text with Serif Typography */}
                    <p className="text-xs font-serif text-ink-primary leading-relaxed font-normal tracking-wide mt-1 pl-0.5">
                      {e.reflection_text}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
