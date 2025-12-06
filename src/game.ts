// Main game engine
import { Era, ERAS, getEraById, getNextEra } from './eras.js';
import { Technology, TECHNOLOGIES, getTechById, canResearch, TECH_IDS } from './research.js';
import { 
  TroopType, 
  TROOP_TYPES, 
  TrainingTroop, 
  Troop, 
  getTroopTypeById, 
  canTrainTroop,
  calculateArmyPower 
} from './barracks.js';
import {
  Mission,
  ActiveBattle,
  BattleResult,
  BattleLog,
  Territory,
  generateMissions,
  getMissionById,
  getMissionsByEra,
  simulateCombat,
  canStartMission,
  isMissionAvailable,
  generateTerritories,
  getTerritoryById,
  getTerritoriesByEra,
  isTerritoryAvailable,
  calculateConquestBonuses,
  calculateConquestMultipliers,
  simulateTerritoryConquest,
} from './combat.js';
import {
  Achievement,
  AchievementProgress,
  Statistics,
  ACHIEVEMENTS,
  getAchievementById,
  createInitialStatistics,
  createInitialAchievementProgress,
} from './achievements.js';
import {
  BuildingType,
  BUILDING_TYPES,
  Building,
  ConstructingBuilding,
  getBuildingTypeById,
  canBuildBuilding,
  calculateBuildingProduction,
  getTotalBuildingCount,
} from './buildings.js';
import {
  Skill,
  SkillTreeState,
  LegacyMilestone,
  SKILLS,
  LEGACY_MILESTONES,
  getSkillById,
  getMilestoneById,
  getSkillsByCategory,
  canUnlockSkill,
  getSkillLevel,
  getSkillCost,
  getSkillEffect,
  createInitialSkillTreeState,
  calculateSkillBonuses,
} from './skills.js';
import {
  Civilization,
  Leader,
  NaturalWonder,
  Religion,
  CulturalPolicy,
  LoreState,
  CIVILIZATIONS,
  LEADERS,
  NATURAL_WONDERS,
  RELIGION_TEMPLATES,
  CULTURAL_POLICIES,
  getCivilizationById,
  getLeaderById,
  getAvailableLeaders,
  getNaturalWonderById,
  getReligionTemplateById,
  getPolicyById,
  calculateCivilizationBonuses,
  calculateReligionBonuses,
  calculateNaturalWonderBonuses,
  calculatePolicyBonuses,
  createInitialLoreState,
  tryDiscoverWonder,
  foundReligion,
  calculateCultureGain,
  canAdoptPolicy,
} from './lore.js';
import {
  MilitaryState,
  UNIT_UPGRADES,
  FORMATIONS,
  DEFENSE_STRUCTURES,
  HEROES,
  NAVAL_UNITS,
  SIEGE_WEAPONS,
  MILITARY_TRADITIONS,
  SPY_MISSIONS,
  createInitialMilitaryState,
  getUpgradeById,
  getUpgradesForUnit,
  canUpgradeUnit,
  getFormationById,
  getAvailableFormations,
  getDefenseStructureById,
  calculateDefenseBonuses,
  getHeroById,
  getAvailableHeroes,
  getNavalUnitById,
  calculateNavalPower,
  getSiegeWeaponById,
  calculateSiegePower,
  getTraditionById,
  checkTraditionUnlock,
  calculateTraditionBonuses,
  getSpyMissionById,
  getAvailableSpyMissions,
  calculateSpySuccessChance,
  calculateTotalMilitaryPower,
  UnitUpgrade,
  Formation,
  DefenseStructure,
  DefenseBuilding,
  Hero,
  NavalUnit,
  NavalTroop,
  SiegeWeapon,
  SiegeTroop,
  MilitaryTradition,
  SpyMission,
  Spy,
  EXPERIENCE_LEVELS,
  getExperienceLevel,
} from './military.js';

export interface GameState {
  currentEra: string;
  resources: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
  };
  resourceMultipliers: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
  };
  researchedTechs: Set<string>;
  currentResearch: string | null;
  researchProgress: number;
  unlockedTroops: Set<string>;
  army: Troop[];
  trainingQueue: TrainingTroop[];
  lastUpdate: number;
  totalPlayTime: number;
  // Combat system
  missions: Mission[];
  completedMissions: Set<string>;
  activeBattle: ActiveBattle | null;
  battleAnimationSpeed: number; // ms per round
  // Conquest mode
  territories: Territory[];
  conqueredTerritories: Set<string>;
  activeConquestBattle: ActiveBattle | null;
  conquestMode: boolean; // Toggle between missions and conquest
  // Achievements and statistics
  statistics: Statistics;
  achievements: Map<string, AchievementProgress>;
  pendingAchievementNotifications: string[];
  // Buildings system
  buildings: Building[];
  constructionQueue: ConstructingBuilding[];
  unlockedBuildings: Set<string>;
  // Skill tree and legacy system
  skillTree: SkillTreeState;
  // World and Lore system
  lore: LoreState;
  // Military enhancements
  military: MilitaryState;
}

