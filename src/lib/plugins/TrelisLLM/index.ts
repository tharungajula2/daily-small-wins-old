import { registerPlugin } from '@capacitor/core';
import type { TrelisLLMPlugin } from './definitions';

const TrelisLLM = registerPlugin<TrelisLLMPlugin>('TrelisLLM', {
  web: () => import('./web').then((m) => new m.TrelisLLMWeb()),
});

export * from './definitions';
export { TrelisLLM };
