'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import FeetOnFloor from '@/components/rituals/FeetOnFloor';
import MorningCheckIn from '@/components/rituals/MorningCheckIn';
import PulseScore from '@/components/core/PulseScore';
import AnchorCard from '@/components/core/AnchorCard';
import EveningCheckIn from '@/components/rituals/EveningCheckIn';
import { useRitualStore } from '@/store/useRitualStore';
import { syncPullInitialState } from '@/lib/supabase/syncEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, Settings } from 'lucide-react';
import AnchorManager from '@/components/widgets/AnchorManager';
import WidgetManager from '@/components/widgets/WidgetManager';
import VisionPriming from '@/components/widgets/VisionPriming';
import NotesOfLife from '@/components/widgets/NotesOfLife';
import SundayReviewModal from '@/components/core/SundayReviewModal';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { isAnchorActiveForDay } from '@/utils/dayMatcher';
import VisionPrimer from '@/components/VisionPrimer';
import { evaluateYesterdayStreak } from '@/utils/streakEngine';

const PILLAR_METADATA: Record<string, { title: string; icon: string; stripeColor: string }> = {
  nutrition: { title: 'Nutrition', icon: '🥑', stripeColor: 'bg-accent-teal' },
  movement: { title: 'Movement', icon: '💪', stripeColor: 'bg-[#3A86C8]' },
  sleep: { title: 'Sleep', icon: '🌙', stripeColor: 'bg-[#6A5ACD]' },
  stress_mental: { title: 'Stress & Mental', icon: '🧘', stripeColor: 'bg-[#D97706]' },
  social: { title: 'Social Connection', icon: '🤝', stripeColor: 'bg-[#C084FC]' },
  environment: { title: 'Environment', icon: '🌱', stripeColor: 'bg-success' },
};

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const { 
    feetOnFloorLogged, morningCheckInDone, sleepScore, moodScore, anchors, eveningCheckInDone,
    isVisionEnabled, isNotesEnabled, currentStreak
  } = useRitualStore();
  
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useRitualStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsub = useRitualStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  const [showEvening, setShowEvening] = useState(false);
  const [isManagingAnchors, setIsManagingAnchors] = useState(false);
  const [isManagingWidgets, setIsManagingWidgets] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [collapsedPillars, setCollapsedPillars] = useState<Record<string, boolean>>({});
  const [userState, setUserState] = useState<{
    user_id: string;
    pause_tokens_remaining: number;
    current_streak: number;
    longest_streak: number;
    lifetime_anchor_count: number;
  } | null>(null);

  const [anchorMetadata, setAnchorMetadata] = useState<Record<string, { is_non_negotiable: boolean; baseline_target: number | null }>>({});

  const togglePillarCollapse = (pId: string, activeAnchors: any[]) => {
    setCollapsedPillars(prev => ({
      ...prev,
      [pId]: !(prev[pId] !== undefined ? prev[pId] : (activeAnchors.every(a => a.completed)))
    }));
  };

  // Dedicated useEffect to load remote user state and anchor metadata without modifying auth listener
  useEffect(() => {
    let active = true;

    async function loadExtraData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const uid = session.user.id;
        const todayStr = new Date().toLocaleDateString('en-CA');
        const state = useRitualStore.getState();

        // Safe yesterday boundary evaluation
        const lastEvalKey = `trelis_last_streak_eval_${uid}`;
        const lastEval = localStorage.getItem(lastEvalKey);

        if (!lastEval || lastEval !== todayStr) {
          try {
            console.log(`Dashboard: Rollover detected. Running streak engine...`);
            const evalRes = await evaluateYesterdayStreak(supabase, uid);
            console.log("Streak Engine evaluation success:", evalRes);
            state.setStreak(evalRes.newStreak);
          } catch (e) {
            console.error("Streak Engine evaluation failed:", e);
          }
          localStorage.setItem(lastEvalKey, todayStr);
        }

        // 1. Fetch user state
        const { data: stateData, error: stateErr } = await supabase
          .from('user_state')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();

        if (stateErr) throw stateErr;
        
        if (stateData && active) {
          setUserState(stateData);
        } else if (active) {
          // If user_state doesn't exist, create it safely
          const { data: inserted, error: insertErr } = await supabase
            .from('user_state')
            .insert({
              user_id: uid,
              current_streak: currentStreak,
              longest_streak: currentStreak,
              lifetime_anchor_count: 0,
              pause_tokens_remaining: 2
            })
            .select()
            .maybeSingle();

          if (!insertErr && inserted && active) {
            setUserState(inserted);
          }
        }

        // 2. Fetch full user_anchors columns to map extra metadata dynamically
        const { data: anchorsData, error: anchorsErr } = await supabase
          .from('user_anchors')
          .select('id, is_non_negotiable, baseline_target')
          .eq('user_id', uid);

        if (!anchorsErr && anchorsData && active) {
          const metaMap: Record<string, { is_non_negotiable: boolean; baseline_target: number | null }> = {};
          anchorsData.forEach(item => {
            metaMap[item.id] = {
              is_non_negotiable: !!item.is_non_negotiable,
              baseline_target: item.baseline_target
            };
          });
          setAnchorMetadata(metaMap);
        }
      } catch (err) {
        console.error("Error loading user state and anchor metadata:", err);
      }
    }

    if (!isAuthLoading) {
      loadExtraData();
    }

    return () => {
      active = false;
    };
  }, [isAuthLoading, currentStreak]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setIsAuthLoading(false);
        if (!session) {
          router.push('/login');
        } else {
          // Silently sync missing cloud data to local store on boot
          syncPullInitialState(useRitualStore.getState(), useRitualStore.setState);
        }
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!hasHydrated || isAuthLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-canvas bg-[#F7F6F2] flex flex-col justify-center px-8 gap-6 sm:border-x sm:border-muted shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/20 animate-pulse" />
          <div className="h-6 w-3/4 bg-muted/20 rounded-md animate-pulse" />
          <div className="h-4 w-1/2 bg-muted/20 rounded-md animate-pulse" />
        </div>
        <div className="flex flex-col gap-4 mt-6">
          <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
          <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
          <div className="h-24 w-full bg-muted/20 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }
  // daily string matcher
  const activeTodayAnchors = anchors.filter(a => isAnchorActiveForDay(a.frequency));

  const getPulseDetails = () => {
    const morningScore = morningCheckInDone ? 10 : 0;
    const eveningScore = eveningCheckInDone ? 20 : 0;
    let engineScore = 0;

    // Group activeTodayAnchors by pillarId to determine unique active pillars (denominator)
    const pillarsMap: Record<string, typeof activeTodayAnchors> = {};
    activeTodayAnchors.forEach(anchor => {
      if (!pillarsMap[anchor.pillarId]) {
        pillarsMap[anchor.pillarId] = [];
      }
      pillarsMap[anchor.pillarId].push(anchor);
    });

    const activePillarIds = Object.keys(pillarsMap);

    if (activePillarIds.length > 0) {
      let totalPillarsCompletion = 0;

      activePillarIds.forEach(pId => {
        const pillarAnchors = pillarsMap[pId];
        let completedValueSum = 0;

        pillarAnchors.forEach(a => {
          if (a.completed) {
            completedValueSum += a.usedBaseline ? 0.5 : 1.0;
          }
        });

        const pillarCompletion = completedValueSum / pillarAnchors.length;
        totalPillarsCompletion += pillarCompletion;
      });

      const averagePillarCompletion = totalPillarsCompletion / activePillarIds.length;
      engineScore = Math.round(averagePillarCompletion * 70);
    }

    const totalScore = morningScore + eveningScore + engineScore;

    return {
      totalScore,
      morningScore,
      eveningScore,
      engineScore
    };
  };

  const allCompleted = activeTodayAnchors.length > 0 && activeTodayAnchors.every(a => a.completed);

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto relative shadow-md bg-[#F7F6F2] sm:border-x sm:border-muted">
      <SundayReviewModal />
      
      <header className="h-16 flex items-center justify-between px-6 border-b border-muted/50 bg-surface/90 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <span 
          suppressHydrationWarning
          className="text-[10px] font-bold tracking-widest text-ink-secondary select-none w-20 text-left"
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '').toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <Image 
            src="/logo-transparent.png" 
            alt="Trelis Life Logo" 
            width={28} 
            height={28} 
            className="object-contain"
          />
          <h1 className="text-xl font-bold tracking-widest text-ink-primary uppercase">
            Trelis
          </h1>
        </div>
        <div className="w-20 flex justify-end gap-1.5">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsManagingWidgets(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-canvas border border-muted/50 text-ink-secondary hover:text-accent-teal hover:border-accent-teal/30 hover:bg-surface hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 select-none cursor-pointer focus:outline-none"
            title="Manage Widgets"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/settings')}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-canvas border border-muted/50 text-ink-secondary hover:text-accent-teal hover:border-accent-teal/30 hover:bg-surface hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 select-none cursor-pointer focus:outline-none"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {new Date().getDay() === 0 && useRitualStore.getState().lastWeeklyReviewDate !== new Date().toISOString().split('T')[0] && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-[#2A7F7F]/5 border border-[#2A7F7F]/10 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex-1">
              <span className="text-[9px] uppercase tracking-widest text-[#2A7F7F] font-bold block">Sunday Reflection</span>
              <h3 className="text-xs font-semibold text-ink-primary mt-1">Weekly Debrief Open</h3>
              <p className="text-[10px] text-ink-secondary mt-0.5 leading-relaxed">
                Take 5 minutes to close out your week, evaluate slipups, and set your new anchors.
              </p>
            </div>
            <button
              onClick={() => router.push('/debrief')}
              className="px-3.5 py-2 rounded-xl bg-[#2A7F7F] text-white text-[10px] font-bold shadow-md hover:bg-[#206363] transition-all whitespace-nowrap"
            >
              Start
            </button>
          </div>
        )}

        {!feetOnFloorLogged ? (
          <FeetOnFloor />
        ) : !eveningCheckInDone ? (
          <div className="flex flex-col animate-in fade-in duration-500">
            {!morningCheckInDone ? (
               <>
                 <FeetOnFloor />
                 <MorningCheckIn />
               </>
            ) : (
              <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 flex flex-col items-center gap-6 py-6 w-full">
                  {/* Premium HUD Bar */}
                  <div className="w-full px-6">
                    <div className="w-full bg-surface rounded-3xl p-5 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] grid grid-cols-3 hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)] transition-all">
                      {/* Left: Streak */}
                      <div className="flex flex-col items-center justify-center text-center border-r border-muted/30 pr-1">
                        <div className="w-9 h-9 rounded-xl bg-canvas flex items-center justify-center text-lg shadow-sm mb-1.5 select-none">
                          {(userState?.current_streak ?? currentStreak ?? 0) >= 7 ? '🔥' : '🌱'}
                        </div>
                        <span className="text-xs font-bold text-ink-primary select-none leading-none">
                          {userState?.current_streak ?? currentStreak ?? 0} {(userState?.current_streak ?? currentStreak ?? 0) === 1 ? 'Day' : 'Days'}
                        </span>
                        <span className="text-[8px] tracking-wider text-ink-secondary uppercase font-semibold select-none mt-1.5 leading-none">
                          Current Streak
                        </span>
                      </div>

                      {/* Middle: Pause Tokens */}
                      <div className="flex flex-col items-center justify-center text-center border-r border-muted/30 px-1 select-none">
                        <div className="h-9 flex items-center justify-center mb-1.5">
                          <div className="flex gap-1.5">
                            {[1, 2, 3].map((num) => {
                              const remaining = userState?.pause_tokens_remaining ?? 2;
                              const isActive = num <= remaining;
                              return (
                                <span 
                                  key={num} 
                                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                                    isActive 
                                      ? 'bg-accent-teal shadow-[0_0_8px_rgba(42,127,127,0.5)]' 
                                      : 'bg-muted'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-ink-primary leading-none">
                          {userState?.pause_tokens_remaining ?? 2} Tokens
                        </span>
                        <span className="text-[8px] tracking-wider text-ink-secondary uppercase font-semibold mt-1.5 leading-none">
                          Pause Tokens
                        </span>
                      </div>

                      {/* Right: Lifetime Completed */}
                      <div className="flex flex-col items-center justify-center text-center pl-1">
                        <div className="w-9 h-9 rounded-xl bg-canvas flex items-center justify-center text-md shadow-sm mb-1.5 select-none">
                          🏆
                        </div>
                        <span className="text-xs font-bold text-ink-primary select-none leading-none">
                          {userState?.lifetime_anchor_count ?? 0}
                        </span>
                        <span className="text-[8px] tracking-wider text-ink-secondary uppercase font-semibold select-none mt-1.5 leading-none">
                          Lifetime Done
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full px-6 mt-3">
                    <VisionPrimer />
                  </div>

                  <div className="w-full px-6">
                    {(() => {
                      const { totalScore, morningScore, eveningScore, engineScore } = getPulseDetails();
                      return (
                        <PulseScore 
                          score={totalScore} 
                          morningScore={morningScore} 
                          eveningScore={eveningScore} 
                          engineScore={engineScore} 
                        />
                      );
                    })()}
                  </div>

                 {isVisionEnabled && (
                   <div className="w-full px-6">
                     <VisionPriming />
                   </div>
                 )}
                 
                 <div className="w-full px-6 flex flex-col gap-6">
                    {/* Standalone Collapsible MECE Six Pillars or All Done Hero Card */}
                    {allCompleted ? (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-surface rounded-3xl p-8 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-6 relative overflow-hidden animate-fade-in hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)] transition-all"
                      >
                        {/* 1.2s Soft Sparkle Animations (No Confetti) */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[0, 1, 2, 3].map((i) => {
                            const delay = i * 0.4;
                            return (
                              <motion.div
                                key={i}
                                animate={{
                                  opacity: [0.2, 0.8, 0.2],
                                  scale: [0.9, 1.1, 0.9]
                                }}
                                transition={{
                                  duration: 1.6,
                                  repeat: Infinity,
                                  delay,
                                  ease: 'easeInOut'
                                }}
                                className="absolute w-1.5 h-1.5 rounded-full bg-accent-teal/40"
                                style={{
                                  top: ['20%', '60%', '30%', '75%'][i],
                                  left: ['15%', '80%', '45%', '25%'][i]
                                }}
                              />
                            );
                          })}
                        </div>

                        <div className="w-16 h-16 rounded-full bg-accent-teal/5 flex items-center justify-center text-2xl select-none shadow-sm">
                          🧘
                        </div>

                        <div className="flex flex-col gap-2">
                          <h3 className="text-xl font-semibold text-ink-primary">
                            Today is Complete
                          </h3>
                          <p className="text-sm text-ink-secondary leading-relaxed font-normal">
                            All {activeTodayAnchors.length} anchors completed.<br/>
                            Your daily protocol is fully achieved.
                          </p>
                        </div>

                        <div className="w-full h-px bg-muted/60" />

                        {/* Ghost CTA Button */}
                        <button 
                          disabled 
                          className="px-6 py-2.5 rounded-full bg-canvas text-[11px] font-semibold tracking-wider text-ink-secondary uppercase select-none border border-muted"
                        >
                          Tomorrow starts at 00:00
                        </button>
                      </motion.div>
                    ) : (
                      ['nutrition', 'movement', 'sleep', 'stress_mental', 'social', 'environment'].map(pId => {
                        const meta = PILLAR_METADATA[pId];
                        const pillarAnchors = activeTodayAnchors.filter(a => a.pillarId === pId);
                        if (pillarAnchors.length === 0) return null;
                        
                        const isDone = pillarAnchors.every(a => a.completed);
                        const isCollapsed = collapsedPillars[pId] !== undefined ? collapsedPillars[pId] : isDone;
                        const completedCount = pillarAnchors.filter(a => a.completed).length;

                        return (
                          <div 
                            key={pId} 
                            className="w-full bg-surface rounded-3xl p-6 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)]"
                          >
                            {/* Pillar Header with lattice-stripe */}
                            <div 
                              onClick={() => togglePillarCollapse(pId, pillarAnchors)} 
                              className="flex justify-between items-end cursor-pointer select-none group"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{meta.icon}</span>
                                  <h4 className="text-lg font-semibold tracking-wide text-ink-primary group-hover:text-accent-teal transition-colors">
                                    {meta.title}
                                  </h4>
                                </div>
                                {/* 4px lattice-stripe under title */}
                                <div className={`h-[4px] w-12 rounded-full mt-1.5 transition-all ${meta.stripeColor} ${isDone ? 'opacity-40 w-8' : 'w-12'}`} />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-ink-secondary">
                                  {completedCount}/{pillarAnchors.length}
                                </span>
                                <ChevronDown 
                                  className={`w-4 h-4 text-ink-secondary transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} 
                                />
                              </div>
                            </div>

                            {/* Collapsible content area */}
                            <AnimatePresence initial={false}>
                              {!isCollapsed && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                  className="overflow-hidden flex flex-col gap-2.5 pt-3"
                                >
                                  {pillarAnchors.map(anchor => (
                                    <AnchorCard 
                                      key={anchor.id} 
                                      anchor={anchor} 
                                      metadata={anchorMetadata[anchor.id]} 
                                    />
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}

                    <button
                      onClick={() => setIsManagingAnchors(true)}
                      className="w-full bg-canvas hover:bg-muted border border-dashed border-muted hover:border-ink-secondary/30 rounded-xl py-3 text-xs font-semibold tracking-widest uppercase text-ink-secondary transition-all flex items-center justify-center gap-2"
                    >
                      + Add New Anchor
                    </button>

                    {isNotesEnabled && (
                      <NotesOfLife />
                    )}
                 </div>

                 {!showEvening ? (
                   <button 
                     onClick={() => setShowEvening(true)}
                     className="mt-8 text-sm text-ink-secondary hover:text-ink-primary transition-colors border-b border-transparent hover:border-ink-primary pb-1"
                   >
                     Begin Evening Wind-down
                   </button>
                 ) : (
                   <div className="w-full px-6">
                     <EveningCheckIn />
                   </div>
                 )}
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[70vh] px-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent-teal/10 flex items-center justify-center mb-6">
              <span className="text-2xl">🌙</span>
            </div>
            <h2 className="text-ink-primary text-xl font-medium mb-2">Day Complete</h2>
            <p className="text-ink-secondary text-sm">
              Your thoughts are parked. <br/> Nothing carries over to the bed. <br/> See you tomorrow.
            </p>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {isManagingAnchors && <AnchorManager onClose={() => setIsManagingAnchors(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isManagingWidgets && <WidgetManager onClose={() => setIsManagingWidgets(false)} />}
      </AnimatePresence>
    </main>
  );
}
