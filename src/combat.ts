// Combat system with missions based on tech era
import { Troop, getTroopTypeById, calculateArmyPower } from './barracks.js';
import { ERAS } from './eras.js';

// Combat constants
const DEFENSE_MITIGATION_FACTOR = 0.3;
const MAX_BATTLE_ROUNDS = 50;
const DAMAGE_RANDOM_MIN = 0.8;
const DAMAGE_RANDOM_RANGE = 0.4;

// Enemy army size types
export type ArmySize = 'small' | 'medium' | 'large' | 'boss';

export interface EnemyArmy {
  name: string;
  troops: Troop[];
  attack: number;
  defense: number;
  health: number;
  size?: ArmySize;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  era: string;
  enemyArmy: EnemyArmy;
  rewards: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
  };
  unlocked: boolean;
}

// Conquest Mode Types
export interface Territory {
  id: string;
  name: string;
  description: string;
  era: string;
  conquered: boolean;
  enemyArmy: EnemyArmy;
  bonuses: {
    resourceMultiplier?: { resource: string; multiplier: number };
    flatBonus?: { resource: string; amount: number };
  };
  rewards: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
  };
}

export interface ConquestState {
  territories: Territory[];
  conqueredCount: number;
  totalBonuses: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
  };
}

export interface BattleLog {
  round: number;
  playerDamage: number;
  enemyDamage: number;
  playerHealth: number;
  enemyHealth: number;
  message: string;
}

export interface BattleResult {
  victory: boolean;
  logs: BattleLog[];
  playerStartHealth: number;
  enemyStartHealth: number;
  playerEndHealth: number;
  enemyEndHealth: number;
  rewards?: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
  };
  casualtyPercent: number;
}

export interface ActiveBattle {
  missionId: string;
  logs: BattleLog[];
  currentRound: number;
  isComplete: boolean;
  result: BattleResult | null;
  playerStartHealth: number;
  enemyStartHealth: number;
}

