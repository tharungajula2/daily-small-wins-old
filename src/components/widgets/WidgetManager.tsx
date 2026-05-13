'use client';

import { motion } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function WidgetManager({ onClose }: { onClose: () => void }) {
  const { 
    isSupplementWidgetEnabled, toggleSupplementWidget,
    isGutWidgetEnabled, toggleGutWidget,
    isDiscomfortWidgetEnabled, toggleDiscomfortWidget,
    isFoodWidgetEnabled, toggleFoodWidget,
    isMovementWidgetEnabled, toggleMovementWidget,
    isVisionEnabled, toggleVision,
    isNotesEnabled, toggleNotes
  } = useRitualStore();

  const handleToggle = async (action: () => void) => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    action();
  };

  const ToggleSwitch = ({ label, desc, isEnabled, onToggle }: { label: string, desc: string, isEnabled: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-4 bg-canvas border border-muted rounded-xl mb-3">
      <div className="pr-4">
        <p className="text-sm font-medium text-ink-primary">{label}</p>
        <p className="text-xs text-ink-tertiary mt-1">{desc}</p>
      </div>
      <button 
        onClick={() => onToggle()}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isEnabled ? 'bg-success' : 'bg-muted'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-surface transition duration-200 ease-in-out shadow-sm ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/20 backdrop-blur-sm sm:items-center"
    >
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-lg border border-muted max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-ink-primary font-medium">OS Configuration</h3>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink-primary p-2">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-ink-secondary text-xs uppercase tracking-widest mb-4">Active Modules</h4>
          
          <ToggleSwitch 
            label="Vision Priming" 
            desc="Your daily psychological anchor."
            isEnabled={isVisionEnabled} 
            onToggle={() => handleToggle(toggleVision)} 
          />
          
          <ToggleSwitch 
            label="Supplement Stack" 
            desc="Track AM/PM supplement protocols."
            isEnabled={isSupplementWidgetEnabled} 
            onToggle={() => handleToggle(toggleSupplementWidget)} 
          />
          
          <ToggleSwitch 
            label="Gut-Brain Journal" 
            desc="Track digestion and vagal tone daily."
            isEnabled={isGutWidgetEnabled} 
            onToggle={() => handleToggle(toggleGutWidget)} 
          />
          
          <ToggleSwitch 
            label="Discomfort Log" 
            desc="Track voluntary hardship for resilience."
            isEnabled={isDiscomfortWidgetEnabled} 
            onToggle={() => handleToggle(toggleDiscomfortWidget)} 
          />
          
          <ToggleSwitch 
            label="Food Diversity" 
            desc="Track 30 weekly plant sources."
            isEnabled={isFoodWidgetEnabled} 
            onToggle={() => handleToggle(toggleFoodWidget)} 
          />
          
          <ToggleSwitch 
            label="Martial Arts & Movement" 
            desc="Log daily physical sessions and techniques."
            isEnabled={isMovementWidgetEnabled} 
            onToggle={() => handleToggle(toggleMovementWidget)} 
          />
          
          <ToggleSwitch 
            label="Notes of Life" 
            desc="Permanent ledger for quotes and insights."
            isEnabled={isNotesEnabled} 
            onToggle={() => handleToggle(toggleNotes)} 
          />
        </div>

        <p className="text-center text-xs text-ink-tertiary mt-8">
          More widgets will unlock as your baseline stabilizes.
        </p>
      </motion.div>
    </motion.div>
  );
}
