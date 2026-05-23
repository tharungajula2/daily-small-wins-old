import { WebPlugin } from '@capacitor/core';
import type { TrelisLLMPlugin } from './definitions';

export class TrelisLLMWeb extends WebPlugin implements TrelisLLMPlugin {
  async initializeModel(options: { modelPath: string }): Promise<void> {
    console.log('TrelisLLM web mock: initializeModel', options);
  }

  async generateResponse(options: { prompt: string; maxTokens: number }): Promise<{ text: string }> {
    console.log('TrelisLLM web mock: generateResponse', options);
    return { text: "How can you honor your body's need for recovery today, especially after a high-demand evening?" };
  }
}
