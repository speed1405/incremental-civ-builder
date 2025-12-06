// Barracks system with troops for each era
export interface TroopType {
  id: string;
  name: string;
  description: string;
  era: string;
  unlockTech: string;
  cost: {
    food: number;
    gold: number;
    wood?: number;
    stone?: number;
  };
  trainTime: number; // in seconds
  stats: {
    attack: number;
    defense: number;
    health: number;
  };
  icon: string; // Emoji icon for battlefield visualization
  troopClass: 'infantry' | 'ranged' | 'cavalry' | 'siege' | 'air' | 'special';
}

export const TROOP_TYPES: TroopType[] = [
  // Stone Age
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'Basic ranged unit with primitive weapons.',
    era: 'stone_age',
    unlockTech: 'hunting',
    cost: { food: 30, gold: 0 },
    trainTime: 5,
    stats: { attack: 3, defense: 1, health: 20 },
    icon: '🏹',
    troopClass: 'ranged',
  },
  {
    id: 'gatherer',
    name: 'Gatherer Warrior',
    description: 'Versatile fighter who can forage and fight.',
    era: 'stone_age',
    unlockTech: 'hunting',
    cost: { food: 25, gold: 0 },
    trainTime: 4,
    stats: { attack: 2, defense: 2, health: 25 },
    icon: '🪓',
    troopClass: 'infantry',
  },
  {
    id: 'clubman',
    name: 'Clubman',
    description: 'Basic melee unit with a wooden club.',
    era: 'stone_age',
    unlockTech: 'stone_tools',
    cost: { food: 20, gold: 0, wood: 10 },
    trainTime: 3,
    stats: { attack: 4, defense: 1, health: 15 },
    icon: '🏏',
    troopClass: 'infantry',
  },
  
  // Bronze Age
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Melee fighter with bronze weapons.',
    era: 'bronze_age',
    unlockTech: 'bronze_working',
    cost: { food: 50, gold: 10 },
    trainTime: 8,
    stats: { attack: 6, defense: 4, health: 40 },
    icon: '⚔️',
    troopClass: 'infantry',
  },
  {
    id: 'chariot',
    name: 'War Chariot',
    description: 'Fast mobile unit.',
    era: 'bronze_age',
    unlockTech: 'wheel',
    cost: { food: 40, gold: 30, wood: 50 },
    trainTime: 12,
    stats: { attack: 8, defense: 2, health: 30 },
    icon: '🏎️',
    troopClass: 'cavalry',
  },
  {
    id: 'spearman',
    name: 'Spearman',
    description: 'Defensive unit effective against cavalry.',
    era: 'bronze_age',
    unlockTech: 'bronze_working',
    cost: { food: 45, gold: 15 },
    trainTime: 7,
    stats: { attack: 5, defense: 6, health: 35 },
    icon: '🔱',
    troopClass: 'infantry',
  },
  {
    id: 'slinger',
    name: 'Slinger',
    description: 'Cheap ranged unit with a sling.',
    era: 'bronze_age',
    unlockTech: 'writing',
    cost: { food: 35, gold: 5 },
    trainTime: 5,
    stats: { attack: 7, defense: 2, health: 25 },
    icon: '🎯',
    troopClass: 'ranged',
  },

  // Iron Age
  {
    id: 'swordsman',
    name: 'Swordsman',
    description: 'Skilled fighter with iron sword.',
    era: 'iron_age',
    unlockTech: 'iron_working',
    cost: { food: 60, gold: 25 },
    trainTime: 10,
    stats: { attack: 10, defense: 6, health: 50 },
    icon: '🗡️',
    troopClass: 'infantry',
  },
  {
    id: 'archer',
    name: 'Archer',
    description: 'Trained bowman with improved range.',
    era: 'iron_age',
    unlockTech: 'iron_working',
    cost: { food: 55, gold: 20 },
    trainTime: 8,
    stats: { attack: 12, defense: 3, health: 35 },
    icon: '🏹',
    troopClass: 'ranged',
  },
  {
    id: 'phalanx',
    name: 'Phalanx',
    description: 'Heavy defensive infantry with long spears.',
    era: 'iron_age',
    unlockTech: 'construction',
    cost: { food: 70, gold: 30 },
    trainTime: 12,
    stats: { attack: 8, defense: 12, health: 55 },
    icon: '🛡️',
    troopClass: 'infantry',
  },

  // Classical Age
  {
    id: 'horseman',
    name: 'Horseman',
    description: 'Mounted cavalry unit.',
    era: 'classical_age',
    unlockTech: 'horseback_riding',
    cost: { food: 80, gold: 40 },
    trainTime: 15,
    stats: { attack: 12, defense: 4, health: 45 },
    icon: '🐎',
    troopClass: 'cavalry',
  },
  {
    id: 'legionary',
    name: 'Legionary',
    description: 'Elite heavy infantry.',
    era: 'classical_age',
    unlockTech: 'iron_casting',
    cost: { food: 70, gold: 35 },
    trainTime: 12,
    stats: { attack: 11, defense: 10, health: 60 },
    icon: '🏛️',
    troopClass: 'infantry',
  },
  {
    id: 'catapult',
    name: 'Catapult',
    description: 'Siege weapon that hurls stones at enemies.',
    era: 'classical_age',
    unlockTech: 'engineering',
    cost: { food: 60, gold: 60, stone: 80 },
    trainTime: 18,
    stats: { attack: 20, defense: 2, health: 30 },
    icon: '🪨',
    troopClass: 'siege',
  },
  {
    id: 'war_elephant',
    name: 'War Elephant',
    description: 'Massive beast that tramples enemies.',
    era: 'classical_age',
    unlockTech: 'horseback_riding',
    cost: { food: 120, gold: 80 },
    trainTime: 25,
    stats: { attack: 16, defense: 8, health: 90 },
    icon: '🐘',
    troopClass: 'cavalry',
  },

  // Medieval Age
  {
    id: 'knight',
    name: 'Knight',
    description: 'Heavily armored mounted warrior.',
    era: 'medieval_age',
    unlockTech: 'feudalism',
    cost: { food: 100, gold: 80 },
    trainTime: 20,
    stats: { attack: 18, defense: 14, health: 80 },
    icon: '🏇',
    troopClass: 'cavalry',
  },
  {
    id: 'musketeer',
    name: 'Musketeer',
    description: 'Soldier armed with a musket.',
    era: 'medieval_age',
    unlockTech: 'gunpowder',
    cost: { food: 90, gold: 60 },
    trainTime: 15,
    stats: { attack: 22, defense: 8, health: 55 },
    icon: '🔫',
    troopClass: 'ranged',
  },
  {
    id: 'crossbowman',
    name: 'Crossbowman',
    description: 'Powerful ranged unit with a crossbow.',
    era: 'medieval_age',
    unlockTech: 'machinery',
    cost: { food: 85, gold: 50 },
    trainTime: 14,
    stats: { attack: 19, defense: 6, health: 50 },
    icon: '🎯',
    troopClass: 'ranged',
  },
  {
    id: 'trebuchet',
    name: 'Trebuchet',
    description: 'Advanced siege weapon for destroying fortifications.',
    era: 'medieval_age',
    unlockTech: 'machinery',
    cost: { food: 80, gold: 100, wood: 120 },
    trainTime: 22,
    stats: { attack: 35, defense: 3, health: 40 },
    icon: '⚙️',
    troopClass: 'siege',
  },
  {
    id: 'pikeman',
    name: 'Pikeman',
    description: 'Long pike infantry effective against cavalry.',
    era: 'medieval_age',
    unlockTech: 'metal_casting',
    cost: { food: 75, gold: 45 },
    trainTime: 12,
    stats: { attack: 14, defense: 16, health: 65 },
    icon: '🔱',
    troopClass: 'infantry',
  },

  // Renaissance
  {
    id: 'rifleman',
    name: 'Rifleman',
    description: 'Soldier with advanced rifle.',
    era: 'renaissance',
    unlockTech: 'military_science',
    cost: { food: 100, gold: 70 },
    trainTime: 12,
    stats: { attack: 28, defense: 10, health: 60 },
    icon: '🎖️',
    troopClass: 'ranged',
  },
  {
    id: 'cavalry',
    name: 'Light Cavalry',
    description: 'Fast scout and raider unit.',
    era: 'renaissance',
    unlockTech: 'military_science',
    cost: { food: 90, gold: 65 },
    trainTime: 14,
    stats: { attack: 24, defense: 8, health: 55 },
    icon: '🐴',
    troopClass: 'cavalry',
  },
  {
    id: 'cannon',
    name: 'Cannon',
    description: 'Early artillery piece with devastating power.',
    era: 'renaissance',
    unlockTech: 'banking',
    cost: { food: 70, gold: 120, stone: 80 },
    trainTime: 20,
    stats: { attack: 38, defense: 4, health: 45 },
    icon: '💥',
    troopClass: 'siege',
  },
  {
    id: 'lancer',
    name: 'Lancer',
    description: 'Elite cavalry with lance charge.',
    era: 'renaissance',
    unlockTech: 'astronomy',
    cost: { food: 110, gold: 90 },
    trainTime: 18,
    stats: { attack: 30, defense: 12, health: 70 },
    icon: '🏇',
    troopClass: 'cavalry',
  },

  // Industrial Age
  {
    id: 'artillery',
    name: 'Artillery',
    description: 'Powerful ranged siege weapon.',
    era: 'industrial_age',
    unlockTech: 'dynamite',
    cost: { food: 80, gold: 150, stone: 100 },
    trainTime: 25,
    stats: { attack: 45, defense: 5, health: 50 },
    icon: '💣',
    troopClass: 'siege',
  },
  {
    id: 'infantry',
    name: 'Line Infantry',
    description: 'Standard modern infantry with rifles.',
    era: 'industrial_age',
    unlockTech: 'industrialization',
    cost: { food: 90, gold: 60 },
    trainTime: 10,
    stats: { attack: 32, defense: 14, health: 65 },
    icon: '🪖',
    troopClass: 'infantry',
  },
  {
    id: 'gatling_gun',
    name: 'Gatling Gun',
    description: 'Early machine gun with rapid fire.',
    era: 'industrial_age',
    unlockTech: 'industrialization',
    cost: { food: 100, gold: 180 },
    trainTime: 22,
    stats: { attack: 50, defense: 8, health: 55 },
    icon: '🔫',
    troopClass: 'ranged',
  },
  {
    id: 'ironclad',
    name: 'Armored Train',
    description: 'Mobile armored platform on rails.',
    era: 'industrial_age',
    unlockTech: 'railroad',
    cost: { food: 120, gold: 200, stone: 150 },
    trainTime: 30,
    stats: { attack: 40, defense: 25, health: 100 },
    icon: '🚂',
    troopClass: 'special',
  },

  // Modern Age
  {
    id: 'tank',
    name: 'Tank',
    description: 'Armored fighting vehicle.',
    era: 'modern_age',
    unlockTech: 'combustion',
    cost: { food: 100, gold: 250 },
    trainTime: 30,
    stats: { attack: 55, defense: 35, health: 120 },
    icon: '🛡️',
    troopClass: 'cavalry',
  },
  {
    id: 'fighter',
    name: 'Fighter',
    description: 'Military aircraft.',
    era: 'modern_age',
    unlockTech: 'flight',
    cost: { food: 80, gold: 300 },
    trainTime: 25,
    stats: { attack: 65, defense: 20, health: 80 },
    icon: '✈️',
    troopClass: 'air',
  },
  {
    id: 'marine',
    name: 'Marine',
    description: 'Elite amphibious assault infantry.',
    era: 'modern_age',
    unlockTech: 'radio',
    cost: { food: 110, gold: 140 },
    trainTime: 16,
    stats: { attack: 42, defense: 22, health: 75 },
    icon: '🎖️',
    troopClass: 'infantry',
  },
  {
    id: 'bomber',
    name: 'Bomber',
    description: 'Heavy aircraft for strategic bombing.',
    era: 'modern_age',
    unlockTech: 'flight',
    cost: { food: 100, gold: 350 },
    trainTime: 28,
    stats: { attack: 80, defense: 15, health: 90 },
    icon: '🛩️',
    troopClass: 'air',
  },
  {
    id: 'anti_tank',
    name: 'Anti-Tank Gun',
    description: 'Specialized unit for destroying armor.',
    era: 'modern_age',
    unlockTech: 'combustion',
    cost: { food: 90, gold: 200 },
    trainTime: 20,
    stats: { attack: 60, defense: 10, health: 60 },
    icon: '🎯',
    troopClass: 'ranged',
  },

  // Atomic Age
  {
    id: 'rocket_artillery',
    name: 'Rocket Artillery',
    description: 'Long-range rocket launcher.',
    era: 'atomic_age',
    unlockTech: 'rocketry',
    cost: { food: 100, gold: 400 },
    trainTime: 30,
    stats: { attack: 80, defense: 10, health: 70 },
    icon: '🚀',
    troopClass: 'siege',
  },
  {
    id: 'paratrooper',
    name: 'Paratrooper',
    description: 'Elite airborne infantry.',
    era: 'atomic_age',
    unlockTech: 'rocketry',
    cost: { food: 120, gold: 280 },
    trainTime: 18,
    stats: { attack: 55, defense: 25, health: 85 },
    icon: '🪂',
    troopClass: 'infantry',
  },
  {
    id: 'jet_fighter',
    name: 'Jet Fighter',
    description: 'Advanced supersonic aircraft.',
    era: 'atomic_age',
    unlockTech: 'satellites',
    cost: { food: 100, gold: 450 },
    trainTime: 26,
    stats: { attack: 90, defense: 30, health: 95 },
    icon: '🛫',
    troopClass: 'air',
  },
  {
    id: 'nuclear_sub',
    name: 'Nuclear Submarine',
    description: 'Stealthy underwater nuclear platform.',
    era: 'atomic_age',
    unlockTech: 'nuclear_power',
    cost: { food: 150, gold: 600 },
    trainTime: 35,
    stats: { attack: 100, defense: 40, health: 110 },
    icon: '🚢',
    troopClass: 'special',
  },

  // Information Age
  {
    id: 'mech_infantry',
    name: 'Mechanized Infantry',
    description: 'Soldiers with powered exoskeletons.',
    era: 'information_age',
    unlockTech: 'robotics',
    cost: { food: 120, gold: 500 },
    trainTime: 20,
    stats: { attack: 70, defense: 50, health: 150 },
    icon: '🤖',
    troopClass: 'infantry',
  },
  {
    id: 'drone_swarm',
    name: 'Drone Swarm',
    description: 'Autonomous attack drones.',
    era: 'information_age',
    unlockTech: 'robotics',
    cost: { food: 80, gold: 550 },
    trainTime: 18,
    stats: { attack: 85, defense: 15, health: 60 },
    icon: '🛸',
    troopClass: 'air',
  },
  {
    id: 'cyber_warrior',
    name: 'Cyber Warrior',
    description: 'Electronic warfare specialist.',
    era: 'information_age',
    unlockTech: 'internet',
    cost: { food: 100, gold: 480 },
    trainTime: 16,
    stats: { attack: 60, defense: 40, health: 100 },
    icon: '💻',
    troopClass: 'special',
  },
  {
    id: 'stealth_bomber',
    name: 'Stealth Bomber',
    description: 'Undetectable strategic bomber.',
    era: 'information_age',
    unlockTech: 'nanotechnology',
    cost: { food: 120, gold: 700 },
    trainTime: 30,
    stats: { attack: 110, defense: 35, health: 100 },
    icon: '🦅',
    troopClass: 'air',
  },
  {
    id: 'battle_mech',
    name: 'Battle Mech',
    description: 'Piloted combat robot.',
    era: 'information_age',
    unlockTech: 'nanotechnology',
    cost: { food: 150, gold: 650 },
    trainTime: 28,
    stats: { attack: 95, defense: 60, health: 180 },
    icon: '🦾',
    troopClass: 'special',
  },

  // Future Age
  {
    id: 'space_marine',
    name: 'Space Marine',
    description: 'Elite soldier for space combat.',
    era: 'future_age',
    unlockTech: 'space_colonization',
    cost: { food: 150, gold: 800 },
    trainTime: 25,
    stats: { attack: 100, defense: 80, health: 200 },
    icon: '👨‍🚀',
    troopClass: 'infantry',
  },
  {
    id: 'plasma_tank',
    name: 'Plasma Tank',
    description: 'Hover tank with plasma weapons.',
    era: 'future_age',
    unlockTech: 'fusion_power',
    cost: { food: 180, gold: 900 },
    trainTime: 32,
    stats: { attack: 120, defense: 70, health: 220 },
    icon: '🔮',
    troopClass: 'cavalry',
  },
  {
    id: 'nanite_swarm',
    name: 'Nanite Swarm',
    description: 'Self-replicating microscopic robots.',
    era: 'future_age',
    unlockTech: 'quantum_computing',
    cost: { food: 100, gold: 1000 },
    trainTime: 22,
    stats: { attack: 90, defense: 30, health: 150 },
    icon: '✨',
    troopClass: 'special',
  },
  {
    id: 'antimatter_bomber',
    name: 'Antimatter Bomber',
    description: 'Aircraft with antimatter warheads.',
    era: 'future_age',
    unlockTech: 'fusion_power',
    cost: { food: 200, gold: 1200 },
    trainTime: 35,
    stats: { attack: 150, defense: 40, health: 130 },
    icon: '💫',
    troopClass: 'air',
  },
  {
    id: 'titan',
    name: 'Titan',
    description: 'Massive war machine of destruction.',
    era: 'future_age',
    unlockTech: 'singularity',
    cost: { food: 300, gold: 1500 },
    trainTime: 45,
    stats: { attack: 200, defense: 150, health: 500 },
    icon: '🗿',
    troopClass: 'special',
  },
];

