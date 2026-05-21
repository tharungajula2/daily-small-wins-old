/**
 * Hardened Local Day Matcher for Trelis Life.
 * Maps standard JS weekday numeric indexes safely to our frequency string schema.
 * Sunday is strictly 0 ('Sun'), Monday is strictly 1 ('Mon'), etc.
 * Uses local device time directly to avoid GMT/UTC off-by-one timezone errors.
 */
export const getLocalDayString = (date: Date = new Date()): string => {
  const dayIndex = date.getDay(); // 0 (Sun) to 6 (Sat)
  const dayMap: Record<number, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
  };
  return dayMap[dayIndex] || 'all';
};

/**
 * Validates if an anchor's frequency array matches the current local day.
 */
export const isAnchorActiveForDay = (frequency?: string[], date: Date = new Date()): boolean => {
  if (!frequency || frequency.length === 0 || frequency.includes('all') || frequency.includes('All')) {
    return true;
  }
  const localDayStr = getLocalDayString(date);
  return frequency.includes(localDayStr);
};
