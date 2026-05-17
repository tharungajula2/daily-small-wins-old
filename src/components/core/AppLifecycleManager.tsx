'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRitualStore } from '@/store/useRitualStore';

export default function AppLifecycleManager() {
  useEffect(() => {
    // Check if the date has changed since our last active session
    const checkReset = () => {
      if (!useRitualStore.persist.hasHydrated()) {
        console.log("AppLifecycleManager: Store not hydrated yet. Postponing date check.");
        return;
      }
      
      const todayStr = new Date().toLocaleDateString('en-CA'); // Local YYYY-MM-DD
      const state = useRitualStore.getState();
      const storedLastActive = state.lastActiveDate;

      if (storedLastActive && todayStr > storedLastActive) {
        console.log(`AppLifecycleManager: Date transitioned from ${storedLastActive} to ${todayStr}. Triggering daily reset.`);
        state.resetDaily();
      } else if (!storedLastActive) {
        state.setLastActiveDate(todayStr);
      }
    };

    // If already hydrated, run immediately
    if (useRitualStore.persist.hasHydrated()) {
      checkReset();
    }

    // Subscribe to hydration completion to ensure it runs as soon as hydrated
    const unsubHydrate = useRitualStore.persist.onFinishHydration(() => {
      console.log("AppLifecycleManager: Store hydrated. Running date check...");
      checkReset();
    });

    // Listen for application returning to foreground (focus regained)
    const listener = App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        console.log("AppLifecycleManager: Focus regained. Checking for midnight threshold...");
        checkReset();
      }
    });

    // Listen for standard browser tab visibility changes (for web testing)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("AppLifecycleManager: Browser tab became visible. Checking for midnight threshold...");
        checkReset();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubHydrate();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      listener.then((l) => l.remove());
    };
  }, []);

  return null;
}
