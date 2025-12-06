// Achievements system for tracking player milestones
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'resources' | 'research' | 'military' | 'progress' | 'combat' | 'buildings';
  condition: AchievementCondition;
  reward?: {
    type: 'multiplier' | 'resource';
    resource?: string;
    amount: number;
  };
}

export interface AchievementCondition {
  type: 'resource_total' | 'resource_current' | 'tech_count' | 'troop_count' | 'era_reached' | 'battles_won' | 'missions_completed' | 'building_count';
  target: string | number;
  amount: number;
}

export interface AchievementProgress {
  id: string;
  unlocked: boolean;
  unlockedAt?: number;
  notified: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Resource Achievements
  {
    id: 'first_food',
    name: 'First Meal',
    description: 'Gather 100 total food',
    icon: '🍖',
    category: 'resources',
    condition: { type: 'resource_total', target: 'food', amount: 100 },
  },
  {
    id: 'food_stockpile',
    name: 'Food Stockpile',
    description: 'Gather 1,000 total food',
    icon: '🍖',
    category: 'resources',
    condition: { type: 'resource_total', target: 'food', amount: 1000 },
  },
  {
    id: 'feast_master',
    name: 'Feast Master',
    description: 'Gather 10,000 total food',
    icon: '🍖',
    category: 'resources',
    condition: { type: 'resource_total', target: 'food', amount: 10000 },
    reward: { type: 'multiplier', resource: 'food', amount: 1.1 },
  },
  {
    id: 'first_lumber',
    name: 'Lumberjack',
    description: 'Gather 100 total wood',
    icon: '🪵',
    category: 'resources',
    condition: { type: 'resource_total', target: 'wood', amount: 100 },
  },
  {
    id: 'wood_stockpile',
    name: 'Timber Baron',
    description: 'Gather 1,000 total wood',
    icon: '🪵',
    category: 'resources',
    condition: { type: 'resource_total', target: 'wood', amount: 1000 },
  },
  {
    id: 'forest_cleared',
    name: 'Forest Cleared',
    description: 'Gather 10,000 total wood',
    icon: '🪵',
    category: 'resources',
    condition: { type: 'resource_total', target: 'wood', amount: 10000 },
    reward: { type: 'multiplier', resource: 'wood', amount: 1.1 },
  },
  {
    id: 'first_stone',
    name: 'Stone Collector',
    description: 'Gather 50 total stone',
    icon: '🪨',
    category: 'resources',
    condition: { type: 'resource_total', target: 'stone', amount: 50 },
  },
  {
    id: 'quarry_master',
    name: 'Quarry Master',
    description: 'Gather 1,000 total stone',
    icon: '🪨',
    category: 'resources',
    condition: { type: 'resource_total', target: 'stone', amount: 1000 },
  },
  {
    id: 'mountain_mover',
    name: 'Mountain Mover',
    description: 'Gather 10,000 total stone',
    icon: '🪨',
    category: 'resources',
    condition: { type: 'resource_total', target: 'stone', amount: 10000 },
    reward: { type: 'multiplier', resource: 'stone', amount: 1.1 },
  },
  {
    id: 'first_gold',
    name: 'Gold Rush',
    description: 'Accumulate 100 total gold',
    icon: '💰',
    category: 'resources',
    condition: { type: 'resource_total', target: 'gold', amount: 100 },
  },
  {
    id: 'wealthy',
    name: 'Wealthy',
    description: 'Accumulate 1,000 total gold',
    icon: '💰',
    category: 'resources',
    condition: { type: 'resource_total', target: 'gold', amount: 1000 },
  },
  {
    id: 'tycoon',
    name: 'Tycoon',
    description: 'Accumulate 10,000 total gold',
    icon: '💰',
    category: 'resources',
    condition: { type: 'resource_total', target: 'gold', amount: 10000 },
    reward: { type: 'multiplier', resource: 'gold', amount: 1.1 },
  },
  {
    id: 'first_science',
    name: 'Curious Mind',
    description: 'Generate 50 total science',
    icon: '🔬',
    category: 'resources',
    condition: { type: 'resource_total', target: 'science', amount: 50 },
  },
  {
    id: 'scientist',
    name: 'Scientist',
    description: 'Generate 500 total science',
    icon: '🔬',
    category: 'resources',
    condition: { type: 'resource_total', target: 'science', amount: 500 },
  },
  {
    id: 'genius',
    name: 'Genius',
    description: 'Generate 5,000 total science',
    icon: '🔬',
    category: 'resources',
    condition: { type: 'resource_total', target: 'science', amount: 5000 },
    reward: { type: 'multiplier', resource: 'science', amount: 1.1 },
  },

