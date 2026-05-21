export interface StarterAnchor {
  title: string;
  pillarId: 'nutrition' | 'movement' | 'sleep' | 'stress_mental' | 'social' | 'environment';
  type: 'action' | 'reflection';
  prompt?: string;
  baselineTitle?: string;
  baselineTarget?: number;
}

export const defaultStarterAnchors: StarterAnchor[] = [
  {
    title: 'Drink 2.5L water today',
    pillarId: 'nutrition',
    type: 'action',
    baselineTitle: '1 glass',
    baselineTarget: 5
  },
  {
    title: '30g protein at 2+ meals',
    pillarId: 'nutrition',
    type: 'action',
    baselineTitle: '1 meal',
    baselineTarget: 2
  },
  {
    title: '7,000 steps',
    pillarId: 'movement',
    type: 'action',
    baselineTitle: '3,000 steps',
    baselineTarget: 7000
  },
  {
    title: '20-8-2 desk rule (8 cycles)',
    pillarId: 'movement',
    type: 'action',
    baselineTitle: '4 cycles',
    baselineTarget: 8
  },
  {
    title: 'In bed by 23:00 (8-hour opportunity)',
    pillarId: 'sleep',
    type: 'action',
    baselineTitle: 'In bed by 23:30'
  },
  {
    title: 'Evening Reflection',
    pillarId: 'stress_mental',
    type: 'reflection',
    prompt: "Three lines: win, drain, tomorrow's priority."
  },
  {
    title: 'One real conversation today',
    pillarId: 'social',
    type: 'action'
  },
  {
    title: '10 minutes of sunlight',
    pillarId: 'environment',
    type: 'action',
    baselineTitle: 'Sit by window'
  }
];
