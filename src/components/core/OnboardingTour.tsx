'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRitualStore } from '@/store/useRitualStore';
import { syncPushOnboardingTourState } from '@/lib/supabase/syncEngine';

interface TourStep {
  title: string;
  description: string;
  targetId?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Trelis Life',
    description: 'Not a health app. A Life Operating System. A quiet space designed to bring structure, clarity, and calm to your day.',
  },
  {
    title: 'Total Wins',
    description: 'This tracks your lifetime small wins. It only goes up—progress here is permanent, celebrating momentum without failure.',
    targetId: 'tour-promises-kept',
  },
  {
    title: 'Momentum',
    description: 'Your daily momentum. It tracks consecutive days, encouraging you to keep the Arc alive. Progress is shown cleanly, without judgment.',
    targetId: 'tour-streak-hud',
  },
  {
    title: 'Rest Days',
    description: 'Life happens. You receive 2 Rest tokens per month. Tap "Pause today" to rest without breaking your momentum. Consistency with zero guilt.',
    targetId: 'tour-pause-hud',
  },
  {
    title: 'The Daily Arc',
    description: 'This is your daily pulse. It tracks the foundation of your day: your morning wake-up and evening wind-down.',
    targetId: 'tour-pulse-score',
  },
  {
    title: 'The Bookends',
    description: 'The keystone of your routine. By connecting your evening wind-down to your morning wake-up, you naturally align your circadian rhythm.',
    targetId: 'tour-the-arc',
  },
  {
    title: 'Your Vision',
    description: 'A dedicated space to keep your core "Why" front and center. Because structure without purpose is just a cage.',
    targetId: 'tour-vision-card',
  },
  {
    title: 'The Horizon',
    description: 'Focus on a single, long-term goal. Set your target date to stay grounded in the reality of your timeline.',
    targetId: 'tour-dday-timer',
  },
  {
    title: 'Playlists',
    description: 'These are your daily focus areas. Rather than stressful checklists, they are simple buckets. Tap "+ ✨ GEM" to log a small win anytime.',
    targetId: 'tour-anchors-list',
  },
  {
    title: 'The Vault',
    description: 'Your chronological history. Every Gem you capture and reflection you write is stored here permanently. Tap the vault icon to look back.',
    targetId: 'tour-lifetime-vault',
  },
];

interface OnboardingTourProps {
  onTourFinished?: () => void;
}

export default function OnboardingTour({ onTourFinished }: OnboardingTourProps) {
  const { onboardingTourCompleted, setOnboardingTourCompleted } = useRitualStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showTour, setShowTour] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize and check if tour should run
  useEffect(() => {
    if (!onboardingTourCompleted) {
      // Small timeout to let dashboard elements mount
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [onboardingTourCompleted]);

  // Handle window resizing and target bounding updates
  useEffect(() => {
    if (!showTour) return;

    const updateLayout = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      const stepData = TOUR_STEPS[currentStep];
      if (stepData.targetId) {
        const element = document.getElementById(stepData.targetId);
        if (element) {
          // Scroll target into view if needed
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Wait a moment for smooth scroll to finish before capturing rect
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
          }, 150);
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, true);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout, true);
    };
  }, [currentStep, showTour]);

  if (!showTour) return null;

  const currentStepData = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    // Skip closes the tour for now but DOES NOT mark it completed, so it re-offers later
    setShowTour(false);
    if (onTourFinished) onTourFinished();
  };

  const handleComplete = async () => {
    // Sets it to completed in Zustand state
    setOnboardingTourCompleted(true);
    setShowTour(false);
    // Push the state to Supabase user_state table
    await syncPushOnboardingTourState(true);
    if (onTourFinished) onTourFinished();
  };

  const handleHidePermanent = async () => {
    // Same as complete: marks it true so it never shows again
    await handleComplete();
  };

  // SVG mask path calculation for spotlight
  const getMaskPath = () => {
    if (!targetRect || windowSize.width === 0) return '';
    const { width, height } = windowSize;
    const padding = 8;
    const r = 16; // Rounded corner radius for the highlight cutout

    const top = targetRect.top - padding;
    const left = targetRect.left - padding;
    const right = targetRect.right + padding;
    const bottom = targetRect.bottom + padding;

    // Full screen overlay path with clockwise direction, and a cutout in counter-clockwise direction
    return `
      M 0,0 
      H ${width} 
      V ${height} 
      H 0 
      Z 
      M ${left + r},${top} 
      H ${right - r} 
      A ${r},${r} 0 0,1 ${right},${top + r} 
      V ${bottom - r} 
      A ${r},${r} 0 0,1 ${right - r},${bottom} 
      H ${left + r} 
      A ${r},${r} 0 0,1 ${left},${bottom - r} 
      V ${top + r} 
      A ${r},${r} 0 0,1 ${left + r},${top} 
      Z
    `.trim();
  };

  // Card placement styling based on spotlight position
  const getCardStyle = () => {
    if (!targetRect) {
      // Centered position for welcome step
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const,
      };
    }

    const { height: windowHeight } = windowSize;
    const cardHeightEstimate = 180;
    const spaceBelow = windowHeight - targetRect.bottom;

    if (spaceBelow > cardHeightEstimate + 40) {
      // Place below target
      return {
        top: `${targetRect.bottom + 16}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        position: 'absolute' as const,
      };
    } else {
      // Place above target
      return {
        bottom: `${windowHeight - targetRect.top + 16}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        position: 'absolute' as const,
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* SVG Spotlight Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <path d={getMaskPath()} fill="black" fillRule="evenodd" />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.4)"
          className="backdrop-blur-[1.5px] transition-all duration-300"
          style={targetRect ? { mask: 'url(#spotlight-mask)', WebkitMask: 'url(#spotlight-mask)' } : {}}
        />
      </svg>

      {/* Floating Card Container */}
      <div 
        className="w-full max-w-sm px-4 absolute left-1/2 transition-all duration-300"
        style={getCardStyle()}
      >
        <motion.div
          ref={cardRef}
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="bg-surface border border-muted/80 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-wider text-accent-teal font-semibold font-mono">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <button 
                onClick={handleSkip}
                className="text-[10px] uppercase tracking-wider text-ink-secondary hover:text-ink-primary font-semibold transition-colors"
              >
                Skip
              </button>
            </div>
            <h3 className="text-sm font-semibold text-ink-primary tracking-tight">
              {currentStepData.title}
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-normal">
              {currentStepData.description}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-muted/30">
            <button
              onClick={handleHidePermanent}
              className="text-[10px] uppercase tracking-wider text-red-500 hover:text-red-600 font-semibold transition-colors"
            >
              Hide it
            </button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 bg-canvas hover:bg-muted border border-muted rounded-lg text-[10px] font-semibold text-ink-primary uppercase tracking-wider transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-3 py-1.5 bg-accent-teal hover:bg-accent-teal/95 text-white rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
