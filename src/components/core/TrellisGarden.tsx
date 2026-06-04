'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRitualStore, getLifetimeKeeps, getLifetimeGathers } from '@/store/useRitualStore';
import { createClient } from '@/lib/supabase/client';
import { Flower, Leaf, ChevronLeft, ChevronRight, Sprout } from 'lucide-react';

interface VineDayData {
  anchorId: string;
  title: string;
  codename: string | null;
  isKept: boolean;
  gathersList: string[];
}

interface DayData {
  date: string;
  dayLabel: string;
  vines: VineDayData[];
}

export default function TrellisGarden() {
  const supabase = createClient();
  const { anchors, feetOnFloorLogged, eveningCheckInDone } = useRitualStore();
  const [history, setHistory] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  
  // Week navigation: 0 = current week, 1 = 1 week ago, etc.
  const [weekOffset, setWeekOffset] = useState(0);

  // Canonical lifetime counts
  const canonicalKeeps = useRitualStore(state => getLifetimeKeeps(state));
  const canonicalGathers = useRitualStore(state => getLifetimeGathers(state));

  useEffect(() => {
    let active = true;

    async function loadGardenData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const uid = session.user.id;
        const todayStr = new Date().toLocaleDateString('en-CA');

        // 1. Fetch Baseline Stats (before today)
        const [keepsBeforeToday, gathersBeforeToday, ritualsBeforeToday] = await Promise.all([
          supabase.from('anchor_keeps').select('*', { count: 'exact', head: true }).eq('user_id', uid).lt('log_date', todayStr),
          supabase.from('anchor_gathers').select('*', { count: 'exact', head: true }).eq('user_id', uid).lt('log_date', todayStr),
          supabase.from('daily_rituals').select('*', { count: 'exact', head: true }).eq('user_id', uid).lt('date', todayStr)
        ]);

        const historicalKeeps = (keepsBeforeToday.count || 0) + (ritualsBeforeToday.count || 0);
        const historicalGathers = gathersBeforeToday.count || 0;
        
        if (active) {
          useRitualStore.getState().setHistoricalCounts(historicalKeeps, historicalGathers);
        }

        // 2. Get past 7 days dates for current weekOffset
        const dates: string[] = [];
        const dayLabels: string[] = [];
        const today = new Date();
        
        // Offset starting date by weekOffset * 7
        today.setDate(today.getDate() - (weekOffset * 7));

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-CA');
          dates.push(dateStr);
          dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        }

        // Fetch keeps, gathers and rituals for these dates
        const [keepsRes, gathersRes, ritualsRes] = await Promise.all([
          supabase.from('anchor_keeps').select('*').eq('user_id', uid).gte('log_date', dates[0]).lte('log_date', dates[6]),
          supabase.from('anchor_gathers').select('*').eq('user_id', uid).gte('log_date', dates[0]).lte('log_date', dates[6]),
          supabase.from('daily_rituals').select('*').eq('user_id', uid).gte('date', dates[0]).lte('date', dates[6])
        ]);

        const keeps = keepsRes.data || [];
        const gathers = gathersRes.data || [];
        const rituals = ritualsRes.data || [];

        // Define our active anchor list to display as vines
        const activeCustomAnchors = anchors.filter(a => a.isActive !== false);
        const allVinesList = [
          { id: 'the-arc', title: 'The Arc', codename: 'The Keystone', isPermanent: true },
          ...activeCustomAnchors
        ];

        // Build data structure for each day
        const list: DayData[] = dates.map((dateStr, idx) => {
          const isToday = idx === 6 && weekOffset === 0;

          const dayVines: VineDayData[] = allVinesList.map(vine => {
            if (vine.id === 'the-arc') {
              if (isToday) {
                const isKept = !!feetOnFloorLogged;
                const gathersList: string[] = [];
                return {
                  anchorId: vine.id,
                  title: vine.title,
                  codename: vine.codename ?? null,
                  isKept,
                  gathersList
                };
              } else {
                const dayRitual = rituals.find(r => r.date === dateStr);
                const isKept = !!(dayRitual?.feet_on_floor_logged || dayRitual?.morning_ritual_done);
                const gathersList: string[] = [];
                return {
                  anchorId: vine.id,
                  title: vine.title,
                  codename: vine.codename ?? null,
                  isKept,
                  gathersList
                };
              }
            } else {
              // Custom Anchors
              if (isToday) {
                const storeAnchor = anchors.find(a => a.id === vine.id);
                const isKept = !!storeAnchor?.completed;
                const gathersList: string[] = [];
                if (storeAnchor?.gathers) {
                  storeAnchor.gathers.forEach(g => {
                    if (g.logDate === dateStr && g.label) gathersList.push(g.label);
                  });
                }
                return {
                  anchorId: vine.id,
                  title: vine.title,
                  codename: storeAnchor?.codename ?? null,
                  isKept,
                  gathersList
                };
              } else {
                const isKept = keeps.some(k => k.anchor_id === vine.id && k.log_date === dateStr);
                const gathersList = gathers
                  .filter(g => g.anchor_id === vine.id && g.log_date === dateStr)
                  .map(g => g.label)
                  .filter(Boolean) as string[];
                const storeAnchor = anchors.find(a => a.id === vine.id);

                return {
                  anchorId: vine.id,
                  title: vine.title,
                  codename: storeAnchor?.codename ?? null,
                  isKept,
                  gathersList
                };
              }
            }
          });

          return {
            date: dateStr,
            dayLabel: isToday ? 'Today' : dayLabels[idx],
            vines: dayVines
          };
        });

        if (active) {
          setHistory(list);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error compiling garden dashboard data:', err);
      }
    }

    loadGardenData();
    return () => { active = false; };
  }, [anchors, feetOnFloorLogged, eveningCheckInDone, weekOffset]);

  if (loading) {
    return (
      <div className="w-full bg-surface rounded-3xl p-6 border border-muted/85 shadow-xs flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-6 h-6 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-ink-secondary mt-2 tracking-widest uppercase font-semibold">
          Trellis Garden Growing...
        </span>
      </div>
    );
  }

  // Find active anchors list
  const activeCustomAnchors = anchors.filter(a => a.isActive !== false);
  const allVines = [
    { id: 'the-arc', title: 'The Arc', codename: 'The Keystone', isPermanent: true },
    ...activeCustomAnchors
  ];

  // Base coordinates for the lattice S-curve (drawn bottom-up)
  const vinePoints = [
    { x: 80, y: 250 },   // Day 1
    { x: 120, y: 215 },  // Day 2
    { x: 90, y: 180 },   // Day 3
    { x: 130, y: 145 },  // Day 4
    { x: 95, y: 110 },   // Day 5
    { x: 125, y: 75 },   // Day 6
    { x: 105, y: 35 }    // Day 7 (Today)
  ];

  return (
    <div className="w-full bg-surface rounded-3xl p-5 border border-muted/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4 relative overflow-hidden select-none hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)] transition-all">
      
      {/* Header controls & date navigation */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-accent-teal font-bold block">
            Lattice & Vine Tracker
          </span>
          <h3 className="text-xs font-semibold text-ink-primary mt-0.5">
            Your Trellis Garden
          </h3>
        </div>
        
        {/* Navigation buttons to browse back / forth */}
        <div className="flex items-center gap-1 bg-canvas border border-muted/75 rounded-full px-2 py-0.5 text-xs">
          <button 
            type="button"
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-1 hover:text-ink-primary text-ink-secondary hover:bg-muted rounded-full transition-all focus:outline-none"
            title="Previous Week"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] font-bold text-ink-secondary uppercase px-1 min-w-[70px] text-center select-none">
            {weekOffset === 0 ? 'This Week' : `${weekOffset} Wk Ago`}
          </span>
          <button 
            type="button"
            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
            disabled={weekOffset === 0}
            className={`p-1 rounded-full transition-all focus:outline-none ${
              weekOffset === 0 ? 'text-ink-secondary/20 cursor-not-allowed' : 'text-ink-secondary hover:text-ink-primary hover:bg-muted'
            }`}
            title="Next Week"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {/* SVG Trellis Garden Board */}
        <div className="relative w-48 h-[290px] bg-canvas/30 rounded-2xl border border-muted/40 flex items-center justify-center p-2">
          {/* SVG Canvas */}
          <svg className="w-full h-full" viewBox="0 0 200 280">
            {/* 1. Draw Wooden Trellis Grid (Recessed visually behind growth) */}
            {/* Vertical Posts - styled in warm wood brown */}
            <line x1="45" y1="10" x2="45" y2="270" stroke="#B3A28F" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="100" y1="10" x2="100" y2="270" stroke="#9E8D7B" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="155" y1="10" x2="155" y2="270" stroke="#B3A28F" strokeWidth="4.5" strokeLinecap="round" />

            {/* Horizontal Rungs */}
            <line x1="20" y1="45" x2="180" y2="45" stroke="#B3A28F" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="95" x2="180" y2="95" stroke="#B3A28F" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="145" x2="180" y2="145" stroke="#B3A28F" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="195" x2="180" y2="195" stroke="#B3A28F" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="245" x2="180" y2="245" stroke="#B3A28F" strokeWidth="3" strokeLinecap="round" />

            {/* Diagonal Lattice Pattern */}
            <line x1="45" y1="245" x2="155" y2="145" stroke="#C2B3A3" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="45" y1="195" x2="155" y2="95" stroke="#C2B3A3" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="45" y1="145" x2="155" y2="45" stroke="#C2B3A3" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="155" y1="245" x2="45" y2="145" stroke="#C2B3A3" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="155" y1="195" x2="45" y2="95" stroke="#C2B3A3" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="155" y1="145" x2="45" y2="45" stroke="#C2B3A3" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* 2. Draw Vines Segments (From bottom idx 0 to top idx 6) */}
            {allVines.map((vine, vIdx) => {
              // Calculate side-by-side x offset for this vine
              const offset = (vIdx - (allVines.length - 1) / 2) * 15;
              const vineColor = vine.id === 'the-arc' ? '#186464' : '#2A7F7F';
              const shadowColor = vine.id === 'the-arc' ? '#0F4444' : '#1C5B5B';
              
              // Helper to get offset coordinate
              const getPt = (pIdx: number) => ({
                x: vinePoints[pIdx].x + offset,
                y: vinePoints[pIdx].y
              });

              return (
                <g key={`vine-${vine.id}`}>
                  {history.map((day, idx) => {
                    if (idx === 0) return null;
                    const prev = getPt(idx - 1);
                    const curr = getPt(idx);

                    // Curve control points - dynamic offsets to intertwine slightly
                    const curveOffset = (idx % 2 === 0 ? 10 : -10);
                    const cx1 = prev.x + curveOffset;
                    const cy1 = prev.y - 12;
                    const cx2 = curr.x - curveOffset;
                    const cy2 = curr.y + 12;

                    const dayVineData = day.vines.find(v => v.anchorId === vine.id);
                    const isKept = !!dayVineData?.isKept;
                    const gathersCount = dayVineData?.gathersList.length || 0;

                    const midX = (prev.x + curr.x) / 2;
                    const midY = (prev.y + curr.y) / 2;

                    return (
                      <g key={`segment-${idx}`}>
                        {/* Shadow/Glow (giving plant organic thickness) */}
                        <path
                          d={`M ${prev.x} ${prev.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`}
                          fill="none"
                          stroke={isKept ? shadowColor : '#E0DFD8'}
                          strokeWidth={isKept ? '5.5' : '1.5'}
                          strokeLinecap="round"
                          opacity={isKept ? '0.2' : '0.4'}
                        />
                        {/* Main Branch */}
                        <path
                          d={`M ${prev.x} ${prev.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`}
                          fill="none"
                          stroke={isKept ? vineColor : '#D1D0C9'}
                          strokeWidth={isKept ? '2.8' : '1.2'}
                          strokeLinecap="round"
                        />

                        {/* Large, unmistakable plant leaves */}
                        {isKept && (
                          <g>
                            {/* Leaf 1 (curving right) */}
                            <path
                              d={`M ${midX} ${midY} Q ${midX + 13} ${midY - 11}, ${midX + 15} ${midY - 2} Z`}
                              fill="#4CAAA5"
                              stroke={vineColor}
                              strokeWidth="0.8"
                            />
                            {/* Leaf 2 (curving left) */}
                            <path
                              d={`M ${midX - 1} ${midY + 1} Q ${midX - 13} ${midY + 9}, ${midX - 9} ${midY + 13} Z`}
                              fill="#4CAAA5"
                              stroke={vineColor}
                              strokeWidth="0.8"
                            />
                          </g>
                        )}

                        {/* Golden Flower Blossoms (gathers) */}
                        {isKept && gathersCount > 0 && (
                          <g transform={`translate(${midX + 1}, ${midY - 2})`} style={{ pointerEvents: 'none' }}>
                            {/* Outer petals - 5 points */}
                            <circle cx="-3.5" cy="0" r="3" fill="#E8B041" opacity="0.95" />
                            <circle cx="3.5" cy="0" r="3" fill="#E8B041" opacity="0.95" />
                            <circle cx="0" cy="-3.5" r="3" fill="#E8B041" opacity="0.95" />
                            <circle cx="0" cy="3.5" r="3" fill="#E8B041" opacity="0.95" />
                            {/* Center */}
                            <circle cx="0" cy="0" r="1.8" fill="#FFF" />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* 3. Draw Interactive Day Nodes (Brass/Wooden Rings that vines weave through) */}
            {history.map((day, idx) => {
              const pt = vinePoints[idx];
              const isToday = idx === 6 && weekOffset === 0;
              const hasCompletion = day.vines.some(v => v.isKept);
              
              return (
                <g 
                  key={`node-${idx}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedDay(day)}
                >
                  {/* Anchor Ring Outer Shadow */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isToday ? "9.5" : "7.5"}
                    fill="none"
                    stroke="#DCDAD3"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  {/* Anchor Ring Body */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isToday ? "8" : "6"}
                    fill={isToday ? '#E8B041' : (hasCompletion ? '#9E8D7B' : '#F7F6F2')}
                    stroke={isToday ? '#FFF' : '#C4C3BC'}
                    strokeWidth={isToday ? "2.5" : "1.8"}
                    style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                    className="hover:scale-125 transition-transform duration-200"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel on the right of Trellis */}
        <div className="flex-1 flex flex-col justify-center min-h-[220px]">
          {selectedDay ? (
            <motion.div 
              key={selectedDay.date}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-canvas border border-muted/80 rounded-2xl p-4 flex flex-col gap-2 h-full justify-between"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-ink-primary font-bold">
                  {selectedDay.dayLabel === 'Today' ? 'Today' : selectedDay.dayLabel} Details
                </span>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="text-ink-tertiary hover:text-ink-primary text-[10px] font-bold uppercase tracking-wider focus:outline-none"
                >
                  Clear
                </button>
              </div>

              {/* List out all active anchors and their states on this day */}
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedDay.vines.map((v, vidx) => (
                  <div key={vidx} className="flex flex-col gap-0.5 border-b border-muted/50 pb-1.5 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-semibold text-ink-primary truncate max-w-[100px]">
                        {v.title}
                      </span>
                      <span className={`text-[8px] uppercase tracking-widest font-bold ${v.isKept ? 'text-accent-teal' : 'text-ink-tertiary'}`}>
                        {v.isKept ? 'Kept' : 'Dormant'}
                      </span>
                    </div>

                    {v.gathersList.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1 pl-1 border-l-2 border-[#E8B041]/40">
                        {v.gathersList.map((g, gi) => (
                          <p key={gi} className="text-[9px] text-ink-secondary leading-tight italic">
                            “{g}”
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col justify-between items-center text-center p-4 border border-dashed border-muted rounded-2xl bg-canvas/30 h-full min-h-[170px] text-ink-secondary">
              <div className="my-auto flex flex-col items-center">
                <Sprout className="w-5 h-5 text-accent-teal/80 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-ink-primary">Tap a Ring to inspect</p>
                <p className="text-[10px] text-ink-tertiary mt-1 max-w-[140px] leading-normal font-medium">
                  Review the distinct vines & reflections for each day.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Long-term accumulation stats section */}
      <div className="border-t border-muted/80 pt-3 flex items-center justify-between text-[9px] text-ink-secondary">
        <div className="flex items-center gap-1.5 font-semibold">
          <Sprout className="w-3.5 h-3.5 text-accent-teal" />
          <span>Garden Grove Maturity</span>
        </div>
        <div className="flex items-center gap-2 font-bold text-ink-primary">
          <span>{canonicalKeeps} Keeps</span>
          <span className="text-ink-tertiary/40">•</span>
          <span className="text-[#D4AF37]">{canonicalGathers} Blooms</span>
        </div>
      </div>
    </div>
  );
}
