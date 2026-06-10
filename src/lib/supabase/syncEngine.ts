import { createClient } from '@/lib/supabase/client';
import { isAnchorActiveForDay } from '@/utils/dayMatcher';

/** Validates that a string is a proper UUID (DB columns are uuid type) */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

async function getSessionWithTimeout(supabase: any, timeoutMs = 2000): Promise<any> {
  return Promise.race([
    supabase.auth.getSession(),
    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), timeoutMs))
  ]);
}

/**
 * Pulls the initial state from Supabase when the user logs in or reloads.
 * Conflict Resolution: Local data (from Zustand persist) always wins if it already exists.
 * Missing data is populated from the cloud (e.g., fresh device).
 */
export async function syncPullInitialState(userId: string, localState: any, setLocalState: (partial: any) => void) {
  const supabase = createClient();
  
  try {
    const today = new Date().toLocaleDateString('en-CA');

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

    // 4. Pull Today's Anchor Logs (legacy fallback)
    const { data: anchorLogs } = await supabase
      .from('anchor_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    // 5. Pull Today's Keeps
    const { data: anchorKeeps } = await supabase
      .from('anchor_keeps')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today);

    // 6. Pull Today's Gathers
    const { data: anchorGathers } = await supabase
      .from('anchor_gathers')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today);

    // 7. Pull User State
    const { data: userStateData } = await supabase
      .from('user_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Conflict Resolution: Local wins.
    const updates: any = {};

    if (userStateData) {
      updates.onboardingCompleted = !!userStateData.onboarding_completed;
      updates.onboardingTourCompleted = !!userStateData.onboarding_tour_completed;

      if (userStateData.d_day_target_date) {
        if (!localState.dDayTargetDate || localState.dDayTargetDate === "2026-01-01") {
          updates.dDayTargetDate = userStateData.d_day_target_date;
        }
      }
      if (userStateData.d_day_title) {
        if (!localState.dDayTitle || localState.dDayTitle === "Jan 1, 2026") {
          updates.dDayTitle = userStateData.d_day_title;
        }
      }
    }

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
          pillarId: a.pillar_id,
          type: a.type,
          prompt: a.prompt || undefined,
          completed: false,
          usedBaseline: false,
          reflectionText: undefined,
          subItems: a.sub_items || [],
          frequency: a.frequency || ['all'],
          baseline_trg: a.baseline_target || undefined,
          codename: a.codename || null,
          keepDefinition: a.keep_definition || '',
          isPermanent: a.is_permanent || false,
          isActive: a.is_active !== false,
          gathers: []
        }));
      } else {
        let localAnchorsChanged = false;
        const mergedAnchors = localState.anchors.map((la: any) => {
          const cloud = userAnchors.find((ca: any) => ca.id === la.id);
          if (cloud) {
            const hasSubItemsChanged = JSON.stringify(la.subItems || []) !== JSON.stringify(cloud.sub_items || []);
            const hasFrequencyChanged = JSON.stringify(la.frequency || []) !== JSON.stringify(cloud.frequency || []);
            const hasCodenameChanged = la.codename !== cloud.codename;
            const hasKeepDefinitionChanged = la.keepDefinition !== cloud.keep_definition;
            const hasIsPermanentChanged = la.isPermanent !== cloud.is_permanent;
            const hasIsActiveChanged = la.isActive !== cloud.is_active;

            if (hasSubItemsChanged || hasFrequencyChanged || hasCodenameChanged || hasKeepDefinitionChanged || hasIsPermanentChanged || hasIsActiveChanged) {
              localAnchorsChanged = true;
              return {
                ...la,
                subItems: cloud.sub_items || [],
                frequency: cloud.frequency || ['all'],
                codename: cloud.codename !== undefined ? cloud.codename : la.codename,
                keepDefinition: cloud.keep_definition !== undefined ? cloud.keep_definition : la.keepDefinition,
                isPermanent: cloud.is_permanent !== undefined ? cloud.is_permanent : la.isPermanent,
                isActive: cloud.is_active !== undefined ? cloud.is_active : la.isActive
              };
            }
          }
          return la;
        });
        if (localAnchorsChanged) {
          updates.anchors = mergedAnchors;
        }
      }
    }

    // Determine completion status (Keeps) and Gathers for each anchor
    const currentAnchors = updates.anchors || localState.anchors || [];
    let anchorsChanged = false;
    
    const mappedAnchors = currentAnchors.map((anchor: any) => {
      let modified = false;
      let newAnchor = { ...anchor };

      // 1. Resolve Keep status (either from anchor_keeps or legacy anchor_logs)
      const hasKeepRecord = anchorKeeps?.some((k: any) => k.anchor_id === anchor.id);
      const hasLegacyRecord = anchorLogs?.find((l: any) => l.anchor_id === anchor.id);
      const isKept = hasKeepRecord || (hasLegacyRecord ? hasLegacyRecord.completed : false);

      if (newAnchor.completed !== isKept) {
        newAnchor.completed = isKept;
        modified = true;
      }

      if (hasLegacyRecord) {
        if (!newAnchor.usedBaseline && hasLegacyRecord.used_baseline) {
          newAnchor.usedBaseline = true;
          modified = true;
        }
        if (hasLegacyRecord.reflection_text !== undefined && newAnchor.reflectionText !== hasLegacyRecord.reflection_text) {
          newAnchor.reflectionText = hasLegacyRecord.reflection_text || undefined;
          modified = true;
        }
        
        if (hasLegacyRecord.sub_items_state && Array.isArray(hasLegacyRecord.sub_items_state)) {
          const mergedSubItems = (newAnchor.subItems || []).map((s: any) => {
            const stateItem = hasLegacyRecord.sub_items_state.find((st: any) => st.id === s.id);
            if (stateItem && s.completed !== stateItem.completed) {
              modified = true;
              return { ...s, completed: stateItem.completed };
            }
            return s;
          });
          if (modified) {
            newAnchor.subItems = mergedSubItems;
          }
        }
      }

      // 2. Resolve Gather records (anchor_gathers)
      const gathersForAnchor = anchorGathers?.filter((g: any) => g.anchor_id === anchor.id) || [];
      const currentGathers = newAnchor.gathers || [];
      
      const hasGathersCountChanged = gathersForAnchor.length !== currentGathers.length;
      const hasGathersMetaChanged = !hasGathersCountChanged && 
        JSON.stringify(gathersForAnchor.map(g => g.id)) !== JSON.stringify(currentGathers.map((cg: any) => cg.id));

      if (hasGathersCountChanged || hasGathersMetaChanged) {
        newAnchor.gathers = gathersForAnchor.map((g: any) => ({
          id: g.id,
          anchorId: g.anchor_id,
          logDate: g.log_date,
          label: g.label || undefined,
          tags: g.tags || [],
          createdAt: g.created_at
        }));
        modified = true;
      }

      if (modified) {
        anchorsChanged = true;
        return newAnchor;
      }
      return anchor;
    });

    if (anchorsChanged) {
      updates.anchors = mappedAnchors;
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
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return; // Silent return for offline/unauthenticated
    
    const today = new Date().toLocaleDateString('en-CA');

    // Compute pulse_score
    const activeTodayAnchors = (state.anchors || []).filter((a: any) => isAnchorActiveForDay(a.frequency));
    const totalPersonalAnchors = activeTodayAnchors.length;
    const completedPersonalAnchors = activeTodayAnchors.filter((a: any) => a.completed).length;

    const totalCount = 2 + totalPersonalAnchors;
    const completedCount = (state.feetOnFloorLogged ? 1 : 0) + (state.eveningCheckInDone ? 1 : 0) + completedPersonalAnchors;
    const calculatedPulseScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
      pulse_score: calculatedPulseScore
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
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
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
      pillar_id: a.pillarId || 'stress_mental',
      type: a.type || 'action',
      prompt: a.prompt || null,
      baseline_title: a.baselineTitle || null,
      is_active: a.isActive !== false,
      sub_items: a.subItems || [],
      frequency: a.frequency || ['all'],
      codename: a.codename || null,
      keep_definition: a.keepDefinition || '',
      is_permanent: a.isPermanent || false
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
export async function syncPushAnchorLog(
  anchorId: string, 
  completed: boolean, 
  usedBaseline: boolean,
  reflectionText?: string,
  subItemsState?: { id: string; completed: boolean }[]
) {
  const supabase = createClient();
  
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;

    // Skip sync for anchors with non-UUID IDs (default/offline-generated)
    if (!isValidUUID(anchorId)) {
      console.log(`Sync Engine: Skipping anchor log push for non-UUID anchor (${anchorId}).`);
      return;
    }
    
    const today = new Date().toLocaleDateString('en-CA');

    const payload = {
      user_id: session.user.id,
      anchor_id: anchorId,
      date: today,
      completed,
      used_baseline: usedBaseline,
      reflection_text: reflectionText || null,
      sub_items_state: subItemsState || null
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
 * UPSERT to user_vision
 */
export async function syncPushVision(visionText: string) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
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
 * Pushes onboarding tour completed status to user_state.
 */
export async function syncPushOnboardingTourState(completed: boolean) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;

    const { error } = await supabase
      .from('user_state')
      .upsert({
        user_id: session.user.id,
        onboarding_tour_completed: completed
      }, { onConflict: 'user_id' });

    if (error) throw error;
    console.log("Sync Engine: Push Onboarding Tour State Successful");
  } catch (error: any) {
    console.error("Sync Engine: Push Onboarding Tour State Error", error.message || error);
  }
}

/**
 * Pushes D-Day target date to user_state.
 */
export async function syncPushDDayTarget(targetDate: string, title: string) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;

    const { error } = await supabase
      .from('user_state')
      .upsert({
        user_id: session.user.id,
        d_day_target_date: targetDate,
        d_day_title: title
      }, { onConflict: 'user_id' });

    if (error) throw error;
    console.log("Sync Engine: Push D-Day Target Successful");
  } catch (error: any) {
    console.error("Sync Engine: Push D-Day Target Error", error.message || error);
  }
}

