// Skill Tree and Legacy System
// Skills are permanent upgrades that persist across game resets (prestige)
// Legacy points are earned by reaching milestones and can be spent on skills

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'production' | 'military' | 'research' | 'economy' | 'special';
  maxLevel: number;
  costPerLevel: number; // Legacy points per level
  prerequisites: string[]; // Required skill IDs
  effects: {
    type: 'multiplier' | 'flat' | 'unlock';
    target: string; // Resource name or special feature
    valuePerLevel: number;
  };
}

export interface LegacyMilestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'era_reached' | 'resource_total' | 'battles_won' | 'territories_conquered' | 'techs_researched' | 'buildings_built';
    target: string | number;
    amount: number;
  };
  legacyPoints: number;
  repeatable: boolean;
}

export interface SkillTreeState {
  legacyPoints: number;
  totalLegacyPointsEarned: number;
  skillLevels: Map<string, number>;
  completedMilestones: Set<string>;
  milestoneCompletionCounts: Map<string, number>;
  prestigeCount: number;
}

// Skill Definitions
export const SKILLS: Skill[] = [
  // Production Skills
  {
    id: 'efficient_gathering',
    name: 'Efficient Gathering',
    description: 'Increase all resource gathering by 10% per level.',
    icon: '🧺',
    category: 'production',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: [],
    effects: { type: 'multiplier', target: 'all_resources', valuePerLevel: 0.10 },
  },
  {
    id: 'master_farmer',
    name: 'Master Farmer',
    description: 'Increase food production by 15% per level.',
    icon: '🌾',
    category: 'production',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: ['efficient_gathering'],
    effects: { type: 'multiplier', target: 'food', valuePerLevel: 0.15 },
  },
  {
    id: 'master_lumberjack',
    name: 'Master Lumberjack',
    description: 'Increase wood production by 15% per level.',
    icon: '🪓',
    category: 'production',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: ['efficient_gathering'],
    effects: { type: 'multiplier', target: 'wood', valuePerLevel: 0.15 },
  },
  {
    id: 'master_miner',
    name: 'Master Miner',
    description: 'Increase stone production by 15% per level.',
    icon: '⛏️',
    category: 'production',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: ['efficient_gathering'],
    effects: { type: 'multiplier', target: 'stone', valuePerLevel: 0.15 },
  },
  {
    id: 'resource_mastery',
    name: 'Resource Mastery',
    description: 'All resource production increased by 25% per level.',
    icon: '💫',
    category: 'production',
    maxLevel: 5,
    costPerLevel: 5,
    prerequisites: ['master_farmer', 'master_lumberjack', 'master_miner'],
    effects: { type: 'multiplier', target: 'all_resources', valuePerLevel: 0.25 },
  },

  // Military Skills
  {
    id: 'warrior_training',
    name: 'Warrior Training',
    description: 'Increase army attack by 10% per level.',
    icon: '⚔️',
    category: 'military',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: [],
    effects: { type: 'multiplier', target: 'army_attack', valuePerLevel: 0.10 },
  },
  {
    id: 'fortification',
    name: 'Fortification',
    description: 'Increase army defense by 10% per level.',
    icon: '🛡️',
    category: 'military',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: [],
    effects: { type: 'multiplier', target: 'army_defense', valuePerLevel: 0.10 },
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: 'Increase army health by 10% per level.',
    icon: '❤️',
    category: 'military',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: [],
    effects: { type: 'multiplier', target: 'army_health', valuePerLevel: 0.10 },
  },
  {
    id: 'battle_hardened',
    name: 'Battle Hardened',
    description: 'Reduce casualties in battle by 5% per level.',
    icon: '🎖️',
    category: 'military',
    maxLevel: 10,
    costPerLevel: 2,
    prerequisites: ['warrior_training', 'fortification', 'vitality'],
    effects: { type: 'multiplier', target: 'casualty_reduction', valuePerLevel: 0.05 },
  },
  {
    id: 'warlord',
    name: 'Warlord',
    description: 'All military stats increased by 20% per level.',
    icon: '👑',
    category: 'military',
    maxLevel: 5,
    costPerLevel: 5,
    prerequisites: ['battle_hardened'],
    effects: { type: 'multiplier', target: 'all_military', valuePerLevel: 0.20 },
  },

  // Research Skills
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    description: 'Increase science production by 10% per level.',
    icon: '📚',
    category: 'research',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: [],
    effects: { type: 'multiplier', target: 'science', valuePerLevel: 0.10 },
  },
  {
    id: 'research_efficiency',
    name: 'Research Efficiency',
    description: 'Reduce research time by 5% per level.',
    icon: '⏱️',
    category: 'research',
    maxLevel: 10,
    costPerLevel: 2,
    prerequisites: ['quick_learner'],
    effects: { type: 'multiplier', target: 'research_speed', valuePerLevel: 0.05 },
  },
  {
    id: 'genius',
    name: 'Genius',
    description: 'Science production increased by 30% per level.',
    icon: '🧠',
    category: 'research',
    maxLevel: 5,
    costPerLevel: 5,
    prerequisites: ['research_efficiency'],
    effects: { type: 'multiplier', target: 'science', valuePerLevel: 0.30 },
  },

  // Economy Skills
  {
    id: 'merchant',
    name: 'Merchant',
    description: 'Increase gold production by 15% per level.',
    icon: '💰',
    category: 'economy',
    maxLevel: 10,
    costPerLevel: 1,
    prerequisites: [],
    effects: { type: 'multiplier', target: 'gold', valuePerLevel: 0.15 },
  },
  {
    id: 'trade_routes',
    name: 'Trade Routes',
    description: 'Flat +1 gold per second per level.',
    icon: '🛤️',
    category: 'economy',
    maxLevel: 10,
    costPerLevel: 2,
    prerequisites: ['merchant'],
    effects: { type: 'flat', target: 'gold', valuePerLevel: 1 },
  },
  {
    id: 'economic_empire',
    name: 'Economic Empire',
    description: 'Gold production increased by 50% per level.',
    icon: '🏛️',
    category: 'economy',
    maxLevel: 5,
    costPerLevel: 5,
    prerequisites: ['trade_routes'],
    effects: { type: 'multiplier', target: 'gold', valuePerLevel: 0.50 },
  },

  // Special Skills
  {
    id: 'starting_resources',
    name: 'Starting Resources',
    description: 'Start each game with +100 of each resource per level.',
    icon: '📦',
    category: 'special',
    maxLevel: 10,
    costPerLevel: 2,
    prerequisites: [],
    effects: { type: 'flat', target: 'starting_resources', valuePerLevel: 100 },
  },
  {
    id: 'era_memory',
    name: 'Era Memory',
    description: 'Keep 10% of researched technologies per level after prestige.',
    icon: '🧬',
    category: 'special',
    maxLevel: 5,
    costPerLevel: 5,
    prerequisites: ['starting_resources'],
    effects: { type: 'multiplier', target: 'tech_retention', valuePerLevel: 0.10 },
  },
  {
    id: 'legacy_amplifier',
    name: 'Legacy Amplifier',
    description: 'Increase legacy points earned by 10% per level.',
    icon: '✨',
    category: 'special',
    maxLevel: 10,
    costPerLevel: 3,
    prerequisites: [],
    effects: { type: 'multiplier', target: 'legacy_points', valuePerLevel: 0.10 },
  },
  {
    id: 'eternal_wisdom',
    name: 'Eternal Wisdom',
    description: 'All skill effects are 10% stronger per level.',
    icon: '🌟',
    category: 'special',
    maxLevel: 5,
    costPerLevel: 10,
    prerequisites: ['era_memory', 'legacy_amplifier'],
    effects: { type: 'multiplier', target: 'skill_effectiveness', valuePerLevel: 0.10 },
  },
];

