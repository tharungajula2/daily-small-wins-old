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
import PulseSparkline from '@/components/core/PulseSparkline';
import SundayReviewModal from '@/components/core/SundayReviewModal';

const PILLAR_METADATA: Record<string, { title: string; icon: string }> = {
  nutrition: { title: 'Nutrition', icon: '🥑' },
  movement: { title: 'Movement', icon: '💪' },
  sleep: { title: 'Sleep', icon: '🌙' },
  stress_mental: { title: 'Stress & Mental', icon: '🧘' },
  social: { title: 'Social Connection', icon: '🤝' },
  environment: { title: 'Environment', icon: '🌱' },
};

export default function Dashboard() {
  const { 
    feetOnFloorLogged, morningCheckInDone, sleepScore, moodScore, anchors, eveningCheckInDone,
    isVisionEnabled, isNotesEnabled
  } = useRitualStore();
  const [showEvening, setShowEvening] = useState(false);
  const [isManagingAnchors, setIsManagingAnchors] = useState(false);
  const [isManagingWidgets, setIsManagingWidgets] = useState(false);

  useEffect(() => {
    // Silently sync missing cloud data to local store on boot
    syncPullInitialState(useRitualStore.getState(), useRitualStore.setState);
  }, []);

  const calculatePulse = () => {
    const morningScore = morningCheckInDone ? 10 : 0;
    const eveningScore = eveningCheckInDone ? 20 : 0;

    // Group anchors by pillarId to determine active pillars
    const pillarsMap: Record<string, typeof anchors> = {};
    anchors.forEach(anchor => {
      if (!pillarsMap[anchor.pillarId]) {
        pillarsMap[anchor.pillarId] = [];
      }
      pillarsMap[anchor.pillarId].push(anchor);
    });

    const activePillarIds = Object.keys(pillarsMap);
    let engineScore = 0;

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
      engineScore = averagePillarCompletion * 70;
    }

    return Math.round(morningScore + eveningScore + engineScore);
  };

  const allCompleted = anchors.length > 0 && anchors.every(a => a.completed);

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto relative shadow-sm bg-surface sm:border-x sm:border-muted">
      <SundayReviewModal />
      
      <header className="h-16 flex items-center justify-between px-6 border-b border-muted/50">
        <div className="w-8"></div> {/* Spacer for centering */}
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
        <button 
          onClick={() => setIsManagingWidgets(true)}
          className="w-8 h-8 flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
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
                   <PulseSparkline />
                 </div>

                 {isVisionEnabled && (
                   <div className="w-full px-6">
                     <VisionPriming />
                   </div>
                 )}
                 
                 <div className="w-full px-6 flex flex-col gap-6">
                    {/* Header with Edit Button */}
                    <div className="flex justify-between items-center ml-1">
                      <h3 className="text-xs font-semibold tracking-widest uppercase text-ink-secondary">
                        {allCompleted ? 'ALL ANCHORS SET ✓' : 'DAILY ANCHOR ENGINE'}
                      </h3>
                      <button 
                        onClick={() => setIsManagingAnchors(true)}
                        className="text-ink-tertiary hover:text-accent-teal text-xs uppercase tracking-widest transition-colors flex items-center gap-1 font-semibold"
                      >
                        ⚡ Edit Anchors
                      </button>
                    </div>

                    {/* Grouped Pillars */}
                    {['nutrition', 'movement', 'sleep', 'stress_mental', 'social', 'environment'].map(pId => {
                      const meta = PILLAR_METADATA[pId];
                      const pillarAnchors = anchors.filter(a => a.pillarId === pId);
                      if (pillarAnchors.length === 0) return null;
                      return (
                        <div key={pId} className="w-full p-4 rounded-2xl bg-canvas border border-muted shadow-sm flex flex-col gap-1">
                          <div className="flex items-center gap-2 mb-3 ml-1">
                            <span className="text-base">{meta.icon}</span>
                            <h4 className="text-xs font-semibold tracking-widest uppercase text-ink-primary">
                              {meta.title}
                            </h4>
                          </div>
                          {pillarAnchors.map(anchor => (
                            <AnchorCard key={anchor.id} anchor={anchor} />
                          ))}
                        </div>
                      );
                    })}

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
                   <EveningCheckIn />
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
