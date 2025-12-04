import { ERAS } from './eras.js';
import { Technology, TECHNOLOGIES } from './research.js';
import { TroopType, TROOP_TYPES, TrainingTroop, Troop } from './barracks.js';
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
export declare class Game {
    state: GameState;
    private updateInterval;
    private onStateChange;
    constructor();
    private createInitialState;
    setOnStateChange(callback: () => void): void;
    private notifyStateChange;
    start(): void;
    stop(): void;
    private update;
    private updateTrainingQueue;
    private addTroopToArmy;
    gatherFood(): void;
    gatherWood(): void;
    gatherStone(): void;
    startResearch(techId: string): boolean;
    private completeResearch;
    trainTroop(troopId: string): boolean;
    getArmyPower(): {
        attack: number;
        defense: number;
        health: number;
    };
    getAvailableTechs(): Technology[];
    getAvailableTroops(): TroopType[];
    saveGame(): string;
    loadGame(saveString: string): boolean;
    resetGame(): void;
}
export { ERAS, TECHNOLOGIES, TROOP_TYPES };
