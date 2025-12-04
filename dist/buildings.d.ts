export interface BuildingType {
    id: string;
    name: string;
    description: string;
    era: string;
    unlockTech: string | null;
    cost: {
        food: number;
        wood: number;
        stone: number;
        gold: number;
    };
    buildTime: number;
    production: {
        food?: number;
        wood?: number;
        stone?: number;
        gold?: number;
        science?: number;
    };
    maxCount: number;
}
export declare const BUILDING_TYPES: BuildingType[];
export interface ConstructingBuilding {
    buildingId: string;
    startTime: number;
    endTime: number;
}
export interface Building {
    typeId: string;
    count: number;
}
export declare function getBuildingTypeById(id: string): BuildingType | undefined;
export declare function getBuildingsByEra(era: string): BuildingType[];
export declare function canBuildBuilding(buildingId: string, unlockedBuildings: Set<string>, builtBuildings: Building[], resources: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
}): boolean;
export declare function calculateBuildingProduction(buildings: Building[]): {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    science: number;
};
export declare function getTotalBuildingCount(buildings: Building[]): number;
