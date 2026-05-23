export interface TrelisLLMPlugin {
  initializeModel(options: { modelPath: string }): Promise<void>;
  generateResponse(options: { prompt: string; maxTokens: number }): Promise<{ text: string }>;
}


