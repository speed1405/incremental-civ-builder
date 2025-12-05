export interface Technology {
    id: string;
    name: string;
    description: string;
    era: string;
    cost: {
        science: number;
        gold?: number;
    };
    prerequisites: string[];
    effects: {
        unlocks?: string[];
        resourceBonus?: {
            resource: string;
            multiplier: number;
        };
        unitUnlock?: string;
        specialUnlock?: string;
    };
}
export declare const SPECIAL_UNLOCKS: {
    readonly OFFLINE_PROGRESS: "offline_progress";
};
export declare const TECH_IDS: {
    readonly CLOUD_COMPUTING: "cloud_computing";
};
export declare const TECHNOLOGIES: Technology[];
export declare function getTechById(id: string): Technology | undefined;
export declare function getTechsByEra(era: string): Technology[];
export declare function canResearch(techId: string, researchedTechs: Set<string>, science: number): boolean;