  // Research Achievements
  {
    id: 'first_tech',
    name: 'First Discovery',
    description: 'Research your first technology',
    icon: '📚',
    category: 'research',
    condition: { type: 'tech_count', target: 'any', amount: 1 },
  },
  {
    id: 'tech_5',
    name: 'Scholar',
    description: 'Research 5 technologies',
    icon: '📚',
    category: 'research',
    condition: { type: 'tech_count', target: 'any', amount: 5 },
  },
  {
    id: 'tech_10',
    name: 'Researcher',
    description: 'Research 10 technologies',
    icon: '📚',
    category: 'research',
    condition: { type: 'tech_count', target: 'any', amount: 10 },
  },
  {
    id: 'tech_20',
    name: 'Professor',
    description: 'Research 20 technologies',
    icon: '📚',
    category: 'research',
    condition: { type: 'tech_count', target: 'any', amount: 20 },
    reward: { type: 'multiplier', resource: 'science', amount: 1.15 },
  },
  {
    id: 'tech_all',
    name: 'Omniscient',
    description: 'Research all technologies',
    icon: '🧠',
    category: 'research',
    condition: { type: 'tech_count', target: 'any', amount: 44 },
    reward: { type: 'multiplier', resource: 'science', amount: 1.5 },
  },

  // Military Achievements
  {
    id: 'first_troop',
    name: 'First Recruit',
    description: 'Train your first troop',
    icon: '⚔️',
    category: 'military',
    condition: { type: 'troop_count', target: 'any', amount: 1 },
  },
  {
    id: 'small_army',
    name: 'Small Army',
    description: 'Have 10 troops in your army',
    icon: '⚔️',
    category: 'military',
    condition: { type: 'troop_count', target: 'any', amount: 10 },
  },
  {
    id: 'large_army',
    name: 'Large Army',
    description: 'Have 50 troops in your army',
    icon: '⚔️',
    category: 'military',
    condition: { type: 'troop_count', target: 'any', amount: 50 },
  },
  {
    id: 'massive_army',
    name: 'Massive Army',
    description: 'Have 100 troops in your army',
    icon: '🛡️',
    category: 'military',
    condition: { type: 'troop_count', target: 'any', amount: 100 },
  },

  // Progress Achievements
  {
    id: 'bronze_age',
    name: 'Bronze Age',
    description: 'Reach the Bronze Age',
    icon: '🥉',
    category: 'progress',
    condition: { type: 'era_reached', target: 'bronze_age', amount: 1 },
  },
  {
    id: 'iron_age',
    name: 'Iron Age',
    description: 'Reach the Iron Age',
    icon: '⚙️',
    category: 'progress',
    condition: { type: 'era_reached', target: 'iron_age', amount: 1 },
  },
  {
    id: 'classical_age',
    name: 'Classical Age',
    description: 'Reach the Classical Age',
    icon: '🏛️',
    category: 'progress',
    condition: { type: 'era_reached', target: 'classical_age', amount: 1 },
  },
  {
    id: 'medieval_age',
    name: 'Medieval Age',
    description: 'Reach the Medieval Age',
    icon: '🏰',
    category: 'progress',
    condition: { type: 'era_reached', target: 'medieval_age', amount: 1 },
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Reach the Renaissance',
    icon: '🎨',
    category: 'progress',
    condition: { type: 'era_reached', target: 'renaissance', amount: 1 },
  },
  {
    id: 'industrial_age',
    name: 'Industrial Age',
    description: 'Reach the Industrial Age',
    icon: '🏭',
    category: 'progress',
    condition: { type: 'era_reached', target: 'industrial_age', amount: 1 },
  },
  {
    id: 'modern_age',
    name: 'Modern Age',
    description: 'Reach the Modern Age',
    icon: '🚗',
    category: 'progress',
    condition: { type: 'era_reached', target: 'modern_age', amount: 1 },
  },
  {
    id: 'atomic_age',
    name: 'Atomic Age',
    description: 'Reach the Atomic Age',
    icon: '☢️',
    category: 'progress',
    condition: { type: 'era_reached', target: 'atomic_age', amount: 1 },
  },
  {
    id: 'information_age',
    name: 'Information Age',
    description: 'Reach the Information Age',
    icon: '💻',
    category: 'progress',
    condition: { type: 'era_reached', target: 'information_age', amount: 1 },
  },
  {
    id: 'future_age',
    name: 'Future Age',
    description: 'Reach the Future Age',
    icon: '🚀',
    category: 'progress',
    condition: { type: 'era_reached', target: 'future_age', amount: 1 },
    reward: { type: 'multiplier', resource: 'science', amount: 2 },
  },