// Generate missions for each era with varied army sizes
export function generateMissions(): Mission[] {
  const missions: Mission[] = [];
  
  // Stone Age Missions - 4 missions (small, medium, large, boss)
  missions.push({
    id: 'stone_wolves',
    name: 'Wolf Pack',
    description: 'A small pack of wolves threatens your village. Defend your people!',
    era: 'stone_age',
    enemyArmy: {
      name: 'Wolf Pack',
      troops: [],
      attack: 5,
      defense: 2,
      health: 30,
      size: 'small',
    },
    rewards: { food: 50, wood: 20, stone: 10, gold: 0, science: 5 },
    unlocked: true,
  });
  
  missions.push({
    id: 'stone_raiders',
    name: 'Rival Tribe Raiders',
    description: 'A rival tribe is raiding your supplies. Fight them off!',
    era: 'stone_age',
    enemyArmy: {
      name: 'Tribal Raiders',
      troops: [],
      attack: 10,
      defense: 5,
      health: 60,
      size: 'medium',
    },
    rewards: { food: 100, wood: 50, stone: 30, gold: 0, science: 10 },
    unlocked: true,
  });

  missions.push({
    id: 'stone_mammoth_hunters',
    name: 'Mammoth Hunter Clan',
    description: 'A large clan of mammoth hunters wants your territory.',
    era: 'stone_age',
    enemyArmy: {
      name: 'Mammoth Hunter Clan',
      troops: [],
      attack: 15,
      defense: 8,
      health: 100,
      size: 'large',
    },
    rewards: { food: 180, wood: 90, stone: 60, gold: 0, science: 20 },
    unlocked: true,
  });

  missions.push({
    id: 'stone_cave_beast',
    name: 'Cave Beast',
    description: 'A legendary beast terrorizes the land. Only the bravest dare face it!',
    era: 'stone_age',
    enemyArmy: {
      name: 'Ancient Cave Beast',
      troops: [],
      attack: 25,
      defense: 15,
      health: 150,
      size: 'boss',
    },
    rewards: { food: 300, wood: 150, stone: 100, gold: 20, science: 40 },
    unlocked: true,
  });

  // Bronze Age Missions - 4 missions
  missions.push({
    id: 'bronze_scouts',
    name: 'Enemy Scouts',
    description: 'Enemy scouts probe your defenses. Eliminate them!',
    era: 'bronze_age',
    enemyArmy: {
      name: 'Scout Party',
      troops: [],
      attack: 15,
      defense: 8,
      health: 80,
      size: 'small',
    },
    rewards: { food: 100, wood: 70, stone: 50, gold: 30, science: 20 },
    unlocked: true,
  });

  missions.push({
    id: 'bronze_bandits',
    name: 'Bronze Bandits',
    description: 'Bandits with bronze weapons attack your trade routes.',
    era: 'bronze_age',
    enemyArmy: {
      name: 'Bronze Bandits',
      troops: [],
      attack: 25,
      defense: 15,
      health: 120,
      size: 'medium',
    },
    rewards: { food: 150, wood: 100, stone: 80, gold: 50, science: 30 },
    unlocked: true,
  });

  missions.push({
    id: 'bronze_chariot_army',
    name: 'Chariot Army',
    description: 'A massive chariot army approaches your borders!',
    era: 'bronze_age',
    enemyArmy: {
      name: 'Chariot Legion',
      troops: [],
      attack: 35,
      defense: 18,
      health: 160,
      size: 'large',
    },
    rewards: { food: 200, wood: 130, stone: 100, gold: 80, science: 45 },
    unlocked: true,
  });
  
  missions.push({
    id: 'bronze_warlord',
    name: "Warlord's Army",
    description: 'The Bronze Warlord seeks to conquer your lands with his elite army.',
    era: 'bronze_age',
    enemyArmy: {
      name: "Warlord's Forces",
      troops: [],
      attack: 50,
      defense: 25,
      health: 220,
      size: 'boss',
    },
    rewards: { food: 350, wood: 200, stone: 160, gold: 150, science: 70 },
    unlocked: true,
  });

  // Iron Age Missions - 4 missions
  missions.push({
    id: 'iron_raiders',
    name: 'Iron Raiders',
    description: 'Small raiding parties with iron weapons test your defenses.',
    era: 'iron_age',
    enemyArmy: {
      name: 'Iron Raiders',
      troops: [],
      attack: 40,
      defense: 25,
      health: 200,
      size: 'small',
    },
    rewards: { food: 280, wood: 180, stone: 140, gold: 120, science: 70 },
    unlocked: true,
  });

  missions.push({
    id: 'iron_invaders',
    name: 'Iron Invaders',
    description: 'An invading army with iron weapons threatens your borders.',
    era: 'iron_age',
    enemyArmy: {
      name: 'Iron Invaders',
      troops: [],
      attack: 60,
      defense: 40,
      health: 300,
      size: 'medium',
    },
    rewards: { food: 400, wood: 250, stone: 200, gold: 200, science: 100 },
    unlocked: true,
  });

  missions.push({
    id: 'iron_phalanx',
    name: 'Iron Phalanx',
    description: 'A disciplined phalanx of iron-clad warriors marches against you.',
    era: 'iron_age',
    enemyArmy: {
      name: 'Iron Phalanx',
      troops: [],
      attack: 80,
      defense: 55,
      health: 400,
      size: 'large',
    },
    rewards: { food: 550, wood: 350, stone: 280, gold: 300, science: 140 },
    unlocked: true,
  });
  
  missions.push({
    id: 'iron_empire',
    name: 'Empire Strike',
    description: 'The neighboring empire sends its elite legions against you.',
    era: 'iron_age',
    enemyArmy: {
      name: 'Imperial Legion',
      troops: [],
      attack: 100,
      defense: 70,
      health: 550,
      size: 'boss',
    },
    rewards: { food: 700, wood: 450, stone: 350, gold: 400, science: 180 },
    unlocked: true,
  });

  // Classical Age Missions - 4 missions
  missions.push({
    id: 'classical_mercenaries',
    name: 'Mercenary Band',
    description: 'A small band of mercenaries threatens your borders.',
    era: 'classical_age',
    enemyArmy: {
      name: 'Mercenary Band',
      troops: [],
      attack: 90,
      defense: 50,
      health: 450,
      size: 'small',
    },
    rewards: { food: 600, wood: 380, stone: 300, gold: 350, science: 150 },
    unlocked: true,
  });

  missions.push({
    id: 'classical_horde',
    name: 'Barbarian Horde',
    description: 'A barbarian horde approaches your civilization.',
    era: 'classical_age',
    enemyArmy: {
      name: 'Barbarian Horde',
      troops: [],
      attack: 120,
      defense: 70,
      health: 600,
      size: 'medium',
    },
    rewards: { food: 800, wood: 500, stone: 400, gold: 500, science: 200 },
    unlocked: true,
  });

  missions.push({
    id: 'classical_legion',
    name: 'Enemy Legion',
    description: 'A massive legion of enemy soldiers marches toward your lands.',
    era: 'classical_age',
    enemyArmy: {
      name: 'Enemy Legion',
      troops: [],
      attack: 145,
      defense: 90,
      health: 750,
      size: 'large',
    },
    rewards: { food: 950, wood: 620, stone: 470, gold: 620, science: 270 },
    unlocked: true,
  });
  
  missions.push({
    id: 'classical_rivals',
    name: 'Rival Kingdom',
    description: 'The rival kingdom declares war. Defend your honor against their elite forces!',
    era: 'classical_age',
    enemyArmy: {
      name: 'Royal Army',
      troops: [],
      attack: 180,
      defense: 110,
      health: 900,
      size: 'boss',
    },
    rewards: { food: 1200, wood: 800, stone: 600, gold: 800, science: 350 },
    unlocked: true,
  });

  // Medieval Age Missions - 4 missions
  missions.push({
    id: 'medieval_raiders',
    name: 'Viking Raiders',
    description: 'Viking raiders land on your shores seeking plunder.',
    era: 'medieval_age',
    enemyArmy: {
      name: 'Viking Raiders',
      troops: [],
      attack: 150,
      defense: 100,
      health: 750,
      size: 'small',
    },
    rewards: { food: 1100, wood: 750, stone: 600, gold: 750, science: 300 },
    unlocked: true,
  });

  missions.push({
    id: 'medieval_siege',
    name: 'Castle Siege',
    description: 'Enemy forces besiege your castle. Hold the walls!',
    era: 'medieval_age',
    enemyArmy: {
      name: 'Siege Army',
      troops: [],
      attack: 200,
      defense: 150,
      health: 1000,
      size: 'medium',
    },
    rewards: { food: 1500, wood: 1000, stone: 800, gold: 1000, science: 400 },
    unlocked: true,
  });

  missions.push({
    id: 'medieval_mongol_horde',
    name: 'Mongol Horde',
    description: 'The great Mongol horde sweeps across your land.',
    era: 'medieval_age',
    enemyArmy: {
      name: 'Mongol Horde',
      troops: [],
      attack: 250,
      defense: 170,
      health: 1250,
      size: 'large',
    },
    rewards: { food: 1800, wood: 1250, stone: 1000, gold: 1250, science: 520 },
    unlocked: true,
  });
  
  missions.push({
    id: 'medieval_crusade',
    name: 'Holy Crusade',
    description: 'A massive crusading army marches against your lands with divine fury.',
    era: 'medieval_age',
    enemyArmy: {
      name: 'Crusader Army',
      troops: [],
      attack: 320,
      defense: 220,
      health: 1600,
      size: 'boss',
    },
    rewards: { food: 2400, wood: 1700, stone: 1400, gold: 1800, science: 700 },
    unlocked: true,
  });

  // Renaissance Missions - 4 missions
  missions.push({
    id: 'renaissance_privateers',
    name: 'Privateers',
    description: 'Enemy privateers raid your shipping lanes.',
    era: 'renaissance',
    enemyArmy: {
      name: 'Privateer Fleet',
      troops: [],
      attack: 280,
      defense: 160,
      health: 1400,
      size: 'small',
    },
    rewards: { food: 2200, wood: 1500, stone: 1100, gold: 1800, science: 600 },
    unlocked: true,
  });

  missions.push({
    id: 'renaissance_pirates',
    name: 'Pirate Invasion',
    description: 'Pirates raid your coastal cities with advanced weaponry.',
    era: 'renaissance',
    enemyArmy: {
      name: 'Pirate Fleet',
      troops: [],
      attack: 350,
      defense: 200,
      health: 1800,
      size: 'medium',
    },
    rewards: { food: 3000, wood: 2000, stone: 1500, gold: 2500, science: 800 },
    unlocked: true,
  });

  missions.push({
    id: 'renaissance_conquistadors',
    name: 'Conquistadors',
    description: 'A large force of conquistadors seeks to claim your lands.',
    era: 'renaissance',
    enemyArmy: {
      name: 'Conquistador Army',
      troops: [],
      attack: 400,
      defense: 250,
      health: 2200,
      size: 'large',
    },
    rewards: { food: 3600, wood: 2600, stone: 1800, gold: 3100, science: 1000 },
    unlocked: true,
  });
  
  missions.push({
    id: 'renaissance_empire',
    name: 'Colonial War',
    description: 'A powerful colonial empire threatens your independence with their full might.',
    era: 'renaissance',
    enemyArmy: {
      name: 'Colonial Army',
      troops: [],
      attack: 500,
      defense: 310,
      health: 2800,
      size: 'boss',
    },
    rewards: { food: 4800, wood: 3500, stone: 2400, gold: 4200, science: 1400 },
    unlocked: true,
  });

  // Industrial Age Missions - 4 missions
  missions.push({
    id: 'industrial_militia',
    name: 'Rebel Militia',
    description: 'Armed militia rebels challenge your authority.',
    era: 'industrial_age',
    enemyArmy: {
      name: 'Rebel Militia',
      troops: [],
      attack: 450,
      defense: 260,
      health: 2200,
      size: 'small',
    },
    rewards: { food: 4500, wood: 3000, stone: 2200, gold: 3800, science: 1500 },
    unlocked: true,
  });

  missions.push({
    id: 'industrial_revolution',
    name: 'Revolution Forces',
    description: 'Revolutionary forces threaten to overthrow your government.',
    era: 'industrial_age',
    enemyArmy: {
      name: 'Revolutionary Army',
      troops: [],
      attack: 600,
      defense: 350,
      health: 3000,
      size: 'medium',
    },
    rewards: { food: 6000, wood: 4000, stone: 3000, gold: 5000, science: 2000 },
    unlocked: true,
  });

  missions.push({
    id: 'industrial_coalition',
    name: 'Enemy Coalition',
    description: 'Multiple nations form a coalition against you.',
    era: 'industrial_age',
    enemyArmy: {
      name: 'Coalition Forces',
      troops: [],
      attack: 720,
      defense: 440,
      health: 3600,
      size: 'large',
    },
    rewards: { food: 7200, wood: 5200, stone: 3700, gold: 6200, science: 2600 },
    unlocked: true,
  });
  
  missions.push({
    id: 'industrial_invasion',
    name: 'Great War',
    description: 'A great power declares total war against your nation. This is an existential threat!',
    era: 'industrial_age',
    enemyArmy: {
      name: 'War Machine',
      troops: [],
      attack: 900,
      defense: 560,
      health: 4500,
      size: 'boss',
    },
    rewards: { food: 9600, wood: 7200, stone: 4800, gold: 8400, science: 3600 },
    unlocked: true,
  });

  // Modern Age Missions - 4 missions
  missions.push({
    id: 'modern_insurgents',
    name: 'Insurgent Forces',
    description: 'Well-equipped insurgent forces operate in your territory.',
    era: 'modern_age',
    enemyArmy: {
      name: 'Insurgent Army',
      troops: [],
      attack: 750,
      defense: 450,
      health: 3800,
      size: 'small',
    },
    rewards: { food: 7500, wood: 5200, stone: 3800, gold: 7500, science: 3800 },
    unlocked: true,
  });

  missions.push({
    id: 'modern_conflict',
    name: 'Regional Conflict',
    description: 'A regional power challenges your military supremacy.',
    era: 'modern_age',
    enemyArmy: {
      name: 'Modern Army',
      troops: [],
      attack: 1000,
      defense: 600,
      health: 5000,
      size: 'medium',
    },
    rewards: { food: 10000, wood: 7000, stone: 5000, gold: 10000, science: 5000 },
    unlocked: true,
  });

  missions.push({
    id: 'modern_alliance',
    name: 'Enemy Alliance',
    description: 'A military alliance mobilizes against your nation.',
    era: 'modern_age',
    enemyArmy: {
      name: 'Allied Forces',
      troops: [],
      attack: 1250,
      defense: 780,
      health: 6200,
      size: 'large',
    },
    rewards: { food: 13000, wood: 9000, stone: 6800, gold: 13000, science: 6800 },
    unlocked: true,
  });
  
  missions.push({
    id: 'modern_superpower',
    name: 'Superpower Clash',
    description: 'Face the full military might of a global superpower.',
    era: 'modern_age',
    enemyArmy: {
      name: 'Superpower Forces',
      troops: [],
      attack: 1600,
      defense: 1000,
      health: 8000,
      size: 'boss',
    },
    rewards: { food: 18000, wood: 12000, stone: 9600, gold: 18000, science: 9600 },
    unlocked: true,
  });

  // Atomic Age Missions - 4 missions
  missions.push({
    id: 'atomic_rogue_state',
    name: 'Rogue State',
    description: 'A rogue state threatens nuclear confrontation.',
    era: 'atomic_age',
    enemyArmy: {
      name: 'Rogue Forces',
      troops: [],
      attack: 1500,
      defense: 900,
      health: 7500,
      size: 'small',
    },
    rewards: { food: 15000, wood: 11000, stone: 9000, gold: 19000, science: 9000 },
    unlocked: true,
  });

  missions.push({
    id: 'atomic_crisis',
    name: 'Nuclear Crisis',
    description: 'A nuclear-armed enemy threatens global destruction.',
    era: 'atomic_age',
    enemyArmy: {
      name: 'Nuclear Forces',
      troops: [],
      attack: 2000,
      defense: 1200,
      health: 10000,
      size: 'medium',
    },
    rewards: { food: 20000, wood: 15000, stone: 12000, gold: 25000, science: 12000 },
    unlocked: true,
  });

  missions.push({
    id: 'atomic_bloc',
    name: 'Enemy Bloc',
    description: 'An entire bloc of nuclear powers aligns against you.',
    era: 'atomic_age',
    enemyArmy: {
      name: 'Nuclear Bloc',
      troops: [],
      attack: 2600,
      defense: 1560,
      health: 13000,
      size: 'large',
    },
    rewards: { food: 26000, wood: 21000, stone: 17000, gold: 34000, science: 17000 },
    unlocked: true,
  });
  
  missions.push({
    id: 'atomic_world_war',
    name: 'World War III',
    description: 'The final conflict. Win or face extinction.',
    era: 'atomic_age',
    enemyArmy: {
      name: 'World Coalition',
      troops: [],
      attack: 3400,
      defense: 2000,
      health: 17000,
      size: 'boss',
    },
    rewards: { food: 36000, wood: 30000, stone: 24000, gold: 48000, science: 24000 },
    unlocked: true,
  });

  // Information Age Missions - 4 missions
  missions.push({
    id: 'info_hackers',
    name: 'Cyber Terrorists',
    description: 'Cyber terrorists with military backing launch attacks.',
    era: 'information_age',
    enemyArmy: {
      name: 'Cyber Terrorists',
      troops: [],
      attack: 3000,
      defense: 1900,
      health: 15000,
      size: 'small',
    },
    rewards: { food: 30000, wood: 22000, stone: 18000, gold: 45000, science: 26000 },
    unlocked: true,
  });

  missions.push({
    id: 'info_cyber',
    name: 'Cyber Warfare',
    description: 'A cyber-enhanced army attacks your infrastructure.',
    era: 'information_age',
    enemyArmy: {
      name: 'Cyber Army',
      troops: [],
      attack: 4000,
      defense: 2500,
      health: 20000,
      size: 'medium',
    },
    rewards: { food: 40000, wood: 30000, stone: 25000, gold: 60000, science: 35000 },
    unlocked: true,
  });

  missions.push({
    id: 'info_drone_swarm',
    name: 'Drone Swarm',
    description: 'Autonomous drone swarms overwhelm conventional defenses.',
    era: 'information_age',
    enemyArmy: {
      name: 'Drone Swarm',
      troops: [],
      attack: 5000,
      defense: 3100,
      health: 25000,
      size: 'large',
    },
    rewards: { food: 52000, wood: 39000, stone: 31000, gold: 72000, science: 44000 },
    unlocked: true,
  });
  
  missions.push({
    id: 'info_ai_uprising',
    name: 'AI Uprising',
    description: 'Rogue AI systems control an army of machines. The singularity is here!',
    era: 'information_age',
    enemyArmy: {
      name: 'Machine Army',
      troops: [],
      attack: 6200,
      defense: 4000,
      health: 32000,
      size: 'boss',
    },
    rewards: { food: 72000, wood: 54000, stone: 42000, gold: 96000, science: 60000 },
    unlocked: true,
  });

  // Future Age Missions - 4 missions
  missions.push({
    id: 'future_rebels',
    name: 'Space Rebels',
    description: 'Rebel forces with advanced tech challenge your authority.',
    era: 'future_age',
    enemyArmy: {
      name: 'Space Rebels',
      troops: [],
      attack: 6000,
      defense: 3800,
      health: 30000,
      size: 'small',
    },
    rewards: { food: 75000, wood: 52000, stone: 38000, gold: 112000, science: 75000 },
    unlocked: true,
  });

  missions.push({
    id: 'future_alien',
    name: 'Alien Invasion',
    description: 'Extraterrestrial forces invade Earth. Humanity\'s last stand!',
    era: 'future_age',
    enemyArmy: {
      name: 'Alien Fleet',
      troops: [],
      attack: 8000,
      defense: 5000,
      health: 40000,
      size: 'medium',
    },
    rewards: { food: 100000, wood: 70000, stone: 50000, gold: 150000, science: 100000 },
    unlocked: true,
  });

  missions.push({
    id: 'future_galactic_empire',
    name: 'Galactic Empire',
    description: 'A galactic empire sends its armada to conquer Earth.',
    era: 'future_age',
    enemyArmy: {
      name: 'Imperial Armada',
      troops: [],
      attack: 10500,
      defense: 6500,
      health: 52000,
      size: 'large',
    },
    rewards: { food: 130000, wood: 91000, stone: 65000, gold: 195000, science: 130000 },
    unlocked: true,
  });
  
  missions.push({
    id: 'future_singularity',
    name: 'Singularity War',
    description: 'Battle the transcended intelligence for the fate of the universe.',
    era: 'future_age',
    enemyArmy: {
      name: 'Singularity Entity',
      troops: [],
      attack: 14000,
      defense: 9000,
      health: 70000,
      size: 'boss',
    },
    rewards: { food: 240000, wood: 180000, stone: 120000, gold: 360000, science: 240000 },
    unlocked: true,
  });

  return missions;
}

