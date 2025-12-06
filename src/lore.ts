// World & Lore system - Civilizations, Leaders, Natural Wonders, Religions, and Cultural Influence

// ===== Civilization System =====
export interface Civilization {
  id: string;
  name: string;
  description: string;
  icon: string;
  bonuses: {
    resourceMultipliers?: {
      food?: number;
      wood?: number;
      stone?: number;
      gold?: number;
      science?: number;
    };
    militaryBonuses?: {
      attack?: number;
      defense?: number;
      health?: number;
    };
    specialAbility?: string;
  };
  startingResources?: {
    food?: number;
    wood?: number;
    stone?: number;
    gold?: number;
    science?: number;
  };
  uniqueUnit?: string;
}

export const CIVILIZATIONS: Civilization[] = [
  {
    id: 'default',
    name: 'Settlers',
    description: 'A balanced civilization with no special bonuses. Perfect for learning the game.',
    icon: '🏠',
    bonuses: {},
    startingResources: { food: 0, wood: 0, stone: 0, gold: 0, science: 0 },
  },
  {
    id: 'roman',
    name: 'Roman Empire',
    description: 'Master builders and soldiers. Bonus to stone and military defense.',
    icon: '🏛️',
    bonuses: {
      resourceMultipliers: { stone: 1.25 },
      militaryBonuses: { defense: 1.15 },
      specialAbility: 'Roads: Buildings complete 20% faster',
    },
    startingResources: { food: 50, wood: 30, stone: 100, gold: 50, science: 20 },
    uniqueUnit: 'legionary',
  },
  {
    id: 'egyptian',
    name: 'Egyptian Kingdom',
    description: 'Ancient wisdom and monumental builders. Bonus to science and gold.',
    icon: '🔺',
    bonuses: {
      resourceMultipliers: { gold: 1.2, science: 1.15 },
      specialAbility: 'Nile Flooding: +50% food from conquered territories',
    },
    startingResources: { food: 80, wood: 20, stone: 50, gold: 100, science: 50 },
  },
  {
    id: 'chinese',
    name: 'Chinese Dynasty',
    description: 'Ancient and wise civilization. Bonus to science and food production.',
    icon: '🐉',
    bonuses: {
      resourceMultipliers: { food: 1.2, science: 1.2 },
      specialAbility: 'Paper Money: Research costs reduced by 10%',
    },
    startingResources: { food: 100, wood: 40, stone: 30, gold: 60, science: 100 },
  },
  {
    id: 'viking',
    name: 'Viking Clans',
    description: 'Fierce warriors and explorers. Bonus to military attack and wood.',
    icon: '⚔️',
    bonuses: {
      resourceMultipliers: { wood: 1.3 },
      militaryBonuses: { attack: 1.2 },
      specialAbility: 'Berserker: +25% damage when health below 50%',
    },
    startingResources: { food: 60, wood: 150, stone: 30, gold: 30, science: 20 },
  },
  {
    id: 'greek',
    name: 'Greek City-States',
    description: 'Birthplace of democracy and philosophy. Major bonus to science.',
    icon: '🏺',
    bonuses: {
      resourceMultipliers: { science: 1.35 },
      specialAbility: 'Philosophy: +1 free technology at game start',
    },
    startingResources: { food: 40, wood: 30, stone: 60, gold: 80, science: 150 },
  },
  {
    id: 'persian',
    name: 'Persian Empire',
    description: 'Vast empire of wealth and trade. Bonus to gold and all resources.',
    icon: '👑',
    bonuses: {
      resourceMultipliers: { food: 1.1, wood: 1.1, stone: 1.1, gold: 1.3, science: 1.1 },
      specialAbility: 'Satrapies: Conquered territories give 50% more bonuses',
    },
    startingResources: { food: 70, wood: 70, stone: 70, gold: 200, science: 70 },
  },
  {
    id: 'japanese',
    name: 'Japanese Shogunate',
    description: 'Honor-bound warriors with refined culture. Balanced military bonuses.',
    icon: '🗾',
    bonuses: {
      militaryBonuses: { attack: 1.1, defense: 1.1, health: 1.1 },
      specialAbility: 'Bushido: Troops deal 30% more damage on first combat round',
    },
    startingResources: { food: 60, wood: 80, stone: 40, gold: 70, science: 50 },
  },
];

