'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRitualStore } from '@/store/useRitualStore';

export default function AppLifecycleManager() {
  const { lastActiveDate, resetDaily, setLastActiveDate } = useRitualStore();

  useEffect(() => {
    // Check if the date has changed since our last active session
    const checkReset = () => {
      const todayStr = new Date().toLocaleDateString('en-CA'); // Local YYYY-MM-DD
      if (lastActiveDate && todayStr > lastActiveDate) {
        console.log(`AppLifecycleManager: Date transitioned from ${lastActiveDate} to ${todayStr}. Triggering daily reset.`);
        resetDaily();
      } else if (!lastActiveDate) {
        setLastActiveDate(todayStr);
      }
    };

    // Run on initial bootstrap mount
    checkReset();

    // Listen for application returning to foreground (focus regained)
    const listener = App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        console.log("AppLifecycleManager: Focus regained. Checking for midnight threshold...");
        checkReset();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [lastActiveDate, resetDaily, setLastActiveDate]);

  return null;
}