export function getMissionsByEra(missions: Mission[], era: string): Mission[] {
  return missions.filter(m => m.era === era);
}

export function getMissionById(missions: Mission[], id: string): Mission | undefined {
  return missions.find(m => m.id === id);
}

// Calculate damage with some randomness
function calculateDamage(attack: number, defense: number): number {
  // Base damage is attack minus some defense mitigation
  const baseDamage = Math.max(1, attack - (defense * DEFENSE_MITIGATION_FACTOR));
  // Add some randomness (80% to 120% of base damage)
  const randomFactor = DAMAGE_RANDOM_MIN + Math.random() * DAMAGE_RANDOM_RANGE;
  return Math.floor(baseDamage * randomFactor);
}

// Generate battle messages
function getBattleMessage(round: number, playerDamage: number, enemyDamage: number, isPlayerTurn: boolean): string {
  const attackMessages = [
    'launches a fierce attack',
    'strikes with full force',
    'charges forward',
    'unleashes a devastating blow',
    'executes a tactical strike',
  ];
  
  const defenseMessages = [
    'takes the hit',
    'suffers damage',
    'is pushed back',
    'loses ground',
    'withstands the assault',
  ];
  
  const attackMsg = attackMessages[Math.floor(Math.random() * attackMessages.length)];
  const defenseMsg = defenseMessages[Math.floor(Math.random() * defenseMessages.length)];
  
  if (isPlayerTurn) {
    return `Round ${round}: Your army ${attackMsg} dealing ${playerDamage} damage! Enemy ${defenseMsg}.`;
  } else {
    return `Round ${round}: Enemy army ${attackMsg} dealing ${enemyDamage} damage! Your forces ${defenseMsg}.`;
  }
}

