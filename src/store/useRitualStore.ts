import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import { 
  syncPushDailyRitual, syncPushAnchors, syncPushAnchorLog,
  syncPushSupplements, syncPushSupplementLog, syncPushNote,
  syncPushVision, syncPushWeeklyPlantCount
} from '@/lib/supabase/syncEngine';

export interface Anchor {
  id: string;
  title: string;
  category: 'body' | 'mind';
  completed: boolean;
  baselineTitle?: string;
  usedBaseline?: boolean;
}

export interface Supplement {
  id: string;
  name: string;
  timing: 'AM' | 'PM' | 'Evening';
  taken: boolean;
  dosage?: string;
  instruction?: string;
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
  supplements: Supplement[];
  morningGut: number | null;
  eveningGut: number | null;
  isSupplementWidgetEnabled: boolean;
  isGutWidgetEnabled: boolean;
  isDiscomfortWidgetEnabled: boolean;
  dailyDiscomfortLog: string;
  isFoodWidgetEnabled: boolean;
  isMovementWidgetEnabled: boolean;
  weeklyPlantCount: number;
  dailyMovementNote: string;
  isVisionEnabled: boolean;
  visionText: string;
  isNotesEnabled: boolean;
  lifeNotes: Array<{ id: string; content: string; attribution: string; date: string }>;
  
  hasSeenFoodTooltip: boolean;
  hasSeenDiscomfortTooltip: boolean;
  hasSeenGutTooltip: boolean;
  hasSeenVisionTooltip: boolean;

  // Weekly History (7-day sparkline)
  weeklyHistory: any[];
  lastWeeklyReviewDate: string | null;

  markFeetOnFloor: (time: string) => void;
  setStreak: (streak: number) => void;
  completeMorningCheckIn: (sleep: number, mood: number, bedTime: string, duration: number) => Promise<void>;
  toggleAnchor: (id: string, asBaseline?: boolean) => void;
  addAnchor: (title: string, category: string, baseline?: string) => void;
  removeAnchor: (id: string) => void;
  toggleSupplement: (id: string) => void;
  addSupplement: (name: string, timing: 'AM' | 'PM' | 'Evening', dosage?: string, instruction?: string) => void;
  removeSupplement: (id: string) => void;
  logMorningGut: (score: number) => void;
  logEveningGut: (score: number) => void;
  completeEveningCheckIn: (win: string, parkingLot: string) => Promise<void>;
  resetDaily: () => void;
  toggleSupplementWidget: () => void;
  toggleGutWidget: () => void;
  toggleDiscomfortWidget: () => void;
  logDiscomfort: (log: string) => void;
  toggleFoodWidget: () => void;
  toggleMovementWidget: () => void;
  incrementPlantCount: () => void;
  logMovement: (note: string) => void;
  toggleVision: () => void;
  setVisionText: (text: string) => void;
  toggleNotes: () => void;
  addLifeNote: (content: string, attribution: string) => void;
  removeLifeNote: (id: string) => void;
  toggleWidget: (widgetKey: string) => void;
  dismissTooltip: (tooltip: string) => void;
  setWeeklyHistory: (history: any[]) => void;
  completeWeeklyReview: () => void;
}

