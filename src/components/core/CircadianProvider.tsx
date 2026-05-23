'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type CircadianTheme = 'morning' | 'day' | 'evening' | 'night';

const CircadianContext = createContext<{ theme: CircadianTheme }>({ theme: 'day' });

export function CircadianProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<CircadianTheme>('day');

  const updateTheme = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 10) {
      setTheme('morning');
    } else if (hours >= 10 && hours < 18) {
      setTheme('day');
    } else if (hours >= 18 && hours < 21) {
      setTheme('evening');
    } else {
      setTheme('night');
    }
  };

  useEffect(() => {
    updateTheme();
    const interval = setInterval(updateTheme, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const themeClasses: Record<CircadianTheme, string> = {
    morning: 'bg-[#F7F6F2] text-[#2A2520]',
    day: 'bg-[#FFFFFF] text-[#2A2520]',
    evening: 'bg-[#F1EAD9] text-[#F7F6F2]',
    night: 'bg-[#1E1B17] text-[#F7F6F2]',
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'night' || theme === 'evening') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <CircadianContext.Provider value={{ theme }}>
      <div className={`min-h-screen transition-colors duration-1000 ease-in-out ${themeClasses[theme]}`}>
        {children}
      </div>
    </CircadianContext.Provider>
  );
}

export const useCircadian = () => useContext(CircadianContext);
