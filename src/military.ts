// Military Enhancements System
// Includes: Unit Upgrades, Formations, Defense System, Heroes, Unit Experience, 
// Naval Combat, Siege Weapons, Military Traditions, and Espionage

import { Troop, TroopType, TROOP_TYPES, getTroopTypeById } from './barracks.js';

// ===== Unit Upgrades System =====
export interface UnitUpgrade {
  id: string;
  name: string;
  description: string;
  fromUnit: string;
  toUnit: string;
  cost: {
    food: number;
    gold: number;
    science: number;
  };
  requiredTech: string;
}

export const UNIT_UPGRADES: UnitUpgrade[] = [
  // Stone Age -> Bronze Age
  {
    id: 'upgrade_hunter_warrior',
    name: 'Upgrade Hunters',
    description: 'Upgrade your Hunters to Warriors with bronze weapons.',
    fromUnit: 'hunter',
    toUnit: 'warrior',
    cost: { food: 30, gold: 20, science: 20 },
    requiredTech: 'bronze_working',
  },
  // Bronze Age -> Iron Age
  {
    id: 'upgrade_warrior_swordsman',
    name: 'Upgrade Warriors',
    description: 'Upgrade your Warriors to Swordsmen with iron weapons.',
    fromUnit: 'warrior',
    toUnit: 'swordsman',
    cost: { food: 50, gold: 40, science: 50 },
    requiredTech: 'iron_working',
  },
  {
    id: 'upgrade_chariot_horseman',
    name: 'Upgrade Chariots',
    description: 'Upgrade your War Chariots to Horsemen.',
    fromUnit: 'chariot',
    toUnit: 'horseman',
    cost: { food: 60, gold: 50, science: 60 },
    requiredTech: 'horseback_riding',
  },
  // Classical -> Medieval
  {
    id: 'upgrade_horseman_knight',
    name: 'Upgrade Horsemen',
    description: 'Upgrade your Horsemen to Knights.',
    fromUnit: 'horseman',
    toUnit: 'knight',
    cost: { food: 80, gold: 100, science: 100 },
    requiredTech: 'feudalism',
  },
  {
    id: 'upgrade_legionary_knight',
    name: 'Upgrade Legionaries',
    description: 'Upgrade your Legionaries to Knights.',
    fromUnit: 'legionary',
    toUnit: 'knight',
    cost: { food: 70, gold: 90, science: 90 },
    requiredTech: 'feudalism',
  },
  // Medieval -> Renaissance
  {
    id: 'upgrade_musketeer_rifleman',
    name: 'Upgrade Musketeers',
    description: 'Upgrade your Musketeers to Riflemen.',
    fromUnit: 'musketeer',
    toUnit: 'rifleman',
    cost: { food: 100, gold: 150, science: 200 },
    requiredTech: 'military_science',
  },
  // Industrial -> Modern
  {
    id: 'upgrade_artillery_rocket_artillery',
    name: 'Upgrade Artillery',
    description: 'Upgrade your Artillery to Rocket Artillery.',
    fromUnit: 'artillery',
    toUnit: 'rocket_artillery',
    cost: { food: 200, gold: 500, science: 600 },
    requiredTech: 'rocketry',
  },
  // Modern -> Information
  {
    id: 'upgrade_tank_mech_infantry',
    name: 'Mechanize Infantry',
    description: 'Upgrade your Tanks to Mechanized Infantry.',
    fromUnit: 'tank',
    toUnit: 'mech_infantry',
    cost: { food: 300, gold: 800, science: 1000 },
    requiredTech: 'robotics',
  },
  // Information -> Future
  {
    id: 'upgrade_mech_space_marine',
    name: 'Space Marine Program',
    description: 'Upgrade your Mechanized Infantry to Space Marines.',
    fromUnit: 'mech_infantry',
    toUnit: 'space_marine',
    cost: { food: 500, gold: 1500, science: 2000 },
    requiredTech: 'space_colonization',
  },
];

export function getUpgradeById(id: string): UnitUpgrade | undefined {
  return UNIT_UPGRADES.find(u => u.id === id);
}

export function getUpgradesForUnit(unitId: string): UnitUpgrade[] {
  return UNIT_UPGRADES.filter(u => u.fromUnit === unitId);
}

export function canUpgradeUnit(
  upgrade: UnitUpgrade,
  army: Troop[],
  resources: { food: number; gold: number; science: number },
  researchedTechs: Set<string>
): boolean {
  // Check if player has the unit to upgrade
  const troopEntry = army.find(t => t.typeId === upgrade.fromUnit);
  if (!troopEntry || troopEntry.count <= 0) return false;

  // Check if tech is researched
  if (!researchedTechs.has(upgrade.requiredTech)) return false;

  // Check resources
  if (resources.food < upgrade.cost.food) return false;
  if (resources.gold < upgrade.cost.gold) return false;
  if (resources.science < upgrade.cost.science) return false;

  return true;
}

// ===== Combat Formations System =====
export interface Formation {
  id: string;
  name: string;
  description: string;
  icon: string;
  attackModifier: number;
  defenseModifier: number;
  healthModifier: number;
  specialEffect?: string;
  requiredTech?: string;
}