// Simulate a single round of combat
export function simulateBattleRound(
  playerHealth: number,
  enemyHealth: number,
  playerAttack: number,
  playerDefense: number,
  enemyAttack: number,
  enemyDefense: number,
  round: number
): BattleLog {
  // Both sides attack each round
  const playerDamage = calculateDamage(playerAttack, enemyDefense);
  const enemyDamage = calculateDamage(enemyAttack, playerDefense);
  
  const newPlayerHealth = Math.max(0, playerHealth - enemyDamage);
  const newEnemyHealth = Math.max(0, enemyHealth - playerDamage);
  
  const messages = [
    `Your army deals ${playerDamage} damage!`,
    `Enemy army deals ${enemyDamage} damage!`,
  ];
  
  return {
    round,
    playerDamage,
    enemyDamage,
    playerHealth: newPlayerHealth,
    enemyHealth: newEnemyHealth,
    message: messages.join(' '),
  };
}

// Generate all battle rounds at once (for pre-computing the battle)
export function generateBattleLogs(
  playerArmy: { attack: number; defense: number; health: number },
  enemyArmy: EnemyArmy
): BattleLog[] {
  const logs: BattleLog[] = [];
  let playerHealth = playerArmy.health;
  let enemyHealth = enemyArmy.health;
  let round = 1;
  
  while (playerHealth > 0 && enemyHealth > 0 && round <= MAX_BATTLE_ROUNDS) {
    const log = simulateBattleRound(
      playerHealth,
      enemyHealth,
      playerArmy.attack,
      playerArmy.defense,
      enemyArmy.attack,
      enemyArmy.defense,
      round
    );
    
    playerHealth = log.playerHealth;
    enemyHealth = log.enemyHealth;
    logs.push(log);
    round++;
  }
  
  return logs;
}

