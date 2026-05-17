import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  syncPushDailyRitual, syncPushAnchors, syncPushAnchorLog,
  syncPushNote, syncPushVision
} from '@/lib/supabase/syncEngine';

export type PillarId = 'nutrition' | 'movement' | 'sleep' | 'stress_mental' | 'social' | 'environment';
export type AnchorType = 'action' | 'reflection';

export interface Anchor {
  id: string;
  title: string;
  pillarId: PillarId;
  type: AnchorType;
  prompt?: string; // for Type B reflection anchors
  completed: boolean;
  baselineTitle?: string;
  usedBaseline?: boolean;
  reflectionText?: string; // for Type B reflection completions
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
  isNotesEnabled: boolean;
  lifeNotes: Array<{ id: string; content: string; attribution: string; date: string }>;
  
  hasSeenVisionTooltip: boolean;

  // Weekly History (7-day sparkline)
  weeklyHistory: any[];
  lastWeeklyReviewDate: string | null;
  lastActiveDate: string | null;
  setLastActiveDate: (date: string) => void;

  markFeetOnFloor: (time: string) => void;
  setStreak: (streak: number) => void;
  completeMorningCheckIn: (sleep: number, mood: number, bedTime: string, duration: number) => Promise<void>;
  toggleAnchor: (id: string, asBaseline?: boolean, reflectionText?: string, prompt?: string) => void;
  addAnchor: (title: string, pillarId: PillarId, type: AnchorType, baseline?: string, prompt?: string) => void;
  removeAnchor: (id: string) => void;
  completeEveningCheckIn: (win: string, parkingLot: string) => Promise<void>;
  resetDaily: () => void;
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
        { 
          id: 'default-a1', 
          title: 'Hydration (3 Liters)', 
          pillarId: 'nutrition', 
          type: 'action', 
          completed: false, 
          baselineTitle: 'Drink 1 large glass' 
        },
        { 
          id: 'default-a2', 
          title: 'Morning Sunlight / Walk', 
          pillarId: 'environment', 
          type: 'action', 
          completed: false, 
          baselineTitle: 'Step outside for 2 mins' 
        },
        { 
          id: 'default-a3', 
          title: 'Silence / Breathwork', 
          pillarId: 'stress_mental', 
          type: 'action', 
          completed: false, 
          baselineTitle: '3 deep breaths' 
        },
        {
          id: 'default-a4',
          title: 'Daily Reflection',
          pillarId: 'stress_mental',
          type: 'reflection',
          prompt: 'What was the most meaningful part of today?',
          completed: false
        }
      ],
      eveningCheckInDone: false,
      winOfTheDay: '',
      parkingLotNotes: '',
      isVisionEnabled: true,
      visionText: "I am building the structure for a better life.",
      isNotesEnabled: false,
      lifeNotes: [],

      hasSeenVisionTooltip: false,

      weeklyHistory: [],
      lastWeeklyReviewDate: null,
      lastActiveDate: null,
      
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
      
      toggleAnchor: (id: string, asBaseline: boolean = false, reflectionText?: string, prompt?: string) => {
        set((state) => ({
          anchors: state.anchors.map(a => {
            if (a.id !== id) return a;
            const willComplete = !a.completed;
            return {
              ...a,
              completed: willComplete,
              usedBaseline: willComplete ? asBaseline : false,
              reflectionText: willComplete ? reflectionText : undefined,
              prompt: willComplete ? (prompt || a.prompt) : a.prompt
            };
          })
        }));
        const anchor = get().anchors.find(a => a.id === id);
        if (anchor) {
          syncPushAnchorLog(anchor.id, anchor.completed, anchor.usedBaseline || false, anchor.reflectionText);
        }
      },

      addAnchor: (title: string, pillarId: PillarId, type: AnchorType, baseline?: string, prompt?: string) => {
        set((state) => ({
          anchors: [
            ...state.anchors, 
            { 
              id: crypto.randomUUID(), 
              title, 
              pillarId, 
              type, 
              completed: false, 
              baselineTitle: baseline || undefined,
              prompt: prompt || undefined
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
          anchors: state.anchors.map(a => ({ ...a, completed: false, usedBaseline: false, reflectionText: undefined })),
          eveningCheckInDone: false,
          winOfTheDay: '',
          parkingLotNotes: '',
          lastActiveDate: new Date().toLocaleDateString('en-CA'),
        })),

      setLastActiveDate: (date: string) => set({ lastActiveDate: date }),

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
          lastWeeklyReviewDate: today
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