export const FORMATIONS: Formation[] = [
  {
    id: 'standard',
    name: 'Standard Formation',
    description: 'Balanced formation with no special bonuses.',
    icon: '⚔️',
    attackModifier: 1.0,
    defenseModifier: 1.0,
    healthModifier: 1.0,
  },
  {
    id: 'aggressive',
    name: 'Aggressive Stance',
    description: 'All-out attack sacrificing defense. +30% Attack, -20% Defense.',
    icon: '🔥',
    attackModifier: 1.3,
    defenseModifier: 0.8,
    healthModifier: 1.0,
    specialEffect: 'First strike bonus',
  },
  {
    id: 'defensive',
    name: 'Defensive Stance',
    description: 'Hunker down and hold the line. +40% Defense, -15% Attack.',
    icon: '🛡️',
    attackModifier: 0.85,
    defenseModifier: 1.4,
    healthModifier: 1.0,
    specialEffect: 'Reduced casualties',
  },
  {
    id: 'phalanx',
    name: 'Phalanx Formation',
    description: 'Ancient formation focusing on collective defense. +50% Defense.',
    icon: '🗡️',
    attackModifier: 0.9,
    defenseModifier: 1.5,
    healthModifier: 1.1,
    requiredTech: 'iron_working',
    specialEffect: 'Shield wall',
  },
  {
    id: 'cavalry_charge',
    name: 'Cavalry Charge',
    description: 'Swift mounted attack. +50% Attack but lower defense.',
    icon: '🐴',
    attackModifier: 1.5,
    defenseModifier: 0.7,
    healthModifier: 1.0,
    requiredTech: 'horseback_riding',
    specialEffect: 'Breakthrough damage',
  },
  {
    id: 'guerrilla',
    name: 'Guerrilla Tactics',
    description: 'Hit and run tactics. +20% Attack, +20% Defense, -10% Health.',
    icon: '🌿',
    attackModifier: 1.2,
    defenseModifier: 1.2,
    healthModifier: 0.9,
    requiredTech: 'military_science',
    specialEffect: 'Evasion bonus',
  },
  {
    id: 'blitzkrieg',
    name: 'Blitzkrieg',
    description: 'Lightning warfare. +60% Attack, -30% Defense.',
    icon: '⚡',
    attackModifier: 1.6,
    defenseModifier: 0.7,
    healthModifier: 1.0,
    requiredTech: 'combustion',
    specialEffect: 'Shock and awe',
  },
  {
    id: 'combined_arms',
    name: 'Combined Arms',
    description: 'Modern integrated warfare. +25% to all stats.',
    icon: '🎯',
    attackModifier: 1.25,
    defenseModifier: 1.25,
    healthModifier: 1.25,
    requiredTech: 'internet',
    specialEffect: 'Force multiplier',
  },
];

export function getFormationById(id: string): Formation | undefined {
  return FORMATIONS.find(f => f.id === id);
}

export function getAvailableFormations(researchedTechs: Set<string>): Formation[] {
  return FORMATIONS.filter(f => !f.requiredTech || researchedTechs.has(f.requiredTech));
}

// ===== Defense System =====
export interface DefenseStructure {
  id: string;
  name: string;
  description: string;
  icon: string;
  era: string;
  defenseBonus: number;
  healthBonus: number;
  cost: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
  };
  buildTime: number;
  maxCount: number;
  requiredTech: string;
}

export const DEFENSE_STRUCTURES: DefenseStructure[] = [
  {
    id: 'wooden_palisade',
    name: 'Wooden Palisade',
    description: 'Basic wooden defensive wall.',
    icon: '🪵',
    era: 'stone_age',
    defenseBonus: 10,
    healthBonus: 50,
    cost: { food: 0, wood: 100, stone: 0, gold: 0 },
    buildTime: 30,
    maxCount: 3,
    requiredTech: 'stone_tools',
  },
  {
    id: 'stone_wall',
    name: 'Stone Wall',
    description: 'Sturdy stone defensive wall.',
    icon: '🧱',
    era: 'bronze_age',
    defenseBonus: 25,
    healthBonus: 150,
    cost: { food: 0, wood: 50, stone: 200, gold: 50 },
    buildTime: 60,
    maxCount: 3,
    requiredTech: 'bronze_working',
  },
  {
    id: 'watchtower',
    name: 'Watchtower',
    description: 'Provides early warning and ranged defense.',
    icon: '🗼',
    era: 'iron_age',
    defenseBonus: 15,
    healthBonus: 75,
    cost: { food: 0, wood: 100, stone: 150, gold: 50 },
    buildTime: 45,
    maxCount: 4,
    requiredTech: 'construction',
  },
  {
    id: 'fortified_wall',
    name: 'Fortified Wall',
    description: 'Reinforced wall with battlements.',
    icon: '🏰',
    era: 'classical_age',
    defenseBonus: 50,
    healthBonus: 300,
    cost: { food: 0, wood: 100, stone: 400, gold: 100 },
    buildTime: 90,
    maxCount: 3,
    requiredTech: 'engineering',
  },
  {
    id: 'castle',
    name: 'Castle',
    description: 'Massive fortification providing ultimate defense.',
    icon: '🏯',
    era: 'medieval_age',
    defenseBonus: 100,
    healthBonus: 500,
    cost: { food: 100, wood: 200, stone: 800, gold: 300 },
    buildTime: 180,
    maxCount: 2,
    requiredTech: 'feudalism',
  },
  {
    id: 'star_fort',
    name: 'Star Fort',
    description: 'Angular fortress designed to resist cannon fire.',
    icon: '⭐',
    era: 'renaissance',
    defenseBonus: 150,
    healthBonus: 750,
    cost: { food: 200, wood: 300, stone: 1200, gold: 500 },
    buildTime: 240,
    maxCount: 2,
    requiredTech: 'military_science',
  },
  {
    id: 'bunker',
    name: 'Bunker',
    description: 'Reinforced concrete bunker for modern warfare.',
    icon: '🏗️',
    era: 'modern_age',
    defenseBonus: 200,
    healthBonus: 1000,
    cost: { food: 300, wood: 100, stone: 2000, gold: 800 },
    buildTime: 300,
    maxCount: 3,
    requiredTech: 'electricity',
  },
  {
    id: 'missile_defense',
    name: 'Missile Defense System',
    description: 'Advanced anti-missile defense network.',
    icon: '🚀',
    era: 'atomic_age',
    defenseBonus: 300,
    healthBonus: 1500,
    cost: { food: 500, wood: 200, stone: 3000, gold: 2000 },
    buildTime: 360,
    maxCount: 2,
    requiredTech: 'rocketry',
  },
  {
    id: 'energy_shield',
    name: 'Energy Shield',
    description: 'Force field protection against all attacks.',
    icon: '💠',
    era: 'future_age',
    defenseBonus: 500,
    healthBonus: 3000,
    cost: { food: 1000, wood: 500, stone: 5000, gold: 5000 },
    buildTime: 480,
    maxCount: 1,
    requiredTech: 'fusion_power',
  },
];

