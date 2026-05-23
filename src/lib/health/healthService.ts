import { Health } from '@capgo/capacitor-health';
import { Capacitor } from '@capacitor/core';

/**
 * Checks if native Health Connect is available on the device and requests
 * READ_STEPS and READ_SLEEP permissions if they have not been granted.
 * Supports clean Web fallback.
 */
export async function checkAndRequestPermissions(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Trelis Health Web: Permission simulated as granted.');
    return true;
  }

  try {
    const { available } = await Health.isAvailable();
    if (!available) {
      console.warn('Trelis Health: Health Connect is not available on this device.');
      return false;
    }

    // Check existing authorization status
    const status = await Health.checkAuthorization({
      read: ['steps', 'sleep'],
    });

    const stepsAuthorized = status.readAuthorized.includes('steps');
    const sleepAuthorized = status.readAuthorized.includes('sleep');

    if (stepsAuthorized && sleepAuthorized) {
      return true;
    }

    // Request permissions
    const requestStatus = await Health.requestAuthorization({
      read: ['steps', 'sleep'],
    });

    return (
      requestStatus.readAuthorized.includes('steps') &&
      requestStatus.readAuthorized.includes('sleep')
    );
  } catch (err) {
    console.error('Trelis Health: Error checking/requesting permissions:', err);
    return false;
  }
}

/**
 * Checks if Health Connect permissions are already granted without prompting the user.
 */
export async function checkPermissionsGranted(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return true;
  }

  try {
    const { available } = await Health.isAvailable();
    if (!available) return false;

    const status = await Health.checkAuthorization({
      read: ['steps', 'sleep'],
    });

    return (
      status.readAuthorized.includes('steps') &&
      status.readAuthorized.includes('sleep')
    );
  } catch (err) {
    console.error('Trelis Health: Error checking permission status:', err);
    return false;
  }
}

/**
 * Queries Health Connect for the current local day's step count aggregate.
 * Returns the numeric step count or 0.
 */
export async function fetchTodaySteps(): Promise<number> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Trelis Health Web: Mocking step data (7432 steps).');
    return 7432;
  }

  try {
    const { available } = await Health.isAvailable();
    if (!available) return 0;

    // Get permission status first to avoid silent failures
    const authorized = await checkPermissionsGranted();
    if (!authorized) return 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();

    const result = await Health.queryAggregated({
      dataType: 'steps',
      startDate: todayStart.toISOString(),
      endDate: todayEnd.toISOString(),
      bucket: 'day',
      aggregation: 'sum',
    });

    if (result.samples && result.samples.length > 0) {
      // Find the aggregated steps value
      const totalSteps = result.samples.reduce((acc, sample) => acc + sample.value, 0);
      return Math.round(totalSteps);
    }

    return 0;
  } catch (err) {
    console.error('Trelis Health: Error fetching today steps:', err);
    return 0;
  }
}
