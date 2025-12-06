// Tutorial and Help System for the game

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for highlighting
  action?: 'click' | 'wait' | 'info';
  nextCondition?: 'manual' | 'resource' | 'building' | 'research';
  conditionValue?: string | number;
}

export interface HelpTopic {
  id: string;
  icon: string;
  title: string;
  content: string;
  tips?: string[];
}

// Tutorial steps for new players
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Incremental Civ Builder!',
    description: 'Build your civilization from the Stone Age to the Future! This tutorial will guide you through the basics. Click "Next" to continue.',
    action: 'info',
    nextCondition: 'manual',
  },
  {
    id: 'resources_intro',
    title: 'Understanding Resources',
    description: 'Your civilization needs resources to grow. Look at the resource bar above - you have Food 🍖, Wood 🪵, Stone 🪨, Gold 💰, and Science 🔬. These are essential for everything!',
    targetElement: '.resources-bar',
    action: 'info',
    nextCondition: 'manual',
  },
  {
    id: 'gather_resources',
    title: 'Gathering Resources',
    description: 'Click the "Gather Food", "Gather Wood", or "Gather Stone" buttons to manually collect resources. Try gathering some food now!',
    targetElement: '.gather-buttons',
    action: 'click',
    nextCondition: 'resource',
    conditionValue: 'food',
  },
  {
    id: 'buildings_intro',
    title: 'Building Your First Structure',
    description: 'Buildings produce resources automatically over time. Go to the Buildings tab to construct your first Hut, which produces food passively.',
    targetElement: '[data-tab="buildings"]',
    action: 'click',
    nextCondition: 'manual',
  },
  {
    id: 'research_intro',
    title: 'Research Technologies',
    description: 'Research new technologies to unlock buildings, troops, and advance through eras. Visit the Research tab to see available technologies.',
    targetElement: '[data-tab="research"]',
    action: 'click',
    nextCondition: 'manual',
  },
  {
    id: 'barracks_intro',
    title: 'Training Troops',
    description: 'The Barracks allows you to train troops for combat. Research military technologies to unlock different unit types.',
    targetElement: '[data-tab="barracks"]',
    action: 'info',
    nextCondition: 'manual',
  },
  {
    id: 'combat_intro',
    title: 'Combat & Conquest',
    description: 'Use your army to complete missions and conquer territories. Conquering territories gives you permanent bonuses!',
    targetElement: '[data-tab="combat"]',
    action: 'info',
    nextCondition: 'manual',
  },
  {
    id: 'world_intro',
    title: 'World & Civilization',
    description: 'Choose a civilization and leader for unique bonuses. Found a religion and adopt cultural policies to customize your playstyle.',
    targetElement: '[data-tab="world"]',
    action: 'info',
    nextCondition: 'manual',
  },
  {
    id: 'save_game',
    title: 'Save Your Progress',
    description: 'Don\'t forget to save your game! Use the Save button at the bottom of the screen. The game also auto-saves every 30 seconds.',
    targetElement: '#save-game',
    action: 'info',
    nextCondition: 'manual',
  },
  {
    id: 'tutorial_complete',
    title: 'Tutorial Complete!',
    description: 'You now know the basics! Explore all the tabs and features to discover more. Good luck building your civilization! Visit the Help tab anytime if you need more information.',
    action: 'info',
    nextCondition: 'manual',
  },
];