export interface DefenseBuilding {
  typeId: string;
  count: number;
}

export function getDefenseStructureById(id: string): DefenseStructure | undefined {
  return DEFENSE_STRUCTURES.find(d => d.id === id);
}

export function calculateDefenseBonuses(defenseBuildings: DefenseBuilding[]): { defense: number; health: number } {
  let totalDefense = 0;
  let totalHealth = 0;

  for (const building of defenseBuildings) {
    const structure = getDefenseStructureById(building.typeId);
    if (structure) {
      totalDefense += structure.defenseBonus * building.count;
      totalHealth += structure.healthBonus * building.count;
    }
  }

  return { defense: totalDefense, health: totalHealth };
}

// ===== Heroes/Generals System =====
export interface Hero {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  era: string;
  bonuses: {
    attackBonus: number;
    defenseBonus: number;
    healthBonus: number;
    specialAbility: string;
  };
  cost: {
    gold: number;
    science: number;
  };
  requiredTech: string;
}

export const HEROES: Hero[] = [
  {
    id: 'tribal_chief',
    name: 'Grunk',
    title: 'Tribal Chief',
    description: 'A fierce tribal leader who inspires warriors.',
    icon: '🦴',
    era: 'stone_age',
    bonuses: {
      attackBonus: 10,
      defenseBonus: 5,
      healthBonus: 50,
      specialAbility: 'Rally Cry - +15% attack for all units',
    },
    cost: { gold: 50, science: 30 },
    requiredTech: 'hunting',
  },
  {
    id: 'bronze_commander',
    name: 'Marduk',
    title: 'Bronze Commander',
    description: 'A legendary commander of bronze age armies.',
    icon: '⚔️',
    era: 'bronze_age',
    bonuses: {
      attackBonus: 20,
      defenseBonus: 15,
      healthBonus: 100,
      specialAbility: 'Bronze Wall - +25% defense when defending',
    },
    cost: { gold: 150, science: 100 },
    requiredTech: 'bronze_working',
  },
  {
    id: 'iron_general',
    name: 'Leonidas',
    title: 'Iron General',
    description: 'A tactical genius of iron age warfare.',
    icon: '🛡️',
    era: 'iron_age',
    bonuses: {
      attackBonus: 35,
      defenseBonus: 40,
      healthBonus: 200,
      specialAbility: 'Phalanx Master - Defense formations are 50% more effective',
    },
    cost: { gold: 400, science: 300 },
    requiredTech: 'iron_working',
  },
  {
    id: 'classical_strategos',
    name: 'Alexander',
    title: 'Strategos',
    description: 'A conquering hero who never lost a battle.',
    icon: '👑',
    era: 'classical_age',
    bonuses: {
      attackBonus: 60,
      defenseBonus: 30,
      healthBonus: 250,
      specialAbility: 'Conqueror - +50% rewards from victories',
    },
    cost: { gold: 800, science: 500 },
    requiredTech: 'philosophy',
  },
  {
    id: 'medieval_knight',
    name: 'Richard',
    title: 'Lionheart',
    description: 'A crusading king renowned for his valor.',
    icon: '🦁',
    era: 'medieval_age',
    bonuses: {
      attackBonus: 80,
      defenseBonus: 60,
      healthBonus: 400,
      specialAbility: 'Chivalry - Knights deal double damage',
    },
    cost: { gold: 1500, science: 800 },
    requiredTech: 'feudalism',
  },
  {
    id: 'renaissance_admiral',
    name: 'Drake',
    title: 'Admiral',
    description: 'A master of naval warfare and exploration.',
    icon: '⚓',
    era: 'renaissance',
    bonuses: {
      attackBonus: 100,
      defenseBonus: 50,
      healthBonus: 350,
      specialAbility: 'Sea Wolf - Naval units +75% effectiveness',
    },
    cost: { gold: 2500, science: 1200 },
    requiredTech: 'astronomy',
  },
  {
    id: 'industrial_marshal',
    name: 'Napoleon',
    title: 'Marshal',
    description: 'A military genius who conquered empires.',
    icon: '🎖️',
    era: 'industrial_age',
    bonuses: {
      attackBonus: 150,
      defenseBonus: 80,
      healthBonus: 600,
      specialAbility: 'Grande Armée - All units +20% stats',
    },
    cost: { gold: 5000, science: 2500 },
    requiredTech: 'steam_power',
  },
  {
    id: 'modern_general',
    name: 'Patton',
    title: 'General',
    description: 'A tank commander who led from the front.',
    icon: '🎗️',
    era: 'modern_age',
    bonuses: {
      attackBonus: 250,
      defenseBonus: 120,
      healthBonus: 800,
      specialAbility: 'Armor Blitz - Tanks deal +100% damage',
    },
    cost: { gold: 10000, science: 5000 },
    requiredTech: 'combustion',
  },
  {
    id: 'atomic_commander',
    name: 'Zhukov',
    title: 'Supreme Commander',
    description: 'Master of massive military operations.',
    icon: '⭐',
    era: 'atomic_age',
    bonuses: {
      attackBonus: 400,
      defenseBonus: 200,
      healthBonus: 1200,
      specialAbility: 'Deep Battle - +30% attack, -25% casualties',
    },
    cost: { gold: 20000, science: 10000 },
    requiredTech: 'rocketry',
  },
  {
    id: 'cyber_commander',
    name: 'ARIA',
    title: 'Cyber Commander',
    description: 'An AI military strategist.',
    icon: '🤖',
    era: 'information_age',
    bonuses: {
      attackBonus: 600,
      defenseBonus: 400,
      healthBonus: 2000,
      specialAbility: 'Network Warfare - Enemy defense reduced by 30%',
    },
    cost: { gold: 40000, science: 25000 },
    requiredTech: 'artificial_intelligence',
  },
  {
    id: 'stellar_admiral',
    name: 'Nova',
    title: 'Stellar Admiral',
    description: 'Commander of the space fleet.',
    icon: '🌟',
    era: 'future_age',
    bonuses: {
      attackBonus: 1000,
      defenseBonus: 600,
      healthBonus: 3000,
      specialAbility: 'Orbital Strike - First strike deals triple damage',
    },
    cost: { gold: 100000, science: 50000 },
    requiredTech: 'space_colonization',
  },
];