// Determine battle result from logs
export function determineBattleResult(
  logs: BattleLog[],
  playerStartHealth: number,
  enemyStartHealth: number,
  mission: Mission
): BattleResult {
  const lastLog = logs[logs.length - 1];
  const victory = lastLog.enemyHealth <= 0;
  const playerEndHealth = lastLog.playerHealth;
  const enemyEndHealth = lastLog.enemyHealth;
  
  // Calculate casualty percent (how much health was lost)
  const casualtyPercent = Math.round(((playerStartHealth - playerEndHealth) / playerStartHealth) * 100);
  
  return {
    victory,
    logs,
    playerStartHealth,
    enemyStartHealth,
    playerEndHealth,
    enemyEndHealth,
    rewards: victory ? mission.rewards : undefined,
    casualtyPercent,
  };
}

// Full combat simulation
export function simulateCombat(
  playerArmy: Troop[],
  mission: Mission
): BattleResult {
  const playerPower = calculateArmyPower(playerArmy);
  
  // If player has no army, they lose instantly
  if (playerPower.health <= 0) {
    return {
      victory: false,
      logs: [{
        round: 1,
        playerDamage: 0,
        enemyDamage: mission.enemyArmy.health,
        playerHealth: 0,
        enemyHealth: mission.enemyArmy.health,
        message: 'You have no army to fight! The enemy claims victory.',
      }],
      playerStartHealth: 0,
      enemyStartHealth: mission.enemyArmy.health,
      playerEndHealth: 0,
      enemyEndHealth: mission.enemyArmy.health,
      casualtyPercent: 100,
    };
  }
  
  const logs = generateBattleLogs(playerPower, mission.enemyArmy);
  return determineBattleResult(logs, playerPower.health, mission.enemyArmy.health, mission);
}

