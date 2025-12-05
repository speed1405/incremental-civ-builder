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

    // Calculate total multipliers (base + conquest)
    const totalFoodMultiplier = this.state.resourceMultipliers.food * conquestMultipliers.food;
    const totalWoodMultiplier = this.state.resourceMultipliers.wood * conquestMultipliers.wood;
    const totalStoneMultiplier = this.state.resourceMultipliers.stone * conquestMultipliers.stone;
    const totalGoldMultiplier = this.state.resourceMultipliers.gold * conquestMultipliers.gold;
    const totalScienceMultiplier = this.state.resourceMultipliers.science * conquestMultipliers.science;

    // Calculate resource gains (era base rate + building production + conquest flat) * multipliers
    const foodGain = (era.resources.food.baseRate + buildingProduction.food + conquestBonuses.food) * totalFoodMultiplier * delta;
    const woodGain = (era.resources.wood.baseRate + buildingProduction.wood + conquestBonuses.wood) * totalWoodMultiplier * delta;
    const stoneGain = (era.resources.stone.baseRate + buildingProduction.stone + conquestBonuses.stone) * totalStoneMultiplier * delta;
    const goldGain = (era.resources.gold.baseRate + buildingProduction.gold + conquestBonuses.gold) * totalGoldMultiplier * delta;
    const scienceGain = (era.resources.science.baseRate + buildingProduction.science + conquestBonuses.science) * totalScienceMultiplier * delta;

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

    // Update research progress
    if (this.state.currentResearch) {
      const tech = getTechById(this.state.currentResearch);
      if (tech) {
        // Research progresses based on science generation
        this.state.researchProgress += (era.resources.science.baseRate + buildingProduction.science + conquestBonuses.science) * totalScienceMultiplier * delta;
        
        if (this.state.researchProgress >= tech.cost.science) {
          this.completeResearch();
        }
      }
    }

    // Update training queue
    this.updateTrainingQueue(now);

    // Update construction queue
    this.updateConstructionQueue(now);

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

  private hasReachedEra(eraId: string): boolean {
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
    
    const saveData = {
      ...this.state,
      researchedTechs: Array.from(this.state.researchedTechs),
      unlockedTroops: Array.from(this.state.unlockedTroops),
      completedMissions: Array.from(this.state.completedMissions),
      unlockedBuildings: Array.from(this.state.unlockedBuildings),
      conqueredTerritories: Array.from(this.state.conqueredTerritories),
      achievements: achievementsArray,
      skillTree: skillTreeSave,
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
}

// Export for global use
export { ERAS, TECHNOLOGIES, TROOP_TYPES, ACHIEVEMENTS, BUILDING_TYPES };
export type { Mission, ActiveBattle, BattleResult, BattleLog, Territory, ArmySize } from './combat.js';
export type { Achievement, AchievementProgress, Statistics } from './achievements.js';
export type { BuildingType, Building, ConstructingBuilding } from './buildings.js';