export function getHeroById(id: string): Hero | undefined {
  return HEROES.find(h => h.id === id);
}

export function getAvailableHeroes(researchedTechs: Set<string>, recruitedHeroes: Set<string>): Hero[] {
  return HEROES.filter(h => 
    researchedTechs.has(h.requiredTech) && !recruitedHeroes.has(h.id)
  );
}

// ===== Unit Experience System =====
export interface UnitExperience {
  typeId: string;
  experience: number;
  level: number; // 0 = Recruit, 1 = Regular, 2 = Veteran, 3 = Elite
}

export const EXPERIENCE_LEVELS = [
  { level: 0, name: 'Recruit', expRequired: 0, attackBonus: 0, defenseBonus: 0, healthBonus: 0 },
  { level: 1, name: 'Regular', expRequired: 100, attackBonus: 5, defenseBonus: 5, healthBonus: 10 },
  { level: 2, name: 'Veteran', expRequired: 300, attackBonus: 15, defenseBonus: 15, healthBonus: 25 },
  { level: 3, name: 'Elite', expRequired: 600, attackBonus: 30, defenseBonus: 30, healthBonus: 50 },
];

export function getExperienceLevel(exp: number): typeof EXPERIENCE_LEVELS[0] {
  for (let i = EXPERIENCE_LEVELS.length - 1; i >= 0; i--) {
    if (exp >= EXPERIENCE_LEVELS[i].expRequired) {
      return EXPERIENCE_LEVELS[i];
    }
  }
  return EXPERIENCE_LEVELS[0];
}

export function calculateExperienceBonuses(unitExperience: UnitExperience[]): { attack: number; defense: number; health: number } {
  let totalAttack = 0;
  let totalDefense = 0;
  let totalHealth = 0;

  for (const unit of unitExperience) {
    const level = getExperienceLevel(unit.experience);
    totalAttack += level.attackBonus;
    totalDefense += level.defenseBonus;
    totalHealth += level.healthBonus;
  }

  return { attack: totalAttack, defense: totalDefense, health: totalHealth };
}

export function gainExperience(unitExperience: UnitExperience[], battleResult: { victory: boolean; rounds: number }): UnitExperience[] {
  const baseExp = battleResult.victory ? 50 : 20;
  const roundBonus = battleResult.rounds * 2;
  const totalExp = baseExp + roundBonus;

  return unitExperience.map(unit => ({
    ...unit,
    experience: unit.experience + totalExp,
    level: getExperienceLevel(unit.experience + totalExp).level,
  }));
}

// ===== Naval Combat System =====
export interface NavalUnit {
  id: string;
  name: string;
  description: string;
  icon: string;
  era: string;
  stats: {
    attack: number;
    defense: number;
    health: number;
  };
  cost: {
    food: number;
    wood: number;
    gold: number;
  };
  trainTime: number;
  requiredTech: string;
}

