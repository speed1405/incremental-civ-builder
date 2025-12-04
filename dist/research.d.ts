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
    };
}
export declare const TECHNOLOGIES: Technology[];
export declare function getTechById(id: string): Technology | undefined;
export declare function getTechsByEra(era: string): Technology[];
export declare function canResearch(techId: string, researchedTechs: Set<string>, science: number): boolean;