// Check if player can start a mission (has army)
export function canStartMission(playerArmy: Troop[]): boolean {
  const power = calculateArmyPower(playerArmy);
  return power.health > 0;
}

// Get era index for comparison
export function getEraIndex(eraId: string): number {
  return ERAS.findIndex(e => e.id === eraId);
}

// Check if mission is available for current era
export function isMissionAvailable(mission: Mission, currentEra: string): boolean {
  const missionEraIndex = getEraIndex(mission.era);
  const currentEraIndex = getEraIndex(currentEra);
  return missionEraIndex <= currentEraIndex;
}

// ===== Conquest Mode Functions =====

// Generate territories for conquest mode
export function generateTerritories(): Territory[] {
  const territories: Territory[] = [];
  
  // Stone Age Territories
  territories.push({
    id: 'territory_river_valley',
    name: 'River Valley',
    description: 'A fertile valley with abundant food sources.',
    era: 'stone_age',
    conquered: false,
    enemyArmy: {
      name: 'River Tribe',
      troops: [],
      attack: 8,
      defense: 4,
      health: 50,
      size: 'small',
    },
    bonuses: { flatBonus: { resource: 'food', amount: 1 } },
    rewards: { food: 80, wood: 40, stone: 20, gold: 0, science: 10 },
  });

  territories.push({
    id: 'territory_forest_encampment',
    name: 'Forest Encampment',
    description: 'Dense woodland rich with timber.',
    era: 'stone_age',
    conquered: false,
    enemyArmy: {
      name: 'Forest Dwellers',
      troops: [],
      attack: 12,
      defense: 6,
      health: 70,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'wood', amount: 1 } },
    rewards: { food: 60, wood: 100, stone: 30, gold: 0, science: 15 },
  });

  // Bronze Age Territories
  territories.push({
    id: 'territory_copper_mines',
    name: 'Copper Mines',
    description: 'Rich copper deposits for bronze production.',
    era: 'bronze_age',
    conquered: false,
    enemyArmy: {
      name: 'Mine Guards',
      troops: [],
      attack: 30,
      defense: 20,
      health: 150,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'gold', amount: 2 } },
    rewards: { food: 200, wood: 150, stone: 200, gold: 150, science: 50 },
  });

  territories.push({
    id: 'territory_trade_crossroads',
    name: 'Trade Crossroads',
    description: 'A strategic trading hub.',
    era: 'bronze_age',
    conquered: false,
    enemyArmy: {
      name: 'Merchant Guards',
      troops: [],
      attack: 45,
      defense: 25,
      health: 200,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'gold', multiplier: 1.1 } },
    rewards: { food: 300, wood: 200, stone: 180, gold: 250, science: 80 },
  });

  // Iron Age Territories
  territories.push({
    id: 'territory_iron_hills',
    name: 'Iron Hills',
    description: 'Mountains rich with iron ore.',
    era: 'iron_age',
    conquered: false,
    enemyArmy: {
      name: 'Hill Clan',
      troops: [],
      attack: 70,
      defense: 50,
      health: 350,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'stone', amount: 3 } },
    rewards: { food: 500, wood: 350, stone: 400, gold: 300, science: 150 },
  });

  territories.push({
    id: 'territory_coastal_fortress',
    name: 'Coastal Fortress',
    description: 'A strategic naval position.',
    era: 'iron_age',
    conquered: false,
    enemyArmy: {
      name: 'Coastal Garrison',
      troops: [],
      attack: 95,
      defense: 70,
      health: 500,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'food', multiplier: 1.15 } },
    rewards: { food: 700, wood: 500, stone: 400, gold: 450, science: 200 },
  });

  // Classical Age Territories
  territories.push({
    id: 'territory_ancient_library',
    name: 'Ancient Library',
    description: 'A repository of ancient knowledge.',
    era: 'classical_age',
    conquered: false,
    enemyArmy: {
      name: 'Library Guards',
      troops: [],
      attack: 140,
      defense: 90,
      health: 700,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'science', amount: 5 } },
    rewards: { food: 900, wood: 600, stone: 500, gold: 700, science: 500 },
  });

  territories.push({
    id: 'territory_golden_city',
    name: 'Golden City',
    description: 'A wealthy city of gold and culture.',
    era: 'classical_age',
    conquered: false,
    enemyArmy: {
      name: 'City Guard',
      troops: [],
      attack: 175,
      defense: 120,
      health: 900,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'gold', multiplier: 1.2 } },
    rewards: { food: 1100, wood: 750, stone: 600, gold: 1200, science: 400 },
  });

  // Medieval Age Territories
  territories.push({
    id: 'territory_castle_keep',
    name: 'Castle Keep',
    description: 'An impenetrable fortress.',
    era: 'medieval_age',
    conquered: false,
    enemyArmy: {
      name: 'Castle Defenders',
      troops: [],
      attack: 240,
      defense: 180,
      health: 1200,
      size: 'large',
    },
    bonuses: { flatBonus: { resource: 'stone', amount: 5 } },
    rewards: { food: 1800, wood: 1200, stone: 1500, gold: 1400, science: 700 },
  });

  territories.push({
    id: 'territory_holy_land',
    name: 'Holy Land',
    description: 'A sacred territory with immense spiritual value.',
    era: 'medieval_age',
    conquered: false,
    enemyArmy: {
      name: 'Zealot Army',
      troops: [],
      attack: 300,
      defense: 210,
      health: 1500,
      size: 'boss',
    },
    bonuses: { resourceMultiplier: { resource: 'science', multiplier: 1.2 } },
    rewards: { food: 2200, wood: 1600, stone: 1300, gold: 2000, science: 1000 },
  });

  // Renaissance Territories
  territories.push({
    id: 'territory_trading_port',
    name: 'Trading Port',
    description: 'A bustling international trading port.',
    era: 'renaissance',
    conquered: false,
    enemyArmy: {
      name: 'Port Militia',
      troops: [],
      attack: 400,
      defense: 250,
      health: 2000,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'gold', amount: 10 } },
    rewards: { food: 3500, wood: 2500, stone: 2000, gold: 4000, science: 1500 },
  });

  territories.push({
    id: 'territory_new_world_colony',
    name: 'New World Colony',
    description: 'A rich colony in the new world.',
    era: 'renaissance',
    conquered: false,
    enemyArmy: {
      name: 'Colonial Defense',
      troops: [],
      attack: 480,
      defense: 300,
      health: 2600,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'food', multiplier: 1.25 } },
    rewards: { food: 5000, wood: 3500, stone: 2500, gold: 4500, science: 1800 },
  });

  // Industrial Age Territories
  territories.push({
    id: 'territory_coal_basin',
    name: 'Coal Basin',
    description: 'Vast coal deposits to fuel your industries.',
    era: 'industrial_age',
    conquered: false,
    enemyArmy: {
      name: 'Mining Company',
      troops: [],
      attack: 650,
      defense: 400,
      health: 3200,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'stone', amount: 15 } },
    rewards: { food: 7000, wood: 5000, stone: 6000, gold: 6000, science: 3000 },
  });

  territories.push({
    id: 'territory_industrial_heartland',
    name: 'Industrial Heartland',
    description: 'The manufacturing hub of a nation.',
    era: 'industrial_age',
    conquered: false,
    enemyArmy: {
      name: 'Industrial Guard',
      troops: [],
      attack: 850,
      defense: 540,
      health: 4200,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'wood', multiplier: 1.3 } },
    rewards: { food: 9000, wood: 7500, stone: 5500, gold: 8000, science: 4000 },
  });

  // Modern Age Territories
  territories.push({
    id: 'territory_oil_fields',
    name: 'Oil Fields',
    description: 'Strategic petroleum reserves.',
    era: 'modern_age',
    conquered: false,
    enemyArmy: {
      name: 'Oil Defense Force',
      troops: [],
      attack: 1100,
      defense: 700,
      health: 5500,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'gold', amount: 30 } },
    rewards: { food: 12000, wood: 8500, stone: 6500, gold: 18000, science: 7000 },
  });

  territories.push({
    id: 'territory_tech_hub',
    name: 'Tech Hub',
    description: 'A center of technological innovation.',
    era: 'modern_age',
    conquered: false,
    enemyArmy: {
      name: 'Tech Security',
      troops: [],
      attack: 1500,
      defense: 950,
      health: 7500,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'science', multiplier: 1.35 } },
    rewards: { food: 16000, wood: 11000, stone: 9000, gold: 20000, science: 15000 },
  });

  // Atomic Age Territories
  territories.push({
    id: 'territory_nuclear_facility',
    name: 'Nuclear Facility',
    description: 'A secured nuclear research center.',
    era: 'atomic_age',
    conquered: false,
    enemyArmy: {
      name: 'Nuclear Guard',
      troops: [],
      attack: 2200,
      defense: 1350,
      health: 11000,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'science', amount: 50 } },
    rewards: { food: 24000, wood: 18000, stone: 15000, gold: 35000, science: 25000 },
  });

  territories.push({
    id: 'territory_space_launch_complex',
    name: 'Space Launch Complex',
    description: 'Gateway to the stars.',
    era: 'atomic_age',
    conquered: false,
    enemyArmy: {
      name: 'Space Command',
      troops: [],
      attack: 3200,
      defense: 1950,
      health: 16000,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'science', multiplier: 1.4 } },
    rewards: { food: 34000, wood: 28000, stone: 22000, gold: 46000, science: 35000 },
  });

  // Information Age Territories
  territories.push({
    id: 'territory_data_center',
    name: 'Global Data Center',
    description: 'The nerve center of worldwide communications.',
    era: 'information_age',
    conquered: false,
    enemyArmy: {
      name: 'Cyber Defense',
      troops: [],
      attack: 4500,
      defense: 2800,
      health: 22000,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'science', amount: 80 } },
    rewards: { food: 48000, wood: 35000, stone: 28000, gold: 70000, science: 55000 },
  });

  territories.push({
    id: 'territory_ai_nexus',
    name: 'AI Nexus',
    description: 'The central hub of artificial intelligence.',
    era: 'information_age',
    conquered: false,
    enemyArmy: {
      name: 'AI Defense Grid',
      troops: [],
      attack: 5800,
      defense: 3800,
      health: 30000,
      size: 'large',
    },
    bonuses: { resourceMultiplier: { resource: 'science', multiplier: 1.5 } },
    rewards: { food: 68000, wood: 50000, stone: 40000, gold: 90000, science: 75000 },
  });

  // Future Age Territories
  territories.push({
    id: 'territory_space_station',
    name: 'Orbital Space Station',
    description: 'A strategic foothold in orbit.',
    era: 'future_age',
    conquered: false,
    enemyArmy: {
      name: 'Orbital Guard',
      troops: [],
      attack: 9000,
      defense: 5500,
      health: 45000,
      size: 'medium',
    },
    bonuses: { flatBonus: { resource: 'science', amount: 150 } },
    rewards: { food: 120000, wood: 84000, stone: 60000, gold: 180000, science: 150000 },
  });

  territories.push({
    id: 'territory_dyson_sphere',
    name: 'Dyson Sphere',
    description: 'Harness the power of a star!',
    era: 'future_age',
    conquered: false,
    enemyArmy: {
      name: 'Stellar Guardians',
      troops: [],
      attack: 13000,
      defense: 8500,
      health: 65000,
      size: 'boss',
    },
    bonuses: { resourceMultiplier: { resource: 'gold', multiplier: 2.0 } },
    rewards: { food: 200000, wood: 150000, stone: 100000, gold: 350000, science: 250000 },
  });

  return territories;
}