// Legacy Milestones - Ways to earn Legacy Points
export const LEGACY_MILESTONES: LegacyMilestone[] = [
  // Era Progression Milestones
  {
    id: 'reach_bronze_age',
    name: 'Bronze Pioneer',
    description: 'Reach the Bronze Age',
    icon: '🥉',
    condition: { type: 'era_reached', target: 'bronze_age', amount: 1 },
    legacyPoints: 1,
    repeatable: true,
  },
  {
    id: 'reach_iron_age',
    name: 'Iron Forger',
    description: 'Reach the Iron Age',
    icon: '⚙️',
    condition: { type: 'era_reached', target: 'iron_age', amount: 1 },
    legacyPoints: 2,
    repeatable: true,
  },
  {
    id: 'reach_classical_age',
    name: 'Classical Scholar',
    description: 'Reach the Classical Age',
    icon: '🏛️',
    condition: { type: 'era_reached', target: 'classical_age', amount: 1 },
    legacyPoints: 3,
    repeatable: true,
  },
  {
    id: 'reach_medieval_age',
    name: 'Medieval Lord',
    description: 'Reach the Medieval Age',
    icon: '🏰',
    condition: { type: 'era_reached', target: 'medieval_age', amount: 1 },
    legacyPoints: 5,
    repeatable: true,
  },
  {
    id: 'reach_renaissance',
    name: 'Renaissance Master',
    description: 'Reach the Renaissance',
    icon: '🎨',
    condition: { type: 'era_reached', target: 'renaissance', amount: 1 },
    legacyPoints: 8,
    repeatable: true,
  },
  {
    id: 'reach_industrial_age',
    name: 'Industrial Tycoon',
    description: 'Reach the Industrial Age',
    icon: '🏭',
    condition: { type: 'era_reached', target: 'industrial_age', amount: 1 },
    legacyPoints: 12,
    repeatable: true,
  },
  {
    id: 'reach_modern_age',
    name: 'Modern Leader',
    description: 'Reach the Modern Age',
    icon: '🌆',
    condition: { type: 'era_reached', target: 'modern_age', amount: 1 },
    legacyPoints: 18,
    repeatable: true,
  },
  {
    id: 'reach_atomic_age',
    name: 'Atomic Pioneer',
    description: 'Reach the Atomic Age',
    icon: '☢️',
    condition: { type: 'era_reached', target: 'atomic_age', amount: 1 },
    legacyPoints: 25,
    repeatable: true,
  },
  {
    id: 'reach_information_age',
    name: 'Digital Visionary',
    description: 'Reach the Information Age',
    icon: '💻',
    condition: { type: 'era_reached', target: 'information_age', amount: 1 },
    legacyPoints: 35,
    repeatable: true,
  },
  {
    id: 'reach_future_age',
    name: 'Future Architect',
    description: 'Reach the Future Age',
    icon: '🚀',
    condition: { type: 'era_reached', target: 'future_age', amount: 1 },
    legacyPoints: 50,
    repeatable: true,
  },

  // Combat Milestones
  {
    id: 'battle_novice',
    name: 'Battle Novice',
    description: 'Win 10 battles',
    icon: '⚔️',
    condition: { type: 'battles_won', target: 'any', amount: 10 },
    legacyPoints: 2,
    repeatable: false,
  },
  {
    id: 'battle_veteran',
    name: 'Battle Veteran',
    description: 'Win 50 battles',
    icon: '🗡️',
    condition: { type: 'battles_won', target: 'any', amount: 50 },
    legacyPoints: 5,
    repeatable: false,
  },
  {
    id: 'battle_legend',
    name: 'Battle Legend',
    description: 'Win 100 battles',
    icon: '⚔️',
    condition: { type: 'battles_won', target: 'any', amount: 100 },
    legacyPoints: 10,
    repeatable: false,
  },

  // Territory Milestones
  {
    id: 'first_conquest',
    name: 'First Conquest',
    description: 'Conquer your first territory',
    icon: '🏴',
    condition: { type: 'territories_conquered', target: 'any', amount: 1 },
    legacyPoints: 2,
    repeatable: false,
  },
  {
    id: 'regional_power',
    name: 'Regional Power',
    description: 'Conquer 5 territories',
    icon: '🗺️',
    condition: { type: 'territories_conquered', target: 'any', amount: 5 },
    legacyPoints: 5,
    repeatable: false,
  },
  {
    id: 'empire_builder',
    name: 'Empire Builder',
    description: 'Conquer 10 territories',
    icon: '👑',
    condition: { type: 'territories_conquered', target: 'any', amount: 10 },
    legacyPoints: 10,
    repeatable: false,
  },
  {
    id: 'world_conqueror',
    name: 'World Conqueror',
    description: 'Conquer all territories',
    icon: '🌍',
    condition: { type: 'territories_conquered', target: 'any', amount: 22 },
    legacyPoints: 25,
    repeatable: false,
  },

  // Research Milestones
  {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Research 10 technologies',
    icon: '📖',
    condition: { type: 'techs_researched', target: 'any', amount: 10 },
    legacyPoints: 3,
    repeatable: false,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Research 25 technologies',
    icon: '🎓',
    condition: { type: 'techs_researched', target: 'any', amount: 25 },
    legacyPoints: 8,
    repeatable: false,
  },
  {
    id: 'tech_master',
    name: 'Tech Master',
    description: 'Research all technologies',
    icon: '🧪',
    condition: { type: 'techs_researched', target: 'any', amount: 44 },
    legacyPoints: 20,
    repeatable: false,
  },

  // Building Milestones
  {
    id: 'builder',
    name: 'Builder',
    description: 'Construct 10 buildings',
    icon: '🏗️',
    condition: { type: 'buildings_built', target: 'any', amount: 10 },
    legacyPoints: 2,
    repeatable: false,
  },
  {
    id: 'architect',
    name: 'Architect',
    description: 'Construct 50 buildings',
    icon: '🏘️',
    condition: { type: 'buildings_built', target: 'any', amount: 50 },
    legacyPoints: 5,
    repeatable: false,
  },
  {
    id: 'city_planner',
    name: 'City Planner',
    description: 'Construct 100 buildings',
    icon: '🌆',
    condition: { type: 'buildings_built', target: 'any', amount: 100 },
    legacyPoints: 10,
    repeatable: false,
  },
];

