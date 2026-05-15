import { createClient } from '@/lib/supabase/client';

/** Validates that a string is a proper UUID (DB columns are uuid type) */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

/**
 * Pulls the initial state from Supabase when the user logs in or reloads.
 * Conflict Resolution: Local data (from Zustand persist) always wins if it already exists.
 * Missing data is populated from the cloud (e.g., fresh device).
 */
export async function syncPullInitialState(localState: any, setLocalState: (partial: any) => void) {
  const supabase = createClient();
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    // 1. Pull Daily Rituals
    const { data: dailyRitual } = await supabase
      .from('daily_rituals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    // 1b. Pull Last 7 Days for Sparkline
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: weekData } = await supabase
      .from('daily_rituals')
      .select('date, feet_on_floor_logged, morning_ritual_done, sleep_quality, win_of_the_day')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: true });

    // Push weekly history to store immediately (read-only, no conflict resolution needed)
    setLocalState({ weeklyHistory: weekData || [] });

    // 2. Pull User Vision
    const { data: userVision } = await supabase
      .from('user_vision')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // 3. Pull User Anchors
    const { data: userAnchors } = await supabase
      .from('user_anchors')
      .select('*')
      .eq('user_id', userId);

    // 4. Pull Today's Anchor Logs
    const { data: anchorLogs } = await supabase
      .from('anchor_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    // 5. Pull Supplements
    const { data: userSupplements } = await supabase
      .from('user_supplements')
      .select('*')
      .eq('user_id', userId);

    // 6. Pull Today's Supplement Logs
    const { data: supplementLogs } = await supabase
      .from('supplement_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today);

    // 7. Pull Notes of Life
    const { data: notesOfLife } = await supabase
      .from('notes_of_life')
      .select('*')
      .eq('user_id', userId);

    // Conflict Resolution: Local wins.
    const updates: any = {};

    if (dailyRitual) {
      if (!localState.feetOnFloorLogged && dailyRitual.feet_on_floor_logged) {
        updates.feetOnFloorLogged = dailyRitual.feet_on_floor_logged;
        updates.wakeTime = dailyRitual.wake_time;
      }
      if (!localState.morningCheckInDone && dailyRitual.morning_ritual_done) {
        updates.morningCheckInDone = dailyRitual.morning_ritual_done;
        if (dailyRitual.sleep_quality) updates.sleepScore = dailyRitual.sleep_quality - 1;
        if (dailyRitual.morning_mood) updates.moodScore = dailyRitual.morning_mood - 1;
      }
      if (!localState.eveningCheckInDone && dailyRitual.win_of_the_day) {
        updates.eveningCheckInDone = true;
        updates.winOfTheDay = dailyRitual.win_of_the_day;
        updates.parkingLotNotes = dailyRitual.parking_lot_notes || '';
      }
      // Apply missing gut/movement logs if local is empty
      if (!localState.morningGut && dailyRitual.morning_gut) updates.morningGut = dailyRitual.morning_gut;
      if (!localState.eveningGut && dailyRitual.evening_gut) updates.eveningGut = dailyRitual.evening_gut;
      if (!localState.dailyDiscomfortLog && dailyRitual.daily_discomfort_log) updates.dailyDiscomfortLog = dailyRitual.daily_discomfort_log;
      if (!localState.dailyMovementNote && dailyRitual.daily_movement_note) updates.dailyMovementNote = dailyRitual.daily_movement_note;
    }

    if (userVision && userVision.vision_text) {
       // Only override if the user has the default vision text
       if (localState.visionText === "I am building the structure for a better life.") {
          updates.visionText = userVision.vision_text;
       }
    }

    if (userAnchors && userAnchors.length > 0) {
      const isLocalEmptyOrDefault = !localState.anchors || localState.anchors.length === 0 || (localState.anchors.length > 0 && localState.anchors[0].id.startsWith('default-'));
      if (isLocalEmptyOrDefault) {
        updates.anchors = userAnchors.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          baselineTitle: a.baseline_title,
          completed: false,
          usedBaseline: false
        }));
      }
    }

    if (anchorLogs && anchorLogs.length > 0) {
      const currentAnchors = updates.anchors || localState.anchors || [];
      let anchorsChanged = false;
      
      const mappedAnchors = currentAnchors.map((anchor: any) => {
        const log = anchorLogs.find((l: any) => l.anchor_id === anchor.id);
        if (log) {
          let modified = false;
          let newAnchor = { ...anchor };
          if (!newAnchor.completed && log.completed) {
            newAnchor.completed = true;
            modified = true;
          }
          if (!newAnchor.usedBaseline && log.used_baseline) {
            newAnchor.usedBaseline = true;
            modified = true;
          }
          if (modified) {
            anchorsChanged = true;
            return newAnchor;
          }
        }
        return anchor;
      });

      if (anchorsChanged) {
        updates.anchors = mappedAnchors;
      }
    }

    if (userSupplements && userSupplements.length > 0) {
      const isLocalEmptyOrDefault = !localState.supplements || localState.supplements.length === 0 || (localState.supplements.length > 0 && localState.supplements[0].id.startsWith('default-'));
      if (isLocalEmptyOrDefault) {
        updates.supplements = userSupplements.map((s: any) => ({
          id: s.id,
          name: s.name,
          timing: s.timing,
          dosage: s.dosage || undefined,
          instruction: s.instruction || undefined,
          taken: false
        }));
      }
    }

    if (supplementLogs && supplementLogs.length > 0) {
      const currentSupplements = updates.supplements || localState.supplements || [];
      let suppsChanged = false;
      const mappedSupplements = currentSupplements.map((supp: any) => {
        const log = supplementLogs.find((l: any) => l.supplement_id === supp.id);
        if (log && !supp.taken && log.taken) {
          suppsChanged = true;
          return { ...supp, taken: true };
        }
        return supp;
      });
      if (suppsChanged) {
        updates.supplements = mappedSupplements;
      }
    }

    if (notesOfLife && notesOfLife.length > 0) {
      const currentNotes = localState.lifeNotes || [];
      const missingNotes = notesOfLife.filter((cn: any) => !currentNotes.find((ln: any) => ln.id === cn.id));
      if (missingNotes.length > 0) {
        const mappedNotes = missingNotes.map((n: any) => ({
          id: n.id,
          content: n.content,
          attribution: n.attribution || '',
          category: n.category || '',
          date: n.created_at
        }));
        updates.lifeNotes = [...mappedNotes, ...currentNotes];
      }
    }

    // Apply updates to Zustand if any conflicts were resolved in favor of the cloud
    if (Object.keys(updates).length > 0) {
      setLocalState(updates);
      console.log("Sync Engine: Pulled state updates from cloud.", updates);
    } else {
      console.log("Sync Engine: Local state is authoritative or cloud is empty.");
    }
  } catch (error) {
    // Graceful failure - do not crash the UI
    console.error("Sync Engine: Pull Initial State Error", error);
  }
}

