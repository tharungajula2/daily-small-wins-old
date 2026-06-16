'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRitualStore } from '@/store/useRitualStore';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function calculateStreaks(dates: string[]) {
  // Sort descending
  const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  if (sorted.length === 0) return { current: 0, longest: 0 };
  
  let current = 0;
  let longest = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i]);
    date.setHours(0, 0, 0, 0);
    
    // Check if difference between dates is exactly 1 day
    if (i === 0) {
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        tempStreak = 1;
        current = 1;
      }
    } else {
      const prevDate = new Date(sorted[i-1]);
      prevDate.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(prevDate.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longest) longest = tempStreak;
        if (i === tempStreak - 1) current = tempStreak; // still on current streak
      } else {
        tempStreak = 1;
      }
    }
  }
  
  if (tempStreak > longest) longest = tempStreak;
  if (sorted.length === 1) longest = 1;
  
  return { current, longest };
}

export default function JournalPage() {
  const router = useRouter();
  const { journalEntries, addJournalEntry } = useRitualStore();
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Wait for hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Stats computation
  const entryDates = journalEntries.map(e => e.created_at.split('T')[0]);
  const streaks = calculateStreaks(entryDates);
  const totalWords = journalEntries.reduce((acc, entry) => acc + (entry.word_count || 0), 0);
  
  const thisYear = new Date().getFullYear();
  const entriesThisYear = journalEntries.filter(e => e.created_at.startsWith(thisYear.toString())).length;

  const handleSave = () => {
    if (!content.trim()) {
      setIsWriting(false);
      return;
    }
    
    const wordCount = content.trim().split(/\s+/).length;
    
    addJournalEntry({
      id: generateUUID(),
      user_id: '', // Will be injected by syncEngine
      content: content.trim(),
      word_count: wordCount,
      created_at: new Date().toISOString()
    });
    
    setContent('');
    setIsWriting(false);
  };

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

  return (
    <main className="min-h-screen max-w-md mx-auto bg-canvas relative flex flex-col sm:border-x sm:border-muted select-none">
      <header className="pt-10 pb-4 px-6 sticky top-0 bg-canvas/80 backdrop-blur-md z-30 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-primary tracking-tight">Journal</h1>
        <button 
          onClick={() => router.push('/')} 
          className="w-8 h-8 rounded-full bg-surface border border-muted/50 flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:border-muted active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col gap-6">
        
        {/* Insights: Streaks */}
        <div className="flex gap-3">
          <div className="flex-1 bg-surface p-4 rounded-2xl border border-muted/50 shadow-sm flex flex-col gap-1 items-start">
            <span className="text-[10px] text-ink-secondary uppercase tracking-widest font-semibold">Current</span>
            <div className="flex items-end gap-1.5 mt-1">
              <span className="text-2xl font-semibold text-accent-teal leading-none">{streaks.current}</span>
              <span className="text-xs text-ink-secondary font-medium pb-0.5">days</span>
            </div>
          </div>
          <div className="flex-1 bg-surface p-4 rounded-2xl border border-muted/50 shadow-sm flex flex-col gap-1 items-start">
            <span className="text-[10px] text-ink-secondary uppercase tracking-widest font-semibold">Longest</span>
            <div className="flex items-end gap-1.5 mt-1">
              <span className="text-2xl font-semibold text-ink-primary leading-none">{streaks.longest}</span>
              <span className="text-xs text-ink-secondary font-medium pb-0.5">days</span>
            </div>
          </div>
        </div>

        {/* Insights: Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface p-4 rounded-2xl border border-muted/50 shadow-sm flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[10px] text-ink-secondary uppercase tracking-widest font-semibold">This Year</span>
            <span className="text-lg font-semibold text-ink-primary leading-none mt-1">{entriesThisYear}</span>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-muted/50 shadow-sm flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[10px] text-ink-secondary uppercase tracking-widest font-semibold">Total Days</span>
            <span className="text-lg font-semibold text-ink-primary leading-none mt-1">{[...new Set(entryDates)].length}</span>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-muted/50 shadow-sm flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[10px] text-ink-secondary uppercase tracking-widest font-semibold">Words</span>
            <span className="text-lg font-semibold text-ink-primary leading-none mt-1">{totalWords}</span>
          </div>
        </div>

        {/* Insights: Calendar */}
        <div className="bg-surface p-5 rounded-3xl border border-muted/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1 text-ink-secondary hover:text-ink-primary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-ink-primary tracking-wide">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1 text-ink-secondary hover:text-ink-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-y-3 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-center text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">{d}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-2">
            {padding.map((_, i) => (
              <div key={`pad-${i}`} className="h-8" />
            ))}
            {days.map(d => {
              const dateObj = new Date(year, month, d);
              const dateStr = dateObj.toLocaleDateString('en-CA');
              const hasEntry = entryDates.includes(dateStr);
              const isToday = isSameDay(dateObj, new Date());
              
              return (
                <div key={d} className="flex flex-col items-center justify-start h-8 relative">
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-accent-teal text-white' : 'text-ink-primary'
                  }`}>
                    {d}
                  </span>
                  {hasEntry && !isToday && (
                    <span className="w-1 h-1 rounded-full bg-accent-teal absolute bottom-0.5" />
                  )}
                  {hasEntry && isToday && (
                    <span className="w-1 h-1 rounded-full bg-white absolute bottom-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline (Recent Entries Preview) */}
        <div className="mt-2 flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-ink-secondary uppercase tracking-widest pl-1">Recent Notes</h2>
          {journalEntries.length === 0 ? (
            <p className="text-xs text-ink-tertiary italic pl-1">No entries yet. Write your first thought below.</p>
          ) : (
            journalEntries.slice(0, 5).map(entry => (
              <div key={entry.id} className="p-4 bg-surface rounded-2xl border border-muted/40 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-ink-secondary uppercase tracking-wider font-semibold">
                    {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] text-ink-tertiary font-medium">{entry.word_count} words</span>
                </div>
                <p className="text-sm text-ink-primary leading-relaxed line-clamp-3">
                  {entry.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {!isWriting && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => setIsWriting(true)}
            className="fixed bottom-8 right-6 w-14 h-14 bg-accent-teal text-white rounded-full shadow-[0_8px_30px_rgba(42,127,127,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
          >
            <PenLine className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Writing Modal */}
      <AnimatePresence>
        {isWriting && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-canvas sm:max-w-md sm:mx-auto flex flex-col"
          >
            <header className="px-6 py-5 flex items-center justify-between border-b border-muted/50 bg-canvas">
              <button 
                onClick={() => setIsWriting(false)}
                className="text-xs font-semibold text-ink-secondary uppercase tracking-widest px-2 py-1 -ml-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!content.trim()}
                className="text-xs font-bold text-accent-teal uppercase tracking-widest px-2 py-1 -mr-2 disabled:opacity-50"
              >
                Save
              </button>
            </header>
            
            <div className="flex-1 p-6 flex flex-col overflow-y-auto">
              <span className="text-[10px] font-semibold tracking-widest text-ink-tertiary uppercase mb-4">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full flex-1 bg-transparent text-lg text-ink-primary leading-relaxed placeholder:text-ink-tertiary focus:outline-none resize-none"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
