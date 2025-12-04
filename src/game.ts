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
