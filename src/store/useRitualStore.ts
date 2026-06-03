import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  syncPushDailyRitual, syncPushAnchors, syncPushAnchorLog,
  syncPushVision
} from '@/lib/supabase/syncEngine';

export type PillarId = 'nutrition' | 'movement' | 'sleep' | 'stress_mental' | 'social' | 'environment';
export type AnchorType = 'action' | 'reflection';

export interface Anchor {
  id: string;
  title: string;
  pillarId?: PillarId | null;
  type: AnchorType;
  prompt?: string; // for Type B reflection anchors
  completed: boolean;
  baselineTitle?: string;
  usedBaseline?: boolean;
  reflectionText?: string; // for Type B reflection completions
  subItems?: { id: string; title: string; completed?: boolean }[];
  frequency?: string[];
  baseline_trg?: number;
}

export interface AnchorLog {
  id?: string;
  userId?: string;
  anchorId: string;
  date?: string;
  completed: boolean;
  usedBaseline: boolean;
  reflectionText?: string;
  completedAt?: string;
  subItemsState?: { id: string; completed: boolean }[];
}

interface RitualState {
  feetOnFloorLogged: boolean;
  wakeTime: string | null;
  currentStreak: number;
  morningCheckInDone: boolean;
  sleepScore: number | null;
  moodScore: number | null;
  bedTime: string | null;
  sleepDuration: number | null;
  anchors: Anchor[];
  eveningCheckInDone: boolean;
  winOfTheDay: string;
  parkingLotNotes: string;
  isVisionEnabled: boolean;
  visionText: string;
  
  hasSeenVisionTooltip: boolean;

  // Weekly History (7-day sparkline)
  weeklyHistory: any[];
  lastWeeklyReviewDate: string | null;
  lastActiveDate: string | null;
  setLastActiveDate: (date: string) => void;

  // Wake/Sleep Windows for The Arc definition
  wakeWindow: string;
  sleepWindow: string;
  setWakeWindow: (time: string) => void;
  setSleepWindow: (time: string) => void;

  markFeetOnFloor: (time: string) => void;
  setStreak: (streak: number) => void;
  completeMorningCheckIn: (sleep: number, mood: number, bedTime: string, duration: number) => Promise<void>;
  toggleAnchor: (id: string, asBaseline?: boolean, reflectionText?: string, prompt?: string) => void;
  addAnchor: (title: string, pillarId?: PillarId | null, type?: AnchorType, baseline?: string, prompt?: string, subItems?: { id: string; title: string }[], frequency?: string[]) => void;
  toggleSubItem: (anchorId: string, subItemId: string) => void;
  removeAnchor: (id: string) => void;
  completeEveningCheckIn: (win: string, parkingLot: string) => Promise<void>;
  resetDaily: () => void;
  toggleVision: () => void;
  setVisionText: (text: string) => void;
  toggleWidget: (widgetKey: string) => void;
  dismissTooltip: (tooltip: string) => void;
  setWeeklyHistory: (history: any[]) => void;
  completeWeeklyReview: () => void;
  
  focusThreeIds: string[];
  setFocusThree: (ids: string[]) => void;
  lastFreshStartPrompt: string | null;
  setLastFreshStartPrompt: (date: string) => void;
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => void;
  isRestDay: boolean;
  toggleRestDay: () => void;
}