export function getTerritoryById(territories: Territory[], id: string): Territory | undefined {
  return territories.find(t => t.id === id);
}

export function getTerritoriesByEra(territories: Territory[], era: string): Territory[] {
  return territories.filter(t => t.era === era);
}

export function isTerritoryAvailable(territory: Territory, currentEra: string): boolean {
  const territoryEraIndex = getEraIndex(territory.era);
  const currentEraIndex = getEraIndex(currentEra);
  return territoryEraIndex <= currentEraIndex;
}

export function calculateConquestBonuses(territories: Territory[]): {
  food: number;
  wood: number;
  stone: number;
  gold: number;
  science: number;
} {
  const bonuses = { food: 0, wood: 0, stone: 0, gold: 0, science: 0 };
  
  for (const territory of territories) {
    if (territory.conquered && territory.bonuses.flatBonus) {
      const resource = territory.bonuses.flatBonus.resource as keyof typeof bonuses;
      bonuses[resource] += territory.bonuses.flatBonus.amount;
    }
  }
  
  return bonuses;
}

export function calculateConquestMultipliers(territories: Territory[]): {
  food: number;
  wood: number;
  stone: number;
  gold: number;
  science: number;
} {
  const multipliers = { food: 1, wood: 1, stone: 1, gold: 1, science: 1 };
  
  for (const territory of territories) {
    if (territory.conquered && territory.bonuses.resourceMultiplier) {
      const resource = territory.bonuses.resourceMultiplier.resource as keyof typeof multipliers;
      multipliers[resource] *= territory.bonuses.resourceMultiplier.multiplier;
    }
  }
  
  return multipliers;
}