// ===== Historical Leaders System =====
export interface Leader {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  civilizationId: string; // Can be 'any' for universal leaders
  era: string; // Era when this leader becomes available
  bonuses: {
    resourceMultipliers?: {
      food?: number;
      wood?: number;
      stone?: number;
      gold?: number;
      science?: number;
    };
    militaryBonuses?: {
      attack?: number;
      defense?: number;
      health?: number;
    };
    specialAbility: string;
  };
}

export const LEADERS: Leader[] = [
  // Universal Leaders (any civilization)
  {
    id: 'tribal_chief',
    name: 'Tribal Chief',
    title: 'Chieftain',
    description: 'A wise leader who guides their people through the earliest times.',
    icon: '👤',
    civilizationId: 'any',
    era: 'stone_age',
    bonuses: {
      resourceMultipliers: { food: 1.1 },
      specialAbility: 'Unity: +10% to all resource gathering',
    },
  },
  {
    id: 'julius_caesar',
    name: 'Julius Caesar',
    title: 'Dictator',
    description: 'The legendary Roman leader who conquered Gaul and transformed the Republic.',
    icon: '🦅',
    civilizationId: 'roman',
    era: 'iron_age',
    bonuses: {
      militaryBonuses: { attack: 1.25, defense: 1.15 },
      specialAbility: 'Veni Vidi Vici: Conquests grant 50% more rewards',
    },
  },
  {
    id: 'cleopatra',
    name: 'Cleopatra VII',
    title: 'Pharaoh',
    description: 'The last active ruler of the Ptolemaic Kingdom of Egypt.',
    icon: '🐍',
    civilizationId: 'egyptian',
    era: 'classical_age',
    bonuses: {
      resourceMultipliers: { gold: 1.3, science: 1.2 },
      specialAbility: 'Diplomatic Charm: Trade routes generate 30% more gold',
    },
  },
  {
    id: 'qin_shi_huang',
    name: 'Qin Shi Huang',
    title: 'First Emperor',
    description: 'The founder of the Qin dynasty and first emperor of unified China.',
    icon: '🏯',
    civilizationId: 'chinese',
    era: 'iron_age',
    bonuses: {
      resourceMultipliers: { stone: 1.3, science: 1.15 },
      specialAbility: 'Great Wall: Defensive buildings cost 25% less',
    },
  },
  {
    id: 'ragnar_lothbrok',
    name: 'Ragnar Lothbrok',
    title: 'King',
    description: 'Legendary Norse hero and Viking king.',
    icon: '🪓',
    civilizationId: 'viking',
    era: 'medieval_age',
    bonuses: {
      militaryBonuses: { attack: 1.35, health: 1.1 },
      specialAbility: 'Raid: Combat victories grant bonus resources',
    },
  },
  {
    id: 'alexander',
    name: 'Alexander the Great',
    title: 'King of Macedon',
    description: 'One of history\'s greatest military commanders who created one of the largest empires.',
    icon: '🐴',
    civilizationId: 'greek',
    era: 'classical_age',
    bonuses: {
      militaryBonuses: { attack: 1.3, defense: 1.1 },
      resourceMultipliers: { science: 1.15 },
      specialAbility: 'Conquest: Conquered territories provide double bonuses for 5 minutes',
    },
  },
  {
    id: 'cyrus',
    name: 'Cyrus the Great',
    title: 'King of Kings',
    description: 'Founder of the Achaemenid Empire, the first Persian Empire.',
    icon: '🦁',
    civilizationId: 'persian',
    era: 'iron_age',
    bonuses: {
      resourceMultipliers: { gold: 1.25, food: 1.15 },
      specialAbility: 'Tolerance: Conquered territories take 50% less time to pacify',
    },
  },
  {
    id: 'oda_nobunaga',
    name: 'Oda Nobunaga',
    title: 'Daimyo',
    description: 'The great unifier who initiated the unification of Japan.',
    icon: '⚔️',
    civilizationId: 'japanese',
    era: 'medieval_age',
    bonuses: {
      militaryBonuses: { attack: 1.2, defense: 1.15 },
      resourceMultipliers: { gold: 1.15 },
      specialAbility: 'Innovation: Gunpowder units cost 20% less',
    },
  },
  // More universal leaders for later eras
  {
    id: 'industrial_tycoon',
    name: 'Industrial Tycoon',
    title: 'Magnate',
    description: 'A captain of industry who revolutionizes production.',
    icon: '🏭',
    civilizationId: 'any',
    era: 'industrial_age',
    bonuses: {
      resourceMultipliers: { gold: 1.4, wood: 1.2, stone: 1.2 },
      specialAbility: 'Mass Production: Buildings produce 25% more resources',
    },
  },
  {
    id: 'tech_visionary',
    name: 'Tech Visionary',
    title: 'CEO',
    description: 'A forward-thinking leader who embraces technological advancement.',
    icon: '💡',
    civilizationId: 'any',
    era: 'information_age',
    bonuses: {
      resourceMultipliers: { science: 1.5 },
      specialAbility: 'Innovation: Research completes 20% faster',
    },
  },
];

