import { useEffect, useCallback } from 'react';
import { useRitualStore } from '@/store/useRitualStore';
import { checkPermissionsGranted, fetchTodaySteps } from '@/lib/health/healthService';

/**
 * Custom hook to silently synchronize wearables (Android Health Connect)
 * data with daily movement anchors.
 */
export function useWearableSync() {
  const { anchors, toggleAnchor } = useRitualStore();

  const syncWearables = useCallback(async () => {
    try {
      const isGranted = await checkPermissionsGranted();
      if (!isGranted) {
        console.log('Trelis Wearable Sync: Health Connect permissions not granted.');
        return;
      }

      const fetchedSteps = await fetchTodaySteps();
      console.log(`Trelis Wearable Sync: Today's steps retrieved: ${fetchedSteps}`);

      // Filter active anchors for movement pillar containing the word "step" (case-insensitive)
      const stepAnchors = anchors.filter(
        (a) =>
          a.pillarId === 'movement' &&
          a.title.toLowerCase().includes('step')
      );

      for (const anchor of stepAnchors) {
        // Evaluate the threshold target:
        // Use anchor.baseline_trg if available, or dynamically parse from title as bulletproof fallback
        const regexMatch = anchor.title.match(/([\d,]+)\s*step/i);
        const parsedTarget = regexMatch ? parseInt(regexMatch[1].replace(/,/g, ''), 10) : 7000;
        const targetSteps = anchor.baseline_trg || parsedTarget;

        if (fetchedSteps >= targetSteps && !anchor.completed) {
          console.log(
            `Trelis Wearable Sync: Auto-completing anchor "${anchor.title}" (${fetchedSteps}/${targetSteps} steps)`
          );
          // Silently toggle the anchor completed
          toggleAnchor(anchor.id, true);
        }
      }
    } catch (err) {
      console.error('Trelis Wearable Sync: Error running silent background sync:', err);
    }
  }, [anchors, toggleAnchor]);

  return { syncWearables };
}
