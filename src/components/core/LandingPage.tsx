'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sun, Anchor, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useCircadian } from '@/components/core/CircadianProvider';

export default function LandingPage() {
  const { theme } = useCircadian();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Hero: animated lattice vine path lengths mapped dynamically to scroll
  const pathLength1 = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const pathLength2 = useTransform(scrollYProgress, [0.05, 0.35], [0, 1]);
  const pathLength3 = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  const pathLength4 = useTransform(scrollYProgress, [0.15, 0.45], [0, 1]);
  const pathLength5 = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const pathLength6 = useTransform(scrollYProgress, [0.25, 0.55], [0, 1]);

  // Centerpiece open progress ring fills as user scrolls
  const ringProgress = useTransform(scrollYProgress, [0.15, 0.45], [0, 1]);
  const [percentVal, setPercentVal] = useState(0);

  useEffect(() => {
    return ringProgress.on("change", (latest) => {
      setPercentVal(Math.min(Math.max(Math.round(latest * 100), 0), 100));
    });
  }, [ringProgress]);

  // Map circadian themes to specific colors to match the app layout
  const themeClasses: Record<string, string> = {
    morning: 'bg-[#F7F6F2] text-[#1C1C1E]',
    day: 'bg-[#FFFFFF] text-[#1C1C1E]',
    evening: 'bg-[#F1EAD9] text-[#2A2520]',
    night: 'bg-[#1E1B18] text-[#F7F6F2]',
  };

  const currentThemeClass = themeClasses[theme] || themeClasses.day;
  const isDark = theme === 'night';

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen ${currentThemeClass} font-sans antialiased overflow-x-hidden selection:bg-accent-teal/30 selection:text-accent-teal transition-colors duration-1000`}
    >
      {/* Premium Header */}
      <header className={`fixed top-0 inset-x-0 h-16 ${isDark ? 'bg-[#1E1B18]/80 border-b border-[#2C2C2E]' : 'bg-[#FFFFFF]/80 border-b border-muted/30'} backdrop-blur-md flex items-center justify-between px-6 z-50 max-w-4xl mx-auto rounded-b-xl transition-colors duration-1000`}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-widest text-[#2A7F7F]">TRELIS</span>
        </div>
        <Link 
          href="/login"
          className="px-4 py-1.5 rounded-full bg-[#2A7F7F] hover:bg-[#2A7F7F]/90 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-sm active:scale-95"
        >
          Sign In
        </Link>
      </header>

      <div className="max-w-xl mx-auto px-6 pt-24 pb-20 flex flex-col gap-24 relative z-10">
        
        {/* SECTION 1: HERO */}
        <section className="relative min-h-[75vh] flex flex-col justify-center items-center text-center gap-6 overflow-hidden py-10">
          {/* Animated Lattice SVG (Vines grow as user scrolls) */}
          <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
            <svg className="w-full h-full stroke-accent-teal" viewBox="0 0 400 600" fill="none">
              <path d="M 80 0 L 80 600 M 160 0 L 160 600 M 240 0 L 240 600 M 320 0 L 320 600" strokeWidth="0.5" stroke="rgba(42,127,127,0.15)" />
              <path d="M 0 100 L 400 100 M 0 250 L 400 250 M 0 400 L 400 400 M 0 550 L 400 550" strokeWidth="0.5" stroke="rgba(42,127,127,0.15)" />
              
              <motion.path d="M 80 600 C 95 500, 65 400, 80 300 C 95 200, 65 100, 80 0" stroke="#2A7F7F" strokeWidth="1.5" style={{ pathLength: pathLength1 }} />
              <motion.path d="M 160 600 C 145 500, 175 400, 160 300 C 145 200, 175 100, 160 0" stroke="#2A7F7F" strokeWidth="1.5" style={{ pathLength: pathLength2 }} />
              <motion.path d="M 240 600 C 255 500, 225 400, 240 300 C 255 200, 225 100, 240 0" stroke="#2A7F7F" strokeWidth="1.5" style={{ pathLength: pathLength3 }} />
              <motion.path d="M 320 600 C 305 500, 335 400, 320 300 C 305 200, 335 100, 320 0" stroke="#2A7F7F" strokeWidth="1.5" style={{ pathLength: pathLength4 }} />
              <motion.path d="M 80 600 C 200 450, 80 300, 200 150 C 320 0, 200 0, 200 0" stroke="#2A7F7F" strokeWidth="1" style={{ pathLength: pathLength5 }} />
              <motion.path d="M 240 600 C 120 450, 240 300, 120 150 C 0 0, 120 0, 120 0" stroke="#2A7F7F" strokeWidth="1" style={{ pathLength: pathLength6 }} />
            </svg>
          </div>

          <div className="flex flex-col gap-4 relative z-10">
            <h1 className={`text-3xl font-semibold tracking-tight leading-[1.2] ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>
              The quiet structure<br />
              <span className="text-[#2A7F7F] bg-accent-teal/5 px-3 py-1 rounded-md">your life grows on.</span>
            </h1>
            <p className={`text-sm ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} leading-relaxed max-w-sm mx-auto font-normal`}>
              Trelis isn't a habit tracker. It's one calm daily ritual and a few promises you actually keep — built for people who need structure but live unpredictable days. It bends so you don't break.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-6 relative z-10">
            <Link 
              href="/login"
              className="py-3.5 px-6 rounded-2xl bg-[#2A7F7F] hover:bg-[#2A7F7F]/90 text-xs font-semibold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* SECTION 1: HOW IT WORKS */}
        <section className="flex flex-col items-center gap-10 py-6">
          <div className="text-center">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>How it works</h2>
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} mt-1`}>Keep Promises, Build Trust</p>
          </div>

          {/* The centerpiece open progress ring (centered gap at the bottom) */}
          <div className="relative w-48 h-48 flex items-center justify-center select-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full transform overflow-visible" viewBox="0 0 100 100" style={{ transform: 'rotate(117deg)' }}>
                {/* Background Track with Seam */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} 
                  strokeWidth="4.5" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray="213.6 251.3"
                />
                {/* Foreground Active Arc */}
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#2A7F7F" 
                  strokeWidth="4.5" 
                  strokeLinecap="round"
                  strokeDasharray="213.6 251.3"
                  initial={{ strokeDashoffset: 213.6 }}
                  style={{ 
                    strokeDashoffset: useTransform(ringProgress, [0, 1], [213.6, 0])
                  }} 
                  fill="none" 
                />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center z-10 gap-0.5">
              <span className={`text-3xl font-mono font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>{percentVal}%</span>
              <span className={`text-[9px] uppercase tracking-widest ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} font-semibold`}>Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full text-left">
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#2C2C2E]/20 border border-[#2C2C2E]' : 'bg-white border border-muted/80'} flex flex-col gap-2`}>
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-accent-teal shrink-0" />
                <h4 className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>The Arc</h4>
              </div>
              <p className={`text-xs ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} leading-relaxed font-normal`}>
                The one promise you keep every day: wind down, rest, and wake to a single tap that says 'I'm here, resuming.' Even on your worst day, that's enough.
              </p>
            </div>

            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#2C2C2E]/20 border border-[#2C2C2E]' : 'bg-white border border-muted/80'} flex flex-col gap-2`}>
              <div className="flex items-center gap-2.5">
                <Anchor className="w-4 h-4 text-accent-teal shrink-0" />
                <h4 className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>Your anchors</h4>
              </div>
              <p className={`text-xs ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} leading-relaxed font-normal`}>
                Add up to five anchors that hold your days up — the things that, when you skip them, the day quietly falls apart. No categories. No rules. Just yours.
              </p>
            </div>

            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#2C2C2E]/20 border border-[#2C2C2E]' : 'bg-white border border-muted/80'} flex flex-col gap-2`}>
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-accent-teal shrink-0" />
                <h4 className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>Then you leave</h4>
              </div>
              <p className={`text-xs ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} leading-relaxed font-normal`}>
                Trelis doesn't want your time. You show up, keep your word, and get back to your life. The win was never on the screen.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHY A TRELLIS */}
        <section className={`flex flex-col gap-6 py-6 border-t ${isDark ? 'border-[#2C2C2E]' : 'border-muted/30'} pt-12 text-left`}>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>Why a trellis</h2>
            <p className={`text-[10px] uppercase tracking-wider text-[#2A7F7F] mt-1`}>Structure, Not Compliance</p>
          </div>

          <div className={`flex flex-col gap-4 text-sm leading-relaxed ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} font-normal`}>
            <p>
              Most habit apps treat your life like a checklist game. They assume your willpower is endless, and that one missed day means you failed completely.
            </p>
            <p>
              A trellis works differently. It's a lattice — open, full of gaps. It doesn't pull or force. It simply holds the vine up and lets it grow toward the light. The gaps aren't flaws; they're how the light gets in.
            </p>
            <p>
              Look closely at our mark: an open ring, never quite closed. A closed circle is a loop you can't escape. The opening is the seam — proof there's always a way through. Miss a day, and you don't start over. You resume.
            </p>
          </div>
        </section>

        {/* SECTION 3: WHY IT WORKS */}
        <section className={`flex flex-col gap-6 py-6 border-t ${isDark ? 'border-[#2C2C2E]' : 'border-muted/30'} pt-12 text-left`}>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>Why it works</h2>
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} mt-1`}>Psychological Scaffolding</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h4 className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>
                One promise, not thirty
              </h4>
              <p className={`text-xs ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} leading-relaxed font-normal`}>
                You start with a single thing you can't fail, and earn the rest. Self-trust is built one kept word at a time.
              </p>
            </div>

            <div className={`flex flex-col gap-1.5 border-t ${isDark ? 'border-[#2C2C2E]/40' : 'border-muted/20'} pt-4`}>
              <h4 className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>
                A floor for hard days
              </h4>
              <p className={`text-xs ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} leading-relaxed font-normal`}>
                Every anchor has a baseline version for when you're depleted. All-or-nothing is how habits die; something-is-enough is how they live.
              </p>
            </div>

            <div className={`flex flex-col gap-1.5 border-t ${isDark ? 'border-[#2C2C2E]/40' : 'border-muted/20'} pt-4`}>
              <h4 className={`text-xs uppercase tracking-widest font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>
                No shame, ever
              </h4>
              <p className={`text-xs ${isDark ? 'text-[#9A9A9E]' : 'text-[#5C5C5E]'} leading-relaxed font-normal`}>
                Trelis celebrates — it never accuses. There's no red number waiting to tell you that you failed.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`text-center text-[10px] uppercase tracking-widest text-[#5C5C5E] border-t ${isDark ? 'border-[#2C2C2E]' : 'border-muted/30'} pt-8 mt-12 font-normal`}>
          © 2026 TRELIS · Structure for a better life.
        </footer>

      </div>
    </div>
  );
}
