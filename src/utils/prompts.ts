export const REFLECTION_PROMPTS = [
  "What drained your energy today?",
  "What is one hard thing you avoided today?",
  "What gave you life today?",
  "If today was a chapter in your biography, what would it be titled?",
  "What made you smile or feel at peace today?",
  "Who did you feel most connected to today, and why?",
  "What is one thing you would have done differently today?",
  "What truth did you speak or realize today?",
  "What are you most proud of from the last 24 hours?"
];

export function getRandomPrompt(): string {
  const index = Math.floor(Math.random() * REFLECTION_PROMPTS.length);
  return REFLECTION_PROMPTS[index];
}