// Help topics with detailed information
export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'getting_started',
    icon: '🚀',
    title: 'Getting Started',
    content: 'Welcome to Incremental Civ Builder! Your goal is to advance your civilization from the Stone Age to the Future by gathering resources, building structures, researching technologies, and conquering territories.',
    tips: [
      'Start by gathering resources manually using the gather buttons',
      'Build structures to generate resources automatically',
      'Research technologies to unlock new features and advance eras',
      'Save your game regularly to preserve your progress',
    ],
  },
  {
    id: 'resources',
    icon: '📦',
    title: 'Resources',
    content: 'There are 5 main resources in the game:\n\n🍖 Food - Used for training troops and sustaining your population\n🪵 Wood - Essential for construction and some units\n🪨 Stone - Required for advanced buildings and defenses\n💰 Gold - Universal currency for various purchases\n🔬 Science - Used to research new technologies',
    tips: [
      'Each era increases your base resource generation rate',
      'Buildings provide passive resource income',
      'Conquered territories give permanent resource bonuses',
      'Some civilizations and policies boost specific resources',
    ],
  },
  {
    id: 'buildings',
    icon: '🏗️',
    title: 'Buildings',
    content: 'Buildings automatically generate resources over time. Each building type has:\n• A production rate (resources per second)\n• A construction cost\n• A build time\n• A maximum count\n\nResearch technologies to unlock new building types.',
    tips: [
      'Focus on food production early to train troops',
      'Libraries and Universities boost science generation',
      'Each building can be built multiple times up to its max limit',
      'Higher era buildings are more efficient but cost more',
    ],
  },
  {
    id: 'research',
    icon: '🔬',
    title: 'Research & Technology',
    content: 'Technologies unlock new features, buildings, and troops. Research requires science points and takes time to complete. Only one technology can be researched at a time.\n\nAdvancing to new eras unlocks more powerful technologies.',
    tips: [
      'Prioritize technologies that unlock troops for combat',
      'Building-unlocking techs help passive resource generation',
      'Some technologies provide direct resource multipliers',
      'Complete all era requirements to advance to the next age',
    ],
  },
  {
    id: 'military',
    icon: '⚔️',
    title: 'Military & Combat',
    content: 'Train troops in the Barracks to build your army. Each troop type has Attack, Defense, and Health stats.\n\nUse your army in two modes:\n• Missions - Fight enemies for rewards\n• Conquest - Capture territories for permanent bonuses',
    tips: [
      'Balance different troop types for a versatile army',
      'Check difficulty ratings before starting battles',
      'Winning battles may cause casualties - rebuild your army',
      'Formations and Heroes boost your army\'s effectiveness',
    ],
  },
  {
    id: 'conquest',
    icon: '🏰',
    title: 'Conquest & Territories',
    content: 'Conquer territories to gain permanent bonuses. Each territory provides:\n• Flat resource bonuses (e.g., +2 food/s)\n• Resource multipliers (e.g., ×1.1 gold)\n\nTerritories remain conquered even after refreshing the page.',
    tips: [
      'Easier territories have smaller armies but lower rewards',
      'Multiplier bonuses stack with all other bonuses',
      'Plan your conquests based on resources you need most',
      'Build up a strong army before tackling harder territories',
    ],
  },
  {
    id: 'civilizations',
    icon: '🌍',
    title: 'Civilizations & Leaders',
    content: 'Choose a civilization for unique bonuses and playstyles. Each civilization has:\n• Resource multipliers\n• Military bonuses\n• Special abilities\n\nLeaders provide additional bonuses and unlock as you progress.',
    tips: [
      'Egyptians excel at building and resource production',
      'Romans have strong military bonuses',
      'Greeks boost science and research',
      'Choose a leader that complements your strategy',
    ],
  },
  {
    id: 'religion_culture',
    icon: '🙏',
    title: 'Religion & Culture',
    content: 'Found a religion for permanent bonuses. Only one religion can be founded per game.\n\nCultural policies are purchased with culture points (earned passively). Policies provide various bonuses but cannot be un-adopted.',
    tips: [
      'Different religions suit different playstyles',
      'Culture points accumulate over time automatically',
      'Some policies have prerequisites',
      'Plan your policy path for maximum benefit',
    ],
  },
  {
    id: 'skills',
    icon: '🌟',
    title: 'Skills & Legacy',
    content: 'Legacy points are earned through achievements and milestones. Spend them on permanent skills that persist across games.\n\nSkills provide:\n• Resource multipliers\n• Military bonuses\n• Starting resources\n• Special abilities',
    tips: [
      'Complete milestones to earn legacy points',
      'Some skills have prerequisites',
      'Skills are permanent and don\'t reset',
      'Plan your skill tree based on your playstyle',
    ],
  },
  {
    id: 'advanced_military',
    icon: '🎖️',
    title: 'Advanced Military',
    content: 'The Military tab offers advanced combat features:\n\n⚔️ Formations - Change how your army fights\n👑 Heroes - Recruit leaders with special abilities\n🏰 Defense - Build fortifications\n⚓ Naval Forces - Build a fleet\n💣 Siege Weapons - Breach enemy defenses\n🕵️ Espionage - Send spies on missions',
    tips: [
      'Formations can turn the tide of difficult battles',
      'Only one hero can be active at a time',
      'Defense structures help in territory defense',
      'Unlock advanced features through research',
    ],
  },
  {
    id: 'achievements',
    icon: '🏆',
    title: 'Achievements',
    content: 'Complete achievements by reaching various milestones. Achievements track:\n• Resources gathered\n• Technologies researched\n• Battles won\n• Territories conquered\n• Buildings constructed\n\nSome achievements provide bonus rewards!',
    tips: [
      'Check the Achievements tab to see your progress',
      'Achievement rewards include resource multipliers',
      'Some achievements are hidden until completed',
      'Achievements are saved with your game',
    ],
  },
  {
    id: 'tips_tricks',
    icon: '💡',
    title: 'Tips & Tricks',
    content: 'Here are some advanced strategies to maximize your progress:',
    tips: [
      'Leave the game running to accumulate offline resources (requires Cloud Computing tech)',
      'The game auto-saves every 30 seconds',
      'Use keyboard shortcuts: dark/light theme toggle is in top-right corner',
      'Hover over elements for detailed tooltips',
      'Balance between military power and economic growth',
      'Prioritize science early to unlock more options',
      'Complete easier missions before harder ones',
      'Check territory bonuses to plan conquests strategically',
    ],
  },
];

// Tutorial state management
export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  completed: boolean;
  skipped: boolean;
}

export function createInitialTutorialState(): TutorialState {
  return {
    isActive: false,
    currentStep: 0,
    completed: false,
    skipped: false,
  };
}

export function getCurrentTutorialStep(state: TutorialState): TutorialStep | null {
  if (!state.isActive || state.completed || state.skipped) {
    return null;
  }
  return TUTORIAL_STEPS[state.currentStep] || null;
}

export function advanceTutorialStep(state: TutorialState): TutorialState {
  if (state.currentStep >= TUTORIAL_STEPS.length - 1) {
    return {
      ...state,
      isActive: false,
      completed: true,
    };
  }
  return {
    ...state,
    currentStep: state.currentStep + 1,
  };
}

export function skipTutorial(state: TutorialState): TutorialState {
  return {
    ...state,
    isActive: false,
    skipped: true,
  };
}

export function startTutorial(state: TutorialState): TutorialState {
  return {
    isActive: true,
    currentStep: 0,
    completed: false,
    skipped: false,
  };
}

export function getHelpTopicById(id: string): HelpTopic | undefined {
  return HELP_TOPICS.find(topic => topic.id === id);
}
