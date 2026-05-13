'use client';

import { useState } from 'react';
import FeetOnFloor from '@/components/rituals/FeetOnFloor';
import MorningCheckIn from '@/components/rituals/MorningCheckIn';
import PulseScore from '@/components/core/PulseScore';
import AnchorCard from '@/components/core/AnchorCard';
import EveningCheckIn from '@/components/rituals/EveningCheckIn';
import { useRitualStore } from '@/store/useRitualStore';
import { motion, AnimatePresence } from 'framer-motion';
import AnchorManager from '@/components/widgets/AnchorManager';
import SupplementStack from '@/components/widgets/SupplementStack';
import SupplementManager from '@/components/widgets/SupplementManager';
import GutJournal from '@/components/widgets/GutJournal';
import WidgetManager from '@/components/widgets/WidgetManager';
import DiscomfortLog from '@/components/widgets/DiscomfortLog';
import FoodDiversity from '@/components/widgets/FoodDiversity';
import MovementLog from '@/components/widgets/MovementLog';
import VisionPriming from '@/components/widgets/VisionPriming';
import NotesOfLife from '@/components/widgets/NotesOfLife';

export default function Dashboard() {
  const { 
    feetOnFloorLogged, morningCheckInDone, sleepScore, moodScore, anchors, eveningCheckInDone,
    isSupplementWidgetEnabled, isGutWidgetEnabled, isDiscomfortWidgetEnabled,
    isFoodWidgetEnabled, isMovementWidgetEnabled, isVisionEnabled, isNotesEnabled
  } = useRitualStore();
  const [showEvening, setShowEvening] = useState(false);
  const [isManagingAnchors, setIsManagingAnchors] = useState(false);
  const [isManagingSupplements, setIsManagingSupplements] = useState(false);
  const [isManagingWidgets, setIsManagingWidgets] = useState(false);

  const calculatePulse = () => {
    let base = 50;
    if (morningCheckInDone) base += 20;
    if (sleepScore !== null && sleepScore > 1) base += (sleepScore - 1) * 5;
    if (moodScore !== null && moodScore > 1) base += (moodScore - 1) * 5;
    const completedAnchors = anchors.filter(a => a.completed).length;
    base += (completedAnchors * 10);
    return Math.min(base, 100);
  };

  return (
    <main className="flex flex-col min-h-screen max-w-md mx-auto relative shadow-sm bg-surface sm:border-x sm:border-muted">
      
      <header className="h-16 flex items-center justify-between px-6 border-b border-muted/50">
        <div className="w-8"></div> {/* Spacer for centering */}
        <h1 className="text-ink-secondary text-sm font-medium tracking-widest uppercase">
          TRELIS
        </h1>
        <button 
          onClick={() => setIsManagingWidgets(true)}
          className="w-8 h-8 flex items-center justify-center text-ink-tertiary hover:text-ink-primary transition-colors"
        >
          <span className="text-lg">⚙️</span>
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
              <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 flex flex-col items-center">
                 <PulseScore score={calculatePulse()} />

                 <div className="w-full px-6">
                   {isVisionEnabled && <VisionPriming />}
                 </div>
                 
                 <div className="w-full px-6 mt-4">
                    <div className="flex justify-between items-center mb-4 ml-1">
                      <h3 className="text-ink-secondary text-xs uppercase tracking-widest">
                        Today's Anchors
                      </h3>
                      <button 
                        onClick={() => setIsManagingAnchors(true)}
                        className="text-ink-tertiary hover:text-accent-teal text-xs uppercase tracking-widest transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    {anchors.map(anchor => (
                      <AnchorCard key={anchor.id} anchor={anchor} />
                    ))}
                 </div>

                 <div className="w-full px-6">
                   {isSupplementWidgetEnabled && (
                     <SupplementStack onEdit={() => setIsManagingSupplements(true)} />
                   )}
                   {isGutWidgetEnabled && (
                     <GutJournal />
                   )}
                   {isDiscomfortWidgetEnabled && (
                     <DiscomfortLog />
                   )}
                   {isFoodWidgetEnabled && (
                     <FoodDiversity />
                   )}
                   {isMovementWidgetEnabled && (
                     <MovementLog />
                   )}
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
        {isManagingSupplements && <SupplementManager onClose={() => setIsManagingSupplements(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isManagingWidgets && <WidgetManager onClose={() => setIsManagingWidgets(false)} />}
      </AnimatePresence>
    </main>
  );
}