// ===== Natural Wonders System =====
export interface NaturalWonder {
  id: string;
  name: string;
  description: string;
  icon: string;
  era: string; // Era when this wonder can be discovered
  discoveryChance: number; // Base chance to discover (0-1)
  discovered: boolean;
  bonuses: {
    flatBonuses?: Array<{ resource: string; amount: number }>;
    resourceMultiplier?: { resource: string; multiplier: number };
    specialEffect?: string;
  };
}

export const NATURAL_WONDERS: NaturalWonder[] = [
  {
    id: 'grand_canyon',
    name: 'Grand Canyon',
    description: 'A steep-sided canyon carved by the Colorado River. Its grandeur inspires your people.',
    icon: '🏜️',
    era: 'stone_age',
    discoveryChance: 0.15,
    discovered: false,
    bonuses: {
      flatBonuses: [{ resource: 'science', amount: 2 }],
      specialEffect: 'Inspires exploration and discovery',
    },
  },
  {
    id: 'mount_everest',
    name: 'Mount Everest',
    description: 'The highest mountain in the world. Its presence strengthens your people\'s resolve.',
    icon: '🏔️',
    era: 'stone_age',
    discoveryChance: 0.1,
    discovered: false,
    bonuses: {
      resourceMultiplier: { resource: 'stone', multiplier: 1.2 },
      specialEffect: 'Military units gain +10% health',
    },
  },
  {
    id: 'great_barrier_reef',
    name: 'Great Barrier Reef',
    description: 'The world\'s largest coral reef system. Its bounty feeds your people.',
    icon: '🐠',
    era: 'bronze_age',
    discoveryChance: 0.12,
    discovered: false,
    bonuses: {
      flatBonuses: [{ resource: 'food', amount: 5 }],
      specialEffect: 'Coastal buildings produce 20% more',
    },
  },
  {
    id: 'amazon_rainforest',
    name: 'Amazon Rainforest',
    description: 'The largest tropical rainforest. An endless source of wood and discovery.',
    icon: '🌳',
    era: 'bronze_age',
    discoveryChance: 0.15,
    discovered: false,
    bonuses: {
      flatBonuses: [{ resource: 'wood', amount: 5 }],
      resourceMultiplier: { resource: 'science', multiplier: 1.1 },
    },
  },
  {
    id: 'sahara_oasis',
    name: 'Sahara Oasis',
    description: 'A hidden paradise in the desert. Trading caravans gather here.',
    icon: '🏝️',
    era: 'iron_age',
    discoveryChance: 0.1,
    discovered: false,
    bonuses: {
      flatBonuses: [{ resource: 'gold', amount: 8 }],
      specialEffect: 'Trade income increased by 15%',
    },
  },
  {
    id: 'victoria_falls',
    name: 'Victoria Falls',
    description: 'One of the largest waterfalls in the world. Its power is awe-inspiring.',
    icon: '💧',
    era: 'classical_age',
    discoveryChance: 0.12,
    discovered: false,
    bonuses: {
      flatBonuses: [
        { resource: 'food', amount: 8 },
        { resource: 'science', amount: 3 },
      ],
    },
  },
  {
    id: 'northern_lights',
    name: 'Northern Lights',
    description: 'The spectacular aurora borealis. Its mystery drives scientific inquiry.',
    icon: '🌌',
    era: 'medieval_age',
    discoveryChance: 0.08,
    discovered: false,
    bonuses: {
      resourceMultiplier: { resource: 'science', multiplier: 1.25 },
      specialEffect: 'Happiness increased by 10%',
    },
  },
  {
    id: 'dead_sea',
    name: 'Dead Sea',
    description: 'The saltiest body of water on Earth. Rich in minerals and trade goods.',
    icon: '🌊',
    era: 'classical_age',
    discoveryChance: 0.12,
    discovered: false,
    bonuses: {
      flatBonuses: [
        { resource: 'gold', amount: 10 },
        { resource: 'stone', amount: 5 },
      ],
    },
  },
  {
    id: 'krakatoa',
    name: 'Krakatoa',
    description: 'A volcanic island between Java and Sumatra. Dangerous but fertile.',
    icon: '🌋',
    era: 'renaissance',
    discoveryChance: 0.08,
    discovered: false,
    bonuses: {
      flatBonuses: [
        { resource: 'food', amount: 15 },
        { resource: 'stone', amount: 10 },
      ],
      specialEffect: 'Chance to cause disasters but also windfalls',
    },
  },
  {
    id: 'el_dorado',
    name: 'El Dorado',
    description: 'The legendary city of gold! Its treasures are beyond imagination.',
    icon: '🏰',
    era: 'renaissance',
    discoveryChance: 0.05,
    discovered: false,
    bonuses: {
      flatBonuses: [{ resource: 'gold', amount: 50 }],
      specialEffect: 'One-time bonus of 5000 gold upon discovery',
    },
  },
];

