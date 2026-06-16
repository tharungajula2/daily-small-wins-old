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

    // 4. Pull All Gathers (Historical + Today)
    const { data: anchorGathers } = await supabase
      .from('anchor_gathers')
      .select('*')
      .eq('user_id', userId);

    // 7. Pull User State
    const { data: userStateData } = await supabase
      .from('user_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // 8. Pull Journal Entries
    const { data: journalEntries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 9. Pull Todos
    const { data: todos } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 10. Pull Vault Notes
    const { data: vaultNotes } = await supabase
      .from('vault_notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    // Conflict Resolution: Local wins.
    const updates: any = {};

    if (userStateData) {
      updates.onboardingCompleted = !!userStateData.onboarding_completed;
      updates.onboardingTourCompleted = !!userStateData.onboarding_tour_completed;

      if (userStateData.is_journal_enabled !== null) updates.isJournalEnabled = userStateData.is_journal_enabled;
      if (userStateData.is_todo_enabled !== null) updates.isTodoEnabled = userStateData.is_todo_enabled;
      if (userStateData.is_vault_notes_enabled !== null) updates.isVaultNotesEnabled = userStateData.is_vault_notes_enabled;
    }

    if (journalEntries) {
      updates.journalEntries = journalEntries;
    }

    if (todos) {
      updates.todos = todos;
    }

    if (vaultNotes) {
      updates.vaultNotes = vaultNotes;
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
      const isLocalEmptyOrDefault = !localState.playlists || localState.playlists.length === 0 || (localState.playlists.length > 0 && localState.playlists[0].id.startsWith('default-'));
      if (isLocalEmptyOrDefault) {
        updates.playlists = userAnchors.map((a: any) => ({
          id: a.id,
          title: a.title,
          isPermanent: a.is_permanent || false,
          isActive: a.is_active !== false,
          gems: []
        }));
      } else {
        let localPlaylistsChanged = false;
        const mergedPlaylists = localState.playlists.map((la: any) => {
          const cloud = userAnchors.find((ca: any) => ca.id === la.id);
          if (cloud) {
            const hasIsPermanentChanged = la.isPermanent !== cloud.is_permanent;
            const hasIsActiveChanged = la.isActive !== cloud.is_active;

            if (hasIsPermanentChanged || hasIsActiveChanged) {
              localPlaylistsChanged = true;
              return {
                ...la,
                isPermanent: cloud.is_permanent !== undefined ? cloud.is_permanent : la.isPermanent,
                isActive: cloud.is_active !== undefined ? cloud.is_active : la.isActive
              };
            }
          }
          return la;
        });
        if (localPlaylistsChanged) {
          updates.playlists = mergedPlaylists;
        }
      }
    }

    // Determine Gems for each playlist
    const currentPlaylists = updates.playlists || localState.playlists || [];
    let playlistsChanged = false;
    
    const mappedPlaylists = currentPlaylists.map((playlist: any) => {
      let modified = false;
      let newPlaylist = { ...playlist };

      // 2. Resolve Gather records (anchor_gathers to gems)
      const gathersForPlaylist = anchorGathers?.filter((g: any) => g.anchor_id === playlist.id) || [];
      const currentGems = newPlaylist.gems || [];
      
      const hasGemsCountChanged = gathersForPlaylist.length !== currentGems.length;
      const hasGemsMetaChanged = !hasGemsCountChanged && 
        JSON.stringify(gathersForPlaylist.map((g: any) => g.id)) !== JSON.stringify(currentGems.map((cg: any) => cg.id));

      if (hasGemsCountChanged || hasGemsMetaChanged) {
        newPlaylist.gems = gathersForPlaylist.map((g: any) => ({
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
        playlistsChanged = true;
        return newPlaylist;
      }
      return playlist;
    });

    if (playlistsChanged) {
      updates.playlists = mappedPlaylists;
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

    const activeTodayPlaylists = (state.playlists || []).filter((a: any) => a.isActive !== false);
    const totalPersonalPlaylists = activeTodayPlaylists.length;

    const totalCount = 2; // the arc count
    const completedCount = (state.feetOnFloorLogged ? 1 : 0) + (state.eveningCheckInDone ? 1 : 0);
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
 * Pushes the full array of playlist definitions to user_anchors.
 * Uses UPSERT to ensure the cloud perfectly matches local state.
 */
export async function syncPushPlaylists(playlists: any[]) {
  const supabase = createClient();
  
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    const userId = session.user.id;
    
    // Filter out anchors with non-UUID IDs (e.g., default-a1) that haven't been synced yet
    const syncablePlaylists = playlists.filter(a => isValidUUID(a.id));
    if (syncablePlaylists.length === 0) {
      console.log("Sync Engine: No syncable playlists (all have local-only IDs).");
      return;
    }

    const payload = syncablePlaylists.map(a => ({
      id: a.id,
      user_id: userId,
      title: a.title,
      is_active: a.isActive !== false,
      is_permanent: a.isPermanent || false
    }));

    // We do a bulk upsert. Deletions from local aren't handled by upsert automatically, 
    // but this fulfills the current requirement securely.
    const { error } = await supabase
      .from('user_anchors')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    console.log("Sync Engine: Push Playlists Successful");
  } catch (error) {
    console.error("Sync Engine: Push Playlists Error", error);
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
export async function syncPushModuleStates(journal: boolean, todo: boolean, vaultNotes: boolean) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;

    const { error } = await supabase
      .from('user_state')
      .upsert({
        user_id: session.user.id,
        is_journal_enabled: journal,
        is_todo_enabled: todo,
        is_vault_notes_enabled: vaultNotes
      }, { onConflict: 'user_id' });

    if (error) throw error;
    console.log("Sync Engine: Push Module States Successful");
  } catch (error: any) {
    console.error("Sync Engine: Push Module States Error", error.message || error);
  }
}



/**
 * Pushes an individual Gem record to anchor_gathers.
 */
export async function syncPushGem(gem: { id: string; playlistId: string; label?: string; tags?: string[]; logDate?: string }) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(gem.playlistId) || !isValidUUID(gem.id)) return;
    
    const logDate = gem.logDate || new Date().toLocaleDateString('en-CA');
    
    const payload = {
      id: gem.id,
      user_id: session.user.id,
      anchor_id: gem.playlistId,
      log_date: logDate,
      label: gem.label || null,
      tags: gem.tags || []
    };
    
    const { error } = await supabase
      .from('anchor_gathers')
      .upsert(payload, { onConflict: 'id' });
      
    if (error) throw error;
    console.log(`Sync Engine: Push Gem (${gem.id}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Push Gem Error", error.message || error);
  }
}

/**
 * Deletes an individual Gem record from anchor_gathers.
 */
export async function syncDeleteGem(gemId: string) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(gemId)) return;
    
    const { error } = await supabase
      .from('anchor_gathers')
      .delete()
      .eq('id', gemId)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
    console.log(`Sync Engine: Delete Gem (${gemId}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Delete Gem Error", error.message || error);
  }
}

/**
 * Pushes a single journal entry to Supabase.
 */
export async function syncPushJournalEntry(entry: any) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(entry.id)) return;
    
    const payload = {
      id: entry.id,
      user_id: session.user.id,
      content: entry.content,
      word_count: entry.word_count,
      created_at: entry.created_at || new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('journal_entries')
      .upsert(payload, { onConflict: 'id' });
      
    if (error) throw error;
    console.log(`Sync Engine: Push Journal Entry (${entry.id}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Push Journal Entry Error", error.message || error);
  }
}

/**
 * Pushes a single todo to Supabase.
 */
export async function syncPushTodo(todo: any) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(todo.id)) return;
    
    const payload = {
      id: todo.id,
      user_id: session.user.id,
      task: todo.task,
      is_completed: todo.is_completed,
      created_at: todo.created_at || new Date().toISOString(),
      completed_at: todo.completed_at || null
    };
    
    const { error } = await supabase
      .from('todos')
      .upsert(payload, { onConflict: 'id' });
      
    if (error) throw error;
    console.log(`Sync Engine: Push Todo (${todo.id}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Push Todo Error", error.message || error);
  }
}

/**
 * Deletes an individual Todo record from Supabase.
 */
export async function syncDeleteTodo(todoId: string) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(todoId)) return;
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
    console.log(`Sync Engine: Delete Todo (${todoId}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Delete Todo Error", error.message || error);
  }
}

/**
 * Pushes a single vault note to Supabase.
 */
export async function syncPushVaultNote(note: any) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(note.id)) return;
    
    const payload = {
      id: note.id,
      user_id: session.user.id,
      title: note.title || null,
      content: note.content,
      created_at: note.created_at || new Date().toISOString(),
      updated_at: note.updated_at || new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('vault_notes')
      .upsert(payload, { onConflict: 'id' });
      
    if (error) throw error;
    console.log(`Sync Engine: Push Vault Note (${note.id}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Push Vault Note Error", error.message || error);
  }
}

/**
 * Deletes an individual Vault Note record from Supabase.
 */
export async function syncDeleteVaultNote(noteId: string) {
  const supabase = createClient();
  try {
    const { data: { session }, error: sessionError } = await getSessionWithTimeout(supabase);
    if (sessionError) throw sessionError;
    if (!session?.user) return;
    
    if (!isValidUUID(noteId)) return;
    
    const { error } = await supabase
      .from('vault_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', session.user.id);
      
    if (error) throw error;
    console.log(`Sync Engine: Delete Vault Note (${noteId}) Successful`);
  } catch (error: any) {
    console.error("Sync Engine: Delete Vault Note Error", error.message || error);
  }
}
