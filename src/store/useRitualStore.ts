import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  syncPushDailyRitual, syncPushPlaylists,
  syncPushVision, syncPushGem, syncDeleteGem,
  syncPushDDayTarget
} from '@/lib/supabase/syncEngine';

export interface Gem {
  id: string;
  playlistId: string;
  logDate: string;
  label?: string;
  tags?: string[];
  createdAt?: string;
}

export interface Playlist {
  id: string;
  title: string;
  isPermanent?: boolean;
  isActive?: boolean;
  gems?: Gem[];
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
  playlists: Playlist[];
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

  historicalTotalWins: number;
  setHistoricalTotalWins: (wins: number) => void;

  // Wake/Sleep Windows for The Arc definition
  wakeWindow: string;
  sleepWindow: string;
  setWakeWindow: (time: string) => void;
  setSleepWindow: (time: string) => void;

  markFeetOnFloor: (time: string) => void;
  setStreak: (streak: number) => void;
  completeMorningCheckIn: (sleep: number, mood: number, bedTime: string, duration: number) => Promise<void>;
  addPlaylist: (title: string) => void;
  renamePlaylist: (id: string, newTitle: string) => void;
  removePlaylist: (id: string) => void;
  togglePlaylistActive: (id: string) => void;
  reorderPlaylists: (startIndex: number, endIndex: number) => void;
  addGem: (playlistId: string, label?: string, tags?: string[]) => void;
  deleteGem: (playlistId: string, gemId: string) => void;
  completeEveningCheckIn: (win: string, parkingLot: string) => Promise<void>;
  reverseEveningCheckIn: () => Promise<void>;
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
      playlists: [],
      eveningCheckInDone: false,
      winOfTheDay: '',
      parkingLotNotes: '',
      isVisionEnabled: true,
      visionText: "I am building the structure for a better life.",
      morningTapText: "I'm here. Let's begin.",

      dDayTargetDate: "2027-01-01",
      dDayTitle: "Jan 1, 2027",

      hasSeenVisionTooltip: false,

      weeklyHistory: [],
      lastWeeklyReviewDate: null,
      lastActiveDate: null,

      historicalTotalWins: 0,
      setHistoricalTotalWins: (wins: number) => set({ historicalTotalWins: wins }),
      
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
      
      addPlaylist: (title: string) => {
        set((state) => ({
          playlists: [
            ...state.playlists, 
            { 
              id: crypto.randomUUID(), 
              title, 
              isPermanent: false,
              isActive: true,
              gems: []
            }
          ]
        }));
        syncPushPlaylists(get().playlists);
      },
        
      renamePlaylist: (id: string, newTitle: string) => {
        set((state) => ({
          playlists: state.playlists.map(a => a.id === id ? { ...a, title: newTitle } : a)
        }));
        syncPushPlaylists(get().playlists);
      },
        
      removePlaylist: (id: string) => {
        set((state) => ({
          playlists: state.playlists.filter(a => a.id !== id)
        }));
        syncPushPlaylists(get().playlists);
      },

      togglePlaylistActive: (id: string) => {
        set((state) => ({
          playlists: state.playlists.map(a => a.id === id ? { ...a, isActive: a.isActive === false } : a)
        }));
        syncPushPlaylists(get().playlists);
      },

      reorderPlaylists: (startIndex: number, endIndex: number) => {
        set((state) => {
          const next = [...state.playlists];
          const [removed] = next.splice(startIndex, 1);
          next.splice(endIndex, 0, removed);
          return { playlists: next };
        });
        syncPushPlaylists(get().playlists);
      },

      addGem: (playlistId: string, label?: string, tags?: string[]) => {
        const newGem: Gem = {
          id: crypto.randomUUID(),
          playlistId,
          logDate: new Date().toLocaleDateString('en-CA'),
          label: label || undefined,
          tags: tags || [],
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          playlists: state.playlists.map(a => a.id === playlistId ? {
            ...a,
            gems: [...(a.gems || []), newGem]
          } : a)
        }));
        syncPushGem(newGem);
      },

      deleteGem: (playlistId: string, gemId: string) => {
        set((state) => ({
          playlists: state.playlists.map(a => a.id === playlistId ? {
            ...a,
            gems: (a.gems || []).filter(g => g.id !== gemId)
          } : a)
        }));
        syncDeleteGem(gemId);
      },

      completeEveningCheckIn: async (win: string, parkingLot: string) => {
        set({ eveningCheckInDone: true, winOfTheDay: win, parkingLotNotes: parkingLot });
        
        syncPushDailyRitual(get());
      },
      
      reverseEveningCheckIn: async () => {
        set({ eveningCheckInDone: false, winOfTheDay: '', parkingLotNotes: '' });
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
          playlists: state.playlists,
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
        const state = get();
        if (state.dDayTargetDate && state.dDayTitle) {
          syncPushDDayTarget(state.dDayTargetDate, state.dDayTitle);
        }
      },
      setDDayTitle: (title: string | null) => {
        set({ dDayTitle: title });
        const state = get();
        if (state.dDayTargetDate && state.dDayTitle) {
          syncPushDDayTarget(state.dDayTargetDate, state.dDayTitle);
        }
      },
    }),
    {
      name: 'trelis-life-ritual-storage',
    }
  )
);

export function getTotalWins(state: any): number {
  const arcKept = state.feetOnFloorLogged ? 1 : 0;
  
  const today = new Date().toLocaleDateString('en-CA');
  let customGemsToday = 0;
  
  (state.playlists || []).forEach((a: any) => {
    if (a.isActive !== false && a.gems) {
      a.gems.forEach((g: any) => {
        if (g.logDate === today && g.label) {
          customGemsToday += 1;
        }
      });
    }
  });
  
  return (state.historicalTotalWins || 0) + arcKept + customGemsToday;
}