export const NAVAL_UNITS: NavalUnit[] = [
  {
    id: 'raft',
    name: 'War Raft',
    description: 'Simple wooden raft for river combat.',
    icon: '🪵',
    era: 'stone_age',
    stats: { attack: 5, defense: 2, health: 30 },
    cost: { food: 20, wood: 50, gold: 0 },
    trainTime: 15,
    requiredTech: 'hunting',
  },
  {
    id: 'galley',
    name: 'Galley',
    description: 'Oar-powered warship with bronze ram.',
    icon: '⛵',
    era: 'bronze_age',
    stats: { attack: 15, defense: 8, health: 60 },
    cost: { food: 40, wood: 100, gold: 30 },
    trainTime: 25,
    requiredTech: 'bronze_working',
  },
  {
    id: 'trireme',
    name: 'Trireme',
    description: 'Advanced galley with three rows of oars.',
    icon: '🚣',
    era: 'classical_age',
    stats: { attack: 30, defense: 15, health: 100 },
    cost: { food: 60, wood: 150, gold: 60 },
    trainTime: 35,
    requiredTech: 'iron_casting',
  },
  {
    id: 'longship',
    name: 'Longship',
    description: 'Fast raiding ship of the north.',
    icon: '🛶',
    era: 'medieval_age',
    stats: { attack: 45, defense: 20, health: 120 },
    cost: { food: 80, wood: 200, gold: 100 },
    trainTime: 40,
    requiredTech: 'feudalism',
  },
  {
    id: 'caravel',
    name: 'Caravel',
    description: 'Exploration and combat ship.',
    icon: '⛵',
    era: 'renaissance',
    stats: { attack: 60, defense: 35, health: 180 },
    cost: { food: 100, wood: 300, gold: 200 },
    trainTime: 50,
    requiredTech: 'astronomy',
  },
  {
    id: 'ship_of_the_line',
    name: 'Ship of the Line',
    description: 'Massive warship with multiple gun decks.',
    icon: '🚢',
    era: 'renaissance',
    stats: { attack: 100, defense: 60, health: 300 },
    cost: { food: 150, wood: 500, gold: 400 },
    trainTime: 70,
    requiredTech: 'military_science',
  },
  {
    id: 'ironclad',
    name: 'Ironclad',
    description: 'Steam-powered armored warship.',
    icon: '🚢',
    era: 'industrial_age',
    stats: { attack: 150, defense: 100, health: 500 },
    cost: { food: 200, wood: 300, gold: 700 },
    trainTime: 90,
    requiredTech: 'steam_power',
  },
  {
    id: 'battleship',
    name: 'Battleship',
    description: 'Heavily armored capital ship.',
    icon: '🛳️',
    era: 'modern_age',
    stats: { attack: 300, defense: 200, health: 1000 },
    cost: { food: 300, wood: 400, gold: 1500 },
    trainTime: 120,
    requiredTech: 'electricity',
  },
  {
    id: 'carrier',
    name: 'Aircraft Carrier',
    description: 'Mobile airbase at sea.',
    icon: '🛳️',
    era: 'modern_age',
    stats: { attack: 400, defense: 150, health: 1200 },
    cost: { food: 400, wood: 500, gold: 2500 },
    trainTime: 150,
    requiredTech: 'flight',
  },
  {
    id: 'nuclear_submarine',
    name: 'Nuclear Submarine',
    description: 'Stealth underwater attack vessel.',
    icon: '🚢',
    era: 'atomic_age',
    stats: { attack: 500, defense: 250, health: 800 },
    cost: { food: 500, wood: 300, gold: 3500 },
    trainTime: 180,
    requiredTech: 'nuclear_power',
  },
  {
    id: 'stealth_destroyer',
    name: 'Stealth Destroyer',
    description: 'Advanced radar-evading warship.',
    icon: '🚢',
    era: 'information_age',
    stats: { attack: 700, defense: 400, health: 1500 },
    cost: { food: 600, wood: 400, gold: 5000 },
    trainTime: 200,
    requiredTech: 'internet',
  },
  {
    id: 'space_cruiser',
    name: 'Space Cruiser',
    description: 'Interplanetary combat vessel.',
    icon: '🚀',
    era: 'future_age',
    stats: { attack: 1200, defense: 800, health: 3000 },
    cost: { food: 1000, wood: 500, gold: 10000 },
    trainTime: 300,
    requiredTech: 'space_colonization',
  },
];

export interface NavalTroop {
  typeId: string;
  count: number;
}

export function getNavalUnitById(id: string): NavalUnit | undefined {
  return NAVAL_UNITS.find(n => n.id === id);
}

export function calculateNavalPower(navy: NavalTroop[]): { attack: number; defense: number; health: number } {
  let totalAttack = 0;
  let totalDefense = 0;
  let totalHealth = 0;

  for (const ship of navy) {
    const unit = getNavalUnitById(ship.typeId);
    if (unit) {
      totalAttack += unit.stats.attack * ship.count;
      totalDefense += unit.stats.defense * ship.count;
      totalHealth += unit.stats.health * ship.count;
    }
  }

  return { attack: totalAttack, defense: totalDefense, health: totalHealth };
}

// ===== Siege Weapons System =====
export interface SiegeWeapon {
  id: string;
  name: string;
  description: string;
  icon: string;
  era: string;
  stats: {
    attack: number;
    defense: number;
    health: number;
    siegeBonus: number; // Bonus damage against fortifications
  };
  cost: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
  };
  trainTime: number;
  requiredTech: string;
}

