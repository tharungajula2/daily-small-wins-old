'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRitualStore } from '@/store/useRitualStore';

export default function AppLifecycleManager() {
  useEffect(() => {
    // Check if the date has changed since our last active session
    const checkReset = () => {
      if (!useRitualStore.persist.hasHydrated()) {
        return;
      }
      
      const todayStr = new Date().toLocaleDateString('en-CA'); // Local YYYY-MM-DD
      const state = useRitualStore.getState();
      const storedLastActive = state.lastActiveDate;

      if (storedLastActive && todayStr > storedLastActive) {
        console.log(`AppLifecycleManager: Date transitioned from ${storedLastActive} to ${todayStr}. Resetting daily ritual.`);
        state.resetDaily();
      } else if (!storedLastActive) {
        state.setLastActiveDate(todayStr);
      }
    };

    // 1. Run immediately on mount if hydration is already complete
    if (useRitualStore.persist.hasHydrated()) {
      checkReset();
    }

    // 2. Subscribe to hydration event to catch cold-launch initialization instantly
    const unsubHydrate = useRitualStore.persist.onFinishHydration(() => {
      checkReset();
    });

    // 3. Bulletproof 1-second interval to catch exact midnight transitions immediately
    const checkInterval = setInterval(checkReset, 1000);

    // 4. Listen for Capacitor foreground state triggers
    const listener = App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        checkReset();
      }
    });

    // 5. Listen for web tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkReset();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubHydrate();
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      listener.then((l) => l.remove());
    };
  }, []);

  return null;
}