// Combat simulation for territory conquest
export function simulateTerritoryConquest(
  playerArmy: Troop[],
  territory: Territory
): BattleResult {
  const playerPower = calculateArmyPower(playerArmy);
  
  // If player has no army, they lose instantly
  if (playerPower.health <= 0) {
    return {
      victory: false,
      logs: [{
        round: 1,
        playerDamage: 0,
        enemyDamage: territory.enemyArmy.health,
        playerHealth: 0,
        enemyHealth: territory.enemyArmy.health,
        message: 'You have no army to fight! The territory remains unconquered.',
      }],
      playerStartHealth: 0,
      enemyStartHealth: territory.enemyArmy.health,
      playerEndHealth: 0,
      enemyEndHealth: territory.enemyArmy.health,
      casualtyPercent: 100,
    };
  }
  
  const logs = generateBattleLogs(playerPower, territory.enemyArmy);
  const lastLog = logs[logs.length - 1];
  const victory = lastLog.enemyHealth <= 0;
  const playerEndHealth = lastLog.playerHealth;
  const enemyEndHealth = lastLog.enemyHealth;
  
  // Calculate casualty percent
  const casualtyPercent = Math.round(((playerPower.health - playerEndHealth) / playerPower.health) * 100);
  
  return {
    victory,
    logs,
    playerStartHealth: playerPower.health,
    enemyStartHealth: territory.enemyArmy.health,
    playerEndHealth,
    enemyEndHealth,
    rewards: victory ? territory.rewards : undefined,
    casualtyPercent,
  };
}