// ===== Religion System =====
export interface Religion {
  id: string;
  name: string;
  description: string;
  icon: string;
  founded: boolean;
  followers: number; // Number of followers (affects strength)
  bonuses: {
    resourceMultipliers?: {
      food?: number;
      wood?: number;
      stone?: number;
      gold?: number;
      science?: number;
    };
    militaryBonuses?: {
      attack?: number;
      defense?: number;
      morale?: number;
    };
    specialAbility: string;
  };
}

export const RELIGION_TEMPLATES: Omit<Religion, 'founded' | 'followers'>[] = [
  {
    id: 'ancestor_worship',
    name: 'Ancestor Worship',
    description: 'Honor the spirits of ancestors who guide and protect.',
    icon: '👻',
    bonuses: {
      resourceMultipliers: { food: 1.15 },
      militaryBonuses: { morale: 1.2 },
      specialAbility: 'Ancestral Guidance: +15% to all production during peaceful times',
    },
  },
  {
    id: 'sun_worship',
    name: 'Solar Faith',
    description: 'Worship of the life-giving sun.',
    icon: '☀️',
    bonuses: {
      resourceMultipliers: { food: 1.2, gold: 1.1 },
      specialAbility: 'Solar Blessing: Farms and gold production boosted during day',
    },
  },
  {
    id: 'earth_mother',
    name: 'Earth Mother Cult',
    description: 'Veneration of the earth and its bounty.',
    icon: '🌍',
    bonuses: {
      resourceMultipliers: { food: 1.15, stone: 1.15, wood: 1.15 },
      specialAbility: 'Nature\'s Bounty: Natural resources regenerate faster',
    },
  },
  {
    id: 'war_god',
    name: 'War God Devotion',
    description: 'Worship of a deity of battle and victory.',
    icon: '⚔️',
    bonuses: {
      militaryBonuses: { attack: 1.25, morale: 1.15 },
      specialAbility: 'Battle Fury: +25% attack power in combat',
    },
  },
  {
    id: 'wisdom_path',
    name: 'Path of Wisdom',
    description: 'A philosophical tradition emphasizing knowledge and enlightenment.',
    icon: '📜',
    bonuses: {
      resourceMultipliers: { science: 1.3 },
      specialAbility: 'Enlightenment: Research costs reduced by 15%',
    },
  },
  {
    id: 'prosperity_creed',
    name: 'Creed of Prosperity',
    description: 'A belief system centered on wealth and commerce.',
    icon: '💎',
    bonuses: {
      resourceMultipliers: { gold: 1.3 },
      specialAbility: 'Divine Commerce: +30% gold from all sources',
    },
  },
  {
    id: 'harmony_faith',
    name: 'Faith of Harmony',
    description: 'A peaceful religion promoting balance and unity.',
    icon: '☯️',
    bonuses: {
      resourceMultipliers: { food: 1.1, wood: 1.1, stone: 1.1, gold: 1.1, science: 1.1 },
      militaryBonuses: { defense: 1.2 },
      specialAbility: 'Inner Peace: All bonuses apply even during war',
    },
  },
  {
    id: 'techno_faith',
    name: 'Techno-Religion',
    description: 'Worship of technology and progress.',
    icon: '🤖',
    bonuses: {
      resourceMultipliers: { science: 1.4, gold: 1.1 },
      specialAbility: 'Digital Transcendence: +40% science production',
    },
  },
];