export const SIEGE_WEAPONS: SiegeWeapon[] = [
  {
    id: 'battering_ram',
    name: 'Battering Ram',
    description: 'Simple ram for breaking gates.',
    icon: '🪵',
    era: 'bronze_age',
    stats: { attack: 10, defense: 5, health: 50, siegeBonus: 50 },
    cost: { food: 20, wood: 80, stone: 0, gold: 10 },
    trainTime: 20,
    requiredTech: 'bronze_working',
  },
  {
    id: 'siege_tower',
    name: 'Siege Tower',
    description: 'Mobile tower for scaling walls.',
    icon: '🗼',
    era: 'iron_age',
    stats: { attack: 5, defense: 20, health: 100, siegeBonus: 40 },
    cost: { food: 30, wood: 150, stone: 0, gold: 30 },
    trainTime: 40,
    requiredTech: 'construction',
  },
  {
    id: 'catapult',
    name: 'Catapult',
    description: 'Hurls stones at fortifications.',
    icon: '🎯',
    era: 'classical_age',
    stats: { attack: 40, defense: 5, health: 60, siegeBonus: 100 },
    cost: { food: 40, wood: 120, stone: 50, gold: 50 },
    trainTime: 35,
    requiredTech: 'engineering',
  },
  {
    id: 'ballista',
    name: 'Ballista',
    description: 'Giant crossbow for anti-personnel and siege.',
    icon: '🏹',
    era: 'classical_age',
    stats: { attack: 50, defense: 3, health: 40, siegeBonus: 60 },
    cost: { food: 30, wood: 100, stone: 20, gold: 40 },
    trainTime: 30,
    requiredTech: 'engineering',
  },
  {
    id: 'trebuchet',
    name: 'Trebuchet',
    description: 'Massive counterweight siege engine.',
    icon: '🎪',
    era: 'medieval_age',
    stats: { attack: 80, defense: 5, health: 80, siegeBonus: 200 },
    cost: { food: 60, wood: 200, stone: 100, gold: 100 },
    trainTime: 60,
    requiredTech: 'machinery',
  },
  {
    id: 'bombard',
    name: 'Bombard',
    description: 'Early cannon for siege warfare.',
    icon: '💣',
    era: 'medieval_age',
    stats: { attack: 120, defense: 5, health: 60, siegeBonus: 300 },
    cost: { food: 80, wood: 100, stone: 50, gold: 200 },
    trainTime: 70,
    requiredTech: 'gunpowder',
  },
  {
    id: 'cannon',
    name: 'Siege Cannon',
    description: 'Powerful artillery for breaching walls.',
    icon: '💥',
    era: 'renaissance',
    stats: { attack: 180, defense: 10, health: 100, siegeBonus: 400 },
    cost: { food: 100, wood: 150, stone: 100, gold: 350 },
    trainTime: 80,
    requiredTech: 'military_science',
  },
  {
    id: 'howitzer',
    name: 'Howitzer',
    description: 'Long-range bombardment weapon.',
    icon: '🔫',
    era: 'industrial_age',
    stats: { attack: 300, defense: 15, health: 150, siegeBonus: 500 },
    cost: { food: 150, wood: 100, stone: 150, gold: 600 },
    trainTime: 100,
    requiredTech: 'dynamite',
  },
  {
    id: 'cruise_missile',
    name: 'Cruise Missile',
    description: 'Precision-guided munition.',
    icon: '🚀',
    era: 'atomic_age',
    stats: { attack: 600, defense: 0, health: 50, siegeBonus: 1000 },
    cost: { food: 200, wood: 50, stone: 100, gold: 1500 },
    trainTime: 60,
    requiredTech: 'rocketry',
  },
  {
    id: 'orbital_bombardment',
    name: 'Orbital Strike Platform',
    description: 'Space-based weapons system.',
    icon: '��',
    era: 'future_age',
    stats: { attack: 1500, defense: 100, health: 200, siegeBonus: 3000 },
    cost: { food: 500, wood: 200, stone: 500, gold: 5000 },
    trainTime: 150,
    requiredTech: 'space_colonization',
  },
];

export interface SiegeTroop {
  typeId: string;
  count: number;
}

export function getSiegeWeaponById(id: string): SiegeWeapon | undefined {
  return SIEGE_WEAPONS.find(s => s.id === id);
}

export function calculateSiegePower(siegeWeapons: SiegeTroop[]): { attack: number; defense: number; health: number; siegeBonus: number } {
  let totalAttack = 0;
  let totalDefense = 0;
  let totalHealth = 0;
  let totalSiegeBonus = 0;

  for (const weapon of siegeWeapons) {
    const unit = getSiegeWeaponById(weapon.typeId);
    if (unit) {
      totalAttack += unit.stats.attack * weapon.count;
      totalDefense += unit.stats.defense * weapon.count;
      totalHealth += unit.stats.health * weapon.count;
      totalSiegeBonus += unit.stats.siegeBonus * weapon.count;
    }
  }

  return { attack: totalAttack, defense: totalDefense, health: totalHealth, siegeBonus: totalSiegeBonus };
}

// ===== Military Traditions System =====
export interface MilitaryTradition {
  id: string;
  name: string;
  description: string;
  icon: string;
  bonuses: {
    attackMultiplier?: number;
    defenseMultiplier?: number;
    healthMultiplier?: number;
    casualtyReduction?: number;
    experienceGain?: number;
    special?: string;
  };
  requirement: {
    battlesWon?: number;
    territoriesConquered?: number;
    heroesRecruited?: number;
    veteranUnits?: number;
  };
}

