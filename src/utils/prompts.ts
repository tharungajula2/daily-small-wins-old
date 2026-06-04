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

export const MORNING_TAP_LINES = [
  "I'm here. Let's begin.",
  "Still here. Still building.",
  "One promise today.",
  "I showed up.",
  "Day one, again.",
  "I'm here. Still breathing."
];

export const MORNING_INTENTIONS = [
  "I am building the structure for a better life.",
  "I keep my word to myself today.",
  "Small, steady, unbreakable.",
  "I do the next right thing.",
  "Calm body, clear mind, one step."
];

export const ANCHOR_NAME_SUGGESTIONS = [
  "Breaking Loops",
  "Body-Mind",
  "Stillness",
  "Reset",
  "Move",
  "Read",
  "Connect",
  "Create",
  "Rest"
];

export const MISSION_CODENAMES = [
  "Operation Daybreak",
  "The Long Game",
  "Nightfall",
  "Clean Signal",
  "Base Camp",
  "The Climb",
  "Deep Current",
  "Quiet Engine"
];

export const KEEP_DEFINITION_SUGGESTIONS = [
  "I did one uncomfortable thing today.",
  "I tended my body or mind once today.",
  "I took one real pause today.",
  "I channeled the energy into something real today.",
  "I completed one focused block of work.",
  "I drank water first thing in the morning."
];


