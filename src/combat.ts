// Combat system with missions based on tech era
import { Troop, getTroopTypeById, calculateArmyPower } from './barracks.js';
import { ERAS } from './eras.js';

// Combat constants
const DEFENSE_MITIGATION_FACTOR = 0.3;
const MAX_BATTLE_ROUNDS = 50;
const DAMAGE_RANDOM_MIN = 0.8;
const DAMAGE_RANDOM_RANGE = 0.4;

export interface EnemyArmy {
  name: string;
  troops: Troop[];
  attack: number;
  defense: number;
  health: number;
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

// Generate missions for each era
export function generateMissions(): Mission[] {
  const missions: Mission[] = [];
  
  // Stone Age Missions
  missions.push({
    id: 'stone_wolves',
    name: 'Wolf Pack',
    description: 'A pack of wolves threatens your village. Defend your people!',
    era: 'stone_age',
    enemyArmy: {
      name: 'Wolf Pack',
      troops: [],
      attack: 5,
      defense: 2,
      health: 30,
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
    },
    rewards: { food: 100, wood: 50, stone: 30, gold: 0, science: 10 },
    unlocked: true,
  });

  // Bronze Age Missions
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
    },
    rewards: { food: 150, wood: 100, stone: 80, gold: 50, science: 30 },
    unlocked: true,
  });
  
  missions.push({
    id: 'bronze_warlord',
    name: "Warlord's Army",
    description: 'A warlord seeks to conquer your lands with his chariot army.',
    era: 'bronze_age',
    enemyArmy: {
      name: "Warlord's Forces",
      troops: [],
      attack: 40,
      defense: 20,
      health: 180,
    },
    rewards: { food: 250, wood: 150, stone: 120, gold: 100, science: 50 },
    unlocked: true,
  });

  // Iron Age Missions
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
    },
    rewards: { food: 400, wood: 250, stone: 200, gold: 200, science: 100 },
    unlocked: true,
  });
  
  missions.push({
    id: 'iron_empire',
    name: 'Empire Strike',
    description: 'The neighboring empire sends its legions against you.',
    era: 'iron_age',
    enemyArmy: {
      name: 'Imperial Legion',
      troops: [],
      attack: 90,
      defense: 60,
      health: 450,
    },
    rewards: { food: 600, wood: 400, stone: 300, gold: 350, science: 150 },
    unlocked: true,
  });

  // Classical Age Missions
  missions.push({
    id: 'classical_horde',
    name: 'Barbarian Horde',
    description: 'A massive barbarian horde approaches your civilization.',
    era: 'classical_age',
    enemyArmy: {
      name: 'Barbarian Horde',
      troops: [],
      attack: 120,
      defense: 70,
      health: 600,
    },
    rewards: { food: 800, wood: 500, stone: 400, gold: 500, science: 200 },
    unlocked: true,
  });
  
  missions.push({
    id: 'classical_rivals',
    name: 'Rival Kingdom',
    description: 'The rival kingdom declares war. Defend your honor!',
    era: 'classical_age',
    enemyArmy: {
      name: 'Royal Army',
      troops: [],
      attack: 160,
      defense: 100,
      health: 800,
    },
    rewards: { food: 1000, wood: 700, stone: 500, gold: 700, science: 300 },
    unlocked: true,
  });

  // Medieval Age Missions
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
    },
    rewards: { food: 1500, wood: 1000, stone: 800, gold: 1000, science: 400 },
    unlocked: true,
  });
  
  missions.push({
    id: 'medieval_crusade',
    name: 'Holy Crusade',
    description: 'A crusading army marches against your lands.',
    era: 'medieval_age',
    enemyArmy: {
      name: 'Crusader Army',
      troops: [],
      attack: 280,
      defense: 200,
      health: 1400,
    },
    rewards: { food: 2000, wood: 1500, stone: 1200, gold: 1500, science: 600 },
    unlocked: true,
  });

  // Renaissance Missions
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
    },
    rewards: { food: 3000, wood: 2000, stone: 1500, gold: 2500, science: 800 },
    unlocked: true,
  });
  
  missions.push({
    id: 'renaissance_empire',
    name: 'Colonial War',
    description: 'A colonial empire threatens your independence.',
    era: 'renaissance',
    enemyArmy: {
      name: 'Colonial Army',
      troops: [],
      attack: 450,
      defense: 280,
      health: 2400,
    },
    rewards: { food: 4000, wood: 3000, stone: 2000, gold: 3500, science: 1200 },
    unlocked: true,
  });

  // Industrial Age Missions
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
    },
    rewards: { food: 6000, wood: 4000, stone: 3000, gold: 5000, science: 2000 },
    unlocked: true,
  });
  
  missions.push({
    id: 'industrial_invasion',
    name: 'Great War',
    description: 'A great power declares total war against your nation.',
    era: 'industrial_age',
    enemyArmy: {
      name: 'War Machine',
      troops: [],
      attack: 800,
      defense: 500,
      health: 4000,
    },
    rewards: { food: 8000, wood: 6000, stone: 4000, gold: 7000, science: 3000 },
    unlocked: true,
  });

  // Modern Age Missions
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
    },
    rewards: { food: 10000, wood: 7000, stone: 5000, gold: 10000, science: 5000 },
    unlocked: true,
  });
  
  missions.push({
    id: 'modern_superpower',
    name: 'Superpower Clash',
    description: 'Face the military might of a global superpower.',
    era: 'modern_age',
    enemyArmy: {
      name: 'Superpower Forces',
      troops: [],
      attack: 1400,
      defense: 900,
      health: 7000,
    },
    rewards: { food: 15000, wood: 10000, stone: 8000, gold: 15000, science: 8000 },
    unlocked: true,
  });

  // Atomic Age Missions
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
    },
    rewards: { food: 20000, wood: 15000, stone: 12000, gold: 25000, science: 12000 },
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
      attack: 3000,
      defense: 1800,
      health: 15000,
    },
    rewards: { food: 30000, wood: 25000, stone: 20000, gold: 40000, science: 20000 },
    unlocked: true,
  });

  // Information Age Missions
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
    },
    rewards: { food: 40000, wood: 30000, stone: 25000, gold: 60000, science: 35000 },
    unlocked: true,
  });
  
  missions.push({
    id: 'info_ai_uprising',
    name: 'AI Uprising',
    description: 'Rogue AI systems control an army of machines.',
    era: 'information_age',
    enemyArmy: {
      name: 'Machine Army',
      troops: [],
      attack: 5500,
      defense: 3500,
      health: 28000,
    },
    rewards: { food: 60000, wood: 45000, stone: 35000, gold: 80000, science: 50000 },
    unlocked: true,
  });

  // Future Age Missions
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
    },
    rewards: { food: 100000, wood: 70000, stone: 50000, gold: 150000, science: 100000 },
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
      attack: 12000,
      defense: 8000,
      health: 60000,
    },
    rewards: { food: 200000, wood: 150000, stone: 100000, gold: 300000, science: 200000 },
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