export class Game {
  state: GameState;
  private updateInterval: number | null = null;
  private onStateChange: (() => void) | null = null;
  private onAchievementUnlocked: ((achievement: Achievement) => void) | null = null;
  offlineProgress: { earned: boolean; resources: { food: number; wood: number; stone: number; gold: number; science: number }; duration: number } | null = null;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      currentEra: 'stone_age',
      resources: {
        food: 0,
        wood: 0,
        stone: 0,
        gold: 0,
        science: 0,
      },
      resourceMultipliers: {
        food: 1,
        wood: 1,
        stone: 1,
        gold: 1,
        science: 1,
      },
      researchedTechs: new Set<string>(),
      currentResearch: null,
      researchProgress: 0,
      unlockedTroops: new Set<string>(),
      army: [],
      trainingQueue: [],
      lastUpdate: Date.now(),
      totalPlayTime: 0,
      // Combat system
      missions: generateMissions(),
      completedMissions: new Set<string>(),
      activeBattle: null,
      battleAnimationSpeed: 800, // 800ms per round
      // Achievements and statistics
      statistics: createInitialStatistics(),
      achievements: createInitialAchievementProgress(),
      pendingAchievementNotifications: [],
      // Buildings system
      buildings: [],
      constructionQueue: [],
      unlockedBuildings: new Set<string>(['hut']), // Hut is available from start
      // Conquest mode
      territories: generateTerritories(),
      conqueredTerritories: new Set<string>(),
      activeConquestBattle: null,
      conquestMode: false,
      // Skill tree and legacy system
      skillTree: createInitialSkillTreeState(),
      // World and Lore system
      lore: createInitialLoreState(),
      // Military enhancements
      military: createInitialMilitaryState(),
    };
  }

  setOnAchievementUnlocked(callback: (achievement: Achievement) => void): void {
    this.onAchievementUnlocked = callback;
  }

  setOnStateChange(callback: () => void): void {
    this.onStateChange = callback;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  start(): void {
    this.state.lastUpdate = Date.now();
    this.updateInterval = window.setInterval(() => this.update(), 100);
  }

  stop(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private update(): void {
    const now = Date.now();
    const delta = (now - this.state.lastUpdate) / 1000; // Convert to seconds
    this.state.lastUpdate = now;
    this.state.totalPlayTime += delta;

    // Get current era data
    const era = getEraById(this.state.currentEra);
    if (!era) return;

    // Calculate building production
    const buildingProduction = calculateBuildingProduction(this.state.buildings);

    // Calculate conquest bonuses
    const conquestBonuses = this.getConquestBonuses();
    const conquestMultipliers = this.getConquestMultipliers();

    // Calculate lore bonuses (civilizations, leaders, wonders, religion, policies)
    const loreBonuses = this.getLoreBonuses();

    // Calculate total multipliers (base + conquest + lore)
    const totalFoodMultiplier = this.state.resourceMultipliers.food * conquestMultipliers.food * loreBonuses.multipliers.food;
    const totalWoodMultiplier = this.state.resourceMultipliers.wood * conquestMultipliers.wood * loreBonuses.multipliers.wood;
    const totalStoneMultiplier = this.state.resourceMultipliers.stone * conquestMultipliers.stone * loreBonuses.multipliers.stone;
    const totalGoldMultiplier = this.state.resourceMultipliers.gold * conquestMultipliers.gold * loreBonuses.multipliers.gold;
    const totalScienceMultiplier = this.state.resourceMultipliers.science * conquestMultipliers.science * loreBonuses.multipliers.science;

    // Calculate resource gains (era base rate + building production + conquest flat + lore flat) * multipliers
    const foodGain = (era.resources.food.baseRate + buildingProduction.food + conquestBonuses.food + loreBonuses.flatBonuses.food) * totalFoodMultiplier * delta;
    const woodGain = (era.resources.wood.baseRate + buildingProduction.wood + conquestBonuses.wood + loreBonuses.flatBonuses.wood) * totalWoodMultiplier * delta;
    const stoneGain = (era.resources.stone.baseRate + buildingProduction.stone + conquestBonuses.stone + loreBonuses.flatBonuses.stone) * totalStoneMultiplier * delta;
    const goldGain = (era.resources.gold.baseRate + buildingProduction.gold + conquestBonuses.gold + loreBonuses.flatBonuses.gold) * totalGoldMultiplier * delta;
    const scienceGain = (era.resources.science.baseRate + buildingProduction.science + conquestBonuses.science + loreBonuses.flatBonuses.science) * totalScienceMultiplier * delta;

    // Update resources based on era rates and multipliers
    this.state.resources.food += foodGain;
    this.state.resources.wood += woodGain;
    this.state.resources.stone += stoneGain;
    this.state.resources.gold += goldGain;
    this.state.resources.science += scienceGain;

    // Update statistics
    this.state.statistics.totalFoodGathered += foodGain;
    this.state.statistics.totalWoodGathered += woodGain;
    this.state.statistics.totalStoneGathered += stoneGain;
    this.state.statistics.totalGoldEarned += goldGain;
    this.state.statistics.totalScienceGenerated += scienceGain;

    // Add culture points (based on science and activities)
    const cultureGain = calculateCultureGain(delta * 0.1, this.state.lore.adoptedPolicies, this.state.lore.discoveredWonders.size);
    this.state.lore.culturePoints += cultureGain;

    // Update research progress
    if (this.state.currentResearch) {
      const tech = getTechById(this.state.currentResearch);
      if (tech) {
        // Research progresses based on science generation
        this.state.researchProgress += (era.resources.science.baseRate + buildingProduction.science + conquestBonuses.science + loreBonuses.flatBonuses.science) * totalScienceMultiplier * delta;
        
        if (this.state.researchProgress >= tech.cost.science) {
          this.completeResearch();
        }
      }
    }

    // Update training queue
    this.updateTrainingQueue(now);

    // Update construction queue
    this.updateConstructionQueue(now);

    // Update military queues (defense, naval, siege, spy)
    this.updateMilitaryQueues(now);

    // Check for military traditions
    this.checkMilitaryTraditions();

    // Check for achievement unlocks
    this.checkAchievements();

    this.notifyStateChange();
  }

  private updateTrainingQueue(now: number): void {
    const completed: number[] = [];
    
    for (let i = 0; i < this.state.trainingQueue.length; i++) {
      const training = this.state.trainingQueue[i];
      if (now >= training.endTime) {
        // Add troop to army
        this.addTroopToArmy(training.troopId);
        this.state.statistics.totalTroopsTrained++;
        completed.push(i);
      }
    }
    
    // Remove completed training
    for (let i = completed.length - 1; i >= 0; i--) {
      this.state.trainingQueue.splice(completed[i], 1);
    }
  }

  private addTroopToArmy(troopId: string): void {
    const existing = this.state.army.find(t => t.typeId === troopId);
    if (existing) {
      existing.count++;
    } else {
      this.state.army.push({ typeId: troopId, count: 1 });
    }
  }

  private updateConstructionQueue(now: number): void {
    const completed: number[] = [];
    
    for (let i = 0; i < this.state.constructionQueue.length; i++) {
      const construction = this.state.constructionQueue[i];
      if (now >= construction.endTime) {
        // Add building
        this.addBuilding(construction.buildingId);
        this.state.statistics.totalBuildingsConstructed = (this.state.statistics.totalBuildingsConstructed || 0) + 1;
        completed.push(i);
      }
    }
    
    // Remove completed construction
    for (let i = completed.length - 1; i >= 0; i--) {
      this.state.constructionQueue.splice(completed[i], 1);
    }
  }

  private addBuilding(buildingId: string): void {
    const existing = this.state.buildings.find(b => b.typeId === buildingId);
    if (existing) {
      existing.count++;
    } else {
      this.state.buildings.push({ typeId: buildingId, count: 1 });
    }
  }

  // Resource gathering actions (manual clicking)
  gatherFood(): void {
    const amount = 1 * this.state.resourceMultipliers.food;
    this.state.resources.food += amount;
    this.state.statistics.totalFoodGathered += amount;
    this.state.statistics.clickCount++;
    this.checkAchievements();
    this.notifyStateChange();
  }

  gatherWood(): void {
    const amount = 1 * this.state.resourceMultipliers.wood;
    this.state.resources.wood += amount;
    this.state.statistics.totalWoodGathered += amount;
    this.state.statistics.clickCount++;
    this.checkAchievements();
    this.notifyStateChange();
  }

  gatherStone(): void {
    const amount = 1 * this.state.resourceMultipliers.stone;
    this.state.resources.stone += amount;
    this.state.statistics.totalStoneGathered += amount;
    this.state.statistics.clickCount++;
    this.checkAchievements();
    this.notifyStateChange();
  }

  // Research system
  startResearch(techId: string): boolean {
    const tech = getTechById(techId);
    if (!tech) return false;
    
    if (!canResearch(techId, this.state.researchedTechs, this.state.resources.science)) {
      return false;
    }
    
    // Deduct science cost
    this.state.resources.science -= tech.cost.science;
    this.state.currentResearch = techId;
    this.state.researchProgress = 0;
    this.notifyStateChange();
    return true;
  }

  private completeResearch(): void {
    if (!this.state.currentResearch) return;
    
    const tech = getTechById(this.state.currentResearch);
    if (!tech) return;
    
    this.state.researchedTechs.add(this.state.currentResearch);
    
    // Apply effects
    if (tech.effects.resourceBonus) {
      const resource = tech.effects.resourceBonus.resource as keyof typeof this.state.resourceMultipliers;
      this.state.resourceMultipliers[resource] *= tech.effects.resourceBonus.multiplier;
    }
    
    if (tech.effects.unitUnlock) {
      this.state.unlockedTroops.add(tech.effects.unitUnlock);
    }
    
    if (tech.effects.unlocks) {
      // Check if we can advance to a new era
      const nextEra = getNextEra(this.state.currentEra);
      if (nextEra && tech.effects.unlocks.includes(nextEra.id)) {
        this.state.currentEra = nextEra.id;
      }
    }
    
    // Check for building unlocks
    this.checkBuildingUnlocks(this.state.currentResearch);
    
    this.state.currentResearch = null;
    this.state.researchProgress = 0;
    this.notifyStateChange();
  }

  private checkBuildingUnlocks(techId: string): void {
    // Check all buildings that require this tech
    for (const building of BUILDING_TYPES) {
      if (building.unlockTech === techId) {
        this.state.unlockedBuildings.add(building.id);
      }
    }
  }

  // Building system
  constructBuilding(buildingId: string): boolean {
    const buildingType = getBuildingTypeById(buildingId);
    if (!buildingType) return false;
    
    if (!canBuildBuilding(buildingId, this.state.unlockedBuildings, this.state.buildings, this.state.resources)) {
      return false;
    }
    
    // Deduct costs
    this.state.resources.food -= buildingType.cost.food;
    this.state.resources.wood -= buildingType.cost.wood;
    this.state.resources.stone -= buildingType.cost.stone;
    this.state.resources.gold -= buildingType.cost.gold;
    
    // Add to construction queue
    const now = Date.now();
    this.state.constructionQueue.push({
      buildingId,
      startTime: now,
      endTime: now + buildingType.buildTime * 1000,
    });
    
    this.notifyStateChange();
    return true;
  }

  getBuildingCount(buildingId: string): number {
    const building = this.state.buildings.find(b => b.typeId === buildingId);
    return building ? building.count : 0;
  }

  getBuildingProduction(): { food: number; wood: number; stone: number; gold: number; science: number } {
    return calculateBuildingProduction(this.state.buildings);
  }

  getAvailableBuildings(): BuildingType[] {
    return BUILDING_TYPES.filter(building => {
      // Check if unlocked
      if (building.unlockTech === null) return true;
      return this.state.unlockedBuildings.has(building.id);
    });
  }

  getTotalBuildingCount(): number {
    return getTotalBuildingCount(this.state.buildings);
  }

  // Barracks system
  trainTroop(troopId: string): boolean {
    const troopType = getTroopTypeById(troopId);
    if (!troopType) return false;
    
    if (!canTrainTroop(troopId, this.state.unlockedTroops, this.state.resources)) {
      return false;
    }
    
    // Deduct costs
    this.state.resources.food -= troopType.cost.food;
    this.state.resources.gold -= troopType.cost.gold;
    if (troopType.cost.wood) this.state.resources.wood -= troopType.cost.wood;
    if (troopType.cost.stone) this.state.resources.stone -= troopType.cost.stone;
    
    // Add to training queue
    const now = Date.now();
    this.state.trainingQueue.push({
      troopId,
      startTime: now,
      endTime: now + troopType.trainTime * 1000,
    });
    
    this.notifyStateChange();
    return true;
  }

  getArmyPower(): { attack: number; defense: number; health: number } {
    return calculateArmyPower(this.state.army);
  }

  // Combat system methods
  getAvailableMissions(): Mission[] {
    return this.state.missions.filter(m => isMissionAvailable(m, this.state.currentEra));
  }

  getMissionsByCurrentEra(): Mission[] {
    return getMissionsByEra(this.state.missions, this.state.currentEra);
  }

  canStartMission(): boolean {
    return canStartMission(this.state.army) && !this.state.activeBattle;
  }

  startMission(missionId: string): boolean {
    const mission = getMissionById(this.state.missions, missionId);
    if (!mission) return false;
    
    if (!isMissionAvailable(mission, this.state.currentEra)) return false;
    if (!canStartMission(this.state.army)) return false;
    if (this.state.activeBattle) return false;
    
    // Simulate the full battle and store all logs
    const result = simulateCombat(this.state.army, mission);
    const playerPower = calculateArmyPower(this.state.army);
    
    // Create active battle with pre-computed logs
    this.state.activeBattle = {
      missionId,
      logs: result.logs,
      currentRound: 0,
      isComplete: false,
      result: result,
      playerStartHealth: playerPower.health,
      enemyStartHealth: mission.enemyArmy.health,
    };
    
    this.notifyStateChange();
    return true;
  }

  // Advance battle animation by one round
  advanceBattleRound(): boolean {
    if (!this.state.activeBattle) return false;
    if (this.state.activeBattle.isComplete) return false;
    
    this.state.activeBattle.currentRound++;
    
    // Check if battle is complete
    if (this.state.activeBattle.currentRound >= this.state.activeBattle.logs.length) {
      this.completeBattle();
    }
    
    this.notifyStateChange();
    return true;
  }

  private completeBattle(): void {
    if (!this.state.activeBattle || !this.state.activeBattle.result) return;
    
    this.state.activeBattle.isComplete = true;
    const result = this.state.activeBattle.result;
    
    if (result.victory && result.rewards) {
      // Add rewards
      this.state.resources.food += result.rewards.food;
      this.state.resources.wood += result.rewards.wood;
      this.state.resources.stone += result.rewards.stone;
      this.state.resources.gold += result.rewards.gold;
      this.state.resources.science += result.rewards.science;
      
      // Update statistics for rewards
      this.state.statistics.totalFoodGathered += result.rewards.food;
      this.state.statistics.totalWoodGathered += result.rewards.wood;
      this.state.statistics.totalStoneGathered += result.rewards.stone;
      this.state.statistics.totalGoldEarned += result.rewards.gold;
      this.state.statistics.totalScienceGenerated += result.rewards.science;
      
      // Mark mission as completed
      this.state.completedMissions.add(this.state.activeBattle.missionId);
      
      // Update battle statistics
      this.state.statistics.battlesWon++;
    } else {
      this.state.statistics.battlesLost++;
    }
    
    // Apply casualties to army (reduce troops based on damage taken)
    if (result.casualtyPercent > 0) {
      this.applyCasualties(result.casualtyPercent);
    }
    
    // Check achievements after battle
    this.checkAchievements();
  }

  private applyCasualties(casualtyPercent: number): void {
    // Remove some troops based on casualty percent
    // Higher casualty = more troops lost
    for (const troop of this.state.army) {
      const casualtyFactor = casualtyPercent / 100;
      const troopsLost = Math.floor(troop.count * casualtyFactor * 0.5); // 50% of casualty rate as actual losses
      troop.count = Math.max(0, troop.count - troopsLost);
    }
    
    // Remove troops with 0 count
    this.state.army = this.state.army.filter(t => t.count > 0);
  }

  dismissBattle(): void {
    this.state.activeBattle = null;
    this.notifyStateChange();
  }

  setBattleSpeed(speed: number): void {
    this.state.battleAnimationSpeed = Math.max(100, Math.min(2000, speed));
    this.notifyStateChange();
  }

  isMissionCompleted(missionId: string): boolean {
    return this.state.completedMissions.has(missionId);
  }

  // Conquest mode methods
  toggleConquestMode(): void {
    this.state.conquestMode = !this.state.conquestMode;
    this.notifyStateChange();
  }

  getAvailableTerritories(): Territory[] {
    return this.state.territories.filter(t => isTerritoryAvailable(t, this.state.currentEra));
  }

  getTerritoriesByCurrentEra(): Territory[] {
    return getTerritoriesByEra(this.state.territories, this.state.currentEra);
  }

  canStartConquest(): boolean {
    return canStartMission(this.state.army) && !this.state.activeConquestBattle && !this.state.activeBattle;
  }

  startConquest(territoryId: string): boolean {
    const territory = getTerritoryById(this.state.territories, territoryId);
    if (!territory) return false;
    
    if (!isTerritoryAvailable(territory, this.state.currentEra)) return false;
    if (!canStartMission(this.state.army)) return false;
    if (this.state.activeConquestBattle) return false;
    if (this.state.activeBattle) return false;
    
    // Simulate the full battle and store all logs
    const result = simulateTerritoryConquest(this.state.army, territory);
    const playerPower = calculateArmyPower(this.state.army);
    
    // Create active battle with pre-computed logs
    this.state.activeConquestBattle = {
      missionId: territoryId, // Using missionId to store territoryId
      logs: result.logs,
      currentRound: 0,
      isComplete: false,
      result: result,
      playerStartHealth: playerPower.health,
      enemyStartHealth: territory.enemyArmy.health,
    };
    
    this.notifyStateChange();
    return true;
  }

  advanceConquestRound(): boolean {
    if (!this.state.activeConquestBattle) return false;
    if (this.state.activeConquestBattle.isComplete) return false;
    
    this.state.activeConquestBattle.currentRound++;
    
    // Check if battle is complete
    if (this.state.activeConquestBattle.currentRound >= this.state.activeConquestBattle.logs.length) {
      this.completeConquest();
    }
    
    this.notifyStateChange();
    return true;
  }

  private completeConquest(): void {
    if (!this.state.activeConquestBattle || !this.state.activeConquestBattle.result) return;
    
    this.state.activeConquestBattle.isComplete = true;
    const result = this.state.activeConquestBattle.result;
    const territoryId = this.state.activeConquestBattle.missionId;
    
    if (result.victory && result.rewards) {
      // Add rewards
      this.state.resources.food += result.rewards.food;
      this.state.resources.wood += result.rewards.wood;
      this.state.resources.stone += result.rewards.stone;
      this.state.resources.gold += result.rewards.gold;
      this.state.resources.science += result.rewards.science;
      
      // Update statistics for rewards
      this.state.statistics.totalFoodGathered += result.rewards.food;
      this.state.statistics.totalWoodGathered += result.rewards.wood;
      this.state.statistics.totalStoneGathered += result.rewards.stone;
      this.state.statistics.totalGoldEarned += result.rewards.gold;
      this.state.statistics.totalScienceGenerated += result.rewards.science;
      
      // Mark territory as conquered
      this.state.conqueredTerritories.add(territoryId);
      
      // Update the territory object
      const territory = getTerritoryById(this.state.territories, territoryId);
      if (territory) {
        territory.conquered = true;
      }
      
      // Update statistics
      this.state.statistics.territoriesConquered = (this.state.statistics.territoriesConquered || 0) + 1;
      this.state.statistics.battlesWon++;
    } else {
      this.state.statistics.battlesLost++;
    }
    
    // Apply casualties to army
    if (result.casualtyPercent > 0) {
      this.applyCasualties(result.casualtyPercent);
    }
    
    // Check achievements after conquest
    this.checkAchievements();
  }

  dismissConquestBattle(): void {
    this.state.activeConquestBattle = null;
    this.notifyStateChange();
  }

  isTerritoryConquered(territoryId: string): boolean {
    return this.state.conqueredTerritories.has(territoryId);
  }

  getConquestBonuses(): { food: number; wood: number; stone: number; gold: number; science: number } {
    return calculateConquestBonuses(this.state.territories);
  }

  getConquestMultipliers(): { food: number; wood: number; stone: number; gold: number; science: number } {
    return calculateConquestMultipliers(this.state.territories);
  }

  getConqueredTerritoryCount(): number {
    return this.state.conqueredTerritories.size;
  }

  getTotalTerritoryCount(): number {
    return this.state.territories.length;
  }

  // Get available technologies
  getAvailableTechs(): Technology[] {
    return TECHNOLOGIES.filter(tech => {
      if (this.state.researchedTechs.has(tech.id)) return false;
      
      // Check prerequisites
      for (const prereq of tech.prerequisites) {
        if (!this.state.researchedTechs.has(prereq)) return false;
      }
      
      return true;
    });
  }

  // Get available troops
  getAvailableTroops(): TroopType[] {
    return TROOP_TYPES.filter(troop => this.state.unlockedTroops.has(troop.id));
  }

  // Skill Tree system
  upgradeSkill(skillId: string): boolean {
    const skill = getSkillById(skillId);
    if (!skill) return false;

    const currentLevel = getSkillLevel(skillId, this.state.skillTree.skillLevels);
    if (currentLevel >= skill.maxLevel) return false;

    const cost = getSkillCost(skill, currentLevel);
    if (this.state.skillTree.legacyPoints < cost) return false;

    if (!canUnlockSkill(skill, this.state.skillTree.skillLevels)) return false;

    // Deduct cost and increase level
    this.state.skillTree.legacyPoints -= cost;
    this.state.skillTree.skillLevels.set(skillId, currentLevel + 1);

    this.notifyStateChange();
    return true;
  }

  addLegacyPoints(points: number): void {
    const bonuses = calculateSkillBonuses(this.state.skillTree.skillLevels);
    const adjustedPoints = Math.floor(points * bonuses.legacyPointsMultiplier);
    this.state.skillTree.legacyPoints += adjustedPoints;
    this.state.skillTree.totalLegacyPointsEarned += adjustedPoints;
    this.notifyStateChange();
  }

  getSkillBonuses(): ReturnType<typeof calculateSkillBonuses> {
    return calculateSkillBonuses(this.state.skillTree.skillLevels);
  }

  // Achievement system
  private checkAchievements(): void {
    for (const achievement of ACHIEVEMENTS) {
      const progress = this.state.achievements.get(achievement.id);
      if (!progress || progress.unlocked) continue;

      if (this.isAchievementConditionMet(achievement)) {
        this.unlockAchievement(achievement.id);
      }
    }
  }

  private isAchievementConditionMet(achievement: Achievement): boolean {
    const condition = achievement.condition;
    
    switch (condition.type) {
      case 'resource_total':
        return this.getStatisticForResource(condition.target as string) >= condition.amount;
      case 'resource_current':
        return this.state.resources[condition.target as keyof typeof this.state.resources] >= condition.amount;
      case 'tech_count':
        return this.state.researchedTechs.size >= condition.amount;
      case 'troop_count':
        return this.getTotalTroopCount() >= condition.amount;
      case 'era_reached':
        return this.hasReachedEra(condition.target as string);
      case 'battles_won':
        return this.state.statistics.battlesWon >= condition.amount;
      case 'missions_completed':
        return this.state.completedMissions.size >= condition.amount;
      case 'building_count':
        return this.getTotalBuildingCount() >= condition.amount;
      default:
        return false;
    }
  }

  private getStatisticForResource(resource: string): number {
    switch (resource) {
      case 'food': return this.state.statistics.totalFoodGathered;
      case 'wood': return this.state.statistics.totalWoodGathered;
      case 'stone': return this.state.statistics.totalStoneGathered;
      case 'gold': return this.state.statistics.totalGoldEarned;
      case 'science': return this.state.statistics.totalScienceGenerated;
      default: return 0;
    }
  }

  private getTotalTroopCount(): number {
    return this.state.army.reduce((sum, troop) => sum + troop.count, 0);
  }

  hasReachedEra(eraId: string): boolean {
    const currentIndex = ERAS.findIndex(e => e.id === this.state.currentEra);
    const targetIndex = ERAS.findIndex(e => e.id === eraId);
    return currentIndex >= targetIndex;
  }

  private unlockAchievement(achievementId: string): void {
    const progress = this.state.achievements.get(achievementId);
    if (!progress || progress.unlocked) return;

    const achievement = getAchievementById(achievementId);
    if (!achievement) return;

    progress.unlocked = true;
    progress.unlockedAt = Date.now();
    progress.notified = false;

    // Add to pending notifications
    this.state.pendingAchievementNotifications.push(achievementId);

    // Apply achievement reward if any
    if (achievement.reward) {
      if (achievement.reward.type === 'multiplier' && achievement.reward.resource) {
        const resource = achievement.reward.resource as keyof typeof this.state.resourceMultipliers;
        this.state.resourceMultipliers[resource] *= achievement.reward.amount;
      }
    }

    // Notify callback
    if (this.onAchievementUnlocked) {
      this.onAchievementUnlocked(achievement);
    }
  }

  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => {
      const progress = this.state.achievements.get(a.id);
      return progress && progress.unlocked;
    });
  }

  getLockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => {
      const progress = this.state.achievements.get(a.id);
      return !progress || !progress.unlocked;
    });
  }

  getAchievementProgress(achievementId: string): AchievementProgress | undefined {
    return this.state.achievements.get(achievementId);
  }

  popPendingAchievementNotification(): string | undefined {
    return this.state.pendingAchievementNotifications.shift();
  }

  // Offline progress
  calculateOfflineProgress(lastSaveTime: number): void {
    // Check if offline progress is unlocked (requires 'cloud_computing' research)
    if (!this.state.researchedTechs.has(TECH_IDS.CLOUD_COMPUTING)) {
      this.offlineProgress = null;
      return;
    }

    const now = Date.now();
    const offlineDuration = (now - lastSaveTime) / 1000; // seconds
    
    // Cap offline time at 8 hours
    const maxOfflineTime = 8 * 60 * 60;
    const cappedDuration = Math.min(offlineDuration, maxOfflineTime);
    
    // Minimum 60 seconds to count as offline
    if (cappedDuration < 60) {
      this.offlineProgress = null;
      return;
    }

    const era = getEraById(this.state.currentEra);
    if (!era) {
      this.offlineProgress = null;
      return;
    }

    // Calculate resources earned (50% efficiency for offline)
    const offlineEfficiency = 0.5;
    const buildingProduction = calculateBuildingProduction(this.state.buildings);
    const food = (era.resources.food.baseRate + buildingProduction.food) * this.state.resourceMultipliers.food * cappedDuration * offlineEfficiency;
    const wood = (era.resources.wood.baseRate + buildingProduction.wood) * this.state.resourceMultipliers.wood * cappedDuration * offlineEfficiency;
    const stone = (era.resources.stone.baseRate + buildingProduction.stone) * this.state.resourceMultipliers.stone * cappedDuration * offlineEfficiency;
    const gold = (era.resources.gold.baseRate + buildingProduction.gold) * this.state.resourceMultipliers.gold * cappedDuration * offlineEfficiency;
    const science = (era.resources.science.baseRate + buildingProduction.science) * this.state.resourceMultipliers.science * cappedDuration * offlineEfficiency;

    // Apply offline earnings
    this.state.resources.food += food;
    this.state.resources.wood += wood;
    this.state.resources.stone += stone;
    this.state.resources.gold += gold;
    this.state.resources.science += science;

    // Update statistics
    this.state.statistics.totalFoodGathered += food;
    this.state.statistics.totalWoodGathered += wood;
    this.state.statistics.totalStoneGathered += stone;
    this.state.statistics.totalGoldEarned += gold;
    this.state.statistics.totalScienceGenerated += science;
    this.state.statistics.offlineEarnings += food + wood + stone + gold + science;

    // Store offline progress for display
    this.offlineProgress = {
      earned: true,
      resources: { food, wood, stone, gold, science },
      duration: cappedDuration,
    };
  }

  dismissOfflineProgress(): void {
    this.offlineProgress = null;
  }

  // Save/Load
  saveGame(): string {
    // Convert achievements Map to array for JSON serialization
    const achievementsArray = Array.from(this.state.achievements.entries());
    
    // Convert skillTree Maps and Sets to arrays for JSON serialization
    const skillTreeSave = {
      legacyPoints: this.state.skillTree.legacyPoints,
      totalLegacyPointsEarned: this.state.skillTree.totalLegacyPointsEarned,
      skillLevels: Array.from(this.state.skillTree.skillLevels.entries()),
      completedMilestones: Array.from(this.state.skillTree.completedMilestones),
      milestoneCompletionCounts: Array.from(this.state.skillTree.milestoneCompletionCounts.entries()),
      prestigeCount: this.state.skillTree.prestigeCount,
    };

    // Convert lore Sets to arrays for JSON serialization
    const loreSave = {
      selectedCivilization: this.state.lore.selectedCivilization,
      selectedLeader: this.state.lore.selectedLeader,
      discoveredWonders: Array.from(this.state.lore.discoveredWonders),
      foundedReligion: this.state.lore.foundedReligion,
      culturePoints: this.state.lore.culturePoints,
      cultureLevel: this.state.lore.cultureLevel,
      adoptedPolicies: Array.from(this.state.lore.adoptedPolicies),
    };

    // Convert military Sets and Maps to arrays for JSON serialization
    const militarySave = {
      selectedFormation: this.state.military.selectedFormation,
      defenseBuildings: this.state.military.defenseBuildings,
      defenseConstructionQueue: this.state.military.defenseConstructionQueue,
      recruitedHeroes: Array.from(this.state.military.recruitedHeroes),
      activeHero: this.state.military.activeHero,
      unitExperience: Array.from(this.state.military.unitExperience.entries()),
      navy: this.state.military.navy,
      navalTrainingQueue: this.state.military.navalTrainingQueue,
      siegeWeapons: this.state.military.siegeWeapons,
      siegeTrainingQueue: this.state.military.siegeTrainingQueue,
      unlockedTraditions: Array.from(this.state.military.unlockedTraditions),
      spies: this.state.military.spies,
      activeSpyMissions: this.state.military.activeSpyMissions,
      maxSpies: this.state.military.maxSpies,
    };
    
    const saveData = {
      ...this.state,
      researchedTechs: Array.from(this.state.researchedTechs),
      unlockedTroops: Array.from(this.state.unlockedTroops),
      completedMissions: Array.from(this.state.completedMissions),
      unlockedBuildings: Array.from(this.state.unlockedBuildings),
      conqueredTerritories: Array.from(this.state.conqueredTerritories),
      achievements: achievementsArray,
      skillTree: skillTreeSave,
      lore: loreSave,
      military: militarySave,
      activeBattle: null, // Don't save active battles
      activeConquestBattle: null, // Don't save active conquest battles
      saveTime: Date.now(), // Save timestamp for offline progress
    };
    return JSON.stringify(saveData);
  }

  loadGame(saveString: string): boolean {
    try {
      const saveData = JSON.parse(saveString);
      
      // Convert achievements array back to Map, or create new if not present
      let achievementsMap: Map<string, AchievementProgress>;
      if (saveData.achievements && Array.isArray(saveData.achievements)) {
        achievementsMap = new Map(saveData.achievements);
      } else {
        achievementsMap = createInitialAchievementProgress();
      }
      
      // Ensure all achievements exist (in case new ones were added)
      for (const achievement of ACHIEVEMENTS) {
        if (!achievementsMap.has(achievement.id)) {
          achievementsMap.set(achievement.id, {
            id: achievement.id,
            unlocked: false,
            notified: false,
          });
        }
      }

      // Handle buildings (may not exist in old saves)
      let unlockedBuildingsSet: Set<string>;
      if (saveData.unlockedBuildings && Array.isArray(saveData.unlockedBuildings)) {
        unlockedBuildingsSet = new Set(saveData.unlockedBuildings);
      } else {
        // Initialize with default unlocked buildings
        unlockedBuildingsSet = new Set<string>(['hut']);
        // Also unlock buildings based on researched techs
        const researchedTechs = new Set(saveData.researchedTechs || []);
        for (const building of BUILDING_TYPES) {
          if (building.unlockTech && researchedTechs.has(building.unlockTech)) {
            unlockedBuildingsSet.add(building.id);
          }
        }
      }

      // Handle conquered territories (may not exist in old saves)
      let conqueredTerritoriesSet: Set<string>;
      if (saveData.conqueredTerritories && Array.isArray(saveData.conqueredTerritories)) {
        conqueredTerritoriesSet = new Set(saveData.conqueredTerritories);
      } else {
        conqueredTerritoriesSet = new Set<string>();
      }

      // Generate territories and restore conquered state
      const territories = generateTerritories();
      for (const territory of territories) {
        if (conqueredTerritoriesSet.has(territory.id)) {
          territory.conquered = true;
        }
      }

      // Handle skill tree state (may not exist in old saves)
      let skillTreeState = createInitialSkillTreeState();
      if (saveData.skillTree) {
        skillTreeState = {
          legacyPoints: saveData.skillTree.legacyPoints || 0,
          totalLegacyPointsEarned: saveData.skillTree.totalLegacyPointsEarned || 0,
          skillLevels: new Map(saveData.skillTree.skillLevels || []),
          completedMilestones: new Set(saveData.skillTree.completedMilestones || []),
          milestoneCompletionCounts: new Map(saveData.skillTree.milestoneCompletionCounts || []),
          prestigeCount: saveData.skillTree.prestigeCount || 0,
        };
      }

      // Handle lore state (may not exist in old saves)
      let loreState = createInitialLoreState();
      if (saveData.lore) {
        loreState = {
          selectedCivilization: saveData.lore.selectedCivilization || 'default',
          selectedLeader: saveData.lore.selectedLeader || null,
          discoveredWonders: new Set(saveData.lore.discoveredWonders || []),
          foundedReligion: saveData.lore.foundedReligion || null,
          culturePoints: saveData.lore.culturePoints || 0,
          cultureLevel: saveData.lore.cultureLevel || 0,
          adoptedPolicies: new Set(saveData.lore.adoptedPolicies || []),
        };
      }

      // Handle military state (may not exist in old saves)
      let militaryState = createInitialMilitaryState();
      if (saveData.military) {
        militaryState = {
          selectedFormation: saveData.military.selectedFormation || 'standard',
          defenseBuildings: saveData.military.defenseBuildings || [],
          defenseConstructionQueue: saveData.military.defenseConstructionQueue || [],
          recruitedHeroes: new Set(saveData.military.recruitedHeroes || []),
          activeHero: saveData.military.activeHero || null,
          unitExperience: new Map(saveData.military.unitExperience || []),
          navy: saveData.military.navy || [],
          navalTrainingQueue: saveData.military.navalTrainingQueue || [],
          siegeWeapons: saveData.military.siegeWeapons || [],
          siegeTrainingQueue: saveData.military.siegeTrainingQueue || [],
          unlockedTraditions: new Set(saveData.military.unlockedTraditions || []),
          spies: saveData.military.spies || [],
          activeSpyMissions: saveData.military.activeSpyMissions || [],
          maxSpies: saveData.military.maxSpies || 3,
        };
      }
      
      this.state = {
        ...saveData,
        researchedTechs: new Set(saveData.researchedTechs),
        unlockedTroops: new Set(saveData.unlockedTroops),
        completedMissions: new Set(saveData.completedMissions || []),
        missions: generateMissions(), // Always regenerate missions
        activeBattle: null,
        battleAnimationSpeed: saveData.battleAnimationSpeed || 800,
        statistics: saveData.statistics || createInitialStatistics(),
        achievements: achievementsMap,
        pendingAchievementNotifications: [],
        // Buildings system
        buildings: saveData.buildings || [],
        constructionQueue: saveData.constructionQueue || [],
        unlockedBuildings: unlockedBuildingsSet,
        // Conquest mode
        territories: territories,
        conqueredTerritories: conqueredTerritoriesSet,
        activeConquestBattle: null,
        conquestMode: saveData.conquestMode || false,
        // Skill tree
        skillTree: skillTreeState,
        // World and Lore
        lore: loreState,
        // Military enhancements
        military: militaryState,
      };
      
      // Calculate offline progress if save time is available
      if (saveData.saveTime) {
        this.calculateOfflineProgress(saveData.saveTime);
      }
      
      return true;
    } catch {
      return false;
    }
  }

  resetGame(): void {
    this.state = this.createInitialState();
    this.offlineProgress = null;
    this.notifyStateChange();
  }

  // ===== Lore System Methods =====

  getLoreBonuses(): {
    flatBonuses: { food: number; wood: number; stone: number; gold: number; science: number };
    multipliers: { food: number; wood: number; stone: number; gold: number; science: number };
    militaryBonuses: { attack: number; defense: number; health: number };
  } {
    const flatBonuses = { food: 0, wood: 0, stone: 0, gold: 0, science: 0 };
    const multipliers = { food: 1, wood: 1, stone: 1, gold: 1, science: 1 };
    const militaryBonuses = { attack: 1, defense: 1, health: 1 };

    // Get civilization and leader
    const civilization = getCivilizationById(this.state.lore.selectedCivilization);
    const leader = this.state.lore.selectedLeader ? getLeaderById(this.state.lore.selectedLeader) : null;

    // Apply civilization and leader bonuses
    if (civilization) {
      const civBonuses = calculateCivilizationBonuses(civilization, leader);
      multipliers.food *= civBonuses.resourceMultipliers.food;
      multipliers.wood *= civBonuses.resourceMultipliers.wood;
      multipliers.stone *= civBonuses.resourceMultipliers.stone;
      multipliers.gold *= civBonuses.resourceMultipliers.gold;
      multipliers.science *= civBonuses.resourceMultipliers.science;
      militaryBonuses.attack *= civBonuses.militaryBonuses.attack;
      militaryBonuses.defense *= civBonuses.militaryBonuses.defense;
      militaryBonuses.health *= civBonuses.militaryBonuses.health;
    }

    // Apply religion bonuses
    const religionBonuses = calculateReligionBonuses(this.state.lore.foundedReligion);
    multipliers.food *= religionBonuses.resourceMultipliers.food;
    multipliers.wood *= religionBonuses.resourceMultipliers.wood;
    multipliers.stone *= religionBonuses.resourceMultipliers.stone;
    multipliers.gold *= religionBonuses.resourceMultipliers.gold;
    multipliers.science *= religionBonuses.resourceMultipliers.science;

    // Apply natural wonder bonuses
    const wonderBonuses = calculateNaturalWonderBonuses(Array.from(this.state.lore.discoveredWonders));
    flatBonuses.food += wonderBonuses.flatBonuses.food;
    flatBonuses.wood += wonderBonuses.flatBonuses.wood;
    flatBonuses.stone += wonderBonuses.flatBonuses.stone;
    flatBonuses.gold += wonderBonuses.flatBonuses.gold;
    flatBonuses.science += wonderBonuses.flatBonuses.science;
    multipliers.food *= wonderBonuses.multipliers.food;
    multipliers.wood *= wonderBonuses.multipliers.wood;
    multipliers.stone *= wonderBonuses.multipliers.stone;
    multipliers.gold *= wonderBonuses.multipliers.gold;
    multipliers.science *= wonderBonuses.multipliers.science;

    // Apply cultural policy bonuses
    const policyBonuses = calculatePolicyBonuses(Array.from(this.state.lore.adoptedPolicies));
    flatBonuses.food += policyBonuses.flatBonuses.food;
    flatBonuses.wood += policyBonuses.flatBonuses.wood;
    flatBonuses.stone += policyBonuses.flatBonuses.stone;
    flatBonuses.gold += policyBonuses.flatBonuses.gold;
    flatBonuses.science += policyBonuses.flatBonuses.science;
    // Convert percentage values to decimal multipliers (e.g., 10% -> 0.1)
    const PERCENTAGE_TO_DECIMAL = 100;
    militaryBonuses.attack += policyBonuses.militaryBonuses.attack / PERCENTAGE_TO_DECIMAL;
    militaryBonuses.defense += policyBonuses.militaryBonuses.defense / PERCENTAGE_TO_DECIMAL;

    return { flatBonuses, multipliers, militaryBonuses };
  }

  selectCivilization(civilizationId: string): boolean {
    const civilization = getCivilizationById(civilizationId);
    if (!civilization) return false;

    this.state.lore.selectedCivilization = civilizationId;
    this.state.lore.selectedLeader = null; // Reset leader when changing civilization

    // Apply starting resources
    if (civilization.startingResources) {
      this.state.resources.food += civilization.startingResources.food || 0;
      this.state.resources.wood += civilization.startingResources.wood || 0;
      this.state.resources.stone += civilization.startingResources.stone || 0;
      this.state.resources.gold += civilization.startingResources.gold || 0;
      this.state.resources.science += civilization.startingResources.science || 0;
    }

    this.notifyStateChange();
    return true;
  }

  selectLeader(leaderId: string): boolean {
    const leader = getLeaderById(leaderId);
    if (!leader) return false;

    // Check if leader is available for current civilization and era
    const availableLeaders = getAvailableLeaders(
      this.state.lore.selectedCivilization,
      this.state.currentEra,
      ERAS
    );

    if (!availableLeaders.find(l => l.id === leaderId)) {
      return false;
    }

    this.state.lore.selectedLeader = leaderId;
    this.notifyStateChange();
    return true;
  }

  getAvailableLeaders(): Leader[] {
    return getAvailableLeaders(
      this.state.lore.selectedCivilization,
      this.state.currentEra,
      ERAS
    );
  }

  discoverNaturalWonder(): NaturalWonder | null {
    const wonder = tryDiscoverWonder(
      this.state.currentEra,
      this.state.lore.discoveredWonders,
      ERAS
    );

    if (wonder) {
      this.state.lore.discoveredWonders.add(wonder.id);
      
      // Handle special one-time bonuses (like El Dorado)
      if (wonder.id === 'el_dorado') {
        this.state.resources.gold += 5000;
      }

      this.notifyStateChange();
    }

    return wonder;
  }

  getDiscoveredWonders(): NaturalWonder[] {
    return Array.from(this.state.lore.discoveredWonders)
      .map(id => getNaturalWonderById(id))
      .filter((w): w is NaturalWonder => w !== undefined);
  }

  foundNewReligion(templateId: string): boolean {
    if (this.state.lore.foundedReligion) {
      return false; // Can only have one religion
    }

    const religion = foundReligion(templateId);
    if (!religion) return false;

    this.state.lore.foundedReligion = religion;
    this.notifyStateChange();
    return true;
  }

  getReligionTemplates(): typeof RELIGION_TEMPLATES {
    return RELIGION_TEMPLATES;
  }

  adoptCulturalPolicy(policyId: string): boolean {
    if (!canAdoptPolicy(policyId, this.state.lore.culturePoints, this.state.lore.adoptedPolicies)) {
      return false;
    }

    const policy = getPolicyById(policyId);
    if (!policy) return false;

    this.state.lore.culturePoints -= policy.cost;
    this.state.lore.adoptedPolicies.add(policyId);

    // Update culture level
    this.state.lore.cultureLevel = Math.floor(this.state.lore.adoptedPolicies.size / 2);

    this.notifyStateChange();
    return true;
  }

  getAvailablePolicies(): CulturalPolicy[] {
    return CULTURAL_POLICIES.filter(policy => !this.state.lore.adoptedPolicies.has(policy.id));
  }

  getAdoptedPolicies(): CulturalPolicy[] {
    return Array.from(this.state.lore.adoptedPolicies)
      .map(id => getPolicyById(id))
      .filter((p): p is CulturalPolicy => p !== undefined);
  }

  getCivilization(): Civilization | undefined {
    return getCivilizationById(this.state.lore.selectedCivilization);
  }

  getLeader(): Leader | undefined {
    return this.state.lore.selectedLeader ? getLeaderById(this.state.lore.selectedLeader) : undefined;
  }

  // ===== Military Enhancement Methods =====

  // Unit Upgrades
  getAvailableUnitUpgrades(): UnitUpgrade[] {
    return UNIT_UPGRADES.filter(upgrade => 
      canUpgradeUnit(upgrade, this.state.army, this.state.resources, this.state.researchedTechs)
    );
  }

  upgradeUnit(upgradeId: string): boolean {
    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade) return false;

    if (!canUpgradeUnit(upgrade, this.state.army, this.state.resources, this.state.researchedTechs)) {
      return false;
    }

    // Deduct costs
    this.state.resources.food -= upgrade.cost.food;
    this.state.resources.gold -= upgrade.cost.gold;
    this.state.resources.science -= upgrade.cost.science;

    // Find the troop to upgrade
    const fromTroop = this.state.army.find(t => t.typeId === upgrade.fromUnit);
    if (!fromTroop || fromTroop.count <= 0) return false;

    // Remove one unit from the old type
    fromTroop.count--;
    if (fromTroop.count <= 0) {
      this.state.army = this.state.army.filter(t => t.count > 0);
    }

    // Add one unit to the new type
    const toTroop = this.state.army.find(t => t.typeId === upgrade.toUnit);
    if (toTroop) {
      toTroop.count++;
    } else {
      this.state.army.push({ typeId: upgrade.toUnit, count: 1 });
      // Make sure the new troop type is unlocked
      this.state.unlockedTroops.add(upgrade.toUnit);
    }

    this.notifyStateChange();
    return true;
  }

  // Formations
  getAvailableFormations(): Formation[] {
    return getAvailableFormations(this.state.researchedTechs);
  }

  setFormation(formationId: string): boolean {
    const formation = getFormationById(formationId);
    if (!formation) return false;

    // Check if formation is available
    if (formation.requiredTech && !this.state.researchedTechs.has(formation.requiredTech)) {
      return false;
    }

    this.state.military.selectedFormation = formationId;
    this.notifyStateChange();
    return true;
  }

  getCurrentFormation(): Formation | undefined {
    return getFormationById(this.state.military.selectedFormation);
  }

  // Defense System
  getAvailableDefenseStructures(): DefenseStructure[] {
    return DEFENSE_STRUCTURES.filter(structure => 
      this.state.researchedTechs.has(structure.requiredTech)
    );
  }

  buildDefenseStructure(structureId: string): boolean {
    const structure = getDefenseStructureById(structureId);
    if (!structure) return false;

    // Check tech requirement
    if (!this.state.researchedTechs.has(structure.requiredTech)) return false;

    // Check if at max count
    const currentCount = this.state.military.defenseBuildings.find(b => b.typeId === structureId)?.count || 0;
    if (currentCount >= structure.maxCount) return false;

    // Check resources
    if (this.state.resources.food < structure.cost.food) return false;
    if (this.state.resources.wood < structure.cost.wood) return false;
    if (this.state.resources.stone < structure.cost.stone) return false;
    if (this.state.resources.gold < structure.cost.gold) return false;

    // Deduct costs
    this.state.resources.food -= structure.cost.food;
    this.state.resources.wood -= structure.cost.wood;
    this.state.resources.stone -= structure.cost.stone;
    this.state.resources.gold -= structure.cost.gold;

    // Add to construction queue
    const now = Date.now();
    this.state.military.defenseConstructionQueue.push({
      typeId: structureId,
      endTime: now + structure.buildTime * 1000,
    });

    this.notifyStateChange();
    return true;
  }

  getDefenseBonuses(): { defense: number; health: number } {
    return calculateDefenseBonuses(this.state.military.defenseBuildings);
  }

  // Heroes
  getAvailableHeroes(): Hero[] {
    return getAvailableHeroes(this.state.researchedTechs, this.state.military.recruitedHeroes);
  }

  recruitHero(heroId: string): boolean {
    const hero = getHeroById(heroId);
    if (!hero) return false;

    // Check if already recruited
    if (this.state.military.recruitedHeroes.has(heroId)) return false;

    // Check tech requirement
    if (!this.state.researchedTechs.has(hero.requiredTech)) return false;

    // Check resources
    if (this.state.resources.gold < hero.cost.gold) return false;
    if (this.state.resources.science < hero.cost.science) return false;

    // Deduct costs
    this.state.resources.gold -= hero.cost.gold;
    this.state.resources.science -= hero.cost.science;

    // Add hero
    this.state.military.recruitedHeroes.add(heroId);

    // Auto-activate if no hero is active
    if (!this.state.military.activeHero) {
      this.state.military.activeHero = heroId;
    }

    // Update statistics
    this.state.statistics.heroesRecruited = (this.state.statistics.heroesRecruited || 0) + 1;

    // Check for military tradition unlock
    this.checkMilitaryTraditions();

    this.notifyStateChange();
    return true;
  }

  setActiveHero(heroId: string | null): boolean {
    if (heroId && !this.state.military.recruitedHeroes.has(heroId)) {
      return false;
    }
    this.state.military.activeHero = heroId;
    this.notifyStateChange();
    return true;
  }

  getActiveHero(): Hero | undefined {
    return this.state.military.activeHero ? getHeroById(this.state.military.activeHero) : undefined;
  }

  getRecruitedHeroes(): Hero[] {
    return Array.from(this.state.military.recruitedHeroes)
      .map(id => getHeroById(id))
      .filter((h): h is Hero => h !== undefined);
  }

  // Naval Forces
  getAvailableNavalUnits(): NavalUnit[] {
    return NAVAL_UNITS.filter(unit => 
      this.state.researchedTechs.has(unit.requiredTech)
    );
  }

  trainNavalUnit(unitId: string): boolean {
    const unit = getNavalUnitById(unitId);
    if (!unit) return false;

    // Check tech requirement
    if (!this.state.researchedTechs.has(unit.requiredTech)) return false;

    // Check resources
    if (this.state.resources.food < unit.cost.food) return false;
    if (this.state.resources.wood < unit.cost.wood) return false;
    if (this.state.resources.gold < unit.cost.gold) return false;

    // Deduct costs
    this.state.resources.food -= unit.cost.food;
    this.state.resources.wood -= unit.cost.wood;
    this.state.resources.gold -= unit.cost.gold;

    // Add to training queue
    const now = Date.now();
    this.state.military.navalTrainingQueue.push({
      typeId: unitId,
      endTime: now + unit.trainTime * 1000,
    });

    this.notifyStateChange();
    return true;
  }

  getNavalPower(): { attack: number; defense: number; health: number } {
    return calculateNavalPower(this.state.military.navy);
  }

  // Siege Weapons
  getAvailableSiegeWeapons(): SiegeWeapon[] {
    return SIEGE_WEAPONS.filter(weapon => 
      this.state.researchedTechs.has(weapon.requiredTech)
    );
  }

  trainSiegeWeapon(weaponId: string): boolean {
    const weapon = getSiegeWeaponById(weaponId);
    if (!weapon) return false;

    // Check tech requirement
    if (!this.state.researchedTechs.has(weapon.requiredTech)) return false;

    // Check resources
    if (this.state.resources.food < weapon.cost.food) return false;
    if (this.state.resources.wood < weapon.cost.wood) return false;
    if (this.state.resources.stone < weapon.cost.stone) return false;
    if (this.state.resources.gold < weapon.cost.gold) return false;

    // Deduct costs
    this.state.resources.food -= weapon.cost.food;
    this.state.resources.wood -= weapon.cost.wood;
    this.state.resources.stone -= weapon.cost.stone;
    this.state.resources.gold -= weapon.cost.gold;

    // Add to training queue
    const now = Date.now();
    this.state.military.siegeTrainingQueue.push({
      typeId: weaponId,
      endTime: now + weapon.trainTime * 1000,
    });

    this.notifyStateChange();
    return true;
  }

  getSiegePower(): { attack: number; defense: number; health: number; siegeBonus: number } {
    return calculateSiegePower(this.state.military.siegeWeapons);
  }

  // Military Traditions
  checkMilitaryTraditions(): void {
    const stats = {
      battlesWon: this.state.statistics.battlesWon,
      territoriesConquered: this.state.statistics.territoriesConquered || 0,
      heroesRecruited: this.state.statistics.heroesRecruited || 0,
      veteranUnits: this.getVeteranUnitCount(),
    };

    for (const tradition of MILITARY_TRADITIONS) {
      if (!this.state.military.unlockedTraditions.has(tradition.id)) {
        if (checkTraditionUnlock(tradition, stats)) {
          this.state.military.unlockedTraditions.add(tradition.id);
        }
      }
    }
  }

  private getVeteranUnitCount(): number {
    let count = 0;
    for (const [, expData] of this.state.military.unitExperience) {
      if (expData.level >= 2) { // Veteran or Elite
        count++;
      }
    }
    return count;
  }

  getUnlockedTraditions(): MilitaryTradition[] {
    return Array.from(this.state.military.unlockedTraditions)
      .map(id => getTraditionById(id))
      .filter((t): t is MilitaryTradition => t !== undefined);
  }

  getTraditionBonuses(): ReturnType<typeof calculateTraditionBonuses> {
    return calculateTraditionBonuses(this.state.military.unlockedTraditions);
  }

  // Espionage
  getAvailableSpyMissions(): SpyMission[] {
    return getAvailableSpyMissions(this.state.researchedTechs);
  }

  recruitSpy(): boolean {
    // Check if at max spies
    if (this.state.military.spies.length >= this.state.military.maxSpies) return false;

    // Cost to recruit a spy
    const spyCost = 500 * (this.state.military.spies.length + 1);
    if (this.state.resources.gold < spyCost) return false;

    this.state.resources.gold -= spyCost;

    // Create new spy
    const spy: Spy = {
      id: `spy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generateSpyName(),
      level: 1,
      experience: 0,
      currentMission: null,
      missionEndTime: null,
    };

    this.state.military.spies.push(spy);
    this.notifyStateChange();
    return true;
  }

  private generateSpyName(): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Reese', 'Dakota'];
    const lastNames = ['Shadow', 'Steele', 'Fox', 'Wolf', 'Storm', 'Raven', 'Black', 'Gray', 'Stone', 'Cross'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  startSpyMission(spyId: string, missionId: string): boolean {
    const spy = this.state.military.spies.find(s => s.id === spyId);
    if (!spy) return false;
    if (spy.currentMission) return false; // Spy is busy

    const mission = getSpyMissionById(missionId);
    if (!mission) return false;

    // Check tech requirement
    if (!this.state.researchedTechs.has(mission.requiredTech)) return false;

    // Check cost
    if (this.state.resources.gold < mission.cost.gold) return false;

    // Deduct cost
    this.state.resources.gold -= mission.cost.gold;

    // Start mission
    const now = Date.now();
    spy.currentMission = missionId;
    spy.missionEndTime = now + mission.duration * 1000;

    this.state.military.activeSpyMissions.push({
      spyId,
      missionId,
      startTime: now,
      endTime: now + mission.duration * 1000,
    });

    this.notifyStateChange();
    return true;
  }

  // Get total military power including all systems
  getTotalMilitaryPower(): { attack: number; defense: number; health: number } {
    return calculateTotalMilitaryPower(this.state.army, this.state.military, this.state.researchedTechs);
  }

  // Update military training queues (called from main update loop)
  private updateMilitaryQueues(now: number): void {
    // Update defense construction
    const completedDefense: number[] = [];
    for (let i = 0; i < this.state.military.defenseConstructionQueue.length; i++) {
      const construction = this.state.military.defenseConstructionQueue[i];
      if (now >= construction.endTime) {
        // Add defense building
        const existing = this.state.military.defenseBuildings.find(b => b.typeId === construction.typeId);
        if (existing) {
          existing.count++;
        } else {
          this.state.military.defenseBuildings.push({ typeId: construction.typeId, count: 1 });
        }
        completedDefense.push(i);
      }
    }
    for (let i = completedDefense.length - 1; i >= 0; i--) {
      this.state.military.defenseConstructionQueue.splice(completedDefense[i], 1);
    }

    // Update naval training
    const completedNaval: number[] = [];
    for (let i = 0; i < this.state.military.navalTrainingQueue.length; i++) {
      const training = this.state.military.navalTrainingQueue[i];
      if (now >= training.endTime) {
        // Add naval unit
        const existing = this.state.military.navy.find(n => n.typeId === training.typeId);
        if (existing) {
          existing.count++;
        } else {
          this.state.military.navy.push({ typeId: training.typeId, count: 1 });
        }
        completedNaval.push(i);
      }
    }
    for (let i = completedNaval.length - 1; i >= 0; i--) {
      this.state.military.navalTrainingQueue.splice(completedNaval[i], 1);
    }

    // Update siege weapon training
    const completedSiege: number[] = [];
    for (let i = 0; i < this.state.military.siegeTrainingQueue.length; i++) {
      const training = this.state.military.siegeTrainingQueue[i];
      if (now >= training.endTime) {
        // Add siege weapon
        const existing = this.state.military.siegeWeapons.find(s => s.typeId === training.typeId);
        if (existing) {
          existing.count++;
        } else {
          this.state.military.siegeWeapons.push({ typeId: training.typeId, count: 1 });
        }
        completedSiege.push(i);
      }
    }
    for (let i = completedSiege.length - 1; i >= 0; i--) {
      this.state.military.siegeTrainingQueue.splice(completedSiege[i], 1);
    }

    // Update spy missions
    const completedSpyMissions: number[] = [];
    for (let i = 0; i < this.state.military.activeSpyMissions.length; i++) {
      const activeMission = this.state.military.activeSpyMissions[i];
      if (now >= activeMission.endTime) {
        this.completeSpyMission(activeMission);
        completedSpyMissions.push(i);
      }
    }
    for (let i = completedSpyMissions.length - 1; i >= 0; i--) {
      this.state.military.activeSpyMissions.splice(completedSpyMissions[i], 1);
    }
  }

  private completeSpyMission(activeMission: { spyId: string; missionId: string }): void {
    const spy = this.state.military.spies.find(s => s.id === activeMission.spyId);
    const mission = getSpyMissionById(activeMission.missionId);
    
    if (!spy || !mission) return;

    // Calculate success
    const successChance = calculateSpySuccessChance(mission, spy);
    const success = Math.random() < successChance;

    if (success) {
      // Apply mission effects
      if (mission.effects.type === 'steal' && mission.effects.resourceStolen) {
        const resource = mission.effects.resourceStolen.resource as keyof typeof this.state.resources;
        this.state.resources[resource] += mission.effects.resourceStolen.amount;
      }
      // Other effects could be stored for battle use

      // Gain experience
      spy.experience += 50;
      if (spy.experience >= 100 * spy.level) {
        spy.level++;
      }
    }

    // Reset spy
    spy.currentMission = null;
    spy.missionEndTime = null;
  }
}

// Export for global use
export { ERAS, TECHNOLOGIES, TROOP_TYPES, ACHIEVEMENTS, BUILDING_TYPES };
export { CIVILIZATIONS, LEADERS, NATURAL_WONDERS, RELIGION_TEMPLATES, CULTURAL_POLICIES } from './lore.js';
export type { Civilization, Leader, NaturalWonder, Religion, CulturalPolicy, LoreState } from './lore.js';
export type { Mission, ActiveBattle, BattleResult, BattleLog, Territory, ArmySize } from './combat.js';
export type { Achievement, AchievementProgress, Statistics } from './achievements.js';
export type { BuildingType, Building, ConstructingBuilding } from './buildings.js';
// Military exports
export { UNIT_UPGRADES, FORMATIONS, DEFENSE_STRUCTURES, HEROES, NAVAL_UNITS, SIEGE_WEAPONS, MILITARY_TRADITIONS, SPY_MISSIONS, EXPERIENCE_LEVELS } from './military.js';
export type { 
  MilitaryState, UnitUpgrade, Formation, DefenseStructure, DefenseBuilding, 
  Hero, NavalUnit, NavalTroop, SiegeWeapon, SiegeTroop, 
  MilitaryTradition, SpyMission, Spy, UnitExperience 
} from './military.js';