// ===== Cultural Influence System =====
export interface CulturalInfluence {
  id: string;
  name: string;
  description: string;
  level: number; // 0-10, determines strength of cultural effects
  maxLevel: number;
  bonuses: {
    resourceMultiplier?: number; // Applies to all resources
    militaryBonus?: number;
    territoryConversionRate?: number; // Rate at which neighboring territories convert
  };
  policies: CulturalPolicy[];
}

export interface CulturalPolicy {
  id: string;
  name: string;
  description: string;
  icon: string;
  adopted: boolean;
  cost: number; // Culture points needed
  effects: {
    resourceBonus?: { resource: string; amount: number };
    militaryBonus?: { stat: string; amount: number };
    special?: string;
  };
}

export const CULTURAL_POLICIES: CulturalPolicy[] = [
  {
    id: 'tradition',
    name: 'Tradition',
    description: 'Embrace the old ways for stability.',
    icon: '🏛️',
    adopted: false,
    cost: 100,
    effects: {
      resourceBonus: { resource: 'food', amount: 2 },
      special: 'Capital city produces 25% more resources',
    },
  },
  {
    id: 'liberty',
    name: 'Liberty',
    description: 'Freedom drives innovation.',
    icon: '🗽',
    adopted: false,
    cost: 150,
    effects: {
      resourceBonus: { resource: 'science', amount: 3 },
      special: 'Free settler and worker at adoption',
    },
  },
  {
    id: 'honor',
    name: 'Honor',
    description: 'Military might is the path to glory.',
    icon: '⚔️',
    adopted: false,
    cost: 200,
    effects: {
      militaryBonus: { stat: 'attack', amount: 10 },
      special: 'Combat experience gained 50% faster',
    },
  },
  {
    id: 'piety',
    name: 'Piety',
    description: 'Faith guides our people.',
    icon: '🙏',
    adopted: false,
    cost: 175,
    effects: {
      resourceBonus: { resource: 'gold', amount: 3 },
      special: 'Religion spreads 50% faster',
    },
  },
  {
    id: 'patronage',
    name: 'Patronage',
    description: 'Support the arts and sciences.',
    icon: '🎭',
    adopted: false,
    cost: 250,
    effects: {
      resourceBonus: { resource: 'science', amount: 5 },
      special: 'Great people born 25% more often',
    },
  },
  {
    id: 'commerce',
    name: 'Commerce',
    description: 'Trade is the lifeblood of empire.',
    icon: '💰',
    adopted: false,
    cost: 225,
    effects: {
      resourceBonus: { resource: 'gold', amount: 5 },
      special: 'Trade routes generate 50% more income',
    },
  },
  {
    id: 'rationalism',
    name: 'Rationalism',
    description: 'Reason and logic above all.',
    icon: '🔬',
    adopted: false,
    cost: 300,
    effects: {
      resourceBonus: { resource: 'science', amount: 8 },
      special: 'Scientific buildings 25% more effective',
    },
  },
  {
    id: 'aesthetics',
    name: 'Aesthetics',
    description: 'Beauty and culture define civilization.',
    icon: '🎨',
    adopted: false,
    cost: 200,
    effects: {
      special: 'Cultural influence spreads 100% faster',
    },
  },
];

