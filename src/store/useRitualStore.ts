import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  syncPushDailyRitual, syncPushAnchors, syncPushAnchorLog,
  syncPushVision, syncPushKeep, syncPushGather, syncDeleteGather
} from '@/lib/supabase/syncEngine';

export type PillarId = 'nutrition' | 'movement' | 'sleep' | 'stress_mental' | 'social' | 'environment';
export type AnchorType = 'action' | 'reflection';

export interface Gather {
  id: string;
  anchorId: string;
  logDate: string;
  label?: string;
  tags?: string[];
  createdAt?: string;
}

export interface Anchor {
  id: string;
  title: string;
  pillarId?: PillarId | null;
  type?: AnchorType;
  prompt?: string;
  completed: boolean;
  baselineTitle?: string;
  usedBaseline?: boolean;
  reflectionText?: string;
  subItems?: { id: string; title: string; completed?: boolean }[];
  frequency?: string[];
  baseline_trg?: number;
  codename?: string | null;
  keepDefinition?: string;
  isPermanent?: boolean;
  isActive?: boolean;
  gathers?: Gather[];
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
  morningTapText: string;
  
  hasSeenVisionTooltip: boolean;

  // Weekly History (7-day sparkline)
  weeklyHistory: any[];
  lastWeeklyReviewDate: string | null;
  lastActiveDate: string | null;
  setLastActiveDate: (date: string) => void;

  historicalKeepsCount: number;
  historicalGathersCount: number;
  setHistoricalCounts: (keeps: number, gathers: number) => void;

  // Wake/Sleep Windows for The Arc definition
  wakeWindow: string;
  sleepWindow: string;
  setWakeWindow: (time: string) => void;
  setSleepWindow: (time: string) => void;

  markFeetOnFloor: (time: string) => void;
  setStreak: (streak: number) => void;
  completeMorningCheckIn: (sleep: number, mood: number, bedTime: string, duration: number) => Promise<void>;
  toggleAnchor: (id: string, asBaseline?: boolean, reflectionText?: string, prompt?: string) => void;
  addAnchor: (title: string, pillarId?: PillarId | null, type?: AnchorType, baseline?: string, prompt?: string, subItems?: { id: string; title: string }[], frequency?: string[], codename?: string | null, keepDefinition?: string) => void;
  renameAnchor: (id: string, newTitle: string) => void;
  setAnchorCodename: (id: string, codename: string | null) => void;
  setAnchorKeepDefinition: (id: string, keepDefinition: string) => void;
  toggleSubItem: (anchorId: string, subItemId: string) => void;
  removeAnchor: (id: string) => void;
  toggleAnchorActive: (id: string) => void;
  reorderAnchors: (startIndex: number, endIndex: number) => void;
  addGather: (anchorId: string, label?: string, tags?: string[]) => void;
  deleteGather: (anchorId: string, gatherId: string) => void;
  completeEveningCheckIn: (win: string, parkingLot: string) => Promise<void>;
  resetDaily: () => void;
  toggleVision: () => void;
  setVisionText: (text: string) => void;
  setMorningTapText: (text: string) => void;
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
  onboardingCompleted: boolean;
  onboardingTourCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  setOnboardingTourCompleted: (completed: boolean) => void;

  dDayTargetDate: string | null;
  dDayTitle: string | null;
  setDDayTargetDate: (date: string | null) => void;
  setDDayTitle: (title: string | null) => void;
}