// Helper functions
export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find(s => s.id === id);
}

export function getMilestoneById(id: string): LegacyMilestone | undefined {
  return LEGACY_MILESTONES.find(m => m.id === id);
}

export function getSkillsByCategory(category: Skill['category']): Skill[] {
  return SKILLS.filter(s => s.category === category);
}

export function canUnlockSkill(skill: Skill, skillLevels: Map<string, number>): boolean {
  // Check if all prerequisites are met (at least level 1)
  for (const prereqId of skill.prerequisites) {
    const level = skillLevels.get(prereqId) || 0;
    if (level < 1) {
      return false;
    }
  }
  return true;
}

export function getSkillLevel(skillId: string, skillLevels: Map<string, number>): number {
  return skillLevels.get(skillId) || 0;
}

export function getSkillCost(skill: Skill, currentLevel: number): number {
  return skill.costPerLevel * (currentLevel + 1);
}

export function getSkillEffect(skill: Skill, level: number, skillEffectivenessBonus: number = 0): number {
  if (level <= 0) return skill.effects.type === 'multiplier' ? 1 : 0;
  
  const baseValue = skill.effects.valuePerLevel * level;
  const effectivenessMultiplier = 1 + skillEffectivenessBonus;
  
  if (skill.effects.type === 'multiplier') {
    return 1 + (baseValue * effectivenessMultiplier);
  }
  return baseValue * effectivenessMultiplier;
}

