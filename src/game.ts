// Main game engine
import { Era, ERAS, getEraById, getNextEra } from './eras.js';
import { Technology, TECHNOLOGIES, getTechById, canResearch } from './research.js';
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
  generateMissions,
  getMissionById,
  getMissionsByEra,
  simulateCombat,
  canStartMission,
  isMissionAvailable,
} from './combat.js';

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
}

export class Game {
  state: GameState;
  private updateInterval: number | null = null;
  private onStateChange: (() => void) | null = null;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      currentEra: 'stone_age',
      resources: {
        food: 100,
        wood: 50,
        stone: 25,
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
    };
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

    // Update resources based on era rates and multipliers
    this.state.resources.food += era.resources.food.baseRate * this.state.resourceMultipliers.food * delta;
    this.state.resources.wood += era.resources.wood.baseRate * this.state.resourceMultipliers.wood * delta;
    this.state.resources.stone += era.resources.stone.baseRate * this.state.resourceMultipliers.stone * delta;
    this.state.resources.gold += era.resources.gold.baseRate * this.state.resourceMultipliers.gold * delta;
    this.state.resources.science += era.resources.science.baseRate * this.state.resourceMultipliers.science * delta;

    // Update research progress
    if (this.state.currentResearch) {
      const tech = getTechById(this.state.currentResearch);
      if (tech) {
        // Research progresses based on science generation
        this.state.researchProgress += era.resources.science.baseRate * this.state.resourceMultipliers.science * delta;
        
        if (this.state.researchProgress >= tech.cost.science) {
          this.completeResearch();
        }
      }
    }

    // Update training queue
    this.updateTrainingQueue(now);

    this.notifyStateChange();
  }

  private updateTrainingQueue(now: number): void {
    const completed: number[] = [];
    
    for (let i = 0; i < this.state.trainingQueue.length; i++) {
      const training = this.state.trainingQueue[i];
      if (now >= training.endTime) {
        // Add troop to army
        this.addTroopToArmy(training.troopId);
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

  // Resource gathering actions (manual clicking)
  gatherFood(): void {
    this.state.resources.food += 1 * this.state.resourceMultipliers.food;
    this.notifyStateChange();
  }

  gatherWood(): void {
    this.state.resources.wood += 1 * this.state.resourceMultipliers.wood;
    this.notifyStateChange();
  }

  gatherStone(): void {
    this.state.resources.stone += 1 * this.state.resourceMultipliers.stone;
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
    
    this.state.currentResearch = null;
    this.state.researchProgress = 0;
    this.notifyStateChange();
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
      
      // Mark mission as completed
      this.state.completedMissions.add(this.state.activeBattle.missionId);
    }
    
    // Apply casualties to army (reduce troops based on damage taken)
    if (result.casualtyPercent > 0) {
      this.applyCasualties(result.casualtyPercent);
    }
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

  // Save/Load
  saveGame(): string {
    const saveData = {
      ...this.state,
      researchedTechs: Array.from(this.state.researchedTechs),
      unlockedTroops: Array.from(this.state.unlockedTroops),
      completedMissions: Array.from(this.state.completedMissions),
      activeBattle: null, // Don't save active battles
    };
    return JSON.stringify(saveData);
  }

  loadGame(saveString: string): boolean {
    try {
      const saveData = JSON.parse(saveString);
      this.state = {
        ...saveData,
        researchedTechs: new Set(saveData.researchedTechs),
        unlockedTroops: new Set(saveData.unlockedTroops),
        completedMissions: new Set(saveData.completedMissions || []),
        missions: generateMissions(), // Always regenerate missions
        activeBattle: null,
        battleAnimationSpeed: saveData.battleAnimationSpeed || 800,
      };
      return true;
    } catch {
      return false;
    }
  }

  resetGame(): void {
    this.state = this.createInitialState();
    this.notifyStateChange();
  }
}

// Export for global use
export { ERAS, TECHNOLOGIES, TROOP_TYPES };
export type { Mission, ActiveBattle, BattleResult, BattleLog } from './combat.js';
