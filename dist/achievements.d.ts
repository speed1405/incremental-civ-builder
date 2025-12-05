export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'resources' | 'research' | 'military' | 'progress' | 'combat' | 'buildings';
    condition: AchievementCondition;
    reward?: {
        type: 'multiplier' | 'resource';
        resource?: string;
        amount: number;
    };
}
export interface AchievementCondition {
    type: 'resource_total' | 'resource_current' | 'tech_count' | 'troop_count' | 'era_reached' | 'battles_won' | 'missions_completed' | 'building_count';
    target: string | number;
    amount: number;
}
export interface AchievementProgress {
    id: string;
    unlocked: boolean;
    unlockedAt?: number;
    notified: boolean;
}
export declare const ACHIEVEMENTS: Achievement[];
export declare function getAchievementById(id: string): Achievement | undefined;
export declare function getAchievementsByCategory(category: string): Achievement[];
export interface Statistics {
    totalFoodGathered: number;
    totalWoodGathered: number;
    totalStoneGathered: number;
    totalGoldEarned: number;
    totalScienceGenerated: number;
    totalTroopsTrained: number;
    battlesWon: number;
    battlesLost: number;
    clickCount: number;
    offlineEarnings: number;
    totalBuildingsConstructed: number;
    territoriesConquered: number;
}
export declare function createInitialStatistics(): Statistics;
export declare function createInitialAchievementProgress(): Map<string, AchievementProgress>;