export interface TrainingTroop {
  troopId: string;
  startTime: number;
  endTime: number;
}

export interface Troop {
  typeId: string;
  count: number;
}

export function getTroopTypeById(id: string): TroopType | undefined {
  return TROOP_TYPES.find(troop => troop.id === id);
}

export function getTroopsByEra(era: string): TroopType[] {
  return TROOP_TYPES.filter(troop => troop.era === era);
}

export function canTrainTroop(
  troopId: string,
  unlockedTroops: Set<string>,
  resources: { food: number; gold: number; wood: number; stone: number }
): boolean {
  const troopType = getTroopTypeById(troopId);
  if (!troopType) return false;
  if (!unlockedTroops.has(troopId)) return false;
  
  // Check costs
  if (resources.food < troopType.cost.food) return false;
  if (resources.gold < troopType.cost.gold) return false;
  if (troopType.cost.wood && resources.wood < troopType.cost.wood) return false;
  if (troopType.cost.stone && resources.stone < troopType.cost.stone) return false;
  
  return true;
}

export function calculateArmyPower(troops: Troop[]): { attack: number; defense: number; health: number } {
  let totalAttack = 0;
  let totalDefense = 0;
  let totalHealth = 0;
  
  for (const troop of troops) {
    const troopType = getTroopTypeById(troop.typeId);
    if (troopType) {
      totalAttack += troopType.stats.attack * troop.count;
      totalDefense += troopType.stats.defense * troop.count;
      totalHealth += troopType.stats.health * troop.count;
    }
  }
  
  return { attack: totalAttack, defense: totalDefense, health: totalHealth };
}