/**
 * Pushes the current ephemeral daily state to Supabase.
 * Uses UPSERT to create or update today's daily_rituals row.
 */
export async function syncPushDailyRitual(state: any) {
  const supabase = createClient();
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return; // Silent return for offline/unauthenticated
    
    const today = new Date().toISOString().split('T')[0];

    const payload = {
      user_id: session.user.id,
      date: today,
      wake_time: state.wakeTime || null,
      feet_on_floor_logged: state.feetOnFloorLogged || false,
      morning_ritual_done: state.morningCheckInDone || false,
      sleep_quality: state.sleepScore !== null ? state.sleepScore + 1 : null,
      morning_mood: state.moodScore !== null ? state.moodScore + 1 : null,
      win_of_the_day: state.winOfTheDay || null,
      parking_lot_notes: state.parkingLotNotes || null,
      bed_time: state.bedTime || null,
      sleep_duration: state.sleepDuration || null,
      morning_gut: state.morningGut || null,
      evening_gut: state.eveningGut || null,
      daily_discomfort_log: state.dailyDiscomfortLog || null,
      daily_movement_note: state.dailyMovementNote || null,
    };

    const { error } = await supabase
      .from('daily_rituals')
      .upsert(payload, { onConflict: 'user_id,date' });

    if (error) throw error;
    
    console.log("Sync Engine: Push Daily Ritual Successful");
  } catch (error: any) {
    console.error("Sync Engine: Push Daily Ritual Error", error.message || error);
  }
}

/**
 * Pushes the full array of anchor definitions to user_anchors.
 * Uses UPSERT to ensure the cloud perfectly matches local state.
 */
export async function syncPushAnchors(anchors: any[]) {
  const supabase = createClient();
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    const userId = session.user.id;
    
    // Filter out anchors with non-UUID IDs (e.g., default-a1) that haven't been synced yet
    const syncableAnchors = anchors.filter(a => isValidUUID(a.id));
    if (syncableAnchors.length === 0) {
      console.log("Sync Engine: No syncable anchors (all have local-only IDs).");
      return;
    }

    const payload = syncableAnchors.map(a => ({
      id: a.id,
      user_id: userId,
      title: a.title,
      category: a.category,
      baseline_title: a.baselineTitle || null,
      is_active: true
    }));

    // We do a bulk upsert. Deletions from local aren't handled by upsert automatically, 
    // but this fulfills the current requirement securely.
    const { error } = await supabase
      .from('user_anchors')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    console.log("Sync Engine: Push Anchors Successful");
  } catch (error) {
    console.error("Sync Engine: Push Anchors Error", error);
  }
}

