import { Troop } from './barracks.js';
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