  // Combat Achievements
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first battle',
    icon: '🏆',
    category: 'combat',
    condition: { type: 'battles_won', target: 'any', amount: 1 },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Win 5 battles',
    icon: '🏆',
    category: 'combat',
    condition: { type: 'battles_won', target: 'any', amount: 5 },
  },
  {
    id: 'war_hero',
    name: 'War Hero',
    description: 'Win 10 battles',
    icon: '🎖️',
    category: 'combat',
    condition: { type: 'battles_won', target: 'any', amount: 10 },
  },
  {
    id: 'legendary_commander',
    name: 'Legendary Commander',
    description: 'Win 25 battles',
    icon: '👑',
    category: 'combat',
    condition: { type: 'battles_won', target: 'any', amount: 25 },
  },
  {
    id: 'mission_complete_1',
    name: 'Mission Accomplished',
    description: 'Complete your first mission',
    icon: '✅',
    category: 'combat',
    condition: { type: 'missions_completed', target: 'any', amount: 1 },
  },
  {
    id: 'mission_complete_5',
    name: 'Mission Specialist',
    description: 'Complete 5 unique missions',
    icon: '✅',
    category: 'combat',
    condition: { type: 'missions_completed', target: 'any', amount: 5 },
  },
  {
    id: 'mission_complete_10',
    name: 'Mission Master',
    description: 'Complete 10 unique missions',
    icon: '🌟',
    category: 'combat',
    condition: { type: 'missions_completed', target: 'any', amount: 10 },
  },
  {
    id: 'all_missions',
    name: 'Conqueror',
    description: 'Complete all missions',
    icon: '🌍',
    category: 'combat',
    condition: { type: 'missions_completed', target: 'any', amount: 22 },
  },

  // Building Achievements
  {
    id: 'first_building',
    name: 'First Construction',
    description: 'Construct your first building',
    icon: '🏠',
    category: 'buildings',
    condition: { type: 'building_count', target: 'any', amount: 1 },
  },
  {
    id: 'small_village',
    name: 'Small Village',
    description: 'Have 5 buildings in your civilization',
    icon: '🏘️',
    category: 'buildings',
    condition: { type: 'building_count', target: 'any', amount: 5 },
  },
  {
    id: 'town',
    name: 'Growing Town',
    description: 'Have 15 buildings in your civilization',
    icon: '🏙️',
    category: 'buildings',
    condition: { type: 'building_count', target: 'any', amount: 15 },
  },
  {
    id: 'city',
    name: 'City Builder',
    description: 'Have 30 buildings in your civilization',
    icon: '🌆',
    category: 'buildings',
    condition: { type: 'building_count', target: 'any', amount: 30 },
    reward: { type: 'multiplier', resource: 'gold', amount: 1.15 },
  },
  {
    id: 'metropolis',
    name: 'Metropolis',
    description: 'Have 50 buildings in your civilization',
    icon: '🌃',
    category: 'buildings',
    condition: { type: 'building_count', target: 'any', amount: 50 },
    reward: { type: 'multiplier', resource: 'gold', amount: 1.25 },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: string): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export interface Statistics {
  totalFoodGathered: number;
  totalWoodGathered: number;
  totalStoneGathered: number;
  totalGoldEarned: number;
  totalScienceGenerated: number;
  totalTroopsTrained: number;
  battlesWon: number;
  battlesLost: number;
  clickCount: number;
  offlineEarnings: number;
  totalBuildingsConstructed: number;
  territoriesConquered: number;
  heroesRecruited: number;
}

export function createInitialStatistics(): Statistics {
  return {
    totalFoodGathered: 0,
    totalWoodGathered: 0,
    totalStoneGathered: 0,
    totalGoldEarned: 0,
    totalScienceGenerated: 0,
    totalTroopsTrained: 0,
    battlesWon: 0,
    battlesLost: 0,
    clickCount: 0,
    offlineEarnings: 0,
    totalBuildingsConstructed: 0,
    territoriesConquered: 0,
    heroesRecruited: 0,
  };
}

export function createInitialAchievementProgress(): Map<string, AchievementProgress> {
  const progress = new Map<string, AchievementProgress>();
  for (const achievement of ACHIEVEMENTS) {
    progress.set(achievement.id, {
      id: achievement.id,
      unlocked: false,
      notified: false,
    });
  }
  return progress;
}