/**
 * Pushes an individual anchor log (completion status) to anchor_logs.
 * Uses UPSERT on user_id, anchor_id, date.
 */
export async function syncPushAnchorLog(anchorId: string, completed: boolean, usedBaseline: boolean) {
  const supabase = createClient();
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;

    // Skip sync for anchors with non-UUID IDs (default/offline-generated)
    if (!isValidUUID(anchorId)) {
      console.log(`Sync Engine: Skipping anchor log push for non-UUID anchor (${anchorId}).`);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];

    const payload = {
      user_id: session.user.id,
      anchor_id: anchorId,
      date: today,
      completed,
      used_baseline: usedBaseline
    };

    const { error } = await supabase
      .from('anchor_logs')
      .upsert(payload, { onConflict: 'user_id,anchor_id,date' });

    if (error) throw error;
    console.log(`Sync Engine: Push Anchor Log (${anchorId}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Push Anchor Log Error", error.message || error);
  }
}

/**
 * Bulk UPSERT to user_supplements
 */
export async function syncPushSupplements(supplements: any[]) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    const userId = session.user.id;

    // Filter out supplements with non-UUID IDs (e.g., default-s1)
    const syncableSupplements = supplements.filter(s => isValidUUID(s.id));
    if (syncableSupplements.length === 0) {
      console.log("Sync Engine: No syncable supplements (all have local-only IDs).");
      return;
    }

    const payload = syncableSupplements.map(s => ({
      id: s.id,
      user_id: userId,
      name: s.name,
      timing: s.timing,
      dosage: s.dosage || null,
      instruction: s.instruction || null,
      is_active: true
    }));

    const { error } = await supabase.from('user_supplements').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    console.log("Sync Engine: Push Supplements Successful");
  } catch (error) {
    console.error("Sync Engine: Push Supplements Error", error);
  }
}

/**
 * UPSERT to supplement_logs
 */
export async function syncPushSupplementLog(supplementId: string, taken: boolean) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;

    // Skip sync for supplements with non-UUID IDs (default/offline-generated)
    if (!isValidUUID(supplementId)) {
      console.log(`Sync Engine: Skipping supplement log push for non-UUID supplement (${supplementId}).`);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      user_id: session.user.id,
      supplement_id: supplementId,
      log_date: today,
      taken
    };

    const { error } = await supabase.from('supplement_logs').upsert(payload, { onConflict: 'user_id,supplement_id,log_date' });
    if (error) throw error;
    console.log(`Sync Engine: Push Supplement Log (${supplementId}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Push Supplement Log Error", error.message || error);
  }
}

/**
 * Insert/UPSERT to notes_of_life
 */
export async function syncPushNote(note: any) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    const payload = {
      id: note.id,
      user_id: session.user.id,
      content: note.content,
      attribution: note.attribution || null,
      category: note.category || null,
      created_at: note.date || new Date().toISOString()
    };

    const { error } = await supabase.from('notes_of_life').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    console.log("Sync Engine: Push Note Successful");
  } catch (error) {
    console.error("Sync Engine: Push Note Error", error);
  }
}

/**
 * UPSERT to user_vision
 */
export async function syncPushVision(visionText: string) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    const payload = {
      user_id: session.user.id,
      vision_text: visionText
    };

    const { error } = await supabase.from('user_vision').upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
    console.log("Sync Engine: Push Vision Successful");
  } catch (error) {
    console.error("Sync Engine: Push Vision Error", error);
  }
}

/**
 * UPSERT to weekly_stats
 */
export async function syncPushWeeklyPlantCount(count: number) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.setDate(diff));
    const weekStartDate = monday.toISOString().split('T')[0];

    const payload = {
      user_id: session.user.id,
      week_start: weekStartDate,
      weekly_plant_count: count
    };

    const { error } = await supabase.from('weekly_stats').upsert(payload, { onConflict: 'user_id, week_start' });
    if (error) throw error;
    console.log("Sync Engine: Push Weekly Plant Count Successful");
  } catch (error) {
    console.error("Sync Engine: Push Weekly Plant Count Error", error);
  }
}
