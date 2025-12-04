export interface Era {
    id: string;
    name: string;
    description: string;
    requiredResearch: string | null;
    resources: {
        food: {
            baseRate: number;
        };
        wood: {
            baseRate: number;
        };
        stone: {
            baseRate: number;
        };
        gold: {
            baseRate: number;
        };
        science: {
            baseRate: number;
        };
    };
}
export declare const ERAS: Era[];
export declare function getEraById(id: string): Era | undefined;
export declare function getNextEra(currentEraId: string): Era | undefined;