export const useRitualStore = create<RitualState>()(
  persist(
    (set, get) => ({
      focusThreeIds: [],
      lastFreshStartPrompt: null,
      isPremium: false,
      isRestDay: false,
      onboardingCompleted: false,
      onboardingTourCompleted: false,
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
      morningTapText: "I'm here. Let's begin.",

      dDayTargetDate: "2026-01-01",
      dDayTitle: "Jan 1, 2026",

      hasSeenVisionTooltip: false,

      weeklyHistory: [],
      lastWeeklyReviewDate: null,
      lastActiveDate: null,

      historicalKeepsCount: 0,
      historicalGathersCount: 0,
      setHistoricalCounts: (keeps: number, gathers: number) => set({ historicalKeepsCount: keeps, historicalGathersCount: gathers }),
      
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
          syncPushKeep(anchor.id, anchor.completed);
          syncPushDailyRitual(get());
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
        frequency?: string[],
        codename?: string | null,
        keepDefinition?: string
      ) => {
        set((state) => ({
          anchors: [
            ...state.anchors, 
            { 
              id: crypto.randomUUID(), 
              title, 
              pillarId: pillarId || 'stress_mental', 
              type, 
              completed: false, 
              baselineTitle: baseline || undefined,
              prompt: prompt || undefined,
              subItems: subItems || [],
              frequency: frequency || ['all'],
              baseline_trg: (function() {
                const match = title.match(/([\d,]+)\s*step/i);
                return match ? parseInt(match[1].replace(/,/g, ''), 10) : undefined;
              })(),
              codename: codename || null,
              keepDefinition: keepDefinition || `Kept: ${title}`,
              isPermanent: false,
              isActive: true,
              gathers: []
            }
          ]
        }));
        syncPushAnchors(get().anchors);
      },
        
      renameAnchor: (id: string, newTitle: string) => {
        set((state) => ({
          anchors: state.anchors.map(a => a.id === id ? { ...a, title: newTitle } : a)
        }));
        syncPushAnchors(get().anchors);
      },

      setAnchorCodename: (id: string, codename: string | null) => {
        set((state) => ({
          anchors: state.anchors.map(a => a.id === id ? { ...a, codename } : a)
        }));
        syncPushAnchors(get().anchors);
      },

      setAnchorKeepDefinition: (id: string, keepDefinition: string) => {
        set((state) => ({
          anchors: state.anchors.map(a => a.id === id ? { ...a, keepDefinition } : a)
        }));
        syncPushAnchors(get().anchors);
      },
        
      removeAnchor: (id: string) => {
        set((state) => ({
          anchors: state.anchors.filter(a => a.id !== id)
        }));
        syncPushAnchors(get().anchors);
      },

      toggleAnchorActive: (id: string) => {
        set((state) => ({
          anchors: state.anchors.map(a => a.id === id ? { ...a, isActive: a.isActive === false } : a)
        }));
        syncPushAnchors(get().anchors);
      },

      reorderAnchors: (startIndex: number, endIndex: number) => {
        set((state) => {
          const next = [...state.anchors];
          const [removed] = next.splice(startIndex, 1);
          next.splice(endIndex, 0, removed);
          return { anchors: next };
        });
        syncPushAnchors(get().anchors);
      },

      addGather: (anchorId: string, label?: string, tags?: string[]) => {
        const newGather: Gather = {
          id: crypto.randomUUID(),
          anchorId,
          logDate: new Date().toLocaleDateString('en-CA'),
          label: label || undefined,
          tags: tags || [],
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          anchors: state.anchors.map(a => a.id === anchorId ? {
            ...a,
            gathers: [...(a.gathers || []), newGather]
          } : a)
        }));
        syncPushGather(newGather);
      },

      deleteGather: (anchorId: string, gatherId: string) => {
        set((state) => ({
          anchors: state.anchors.map(a => a.id === anchorId ? {
            ...a,
            gathers: (a.gathers || []).filter(g => g.id !== gatherId)
          } : a)
        }));
        syncDeleteGather(gatherId);
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
      setMorningTapText: (text: string) => {
        set({ morningTapText: text });
      },
      


      setWeeklyHistory: (history: any[]) => set({ weeklyHistory: history }),

      completeWeeklyReview: () => {
        const today = new Date().toLocaleDateString('en-CA');
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
      setOnboardingCompleted: (completed: boolean) => {
        set({ onboardingCompleted: completed });
      },
      setOnboardingTourCompleted: (completed: boolean) => {
        set({ onboardingTourCompleted: completed });
      },
      setDDayTargetDate: (date: string | null) => {
        set({ dDayTargetDate: date });
      },
      setDDayTitle: (title: string | null) => {
        set({ dDayTitle: title });
      },
    }),
    {
      name: 'trelis-life-ritual-storage',
    }
  )
);

export function getLifetimeKeeps(state: any): number {
  // Today's check-ins: The Arc is 1 Keep per day, canonically marked when morning check-in is logged
  const arcKept = state.feetOnFloorLogged ? 1 : 0;
  
  // Today's completed custom anchors
  const activeCustomAnchors = (state.anchors || []).filter((a: any) => a.isActive !== false);
  const customKept = activeCustomAnchors.filter((a: any) => a.completed).length;
  
  return (state.historicalKeepsCount || 0) + arcKept + customKept;
}

export function getLifetimeGathers(state: any): number {
  const today = new Date().toLocaleDateString('en-CA');
  
  // Today's gathers from custom anchors
  let customGathersToday = 0;
  (state.anchors || []).forEach((a: any) => {
    if (a.isActive !== false && a.gathers) {
      a.gathers.forEach((g: any) => {
        if (g.logDate === today && g.label) {
          customGathersToday += 1;
        }
      });
    }
  });
  
  return (state.historicalGathersCount || 0) + customGathersToday;
}

