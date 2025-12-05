import { Troop } from './barracks.js';
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
export interface Territory {
    id: string;
    name: string;
    description: string;
    era: string;
    conquered: boolean;
    enemyArmy: EnemyArmy;
    bonuses: {
        resourceMultiplier?: {
            resource: string;
            multiplier: number;
        };
        flatBonus?: {
            resource: string;
            amount: number;
        };
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
export declare function generateMissions(): Mission[];
export declare function getMissionsByEra(missions: Mission[], era: string): Mission[];
export declare function getMissionById(missions: Mission[], id: string): Mission | undefined;
export declare function simulateBattleRound(playerHealth: number, enemyHealth: number, playerAttack: number, playerDefense: number, enemyAttack: number, enemyDefense: number, round: number): BattleLog;
export declare function generateBattleLogs(playerArmy: {
    attack: number;
    defense: number;
    health: number;
}, enemyArmy: EnemyArmy): BattleLog[];
export declare function determineBattleResult(logs: BattleLog[], playerStartHealth: number, enemyStartHealth: number, mission: Mission): BattleResult;
export declare function simulateCombat(playerArmy: Troop[], mission: Mission): BattleResult;
export declare function canStartMission(playerArmy: Troop[]): boolean;
export declare function getEraIndex(eraId: string): number;
export declare function isMissionAvailable(mission: Mission, currentEra: string): boolean;
export declare function generateTerritories(): Territory[];
export declare function getTerritoryById(territories: Territory[], id: string): Territory | undefined;
export declare function getTerritoriesByEra(territories: Territory[], era: string): Territory[];
export declare function isTerritoryAvailable(territory: Territory, currentEra: string): boolean;
export declare function calculateConquestBonuses(territories: Territory[]): {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
};
export declare function calculateConquestMultipliers(territories: Territory[]): {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
};
export declare function simulateTerritoryConquest(playerArmy: Troop[], territory: Territory): BattleResult;
