export interface TroopType {
    id: string;
    name: string;
    description: string;
    era: string;
    unlockTech: string;
    cost: {
        food: number;
        gold: number;
        wood?: number;
        stone?: number;
    };
    trainTime: number;
    stats: {
        attack: number;
        defense: number;
        health: number;
    };
}
export declare const TROOP_TYPES: TroopType[];
export interface TrainingTroop {
    troopId: string;
    startTime: number;
    endTime: number;
}
export interface Troop {
    typeId: string;
    count: number;
}
export declare function getTroopTypeById(id: string): TroopType | undefined;
export declare function getTroopsByEra(era: string): TroopType[];
export declare function canTrainTroop(troopId: string, unlockedTroops: Set<string>, resources: {
    food: number;
    gold: number;
    wood: number;
    stone: number;
}): boolean;
export declare function calculateArmyPower(troops: Troop[]): {
    attack: number;
    defense: number;
    health: number;
};