export const useRitualStore = create<RitualState>()(
  persist(
    (set, get) => ({
      feetOnFloorLogged: false,
      wakeTime: null,
      currentStreak: 0,
      morningCheckInDone: false,
      sleepScore: null,
      moodScore: null,
      bedTime: null,
      sleepDuration: null,
      anchors: [
        { id: 'default-a1', title: 'Hydration (3 Liters)', category: 'body', completed: false, baselineTitle: 'Drink 1 large glass' },
        { id: 'default-a2', title: 'Morning Sunlight / Walk', category: 'body', completed: false, baselineTitle: 'Step outside for 2 mins' },
        { id: 'default-a3', title: 'Silence / Breathwork', category: 'mind', completed: false, baselineTitle: '3 deep breaths' }
      ],
      eveningCheckInDone: false,
      winOfTheDay: '',
      parkingLotNotes: '',
      supplements: [
        { id: 'default-s1', name: 'Vitamin D3', timing: 'AM', taken: false },
        { id: 'default-s2', name: 'Magnesium', timing: 'Evening', taken: false }
      ],
      morningGut: null,
      eveningGut: null,
      isSupplementWidgetEnabled: true,
      isGutWidgetEnabled: true,
      isDiscomfortWidgetEnabled: false,
      dailyDiscomfortLog: '',
      isFoodWidgetEnabled: false,
      isMovementWidgetEnabled: false,
      weeklyPlantCount: 0,
      dailyMovementNote: '',
      isVisionEnabled: true,
      visionText: "I am building the structure for a better life.",
      isNotesEnabled: false,
      lifeNotes: [],

      hasSeenFoodTooltip: false,
      hasSeenDiscomfortTooltip: false,
      hasSeenGutTooltip: false,
      hasSeenVisionTooltip: false,

      weeklyHistory: [],
      lastWeeklyReviewDate: null,
      
      markFeetOnFloor: (time: string) => {
        set({ feetOnFloorLogged: true, wakeTime: time });
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
      
      toggleAnchor: (id: string, asBaseline: boolean = false) => {
        set((state) => ({
          anchors: state.anchors.map(a => {
            if (a.id !== id) return a;
            const willComplete = !a.completed;
            return {
              ...a,
              completed: willComplete,
              usedBaseline: willComplete ? asBaseline : false
            };
          })
        }));
        const anchor = get().anchors.find(a => a.id === id);
        if (anchor) {
          syncPushAnchorLog(anchor.id, anchor.completed, anchor.usedBaseline || false);
        }
      },

      addAnchor: (title: string, category: string, baseline?: string) => {
        set((state) => ({
          anchors: [...state.anchors, { id: crypto.randomUUID(), title, category: category as 'body' | 'mind', completed: false, baselineTitle: baseline || undefined }]
        }));
        syncPushAnchors(get().anchors);
      },
        
      removeAnchor: (id: string) => {
        set((state) => ({
          anchors: state.anchors.filter(a => a.id !== id)
        }));
        syncPushAnchors(get().anchors);
      },

      toggleSupplement: (id: string) => {
        set((state) => ({
          supplements: state.supplements.map(s => 
            s.id === id ? { ...s, taken: !s.taken } : s
          )
        }));
        const supplement = get().supplements.find(s => s.id === id);
        if (supplement) {
          syncPushSupplementLog(supplement.id, supplement.taken);
        }
      },

      addSupplement: (name: string, timing: 'AM' | 'PM' | 'Evening', dosage?: string, instruction?: string) => {
        set((state) => ({
          supplements: [...state.supplements, { id: crypto.randomUUID(), name, timing, taken: false, dosage, instruction }]
        }));
        syncPushSupplements(get().supplements);
      },
        
      removeSupplement: (id: string) => {
        set((state) => ({
          supplements: state.supplements.filter(s => s.id !== id)
        }));
        syncPushSupplements(get().supplements);
      },

      logMorningGut: (score: number) => {
        set({ morningGut: score });
        syncPushDailyRitual(get());
      },
        
      logEveningGut: (score: number) => {
        set({ eveningGut: score });
        syncPushDailyRitual(get());
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
          anchors: state.anchors.map(a => ({ ...a, completed: false, usedBaseline: false })),
          eveningCheckInDone: false,
          winOfTheDay: '',
          parkingLotNotes: '',
          supplements: state.supplements.map(s => ({ ...s, taken: false })),
          morningGut: null,
          eveningGut: null,
          dailyDiscomfortLog: '',
          dailyMovementNote: ''
        })),

      toggleSupplementWidget: () => 
        set((state) => ({ isSupplementWidgetEnabled: !state.isSupplementWidgetEnabled })),
        
      toggleGutWidget: () => 
        set((state) => ({ isGutWidgetEnabled: !state.isGutWidgetEnabled })),
        
      toggleDiscomfortWidget: () => 
        set((state) => ({ isDiscomfortWidgetEnabled: !state.isDiscomfortWidgetEnabled })),
        
      logDiscomfort: (log: string) => {
        set({ dailyDiscomfortLog: log });
        syncPushDailyRitual(get());
      },
        
      toggleFoodWidget: () => set((state) => ({ isFoodWidgetEnabled: !state.isFoodWidgetEnabled })),
      
      toggleMovementWidget: () => set((state) => ({ isMovementWidgetEnabled: !state.isMovementWidgetEnabled })),
      
      incrementPlantCount: () => {
        set((state) => ({ weeklyPlantCount: Math.min(state.weeklyPlantCount + 1, 30) }));
        syncPushWeeklyPlantCount(get().weeklyPlantCount);
      },
      
      logMovement: (note: string) => {
        set({ dailyMovementNote: note });
        syncPushDailyRitual(get());
      },
      
      toggleVision: () => set((state) => ({ isVisionEnabled: !state.isVisionEnabled })),
      setVisionText: (text: string) => {
        set({ visionText: text });
        syncPushVision(text);
      },
      
      toggleNotes: () => set((state) => ({ isNotesEnabled: !state.isNotesEnabled })),
      
      addLifeNote: (content: string, attribution: string) => {
        const newNote = { id: crypto.randomUUID(), content, attribution, date: new Date().toISOString() };
        set((state) => ({
          lifeNotes: [
            newNote,
            ...state.lifeNotes
          ]
        }));
        syncPushNote(newNote);
      },
        
      removeLifeNote: (id: string) => 
        set((state) => ({
          lifeNotes: state.lifeNotes.filter(n => n.id !== id)
        })),

      setWeeklyHistory: (history: any[]) => set({ weeklyHistory: history }),

      completeWeeklyReview: () => {
        const today = new Date().toISOString().split('T')[0];
        set({ 
          lastWeeklyReviewDate: today,
          weeklyPlantCount: 0 
        });
      },

      toggleWidget: (widgetKey) => 
        set((state) => ({ [widgetKey]: !state[widgetKey as keyof RitualState] })),

      dismissTooltip: (tooltip) => set({ [tooltip]: true }),
    }),
    {
      name: 'trelis-life-ritual-storage',
    }
  )
);