export const MILITARY_TRADITIONS: MilitaryTradition[] = [
  {
    id: 'warrior_spirit',
    name: 'Warrior Spirit',
    description: 'Your soldiers fight with fierce determination.',
    icon: '🔥',
    bonuses: { attackMultiplier: 1.05, special: '+5% attack' },
    requirement: { battlesWon: 5 },
  },
  {
    id: 'iron_discipline',
    name: 'Iron Discipline',
    description: 'Strict training creates resilient soldiers.',
    icon: '⚔️',
    bonuses: { defenseMultiplier: 1.05, special: '+5% defense' },
    requirement: { battlesWon: 10 },
  },
  {
    id: 'shock_tactics',
    name: 'Shock Tactics',
    description: 'Lightning-fast attacks overwhelm enemies.',
    icon: '⚡',
    bonuses: { attackMultiplier: 1.1, special: '+10% attack' },
    requirement: { battlesWon: 25 },
  },
  {
    id: 'fortification_masters',
    name: 'Fortification Masters',
    description: 'Your engineers build superior defenses.',
    icon: '🏰',
    bonuses: { defenseMultiplier: 1.15, special: '+15% defense' },
    requirement: { territoriesConquered: 10 },
  },
  {
    id: 'veteran_corps',
    name: 'Veteran Corps',
    description: 'Battle-hardened units form your army core.',
    icon: '🎖️',
    bonuses: { healthMultiplier: 1.1, experienceGain: 1.25, special: '+10% health, +25% exp gain' },
    requirement: { veteranUnits: 5 },
  },
  {
    id: 'heroic_legacy',
    name: 'Heroic Legacy',
    description: 'Tales of great heroes inspire your troops.',
    icon: '👑',
    bonuses: { attackMultiplier: 1.1, defenseMultiplier: 1.1, special: '+10% attack and defense' },
    requirement: { heroesRecruited: 3 },
  },
  {
    id: 'conquerors_pride',
    name: "Conqueror's Pride",
    description: 'Your empire is built on victory.',
    icon: '🌍',
    bonuses: { attackMultiplier: 1.15, casualtyReduction: 0.1, special: '+15% attack, -10% casualties' },
    requirement: { territoriesConquered: 20 },
  },
  {
    id: 'elite_forces',
    name: 'Elite Forces',
    description: 'The finest military in the world.',
    icon: '⭐',
    bonuses: { attackMultiplier: 1.2, defenseMultiplier: 1.2, healthMultiplier: 1.2, special: '+20% all stats' },
    requirement: { battlesWon: 100 },
  },
];

export function getTraditionById(id: string): MilitaryTradition | undefined {
  return MILITARY_TRADITIONS.find(t => t.id === id);
}

export function checkTraditionUnlock(
  tradition: MilitaryTradition,
  stats: { battlesWon: number; territoriesConquered: number; heroesRecruited: number; veteranUnits: number }
): boolean {
  const req = tradition.requirement;
  if (req.battlesWon && stats.battlesWon < req.battlesWon) return false;
  if (req.territoriesConquered && stats.territoriesConquered < req.territoriesConquered) return false;
  if (req.heroesRecruited && stats.heroesRecruited < req.heroesRecruited) return false;
  if (req.veteranUnits && stats.veteranUnits < req.veteranUnits) return false;
  return true;
}

export function calculateTraditionBonuses(unlockedTraditions: Set<string>): {
  attackMultiplier: number;
  defenseMultiplier: number;
  healthMultiplier: number;
  casualtyReduction: number;
  experienceGain: number;
} {
  let attackMultiplier = 1;
  let defenseMultiplier = 1;
  let healthMultiplier = 1;
  let casualtyReduction = 0;
  let experienceGain = 1;

  for (const traditionId of unlockedTraditions) {
    const tradition = getTraditionById(traditionId);
    if (tradition) {
      if (tradition.bonuses.attackMultiplier) attackMultiplier *= tradition.bonuses.attackMultiplier;
      if (tradition.bonuses.defenseMultiplier) defenseMultiplier *= tradition.bonuses.defenseMultiplier;
      if (tradition.bonuses.healthMultiplier) healthMultiplier *= tradition.bonuses.healthMultiplier;
      if (tradition.bonuses.casualtyReduction) casualtyReduction += tradition.bonuses.casualtyReduction;
      if (tradition.bonuses.experienceGain) experienceGain *= tradition.bonuses.experienceGain;
    }
  }

  return { attackMultiplier, defenseMultiplier, healthMultiplier, casualtyReduction, experienceGain };
}

// ===== Espionage System =====
export interface SpyMission {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // in seconds
  successChance: number; // base success rate 0-1
  cost: {
    gold: number;
  };
  effects: {
    type: 'sabotage' | 'intel' | 'steal' | 'counter';
    resourceStolen?: { resource: string; amount: number };
    enemyDebuff?: { stat: string; amount: number };
    intelGained?: string;
  };
  requiredTech: string;
}

export const SPY_MISSIONS: SpyMission[] = [
  {
    id: 'scout_enemy',
    name: 'Scout Enemy',
    description: 'Gather intelligence on enemy forces.',
    icon: '🔍',
    duration: 30,
    successChance: 0.9,
    cost: { gold: 50 },
    effects: { type: 'intel', intelGained: 'enemy_strength' },
    requiredTech: 'writing',
  },
  {
    id: 'steal_gold',
    name: 'Steal Gold',
    description: 'Pilfer gold from enemy treasury.',
    icon: '💰',
    duration: 60,
    successChance: 0.6,
    cost: { gold: 100 },
    effects: { type: 'steal', resourceStolen: { resource: 'gold', amount: 500 } },
    requiredTech: 'currency',
  },
  {
    id: 'sabotage_defenses',
    name: 'Sabotage Defenses',
    description: 'Weaken enemy fortifications.',
    icon: '💣',
    duration: 90,
    successChance: 0.5,
    cost: { gold: 200 },
    effects: { type: 'sabotage', enemyDebuff: { stat: 'defense', amount: 20 } },
    requiredTech: 'engineering',
  },
  {
    id: 'steal_research',
    name: 'Steal Research',
    description: 'Acquire enemy scientific knowledge.',
    icon: '📜',
    duration: 120,
    successChance: 0.4,
    cost: { gold: 500 },
    effects: { type: 'steal', resourceStolen: { resource: 'science', amount: 2000 } },
    requiredTech: 'printing_press',
  },
  {
    id: 'assassinate',
    name: 'Assassinate Commander',
    description: 'Remove enemy leadership.',
    icon: '🗡️',
    duration: 180,
    successChance: 0.3,
    cost: { gold: 1000 },
    effects: { type: 'sabotage', enemyDebuff: { stat: 'attack', amount: 30 } },
    requiredTech: 'military_science',
  },
  {
    id: 'counterintelligence',
    name: 'Counterintelligence',
    description: 'Protect against enemy spies.',
    icon: '🛡️',
    duration: 60,
    successChance: 0.8,
    cost: { gold: 300 },
    effects: { type: 'counter', intelGained: 'spy_protection' },
    requiredTech: 'radio',
  },
  {
    id: 'cyber_attack',
    name: 'Cyber Attack',
    description: 'Disrupt enemy communications.',
    icon: '💻',
    duration: 60,
    successChance: 0.65,
    cost: { gold: 2000 },
    effects: { type: 'sabotage', enemyDebuff: { stat: 'health', amount: 25 } },
    requiredTech: 'internet',
  },
  {
    id: 'grand_heist',
    name: 'Grand Heist',
    description: 'Massive coordinated theft operation.',
    icon: '🎭',
    duration: 240,
    successChance: 0.35,
    cost: { gold: 5000 },
    effects: { type: 'steal', resourceStolen: { resource: 'gold', amount: 25000 } },
    requiredTech: 'artificial_intelligence',
  },
];

