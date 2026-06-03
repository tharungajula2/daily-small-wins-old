'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import FeetOnFloor from '@/components/rituals/FeetOnFloor';
import PulseScore from '@/components/core/PulseScore';
import AnchorCard from '@/components/core/AnchorCard';
import TheArcCard from '@/components/rituals/TheArcCard';
import { useRitualStore } from '@/store/useRitualStore';
import { syncPullInitialState } from '@/lib/supabase/syncEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import AnchorManager from '@/components/widgets/AnchorManager';
import VisionPriming from '@/components/widgets/VisionPriming';
import QuietPartner from '@/components/core/QuietPartner';
import SundayReviewModal from '@/components/core/SundayReviewModal';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { isAnchorActiveForDay } from '@/utils/dayMatcher';
import VisionPrimer from '@/components/VisionPrimer';
import { evaluateYesterdayStreak } from '@/utils/streakEngine';
import GentleReEntryScreen from '@/components/core/GentleReEntryScreen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import LandingPage from '@/components/core/LandingPage';

function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const { 
    feetOnFloorLogged, morningCheckInDone, sleepScore, moodScore, anchors, eveningCheckInDone,
    isVisionEnabled, currentStreak, lastActiveDate, setLastActiveDate,
    lastFreshStartPrompt, setLastFreshStartPrompt, isRestDay, toggleRestDay
  } = useRitualStore();
  
  const [showGentleReEntry, setShowGentleReEntry] = useState(false);
  const [showFreshStart, setShowFreshStart] = useState(false);
  const [showEvening, setShowEvening] = useState(false);
  const [isManagingAnchors, setIsManagingAnchors] = useState(false);
  const [userState, setUserState] = useState<{
    user_id: string;
    pause_tokens_remaining: number;
    current_streak: number;
    longest_streak: number;
    lifetime_anchor_count: number;
  } | null>(null);

  const [anchorMetadata, setAnchorMetadata] = useState<Record<string, { is_non_negotiable: boolean; baseline_target: number | null }>>({});

  useEffect(() => {
    if (lastActiveDate) {
      try {
        const today = new Date();
        const lastDate = new Date(lastActiveDate);
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 7) {
          setShowGentleReEntry(true);
        }
      } catch (err) {
        console.error('Error evaluating lastActiveDate delta:', err);
      }
    }
  }, [lastActiveDate]);

  const handleResume = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    setLastActiveDate(todayStr);
    setShowGentleReEntry(false);
  };

  useEffect(() => {
    try {
      const today = new Date();
      const isMonday = today.getDay() === 1;
      const isFirstOfMonth = today.getDate() === 1;
      const todayStr = today.toLocaleDateString('en-CA');
      
      if ((isMonday || isFirstOfMonth) && lastFreshStartPrompt !== todayStr) {
        setShowFreshStart(true);
      }
    } catch (err) {
      console.error('Error evaluating fresh start day:', err);
    }
  }, [lastFreshStartPrompt]);

  // Dedicated useEffect to load remote user state and anchor metadata
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

    loadExtraData();

    return () => {
      active = false;
    };
  }, [currentStreak]);

  // daily string matcher
  const activeTodayAnchors = anchors.filter(a => isAnchorActiveForDay(a.frequency));

  const totalPersonalAnchors = activeTodayAnchors.length;
  const completedPersonalAnchors = activeTodayAnchors.filter(a => a.completed).length;

  const totalCount = 2 + totalPersonalAnchors;
  const completedCount = (feetOnFloorLogged ? 1 : 0) + (eveningCheckInDone ? 1 : 0) + completedPersonalAnchors;

  const allCompleted = completedCount === totalCount;

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto relative shadow-md bg-transparent sm:border-x sm:border-muted">
      <SundayReviewModal />
      
      <AnimatePresence>
        {showFreshStart && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden bg-[#F7F6F2] dark:bg-[#1E1B17] border-b border-accent-teal/20 relative z-40"
          >
            <div className="px-6 py-4 flex flex-col items-start gap-3 max-w-md mx-auto">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-accent-teal font-semibold">Fresh Start Moment</span>
                <p className="text-xs text-ink-primary font-medium leading-relaxed">
                  Want to start this {new Date().getDay() === 1 ? 'week' : 'month'} fresh? Your anchors stay exactly the same.
                </p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await Haptics.impact({ style: ImpactStyle.Light });
                  } catch (e) {
                    // web fallback
                  }
                  const todayStr = new Date().toLocaleDateString('en-CA');
                  setLastFreshStartPrompt(todayStr);
                  setShowFreshStart(false);
                }}
                className="bg-accent-teal hover:bg-accent-teal/95 text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-98 transition-all whitespace-nowrap self-stretch text-center select-none"
              >
                Take a breath & begin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <header className="h-16 flex items-center justify-between px-6 border-b border-muted/50 bg-surface/90 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <span 
          suppressHydrationWarning
          className="text-[10px] font-semibold tracking-widest text-ink-secondary select-none w-20 text-left"
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
          <h1 className="text-xl font-semibold tracking-widest text-ink-primary uppercase">
            Trelis
          </h1>
        </div>
        <div className="w-20 flex justify-end">
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
              <span className="text-[9px] uppercase tracking-widest text-[#2A7F7F] font-semibold block">Sunday Reflection</span>
              <h3 className="text-xs font-semibold text-ink-primary mt-1">Weekly Debrief Open</h3>
              <p className="text-[10px] text-ink-secondary mt-0.5 leading-relaxed">
                Take 5 minutes to close out your week, evaluate slipups, and set your new anchors.
              </p>
            </div>
            <button
              onClick={() => router.push('/debrief')}
              className="px-3.5 py-2 rounded-xl bg-[#2A7F7F] text-white text-[10px] font-semibold shadow-md hover:bg-[#206363] transition-all whitespace-nowrap"
            >
              Start
            </button>
          </div>
        )}

        {!feetOnFloorLogged ? (
          <FeetOnFloor />
        ) : !eveningCheckInDone ? (
          <div className="flex flex-col animate-in fade-in duration-500">
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 flex flex-col items-center gap-6 py-6 w-full">
                  {/* Premium HUD Bar */}
                  <div className="w-full px-6">
                    <div className="w-full bg-surface rounded-3xl p-5 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] grid grid-cols-3 hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)] transition-all">
                      {/* Left: Promises Kept */}
                      <div className="flex flex-col items-center justify-center text-center border-r border-muted/30 pr-1">
                        <div className="w-9 h-9 rounded-xl bg-accent-teal/10 flex items-center justify-center shadow-sm mb-1.5 select-none">
                          <svg className="w-4 h-4 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-accent-teal select-none leading-none">
                          {userState?.lifetime_anchor_count ?? 0}
                        </span>
                        <span className="text-[8px] tracking-wider text-ink-secondary uppercase font-semibold select-none mt-1.5 leading-none">
                          Promises Kept
                        </span>
                      </div>

                      {/* Middle: Streak */}
                      {(() => {
                        const streakVal = userState?.current_streak ?? currentStreak ?? 0;
                        const isPaused = isRestDay;
                        return (
                          <div className="flex flex-col items-center justify-center text-center border-r border-muted/30 px-1">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm mb-1.5 select-none transition-colors ${
                              isPaused 
                                ? 'bg-muted/30 text-ink-secondary' 
                                : streakVal === 0 
                                  ? 'bg-canvas text-ink-secondary' 
                                  : 'bg-canvas text-accent-teal'
                            }`}>
                              {isPaused ? (
                                <svg className="w-4 h-4 text-ink-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                                </svg>
                              ) : streakVal === 0 ? (
                                <svg className="w-4 h-4 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 22c1.25-6.7 5.85-11.8 11.75-12.7c-2.3 2.1-3.6 5-3.75 8.7c0 0 0 .1 0 0m2-15c1.4-1.2 3.4-1.7 5-1.1c.9.4 1.7.9 2 1.8c.2.6.2 1.3 0 1.9c-.4 1.1-1.3 2-2 2.6c-2.1 1.7-4.9 2.5-7.5 2.8"/>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                                </svg>
                              )}
                            </div>
                            <span className={`text-xs font-semibold select-none leading-none ${isPaused ? 'text-ink-secondary' : 'text-ink-primary'}`}>
                              {isPaused ? 'Resting' : streakVal === 0 ? 'Fresh Arc' : `${streakVal} Day${streakVal === 1 ? '' : 's'}`}
                            </span>
                            <span className="text-[8px] tracking-wider text-ink-secondary uppercase font-semibold select-none mt-1.5 leading-none">
                              Current Streak
                            </span>
                          </div>
                        );
                      })()}

                      {/* Right: Pause Tokens */}
                      <div className="flex flex-col items-center justify-center text-center pl-1 select-none">
                        <div className="h-9 flex items-center justify-center mb-1.5">
                          <div className="flex gap-1.5">
                            {[1, 2, 3].map((num) => {
                              const remaining = userState?.pause_tokens_remaining ?? 2;
                              const isActive = num <= remaining;
                              return (
                                <span 
                                  key={num} 
                                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                                    isRestDay && num === remaining
                                      ? 'bg-accent-teal/40 animate-pulse'
                                      : isActive 
                                        ? 'bg-accent-teal shadow-[0_0_8px_rgba(42,127,127,0.5)]' 
                                        : 'bg-muted'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleRestDay()}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-colors leading-none border select-none ${
                            isRestDay 
                              ? 'bg-accent-teal/10 text-accent-teal border-accent-teal/20' 
                              : 'bg-canvas text-ink-secondary border-muted/50 hover:bg-muted/20'
                          }`}
                        >
                          {isRestDay ? 'Rest active' : 'Pause today'}
                        </button>
                        <span className="text-[8px] tracking-wider text-ink-secondary uppercase font-semibold mt-1.5 leading-none">
                          {userState?.pause_tokens_remaining ?? 2} Tokens
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full px-6 mt-3">
                    <VisionPrimer />
                  </div>

                  <div className="w-full px-6">
                    <PulseScore 
                      completedCount={completedCount} 
                      totalCount={totalCount} 
                    />
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
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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

                        <div className="w-16 h-16 rounded-full bg-accent-teal/5 flex items-center justify-center select-none shadow-sm">
                          <svg className="w-6 h-6 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
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
                      <div className="flex flex-col gap-3">
                        <TheArcCard />
                        {activeTodayAnchors.map(anchor => (
                          <AnchorCard 
                            key={anchor.id} 
                            anchor={anchor} 
                            metadata={anchorMetadata[anchor.id]} 
                          />
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setIsManagingAnchors(true)}
                      className="w-full bg-canvas hover:bg-muted border border-dashed border-muted hover:border-ink-secondary/30 rounded-xl py-3 text-xs font-semibold tracking-widest uppercase text-ink-secondary transition-all flex items-center justify-center gap-2"
                    >
                      + Add New Anchor
                    </button>

                    <QuietPartner />
                  </div>
              </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center h-[70vh] px-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent-teal/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <h2 className="text-ink-primary text-xl font-semibold mb-2">Day Complete</h2>
            <p className="text-ink-secondary text-sm">
              Your thoughts are parked. <br /> Nothing carries over to the bed. <br /> See you tomorrow.
            </p>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {isManagingAnchors && <AnchorManager onClose={() => setIsManagingAnchors(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showGentleReEntry && <GentleReEntryScreen onResume={handleResume} />}
      </AnimatePresence>
    </main>
  );
}

export default function Page() {
  const supabase = createClient();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  useEffect(() => {
    // 1. Initial check
    async function checkInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          syncPullInitialState(useRitualStore.getState(), useRitualStore.setState);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error fetching initial session:', err);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    }

    checkInitialSession();

    // 2. Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        syncPullInitialState(useRitualStore.getState(), useRitualStore.setState);
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!hasHydrated || isAuthLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-transparent flex flex-col justify-center px-8 gap-6 sm:border-x sm:border-muted shadow-sm">
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

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
