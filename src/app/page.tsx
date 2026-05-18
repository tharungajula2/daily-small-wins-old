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
import { SlidersHorizontal } from 'lucide-react';
import AnchorManager from '@/components/widgets/AnchorManager';
import WidgetManager from '@/components/widgets/WidgetManager';
import VisionPriming from '@/components/widgets/VisionPriming';
import NotesOfLife from '@/components/widgets/NotesOfLife';
import SundayReviewModal from '@/components/core/SundayReviewModal';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const PILLAR_METADATA: Record<string, { title: string; icon: string }> = {
  nutrition: { title: 'Nutrition', icon: '🥑' },
  movement: { title: 'Movement', icon: '💪' },
  sleep: { title: 'Sleep', icon: '🌙' },
  stress_mental: { title: 'Stress & Mental', icon: '🧘' },
  social: { title: 'Social Connection', icon: '🤝' },
  environment: { title: 'Environment', icon: '🌱' },
};

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const { 
    feetOnFloorLogged, morningCheckInDone, sleepScore, moodScore, anchors, eveningCheckInDone,
    isVisionEnabled, isNotesEnabled
  } = useRitualStore();
  const [showEvening, setShowEvening] = useState(false);
  const [isManagingAnchors, setIsManagingAnchors] = useState(false);
  const [isManagingWidgets, setIsManagingWidgets] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session status:", session);
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();

    // Silently sync missing cloud data to local store on boot
    syncPullInitialState(useRitualStore.getState(), useRitualStore.setState);
  }, []);

  // daily string matcher
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = dayMap[new Date().getDay()];
  const activeTodayAnchors = anchors.filter(
    a => !a.frequency || a.frequency.length === 0 || a.frequency.includes('all') || a.frequency.includes(todayStr)
  );

  const calculatePulse = () => {
    let score = 0;

    if (morningCheckInDone) {
      score += 10;
    }

    if (eveningCheckInDone) {
      score += 20;
    }

    // Engine (70 points max)
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
      score += averagePillarCompletion * 70;
    }

    return Math.round(score);
  };

  const allCompleted = activeTodayAnchors.length > 0 && activeTodayAnchors.every(a => a.completed);

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto relative shadow-sm bg-surface sm:border-x sm:border-muted">
      <SundayReviewModal />
      
      <header className="h-16 flex items-center justify-between px-6 border-b border-muted/50">
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
        <div className="w-20 flex justify-end">
          <button 
            onClick={() => setIsManagingWidgets(true)}
            className="w-8 h-8 flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
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
                  <div className="w-full px-6">
                    <PulseScore score={calculatePulse()} />
                  </div>

                 {isVisionEnabled && (
                   <div className="w-full px-6">
                     <VisionPriming />
                   </div>
                 )}
                 
                 <div className="w-full px-6 flex flex-col gap-6">
                    {/* The Engine Card */}
                    <div className="w-full bg-surface rounded-2xl p-5 border border-muted shadow-sm flex flex-col gap-5">
                      <div className="flex justify-between items-center ml-1">
                        <h3 className="text-xs font-semibold tracking-widest uppercase text-ink-secondary">
                          {allCompleted ? 'ALL ANCHORS SET ✓' : 'DAILY ANCHOR ENGINE'}
                        </h3>
                      </div>

                      {/* Grouped Pillars */}
                      <div className="flex flex-col gap-4">
                        {['nutrition', 'movement', 'sleep', 'stress_mental', 'social', 'environment'].map(pId => {
                          const meta = PILLAR_METADATA[pId];
                          const pillarAnchors = activeTodayAnchors.filter(a => a.pillarId === pId);
                          if (pillarAnchors.length === 0) return null;
                          return (
                            <div key={pId} className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 ml-1">
                                <span className="text-sm">{meta.icon}</span>
                                <h4 className="text-xs font-semibold tracking-widest uppercase text-ink-primary">
                                  {meta.title}
                                </h4>
                              </div>
                              <div className="flex flex-col gap-2">
                                {pillarAnchors.map(anchor => (
                                  <AnchorCard key={anchor.id} anchor={anchor} />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setIsManagingAnchors(true)}
                        className="w-full bg-canvas hover:bg-muted border border-dashed border-muted hover:border-ink-secondary/30 rounded-xl py-3 text-xs font-semibold tracking-widest uppercase text-ink-secondary transition-all flex items-center justify-center gap-2"
                      >
                        + Add New Anchor
                      </button>
                    </div>

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