export function createInitialSkillTreeState(): SkillTreeState {
  return {
    legacyPoints: 0,
    totalLegacyPointsEarned: 0,
    skillLevels: new Map<string, number>(),
    completedMilestones: new Set<string>(),
    milestoneCompletionCounts: new Map<string, number>(),
    prestigeCount: 0,
  };
}

// Calculate total skill bonuses
export function calculateSkillBonuses(skillLevels: Map<string, number>): {
  resourceMultipliers: { food: number; wood: number; stone: number; gold: number; science: number };
  flatBonuses: { food: number; wood: number; stone: number; gold: number; science: number };
  militaryMultipliers: { attack: number; defense: number; health: number; casualtyReduction: number };
  researchSpeedMultiplier: number;
  startingResources: number;
  techRetention: number;
  legacyPointsMultiplier: number;
  skillEffectiveness: number;
} {
  // Get eternal wisdom bonus first (affects other skills)
  const eternalWisdomLevel = skillLevels.get('eternal_wisdom') || 0;
  const skillEffectiveness = eternalWisdomLevel > 0 
    ? getSkillEffect(getSkillById('eternal_wisdom')!, eternalWisdomLevel) - 1 
    : 0;

  const resourceMultipliers = { food: 1, wood: 1, stone: 1, gold: 1, science: 1 };
  const flatBonuses = { food: 0, wood: 0, stone: 0, gold: 0, science: 0 };
  const militaryMultipliers = { attack: 1, defense: 1, health: 1, casualtyReduction: 0 };
  let researchSpeedMultiplier = 1;
  let startingResources = 0;
  let techRetention = 0;
  let legacyPointsMultiplier = 1;

  for (const skill of SKILLS) {
    const level = skillLevels.get(skill.id) || 0;
    if (level <= 0) continue;

    const effectValue = getSkillEffect(skill, level, skillEffectiveness);
    const target = skill.effects.target;

    switch (target) {
      case 'all_resources':
        if (skill.effects.type === 'multiplier') {
          resourceMultipliers.food *= effectValue;
          resourceMultipliers.wood *= effectValue;
          resourceMultipliers.stone *= effectValue;
          resourceMultipliers.gold *= effectValue;
          resourceMultipliers.science *= effectValue;
        }
        break;
      case 'food':
        if (skill.effects.type === 'multiplier') resourceMultipliers.food *= effectValue;
        else flatBonuses.food += effectValue;
        break;
      case 'wood':
        if (skill.effects.type === 'multiplier') resourceMultipliers.wood *= effectValue;
        else flatBonuses.wood += effectValue;
        break;
      case 'stone':
        if (skill.effects.type === 'multiplier') resourceMultipliers.stone *= effectValue;
        else flatBonuses.stone += effectValue;
        break;
      case 'gold':
        if (skill.effects.type === 'multiplier') resourceMultipliers.gold *= effectValue;
        else flatBonuses.gold += effectValue;
        break;
      case 'science':
        if (skill.effects.type === 'multiplier') resourceMultipliers.science *= effectValue;
        else flatBonuses.science += effectValue;
        break;
      case 'army_attack':
        militaryMultipliers.attack *= effectValue;
        break;
      case 'army_defense':
        militaryMultipliers.defense *= effectValue;
        break;
      case 'army_health':
        militaryMultipliers.health *= effectValue;
        break;
      case 'casualty_reduction':
        militaryMultipliers.casualtyReduction += skill.effects.valuePerLevel * level * (1 + skillEffectiveness);
        break;
      case 'all_military':
        militaryMultipliers.attack *= effectValue;
        militaryMultipliers.defense *= effectValue;
        militaryMultipliers.health *= effectValue;
        break;
      case 'research_speed':
        researchSpeedMultiplier *= effectValue;
        break;
      case 'starting_resources':
        startingResources += effectValue;
        break;
      case 'tech_retention':
        techRetention += skill.effects.valuePerLevel * level * (1 + skillEffectiveness);
        break;
      case 'legacy_points':
        legacyPointsMultiplier *= effectValue;
        break;
    }
  }

  // Cap casualty reduction at 90%
  militaryMultipliers.casualtyReduction = Math.min(0.9, militaryMultipliers.casualtyReduction);
  // Cap tech retention at 100%
  techRetention = Math.min(1, techRetention);

  return {
    resourceMultipliers,
    flatBonuses,
    militaryMultipliers,
    researchSpeedMultiplier,
    startingResources,
    techRetention,
    legacyPointsMultiplier,
    skillEffectiveness,
  };
}