export const useRitualStore = create<RitualState>()(
  persist(
    (set, get) => ({
      focusThreeIds: [],
      lastFreshStartPrompt: null,
      isPremium: false,
      isRestDay: false,
      feetOnFloorLogged: false,
      wakeTime: null,
      currentStreak: 0,
      morningCheckInDone: false,
      sleepScore: null,
      moodScore: null,
      bedTime: null,
      sleepDuration: null,
      anchors: [],
      eveningCheckInDone: false,
      winOfTheDay: '',
      parkingLotNotes: '',
      isVisionEnabled: true,
      visionText: "I am building the structure for a better life.",

      hasSeenVisionTooltip: false,

      weeklyHistory: [],
      lastWeeklyReviewDate: null,
      lastActiveDate: null,
      
      wakeWindow: '07:00',
      sleepWindow: '23:00',
      setWakeWindow: (time: string) => set({ wakeWindow: time }),
      setSleepWindow: (time: string) => set({ sleepWindow: time }),

      markFeetOnFloor: (time: string) => {
        set({ feetOnFloorLogged: true, wakeTime: time, morningCheckInDone: true });
        syncPushDailyRitual(get());
      },
        
      setStreak: (streak: number) => 
      	set({ currentStreak: streak }),

      completeMorningCheckIn: async (sleep: number, mood: number, bedTime: string, duration: number) => {
        // 1. Update Local State Instantly
        set({ 
          morningCheckInDone: true, 
          sleepScore: sleep, 
          moodScore: mood,
          bedTime: bedTime,
          sleepDuration: duration
        });
        
        syncPushDailyRitual(get());
      },
      
      toggleAnchor: (id: string, asBaseline: boolean = false, reflectionText?: string, prompt?: string) => {
        set((state) => ({
          anchors: state.anchors.map(a => {
            if (a.id !== id) return a;
            const willComplete = !a.completed;
            const updatedSubItems = (a.subItems || []).map(s => ({
              ...s,
              completed: willComplete
            }));
            return {
              ...a,
              completed: willComplete,
              usedBaseline: willComplete ? asBaseline : false,
              reflectionText: willComplete ? reflectionText : undefined,
              prompt: willComplete ? (prompt || a.prompt) : a.prompt,
              subItems: updatedSubItems
            };
          })
        }));
        const anchor = get().anchors.find(a => a.id === id);
        if (anchor) {
          const subItemsState = (anchor.subItems || []).map(s => ({
            id: s.id,
            completed: !!s.completed
          }));
          syncPushAnchorLog(anchor.id, anchor.completed, anchor.usedBaseline || false, anchor.reflectionText, subItemsState);
        }
      },
      
      toggleSubItem: (anchorId: string, subItemId: string) => {
        set((state) => {
          const updatedAnchors = state.anchors.map(a => {
            if (a.id !== anchorId) return a;
            
            const updatedSubItems = (a.subItems || []).map(s => {
              if (s.id !== subItemId) return s;
              return { ...s, completed: !s.completed };
            });

            // Evaluate if ALL sub-items are completed
            const allCompleted = updatedSubItems.length > 0 && updatedSubItems.every(s => s.completed);

            return {
              ...a,
              subItems: updatedSubItems,
              completed: allCompleted
            };
          });

          return { anchors: updatedAnchors };
        });

        const anchor = get().anchors.find(a => a.id === anchorId);
        if (anchor) {
          const subItemsState = (anchor.subItems || []).map(s => ({
            id: s.id,
            completed: !!s.completed
          }));
          syncPushAnchorLog(anchor.id, anchor.completed, anchor.usedBaseline || false, anchor.reflectionText, subItemsState);
        }
      },

      addAnchor: (
        title: string, 
        pillarId?: PillarId | null, 
        type: AnchorType = 'action', 
        baseline?: string, 
        prompt?: string,
        subItems?: { id: string; title: string }[],
        frequency?: string[]
      ) => {
        set((state) => ({
          anchors: [
            ...state.anchors, 
            { 
              id: crypto.randomUUID(), 
              title, 
              pillarId: pillarId || null, 
              type, 
              completed: false, 
              baselineTitle: baseline || undefined,
              prompt: prompt || undefined,
              subItems: subItems || [],
              frequency: frequency || ['all'],
              baseline_trg: (function() {
                const match = title.match(/([\d,]+)\s*step/i);
                return match ? parseInt(match[1].replace(/,/g, ''), 10) : undefined;
              })()
            }
          ]
        }));
        syncPushAnchors(get().anchors);
      },
        
      removeAnchor: (id: string) => {
        set((state) => ({
          anchors: state.anchors.filter(a => a.id !== id)
        }));
        syncPushAnchors(get().anchors);
      },

      completeEveningCheckIn: async (win: string, parkingLot: string) => {
        set({ eveningCheckInDone: true, winOfTheDay: win, parkingLotNotes: parkingLot });
        
        syncPushDailyRitual(get());
      },
        
      resetDaily: () => 
        set((state) => ({ 
          feetOnFloorLogged: false, 
          wakeTime: null, 
          morningCheckInDone: false, 
          sleepScore: null, 
          moodScore: null,
          bedTime: null,
          sleepDuration: null,
          anchors: state.anchors.map(a => ({ 
            ...a, 
            completed: false, 
            usedBaseline: false, 
            reflectionText: undefined,
            subItems: a.subItems?.map(s => ({ ...s, completed: false }))
          })),
          eveningCheckInDone: false,
          winOfTheDay: '',
          parkingLotNotes: '',
          isRestDay: false,
          lastActiveDate: new Date().toLocaleDateString('en-CA'),
        })),

      toggleRestDay: () => set((state) => ({ isRestDay: !state.isRestDay })),

      setLastActiveDate: (date: string) => set({ lastActiveDate: date }),

      toggleVision: () => set((state) => ({ isVisionEnabled: !state.isVisionEnabled })),
      setVisionText: (text: string) => {
        set({ visionText: text });
        syncPushVision(text);
      },
      


      setWeeklyHistory: (history: any[]) => set({ weeklyHistory: history }),

      completeWeeklyReview: () => {
        const today = new Date().toISOString().split('T')[0];
        set({ 
          lastWeeklyReviewDate: today
        });
      },

      toggleWidget: (widgetKey) => 
        set((state) => ({ [widgetKey]: !state[widgetKey as keyof RitualState] })),

      dismissTooltip: (tooltip) => set({ [tooltip]: true }),
      
      setFocusThree: (ids: string[]) => {
        set({ focusThreeIds: ids.slice(0, 3) });
      },
      setLastFreshStartPrompt: (date: string) => {
        set({ lastFreshStartPrompt: date });
      },
      setPremiumStatus: (status: boolean) => {
        set({ isPremium: status });
      },
    }),
    {
      name: 'trelis-life-ritual-storage',
    }
  )
);
