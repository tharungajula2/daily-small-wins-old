'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminBackfillPage() {
  const supabase = createClient();
  const [status, setStatus] = useState('Idle');

  const runBackfill = async () => {
    setStatus('Running backfill...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStatus('Not logged in!');
        return;
      }
      if (session.user.email !== 'tharune4ir@gmail.com') {
        setStatus(`Wrong user: ${session.user.email}. Expected tharune4ir@gmail.com`);
        return;
      }

      const uid = session.user.id;

      // 1. Get or create a "Absolute Baseline" or "Small Wins" playlist
      const { data: anchors } = await supabase.from('user_anchors').select('*').eq('user_id', uid);
      let targetPlaylistId = null;
      if (anchors && anchors.length > 0) {
        const p = anchors.find(a => a.title.toLowerCase().includes('small wins') || a.title.toLowerCase().includes('baseline')) || anchors[0];
        targetPlaylistId = p.id;
      } else {
        targetPlaylistId = crypto.randomUUID();
        await supabase.from('user_anchors').insert({
          id: targetPlaylistId,
          user_id: uid,
          title: 'Absolute Baseline',
          is_active: true,
          position: 0
        });
      }

      // Generate dates from May 10 to Today
      const dates = [];
      const start = new Date(2026, 4, 10); // Month is 0-indexed, 4 = May
      const end = new Date(); // Today
      
      let curr = new Date(start);
      while (curr <= end) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }

      for (const d of dates) {
        const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
        
        // Insert daily_rituals (wakeup)
        await supabase.from('daily_rituals').upsert({
          user_id: uid,
          date: dateStr,
          feet_on_floor_logged: true,
          morning_ritual_done: true,
          pulse_score: 50 // baseline score
        }, { onConflict: 'user_id,date' });

        // Insert Ojas Win
        await supabase.from('anchor_gathers').upsert({
          id: crypto.randomUUID(),
          user_id: uid,
          anchor_id: targetPlaylistId,
          log_date: dateStr,
          label: 'Honored the Baseline (Ojas Cultivation)',
          tags: ['baseline', 'energy']
        }, { onConflict: 'id' });

        // Insert Mantra Win
        await supabase.from('anchor_gathers').upsert({
          id: crypto.randomUUID(),
          user_id: uid,
          anchor_id: targetPlaylistId,
          log_date: dateStr,
          label: 'Recited Mantra: Om Namah Parvathi Pathaye Hara Hara Mahadeva Shambho Shankara',
          tags: ['mantra', 'spiritual']
        }, { onConflict: 'id' });
      }

      setStatus(`Backfill complete for ${dates.length} days!`);

    } catch (e: any) {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto text-ink-primary bg-canvas min-h-screen">
      <h1 className="text-xl font-bold mb-4">Admin Backfill</h1>
      <p className="mb-4 text-sm text-ink-secondary">Backfills data from May 10, 2026 to today.</p>
      
      <button 
        onClick={runBackfill}
        className="px-6 py-3 bg-accent-teal text-white rounded-xl font-bold"
      >
        Run Backfill
      </button>

      <p className="mt-6 text-sm">{status}</p>
    </div>
  );
}