// ===== Lore State Interface =====
export interface LoreState {
  selectedCivilization: string;
  selectedLeader: string | null;
  discoveredWonders: Set<string>;
  foundedReligion: Religion | null;
  culturePoints: number;
  cultureLevel: number;
  adoptedPolicies: Set<string>;
}

// ===== Helper Functions =====

export function getCivilizationById(id: string): Civilization | undefined {
  return CIVILIZATIONS.find(civ => civ.id === id);
}

export function getLeaderById(id: string): Leader | undefined {
  return LEADERS.find(leader => leader.id === id);
}

export function getAvailableLeaders(civilizationId: string, currentEra: string, eras: { id: string }[]): Leader[] {
  const currentEraIndex = eras.findIndex(e => e.id === currentEra);
  return LEADERS.filter(leader => {
    const leaderEraIndex = eras.findIndex(e => e.id === leader.era);
    const eraAvailable = leaderEraIndex <= currentEraIndex;
    const civMatch = leader.civilizationId === 'any' || leader.civilizationId === civilizationId;
    return eraAvailable && civMatch;
  });
}

export function getNaturalWonderById(id: string): NaturalWonder | undefined {
  return NATURAL_WONDERS.find(wonder => wonder.id === id);
}

export function getAvailableWonders(currentEra: string, eras: { id: string }[]): NaturalWonder[] {
  const currentEraIndex = eras.findIndex(e => e.id === currentEra);
  return NATURAL_WONDERS.filter(wonder => {
    const wonderEraIndex = eras.findIndex(e => e.id === wonder.era);
    return wonderEraIndex <= currentEraIndex && !wonder.discovered;
  });
}

export function getReligionTemplateById(id: string): Omit<Religion, 'founded' | 'followers'> | undefined {
  return RELIGION_TEMPLATES.find(rel => rel.id === id);
}

export function getPolicyById(id: string): CulturalPolicy | undefined {
  return CULTURAL_POLICIES.find(policy => policy.id === id);
}