/**
 * Pushes today's Keep status (kept/not kept) to anchor_keeps.
 * Upserts if completed, deletes from table if false.
 */
export async function syncPushKeep(anchorId: string, completed: boolean) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(anchorId)) return;
    
    const today = new Date().toLocaleDateString('en-CA');
    
    if (completed) {
      const payload = {
        user_id: session.user.id,
        anchor_id: anchorId,
        log_date: today
      };
      const { error } = await supabase
        .from('anchor_keeps')
        .upsert(payload, { onConflict: 'user_id,anchor_id,log_date' });
      if (error) throw error;
      console.log(`Sync Engine: Push Keep (${anchorId}) Successful`);
    } else {
      const { error } = await supabase
        .from('anchor_keeps')
        .delete()
        .eq('user_id', session.user.id)
        .eq('anchor_id', anchorId)
        .eq('log_date', today);
      if (error) throw error;
      console.log(`Sync Engine: Delete Keep (${anchorId}) Successful`);
    }
  } catch (error: any) {
    console.error("Sync Engine: Push Keep Error", error.message || error);
  }
}

/**
 * Pushes an individual Gather record to anchor_gathers.
 */
export async function syncPushGather(gather: { id: string; anchorId: string; label?: string; tags?: string[]; logDate?: string }) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(gather.anchorId) || !isValidUUID(gather.id)) return;
    
    const logDate = gather.logDate || new Date().toLocaleDateString('en-CA');
    
    const payload = {
      id: gather.id,
      user_id: session.user.id,
      anchor_id: gather.anchorId,
      log_date: logDate,
      label: gather.label || null,
      tags: gather.tags || []
    };
    
    const { error } = await supabase
      .from('anchor_gathers')
      .upsert(payload, { onConflict: 'id' });
      
    if (error) throw error;
    console.log(`Sync Engine: Push Gather (${gather.id}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Push Gather Error", error.message || error);
  }
}

/**
 * Deletes an individual Gather record from anchor_gathers.
 */
export async function syncDeleteGather(gatherId: string) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(gatherId)) return;
    
    const { error } = await supabase
      .from('anchor_gathers')
      .delete()
      .eq('id', gatherId)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
    console.log(`Sync Engine: Delete Gather (${gatherId}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Delete Gather Error", error.message || error);
  }
}
