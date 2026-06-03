'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Layers, Target, Compass, Sunrise, Settings, Sunset, Apple, Activity, Moon, Brain, Users, Sprout } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
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

  // Centerpiece Pulse Ring fills past the 3-column stack
  const ringProgress = useTransform(scrollYProgress, [0.18, 0.5], [0, 1]);
  const [percentVal, setPercentVal] = useState(0);

  useEffect(() => {
    return ringProgress.on("change", (latest) => {
      setPercentVal(Math.min(Math.max(Math.round(latest * 100), 0), 100));
    });
  }, [ringProgress]);

  const PILLARS = [
    { icon: <Apple className="w-4 h-4 text-accent-teal" />, title: 'Nutrition', desc: 'Frictionless baseline caloric structure and hydration limits.' },
    { icon: <Activity className="w-4 h-4 text-accent-teal" />, title: 'Movement', desc: 'Active, deliberate mobility loops integrated into desk routines.' },
    { icon: <Moon className="w-4 h-4 text-accent-teal" />, title: 'Sleep', desc: 'Strict light hygiene thresholds and evening circadian alignments.' },
    { icon: <Brain className="w-4 h-4 text-accent-teal" />, title: 'Stress & Mental', desc: 'Stoic silent gaps, breathwork, and clean cognitive decompression.' },
    { icon: <Users className="w-4 h-4 text-accent-teal" />, title: 'Social Connection', desc: 'Deliberate dialogues with key relationships without screens.' },
    { icon: <Sprout className="w-4 h-4 text-accent-teal" />, title: 'Environment', desc: 'Optimizing physical micro-spaces to remove friction from habits.' }
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#1C1C1E] text-[#F7F6F2] font-sans antialiased overflow-x-hidden selection:bg-accent-teal/30 selection:text-accent-teal"
    >
      {/* Premium Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#1C1C1E]/80 backdrop-blur-md border-b border-[#2C2C2E] flex items-center justify-between px-6 z-50 max-w-4xl mx-auto rounded-b-xl">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-widest text-[#2A7F7F]">TRELIS</span>
        </div>
        <Link 
          href="/login"
          className="px-4 py-1.5 rounded-full bg-[#2A7F7F] hover:bg-[#2A7F7F]/90 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md active:scale-95"
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
            <h1 className="text-4xl font-semibold tracking-tight leading-[1.15] text-white">
              The trellis your<br />
              <span className="text-[#2A7F7F] bg-accent-teal/5 px-3 py-1 rounded-md">habits grow on.</span>
            </h1>
            <p className="text-sm text-[#9A9A9E] leading-relaxed max-w-sm mx-auto font-normal">
              Not a tracking app. A daily protocol designed to act as physical scaffolding for a structured, exceptional life.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-6 relative z-10">
            <Link 
              href="/login"
              className="py-3.5 px-6 rounded-2xl bg-[#2A7F7F] hover:bg-[#2A7F7F]/90 text-xs font-semibold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 active:scale-98 shadow-lg shadow-accent-teal/15"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* SECTION 2: THE DAILY LOOP */}
        <section className="flex flex-col items-center gap-12 py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">The Daily Loop</h2>
            <p className="text-[10px] uppercase tracking-wider text-[#9A9A9E] mt-1">Structured Habit Synchrony</p>
          </div>

          {/* The centerpiece dynamic pulse ring */}
          <div className="relative w-48 h-48 flex items-center justify-center select-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(42, 127, 127, 0.05)" strokeWidth="4" fill="none" />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  stroke="#2A7F7F" 
                  strokeWidth="4" 
                  strokeDasharray="263.8" 
                  style={{ pathLength: ringProgress }} 
                  fill="none" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center z-10 gap-0.5">
              <span className="text-3xl font-semibold text-white">{percentVal}%</span>
              <span className="text-[9px] uppercase tracking-widest text-[#9A9A9E] font-semibold">Pulse Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full">
            <div className="p-5 rounded-2xl bg-[#2C2C2E]/30 border border-[#2C2C2E] flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <Sunrise className="w-4 h-4 text-accent-teal shrink-0" />
                <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Morning Check-In</h4>
              </div>
              <p className="text-xs text-[#9A9A9E] leading-relaxed font-normal">
                Log rise time, sleep efficiency scores, and morning mindset levels within 30 minutes of waking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#2C2C2E]/30 border border-[#2C2C2E] flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-accent-teal shrink-0" />
                <h4 className="text-xs uppercase tracking-widest font-semibold text-[#2A7F7F]">The Habit Protocol</h4>
              </div>
              <p className="text-xs text-[#9A9A9E] leading-relaxed font-normal">
                Execute daily non-negotiable protocols. Utilize forgiving baseline targets on tough days.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#2C2C2E]/30 border border-[#2C2C2E] flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <Sunset className="w-4 h-4 text-accent-teal shrink-0" />
                <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Evening Check-In</h4>
              </div>
              <p className="text-xs text-[#9A9A9E] leading-relaxed font-normal">
                Reflect on today's single biggest win, clear tasks into parking lots, and prepare mental hygiene for rest.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: CORE RITUAL AREAS */}
        <section className="flex flex-col gap-8 py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">Core Ritual Areas</h2>
            <p className="text-[10px] uppercase tracking-wider text-[#9A9A9E] mt-1">Fundamental pillars of daily balance</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map((p, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-[#2C2C2E]/20 border border-[#2C2C2E] flex flex-col gap-2 transition-all hover:bg-[#2C2C2E]/35"
              >
                <div className="flex items-center gap-2">
                  <span>{p.icon}</span>
                  <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                </div>
                <p className="text-xs text-[#9A9A9E] leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: WHY WE BUILT IT */}
        <section className="flex flex-col gap-6 py-6 border-t border-[#2C2C2E] pt-12">
          <div>
            <h2 className="text-xl font-semibold text-white">Why We Built It</h2>
            <p className="text-[10px] uppercase tracking-wider text-[#2A7F7F] mt-1">The Founders Philosophy</p>
          </div>

          <div className="flex flex-col gap-4 text-sm leading-relaxed text-[#9A9A9E] font-normal">
            <p>
              Modern habit trackers treat your life like a childish game of checklists. They assume high willpower is infinite, and that breaking a streak means you've failed completely.
            </p>
            <p>
              We believe in the concept of a **Trellis**. Like a structural lattice, it holds vines upright, letting them grow towards sunlight. It does not pull or force; it simply supports.
            </p>
            <p>
              Trelis was engineered specifically for people who need high structure but face hard, unpredictable days. By offering supportive baselines and clean circadian guidelines, it ensures that your daily ritual bends without breaking.
            </p>
          </div>
        </section>

        {/* SECTION 5: WHY THIS ACTUALLY WORKS */}
        <section className="flex flex-col gap-8 py-6 border-t border-[#2C2C2E] pt-12">
          <div>
            <h2 className="text-xl font-semibold text-white">The Science Layer</h2>
            <p className="text-[10px] uppercase tracking-wider text-[#9A9A9E] mt-1">Behavioral Medicine Principles</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#2A7F7F]" /> 1. Implementation Intentions
              </h4>
              <p className="text-xs text-[#9A9A9E] leading-relaxed pl-5 font-normal">
                Commitments framed with specific anchors (e.g. "Upon starting my desk routine...") bypass cognitive hesitation, converting passive plans into rapid behavioral execution.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-[#2C2C2E]/40 pt-4">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#2A7F7F]" /> 2. Self-Monitoring
              </h4>
              <p className="text-xs text-[#9A9A9E] leading-relaxed pl-5 font-normal">
                Granular logging of circadian alignment and anchors builds objective self-awareness. Real-time feedback serves to solidify behavioral habits.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-[#2C2C2E]/40 pt-4">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#2A7F7F]" /> 3. Habit Stacking
              </h4>
              <p className="text-xs text-[#9A9A9E] leading-relaxed pl-5 font-normal">
                Layering new non-negotiable protocols directly onto automated daily activities significantly decreases initiation energy thresholds.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-[#2C2C2E]/40 pt-4">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#2A7F7F]" /> 4. The Streak Paradox
              </h4>
              <p className="text-xs text-[#9A9A9E] leading-relaxed pl-5 font-normal">
                Allowing baseline drops on challenging days prevents all-or-nothing cognitive collapse. This supports consistent progress and builds strong long-term habits.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-[10px] uppercase tracking-widest text-[#5C5C5E] border-t border-[#2C2C2E] pt-8 mt-12 font-normal">
          © 2026 TRELIS LIFE • STRUCTURE FOR A BETTER LIFE.
        </footer>

      </div>
    </div>
  );
}