export function calculateCivilizationBonuses(
  civilization: Civilization,
  leader: Leader | null | undefined
): {
  resourceMultipliers: { food: number; wood: number; stone: number; gold: number; science: number };
  militaryBonuses: { attack: number; defense: number; health: number };
} {
  // Base multipliers
  const resourceMultipliers = {
    food: 1,
    wood: 1,
    stone: 1,
    gold: 1,
    science: 1,
  };

  const militaryBonuses = {
    attack: 1,
    defense: 1,
    health: 1,
  };

  // Apply civilization bonuses
  if (civilization.bonuses.resourceMultipliers) {
    if (civilization.bonuses.resourceMultipliers.food) {
      resourceMultipliers.food *= civilization.bonuses.resourceMultipliers.food;
    }
    if (civilization.bonuses.resourceMultipliers.wood) {
      resourceMultipliers.wood *= civilization.bonuses.resourceMultipliers.wood;
    }
    if (civilization.bonuses.resourceMultipliers.stone) {
      resourceMultipliers.stone *= civilization.bonuses.resourceMultipliers.stone;
    }
    if (civilization.bonuses.resourceMultipliers.gold) {
      resourceMultipliers.gold *= civilization.bonuses.resourceMultipliers.gold;
    }
    if (civilization.bonuses.resourceMultipliers.science) {
      resourceMultipliers.science *= civilization.bonuses.resourceMultipliers.science;
    }
  }

  if (civilization.bonuses.militaryBonuses) {
    if (civilization.bonuses.militaryBonuses.attack) {
      militaryBonuses.attack *= civilization.bonuses.militaryBonuses.attack;
    }
    if (civilization.bonuses.militaryBonuses.defense) {
      militaryBonuses.defense *= civilization.bonuses.militaryBonuses.defense;
    }
    if (civilization.bonuses.militaryBonuses.health) {
      militaryBonuses.health *= civilization.bonuses.militaryBonuses.health;
    }
  }

  // Apply leader bonuses
  if (leader) {
    if (leader.bonuses.resourceMultipliers) {
      if (leader.bonuses.resourceMultipliers.food) {
        resourceMultipliers.food *= leader.bonuses.resourceMultipliers.food;
      }
      if (leader.bonuses.resourceMultipliers.wood) {
        resourceMultipliers.wood *= leader.bonuses.resourceMultipliers.wood;
      }
      if (leader.bonuses.resourceMultipliers.stone) {
        resourceMultipliers.stone *= leader.bonuses.resourceMultipliers.stone;
      }
      if (leader.bonuses.resourceMultipliers.gold) {
        resourceMultipliers.gold *= leader.bonuses.resourceMultipliers.gold;
      }
      if (leader.bonuses.resourceMultipliers.science) {
        resourceMultipliers.science *= leader.bonuses.resourceMultipliers.science;
      }
    }

    if (leader.bonuses.militaryBonuses) {
      if (leader.bonuses.militaryBonuses.attack) {
        militaryBonuses.attack *= leader.bonuses.militaryBonuses.attack;
      }
      if (leader.bonuses.militaryBonuses.defense) {
        militaryBonuses.defense *= leader.bonuses.militaryBonuses.defense;
      }
      if (leader.bonuses.militaryBonuses.health) {
        militaryBonuses.health *= leader.bonuses.militaryBonuses.health;
      }
    }
  }

  return { resourceMultipliers, militaryBonuses };
}

export function calculateReligionBonuses(religion: Religion | null): {
  resourceMultipliers: { food: number; wood: number; stone: number; gold: number; science: number };
  militaryBonuses: { attack: number; defense: number; morale: number };
} {
  const resourceMultipliers = {
    food: 1,
    wood: 1,
    stone: 1,
    gold: 1,
    science: 1,
  };

  const militaryBonuses = {
    attack: 1,
    defense: 1,
    morale: 1,
  };

  if (!religion) {
    return { resourceMultipliers, militaryBonuses };
  }

  if (religion.bonuses.resourceMultipliers) {
    if (religion.bonuses.resourceMultipliers.food) {
      resourceMultipliers.food *= religion.bonuses.resourceMultipliers.food;
    }
    if (religion.bonuses.resourceMultipliers.wood) {
      resourceMultipliers.wood *= religion.bonuses.resourceMultipliers.wood;
    }
    if (religion.bonuses.resourceMultipliers.stone) {
      resourceMultipliers.stone *= religion.bonuses.resourceMultipliers.stone;
    }
    if (religion.bonuses.resourceMultipliers.gold) {
      resourceMultipliers.gold *= religion.bonuses.resourceMultipliers.gold;
    }
    if (religion.bonuses.resourceMultipliers.science) {
      resourceMultipliers.science *= religion.bonuses.resourceMultipliers.science;
    }
  }

  if (religion.bonuses.militaryBonuses) {
    if (religion.bonuses.militaryBonuses.attack) {
      militaryBonuses.attack *= religion.bonuses.militaryBonuses.attack;
    }
    if (religion.bonuses.militaryBonuses.defense) {
      militaryBonuses.defense *= religion.bonuses.militaryBonuses.defense;
    }
    if (religion.bonuses.militaryBonuses.morale) {
      militaryBonuses.morale *= religion.bonuses.militaryBonuses.morale;
    }
  }

  return { resourceMultipliers, militaryBonuses };
}