export interface Spy {
  id: string;
  name: string;
  level: number;
  experience: number;
  currentMission: string | null;
  missionEndTime: number | null;
}

export interface ActiveSpyMission {
  spyId: string;
  missionId: string;
  startTime: number;
  endTime: number;
}

export function getSpyMissionById(id: string): SpyMission | undefined {
  return SPY_MISSIONS.find(m => m.id === id);
}

export function getAvailableSpyMissions(researchedTechs: Set<string>): SpyMission[] {
  return SPY_MISSIONS.filter(m => researchedTechs.has(m.requiredTech));
}

export function calculateSpySuccessChance(mission: SpyMission, spy: Spy): number {
  // Higher level spies have better success rates
  const levelBonus = spy.level * 0.05;
  return Math.min(0.95, mission.successChance + levelBonus);
}

// ===== Military State Interface =====
export interface MilitaryState {
  // Unit Upgrades - no state needed, handled by resources
  
  // Formations
  selectedFormation: string;
  
  // Defense System
  defenseBuildings: DefenseBuilding[];
  defenseConstructionQueue: { typeId: string; endTime: number }[];
  
  // Heroes
  recruitedHeroes: Set<string>;
  activeHero: string | null;
  
  // Unit Experience
  unitExperience: Map<string, UnitExperience>;
  
  // Naval Forces
  navy: NavalTroop[];
  navalTrainingQueue: { typeId: string; endTime: number }[];
  
  // Siege Weapons
  siegeWeapons: SiegeTroop[];
  siegeTrainingQueue: { typeId: string; endTime: number }[];
  
  // Military Traditions
  unlockedTraditions: Set<string>;
  
  // Espionage
  spies: Spy[];
  activeSpyMissions: ActiveSpyMission[];
  maxSpies: number;
}

export function createInitialMilitaryState(): MilitaryState {
  return {
    selectedFormation: 'standard',
    defenseBuildings: [],
    defenseConstructionQueue: [],
    recruitedHeroes: new Set(),
    activeHero: null,
    unitExperience: new Map(),
    navy: [],
    navalTrainingQueue: [],
    siegeWeapons: [],
    siegeTrainingQueue: [],
    unlockedTraditions: new Set(),
    spies: [],
    activeSpyMissions: [],
    maxSpies: 3,
  };
}

// ===== Combined Military Power Calculation =====
export function calculateTotalMilitaryPower(
  army: Troop[],
  militaryState: MilitaryState,
  researchedTechs: Set<string>
): { attack: number; defense: number; health: number } {
  // Base army power
  let totalAttack = 0;
  let totalDefense = 0;
  let totalHealth = 0;

  // Add land army power
  for (const troop of army) {
    const troopType = getTroopTypeById(troop.typeId);
    if (troopType) {
      totalAttack += troopType.stats.attack * troop.count;
      totalDefense += troopType.stats.defense * troop.count;
      totalHealth += troopType.stats.health * troop.count;
    }
  }

  // Add naval power
  const navalPower = calculateNavalPower(militaryState.navy);
  totalAttack += navalPower.attack;
  totalDefense += navalPower.defense;
  totalHealth += navalPower.health;

  // Add siege weapon power
  const siegePower = calculateSiegePower(militaryState.siegeWeapons);
  totalAttack += siegePower.attack;
  totalDefense += siegePower.defense;
  totalHealth += siegePower.health;

  // Add defense building bonuses
  const defenseBonuses = calculateDefenseBonuses(militaryState.defenseBuildings);
  totalDefense += defenseBonuses.defense;
  totalHealth += defenseBonuses.health;

  // Apply formation modifiers
  const formation = getFormationById(militaryState.selectedFormation);
  if (formation) {
    totalAttack *= formation.attackModifier;
    totalDefense *= formation.defenseModifier;
    totalHealth *= formation.healthModifier;
  }

  // Apply hero bonuses
  if (militaryState.activeHero) {
    const hero = getHeroById(militaryState.activeHero);
    if (hero) {
      totalAttack += hero.bonuses.attackBonus;
      totalDefense += hero.bonuses.defenseBonus;
      totalHealth += hero.bonuses.healthBonus;
    }
  }

  // Apply tradition bonuses
  const traditionBonuses = calculateTraditionBonuses(militaryState.unlockedTraditions);
  totalAttack *= traditionBonuses.attackMultiplier;
  totalDefense *= traditionBonuses.defenseMultiplier;
  totalHealth *= traditionBonuses.healthMultiplier;

  return {
    attack: Math.floor(totalAttack),
    defense: Math.floor(totalDefense),
    health: Math.floor(totalHealth),
  };
}
