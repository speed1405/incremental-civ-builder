import { Game } from './game.js';
export declare class GameUI {
    private game;
    private currentTab;
    private battleAnimationInterval;
    constructor(game: Game);
    private setupEventListeners;
    private switchTab;
    render(): void;
    private renderHeader;
    private renderResources;
    private renderResourcesTab;
    private renderResearchTab;
    private canResearchTech;
    private renderBarracksTab;
    private canTrainTroop;
    private renderArmyTab;
    private renderCombatTab;
    private getDifficultyRating;
    private startMission;
    private startBattleAnimation;
    private renderActiveBattle;
    private saveGame;
    private loadGame;
    private resetGame;
    private showNotification;
}