export function calculateNaturalWonderBonuses(discoveredWonders: string[]): {
  flatBonuses: { food: number; wood: number; stone: number; gold: number; science: number };
  multipliers: { food: number; wood: number; stone: number; gold: number; science: number };
} {
  const flatBonuses = { food: 0, wood: 0, stone: 0, gold: 0, science: 0 };
  const multipliers = { food: 1, wood: 1, stone: 1, gold: 1, science: 1 };
  const validResources = ['food', 'wood', 'stone', 'gold', 'science'];

  for (const wonderId of discoveredWonders) {
    const wonder = getNaturalWonderById(wonderId);
    if (wonder) {
      if (wonder.bonuses.flatBonuses) {
        for (const bonus of wonder.bonuses.flatBonuses) {
          const resource = bonus.resource;
          if (validResources.includes(resource)) {
            flatBonuses[resource as keyof typeof flatBonuses] += bonus.amount;
          }
        }
      }
      if (wonder.bonuses.resourceMultiplier) {
        const resource = wonder.bonuses.resourceMultiplier.resource;
        if (validResources.includes(resource)) {
          multipliers[resource as keyof typeof multipliers] *= wonder.bonuses.resourceMultiplier.multiplier;
        }
      }
    }
  }

  return { flatBonuses, multipliers };
}

export function calculatePolicyBonuses(adoptedPolicies: string[]): {
  flatBonuses: { food: number; wood: number; stone: number; gold: number; science: number };
  militaryBonuses: { attack: number; defense: number };
} {
  const flatBonuses = { food: 0, wood: 0, stone: 0, gold: 0, science: 0 };
  const militaryBonuses = { attack: 0, defense: 0 };
  const validResources = ['food', 'wood', 'stone', 'gold', 'science'];
  const validStats = ['attack', 'defense'];

  for (const policyId of adoptedPolicies) {
    const policy = getPolicyById(policyId);
    if (policy) {
      if (policy.effects.resourceBonus) {
        const resource = policy.effects.resourceBonus.resource;
        if (validResources.includes(resource)) {
          flatBonuses[resource as keyof typeof flatBonuses] += policy.effects.resourceBonus.amount;
        }
      }
      if (policy.effects.militaryBonus) {
        const stat = policy.effects.militaryBonus.stat;
        if (validStats.includes(stat)) {
          militaryBonuses[stat as keyof typeof militaryBonuses] += policy.effects.militaryBonus.amount;
        }
      }
    }
  }

  return { flatBonuses, militaryBonuses };
}

export function createInitialLoreState(): LoreState {
  return {
    selectedCivilization: 'default',
    selectedLeader: null,
    discoveredWonders: new Set<string>(),
    foundedReligion: null,
    culturePoints: 0,
    cultureLevel: 0,
    adoptedPolicies: new Set<string>(),
  };
}

// Try to discover a natural wonder (called during exploration/gameplay)
export function tryDiscoverWonder(
  currentEra: string,
  discoveredWonders: Set<string>,
  eras: { id: string }[]
): NaturalWonder | null {
  const availableWonders = getAvailableWonders(currentEra, eras).filter(
    wonder => !discoveredWonders.has(wonder.id)
  );

  if (availableWonders.length === 0) return null;

  // Roll for each wonder
  for (const wonder of availableWonders) {
    if (Math.random() < wonder.discoveryChance) {
      return wonder;
    }
  }

  return null;
}

// Found a religion
export function foundReligion(templateId: string): Religion | null {
  const template = getReligionTemplateById(templateId);
  if (!template) return null;

  return {
    ...template,
    founded: true,
    followers: 1,
  };
}

// Calculate culture points gained from activities
export function calculateCultureGain(
  baseAmount: number,
  adoptedPolicies: Set<string>,
  discoveredWonders: number
): number {
  let gain = baseAmount;
  
  // Aesthetics policy doubles culture spread
  if (adoptedPolicies.has('aesthetics')) {
    gain *= 2;
  }
  
  // Natural wonders boost culture
  gain += discoveredWonders * 0.5;
  
  return Math.floor(gain);
}

// Check if a policy can be adopted
export function canAdoptPolicy(
  policyId: string,
  culturePoints: number,
  adoptedPolicies: Set<string>
): boolean {
  const policy = getPolicyById(policyId);
  if (!policy) return false;
  if (adoptedPolicies.has(policyId)) return false;
  return culturePoints >= policy.cost;
}
