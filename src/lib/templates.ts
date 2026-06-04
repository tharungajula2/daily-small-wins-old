export interface Template {
  key: string;
  title: string;
  keepDefinition: string;
  exampleGathers: string[];
  suggestedCodenames: string[];
}

export const PUBLIC_TEMPLATES: Template[] = [
  {
    key: 'breaking-loops',
    title: 'Breaking Loops',
    keepDefinition: 'I did one uncomfortable thing today.',
    exampleGathers: ['said no', 'hard conversation', 'cold shower', 'did the scary task'],
    suggestedCodenames: ['Operation Daybreak', 'Clean Signal', 'The Climb']
  },
  {
    key: 'body-mind',
    title: 'Body-Mind',
    keepDefinition: 'I tended my body or mind once today.',
    exampleGathers: ['walked', 'real meal', 'breathwork', 'sunlight', 'stretched'],
    suggestedCodenames: ['Quiet Engine', 'Base Camp', 'The Long Game']
  },
  {
    key: 'stillness',
    title: 'Stillness',
    keepDefinition: 'I took one real pause today.',
    exampleGathers: ['5-min sit', 'NSDR', 'just breathed', 'did nothing on purpose'],
    suggestedCodenames: ['Deep Current', 'Nightfall']
  },
  {
    key: 'reset',
    title: 'Reset',
    keepDefinition: 'I channeled the energy into something real today.',
    exampleGathers: ['long walk', 'drive', 'built something', 'cooked', 'workout', 'read my why'],
    suggestedCodenames: ['Base Camp', 'The Long Game', 'Quiet Engine', 'Deep Current']
  }
];
