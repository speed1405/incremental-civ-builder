// Main game engine
import { ERAS, getEraById, getNextEra } from './eras.js';
import { TECHNOLOGIES, getTechById, canResearch } from './research.js';
import { TROOP_TYPES, getTroopTypeById, canTrainTroop, calculateArmyPower } from './barracks.js';
import { generateMissions, getMissionById, getMissionsByEra, simulateCombat, canStartMission, isMissionAvailable, } from './combat.js';
import { ACHIEVEMENTS, getAchievementById, createInitialStatistics, createInitialAchievementProgress, } from './achievements.js';
export class Game {
    constructor() {
        this.updateInterval = null;
        this.onStateChange = null;
        this.onAchievementUnlocked = null;
        this.offlineProgress = null;
        this.state = this.createInitialState();
    }
    createInitialState() {
        return {
            currentEra: 'stone_age',
            resources: {
                food: 100,
                wood: 50,
                stone: 25,
                gold: 0,
                science: 0,
            },
            resourceMultipliers: {
                food: 1,
                wood: 1,
                stone: 1,
                gold: 1,
                science: 1,
            },
            researchedTechs: new Set(),
            currentResearch: null,
            researchProgress: 0,
            unlockedTroops: new Set(),
            army: [],
            trainingQueue: [],
            lastUpdate: Date.now(),
            totalPlayTime: 0,
            // Combat system
            missions: generateMissions(),
            completedMissions: new Set(),
            activeBattle: null,
            battleAnimationSpeed: 800, // 800ms per round
            // Achievements and statistics
            statistics: createInitialStatistics(),
            achievements: createInitialAchievementProgress(),
            pendingAchievementNotifications: [],
        };
    }
    setOnAchievementUnlocked(callback) {
        this.onAchievementUnlocked = callback;
    }
    setOnStateChange(callback) {
        this.onStateChange = callback;
    }
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange();
        }
    }
    start() {
        this.state.lastUpdate = Date.now();
        this.updateInterval = window.setInterval(() => this.update(), 100);
    }
    stop() {
        if (this.updateInterval !== null) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    update() {
        const now = Date.now();
        const delta = (now - this.state.lastUpdate) / 1000; // Convert to seconds
        this.state.lastUpdate = now;
        this.state.totalPlayTime += delta;
        // Get current era data
        const era = getEraById(this.state.currentEra);
        if (!era)
            return;
        // Calculate resource gains
        const foodGain = era.resources.food.baseRate * this.state.resourceMultipliers.food * delta;
        const woodGain = era.resources.wood.baseRate * this.state.resourceMultipliers.wood * delta;
        const stoneGain = era.resources.stone.baseRate * this.state.resourceMultipliers.stone * delta;
        const goldGain = era.resources.gold.baseRate * this.state.resourceMultipliers.gold * delta;
        const scienceGain = era.resources.science.baseRate * this.state.resourceMultipliers.science * delta;
        // Update resources based on era rates and multipliers
        this.state.resources.food += foodGain;
        this.state.resources.wood += woodGain;
        this.state.resources.stone += stoneGain;
        this.state.resources.gold += goldGain;
        this.state.resources.science += scienceGain;
        // Update statistics
        this.state.statistics.totalFoodGathered += foodGain;
        this.state.statistics.totalWoodGathered += woodGain;
        this.state.statistics.totalStoneGathered += stoneGain;
        this.state.statistics.totalGoldEarned += goldGain;
        this.state.statistics.totalScienceGenerated += scienceGain;
        // Update research progress
        if (this.state.currentResearch) {
            const tech = getTechById(this.state.currentResearch);
            if (tech) {
                // Research progresses based on science generation
                this.state.researchProgress += era.resources.science.baseRate * this.state.resourceMultipliers.science * delta;
                if (this.state.researchProgress >= tech.cost.science) {
                    this.completeResearch();
                }
            }
        }
        // Update training queue
        this.updateTrainingQueue(now);
        // Check for achievement unlocks
        this.checkAchievements();
        this.notifyStateChange();
    }
    updateTrainingQueue(now) {
        const completed = [];
        for (let i = 0; i < this.state.trainingQueue.length; i++) {
            const training = this.state.trainingQueue[i];
            if (now >= training.endTime) {
                // Add troop to army
                this.addTroopToArmy(training.troopId);
                this.state.statistics.totalTroopsTrained++;
                completed.push(i);
            }
        }
        // Remove completed training
        for (let i = completed.length - 1; i >= 0; i--) {
            this.state.trainingQueue.splice(completed[i], 1);
        }
    }
    addTroopToArmy(troopId) {
        const existing = this.state.army.find(t => t.typeId === troopId);
        if (existing) {
            existing.count++;
        }
        else {
            this.state.army.push({ typeId: troopId, count: 1 });
        }
    }
    // Resource gathering actions (manual clicking)
    gatherFood() {
        const amount = 1 * this.state.resourceMultipliers.food;
        this.state.resources.food += amount;
        this.state.statistics.totalFoodGathered += amount;
        this.state.statistics.clickCount++;
        this.checkAchievements();
        this.notifyStateChange();
    }
    gatherWood() {
        const amount = 1 * this.state.resourceMultipliers.wood;
        this.state.resources.wood += amount;
        this.state.statistics.totalWoodGathered += amount;
        this.state.statistics.clickCount++;
        this.checkAchievements();
        this.notifyStateChange();
    }
    gatherStone() {
        const amount = 1 * this.state.resourceMultipliers.stone;
        this.state.resources.stone += amount;
        this.state.statistics.totalStoneGathered += amount;
        this.state.statistics.clickCount++;
        this.checkAchievements();
        this.notifyStateChange();
    }
    // Research system
    startResearch(techId) {
        const tech = getTechById(techId);
        if (!tech)
            return false;
        if (!canResearch(techId, this.state.researchedTechs, this.state.resources.science)) {
            return false;
        }
        // Deduct science cost
        this.state.resources.science -= tech.cost.science;
        this.state.currentResearch = techId;
        this.state.researchProgress = 0;
        this.notifyStateChange();
        return true;
    }
    completeResearch() {
        if (!this.state.currentResearch)
            return;
        const tech = getTechById(this.state.currentResearch);
        if (!tech)
            return;
        this.state.researchedTechs.add(this.state.currentResearch);
        // Apply effects
        if (tech.effects.resourceBonus) {
            const resource = tech.effects.resourceBonus.resource;
            this.state.resourceMultipliers[resource] *= tech.effects.resourceBonus.multiplier;
        }
        if (tech.effects.unitUnlock) {
            this.state.unlockedTroops.add(tech.effects.unitUnlock);
        }
        if (tech.effects.unlocks) {
            // Check if we can advance to a new era
            const nextEra = getNextEra(this.state.currentEra);
            if (nextEra && tech.effects.unlocks.includes(nextEra.id)) {
                this.state.currentEra = nextEra.id;
            }
        }
        this.state.currentResearch = null;
        this.state.researchProgress = 0;
        this.notifyStateChange();
    }
    // Barracks system
    trainTroop(troopId) {
        const troopType = getTroopTypeById(troopId);
        if (!troopType)
            return false;
        if (!canTrainTroop(troopId, this.state.unlockedTroops, this.state.resources)) {
            return false;
        }
        // Deduct costs
        this.state.resources.food -= troopType.cost.food;
        this.state.resources.gold -= troopType.cost.gold;
        if (troopType.cost.wood)
            this.state.resources.wood -= troopType.cost.wood;
        if (troopType.cost.stone)
            this.state.resources.stone -= troopType.cost.stone;
        // Add to training queue
        const now = Date.now();
        this.state.trainingQueue.push({
            troopId,
            startTime: now,
            endTime: now + troopType.trainTime * 1000,
        });
        this.notifyStateChange();
        return true;
    }
    getArmyPower() {
        return calculateArmyPower(this.state.army);
    }
    // Combat system methods
    getAvailableMissions() {
        return this.state.missions.filter(m => isMissionAvailable(m, this.state.currentEra));
    }
    getMissionsByCurrentEra() {
        return getMissionsByEra(this.state.missions, this.state.currentEra);
    }
    canStartMission() {
        return canStartMission(this.state.army) && !this.state.activeBattle;
    }
    startMission(missionId) {
        const mission = getMissionById(this.state.missions, missionId);
        if (!mission)
            return false;
        if (!isMissionAvailable(mission, this.state.currentEra))
            return false;
        if (!canStartMission(this.state.army))
            return false;
        if (this.state.activeBattle)
            return false;
        // Simulate the full battle and store all logs
        const result = simulateCombat(this.state.army, mission);
        const playerPower = calculateArmyPower(this.state.army);
        // Create active battle with pre-computed logs
        this.state.activeBattle = {
            missionId,
            logs: result.logs,
            currentRound: 0,
            isComplete: false,
            result: result,
            playerStartHealth: playerPower.health,
            enemyStartHealth: mission.enemyArmy.health,
        };
        this.notifyStateChange();
        return true;
    }
    // Advance battle animation by one round
    advanceBattleRound() {
        if (!this.state.activeBattle)
            return false;
        if (this.state.activeBattle.isComplete)
            return false;
        this.state.activeBattle.currentRound++;
        // Check if battle is complete
        if (this.state.activeBattle.currentRound >= this.state.activeBattle.logs.length) {
            this.completeBattle();
        }
        this.notifyStateChange();
        return true;
    }
    completeBattle() {
        if (!this.state.activeBattle || !this.state.activeBattle.result)
            return;
        this.state.activeBattle.isComplete = true;
        const result = this.state.activeBattle.result;
        if (result.victory && result.rewards) {
            // Add rewards
            this.state.resources.food += result.rewards.food;
            this.state.resources.wood += result.rewards.wood;
            this.state.resources.stone += result.rewards.stone;
            this.state.resources.gold += result.rewards.gold;
            this.state.resources.science += result.rewards.science;
            // Update statistics for rewards
            this.state.statistics.totalFoodGathered += result.rewards.food;
            this.state.statistics.totalWoodGathered += result.rewards.wood;
            this.state.statistics.totalStoneGathered += result.rewards.stone;
            this.state.statistics.totalGoldEarned += result.rewards.gold;
            this.state.statistics.totalScienceGenerated += result.rewards.science;
            // Mark mission as completed
            this.state.completedMissions.add(this.state.activeBattle.missionId);
            // Update battle statistics
            this.state.statistics.battlesWon++;
        }
        else {
            this.state.statistics.battlesLost++;
        }
        // Apply casualties to army (reduce troops based on damage taken)
        if (result.casualtyPercent > 0) {
            this.applyCasualties(result.casualtyPercent);
        }
        // Check achievements after battle
        this.checkAchievements();
    }
    applyCasualties(casualtyPercent) {
        // Remove some troops based on casualty percent
        // Higher casualty = more troops lost
        for (const troop of this.state.army) {
            const casualtyFactor = casualtyPercent / 100;
            const troopsLost = Math.floor(troop.count * casualtyFactor * 0.5); // 50% of casualty rate as actual losses
            troop.count = Math.max(0, troop.count - troopsLost);
        }
        // Remove troops with 0 count
        this.state.army = this.state.army.filter(t => t.count > 0);
    }
    dismissBattle() {
        this.state.activeBattle = null;
        this.notifyStateChange();
    }
    setBattleSpeed(speed) {
        this.state.battleAnimationSpeed = Math.max(100, Math.min(2000, speed));
        this.notifyStateChange();
    }
    isMissionCompleted(missionId) {
        return this.state.completedMissions.has(missionId);
    }
    // Get available technologies
    getAvailableTechs() {
        return TECHNOLOGIES.filter(tech => {
            if (this.state.researchedTechs.has(tech.id))
                return false;
            // Check prerequisites
            for (const prereq of tech.prerequisites) {
                if (!this.state.researchedTechs.has(prereq))
                    return false;
            }
            return true;
        });
    }
    // Get available troops
    getAvailableTroops() {
        return TROOP_TYPES.filter(troop => this.state.unlockedTroops.has(troop.id));
    }
    // Achievement system
    checkAchievements() {
        for (const achievement of ACHIEVEMENTS) {
            const progress = this.state.achievements.get(achievement.id);
            if (!progress || progress.unlocked)
                continue;
            if (this.isAchievementConditionMet(achievement)) {
                this.unlockAchievement(achievement.id);
            }
        }
    }
    isAchievementConditionMet(achievement) {
        const condition = achievement.condition;
        switch (condition.type) {
            case 'resource_total':
                return this.getStatisticForResource(condition.target) >= condition.amount;
            case 'resource_current':
                return this.state.resources[condition.target] >= condition.amount;
            case 'tech_count':
                return this.state.researchedTechs.size >= condition.amount;
            case 'troop_count':
                return this.getTotalTroopCount() >= condition.amount;
            case 'era_reached':
                return this.hasReachedEra(condition.target);
            case 'battles_won':
                return this.state.statistics.battlesWon >= condition.amount;
            case 'missions_completed':
                return this.state.completedMissions.size >= condition.amount;
            default:
                return false;
        }
    }
    getStatisticForResource(resource) {
        switch (resource) {
            case 'food': return this.state.statistics.totalFoodGathered;
            case 'wood': return this.state.statistics.totalWoodGathered;
            case 'stone': return this.state.statistics.totalStoneGathered;
            case 'gold': return this.state.statistics.totalGoldEarned;
            case 'science': return this.state.statistics.totalScienceGenerated;
            default: return 0;
        }
    }
    getTotalTroopCount() {
        return this.state.army.reduce((sum, troop) => sum + troop.count, 0);
    }
    hasReachedEra(eraId) {
        const currentIndex = ERAS.findIndex(e => e.id === this.state.currentEra);
        const targetIndex = ERAS.findIndex(e => e.id === eraId);
        return currentIndex >= targetIndex;
    }
    unlockAchievement(achievementId) {
        const progress = this.state.achievements.get(achievementId);
        if (!progress || progress.unlocked)
            return;
        const achievement = getAchievementById(achievementId);
        if (!achievement)
            return;
        progress.unlocked = true;
        progress.unlockedAt = Date.now();
        progress.notified = false;
        // Add to pending notifications
        this.state.pendingAchievementNotifications.push(achievementId);
        // Apply achievement reward if any
        if (achievement.reward) {
            if (achievement.reward.type === 'multiplier' && achievement.reward.resource) {
                const resource = achievement.reward.resource;
                this.state.resourceMultipliers[resource] *= achievement.reward.amount;
            }
        }
        // Notify callback
        if (this.onAchievementUnlocked) {
            this.onAchievementUnlocked(achievement);
        }
    }
    getUnlockedAchievements() {
        return ACHIEVEMENTS.filter(a => {
            const progress = this.state.achievements.get(a.id);
            return progress && progress.unlocked;
        });
    }
    getLockedAchievements() {
        return ACHIEVEMENTS.filter(a => {
            const progress = this.state.achievements.get(a.id);
            return !progress || !progress.unlocked;
        });
    }
    getAchievementProgress(achievementId) {
        return this.state.achievements.get(achievementId);
    }
    popPendingAchievementNotification() {
        return this.state.pendingAchievementNotifications.shift();
    }
    // Offline progress
    calculateOfflineProgress(lastSaveTime) {
        const now = Date.now();
        const offlineDuration = (now - lastSaveTime) / 1000; // seconds
        // Cap offline time at 8 hours
        const maxOfflineTime = 8 * 60 * 60;
        const cappedDuration = Math.min(offlineDuration, maxOfflineTime);
        // Minimum 60 seconds to count as offline
        if (cappedDuration < 60) {
            this.offlineProgress = null;
            return;
        }
        const era = getEraById(this.state.currentEra);
        if (!era) {
            this.offlineProgress = null;
            return;
        }
        // Calculate resources earned (50% efficiency for offline)
        const offlineEfficiency = 0.5;
        const food = era.resources.food.baseRate * this.state.resourceMultipliers.food * cappedDuration * offlineEfficiency;
        const wood = era.resources.wood.baseRate * this.state.resourceMultipliers.wood * cappedDuration * offlineEfficiency;
        const stone = era.resources.stone.baseRate * this.state.resourceMultipliers.stone * cappedDuration * offlineEfficiency;
        const gold = era.resources.gold.baseRate * this.state.resourceMultipliers.gold * cappedDuration * offlineEfficiency;
        const science = era.resources.science.baseRate * this.state.resourceMultipliers.science * cappedDuration * offlineEfficiency;
        // Apply offline earnings
        this.state.resources.food += food;
        this.state.resources.wood += wood;
        this.state.resources.stone += stone;
        this.state.resources.gold += gold;
        this.state.resources.science += science;
        // Update statistics
        this.state.statistics.totalFoodGathered += food;
        this.state.statistics.totalWoodGathered += wood;
        this.state.statistics.totalStoneGathered += stone;
        this.state.statistics.totalGoldEarned += gold;
        this.state.statistics.totalScienceGenerated += science;
        this.state.statistics.offlineEarnings += food + wood + stone + gold + science;
        // Store offline progress for display
        this.offlineProgress = {
            earned: true,
            resources: { food, wood, stone, gold, science },
            duration: cappedDuration,
        };
    }
    dismissOfflineProgress() {
        this.offlineProgress = null;
    }
    // Save/Load
    saveGame() {
        // Convert achievements Map to array for JSON serialization
        const achievementsArray = Array.from(this.state.achievements.entries());
        const saveData = {
            ...this.state,
            researchedTechs: Array.from(this.state.researchedTechs),
            unlockedTroops: Array.from(this.state.unlockedTroops),
            completedMissions: Array.from(this.state.completedMissions),
            achievements: achievementsArray,
            activeBattle: null, // Don't save active battles
            saveTime: Date.now(), // Save timestamp for offline progress
        };
        return JSON.stringify(saveData);
    }
    loadGame(saveString) {
        try {
            const saveData = JSON.parse(saveString);
            // Convert achievements array back to Map, or create new if not present
            let achievementsMap;
            if (saveData.achievements && Array.isArray(saveData.achievements)) {
                achievementsMap = new Map(saveData.achievements);
            }
            else {
                achievementsMap = createInitialAchievementProgress();
            }
            // Ensure all achievements exist (in case new ones were added)
            for (const achievement of ACHIEVEMENTS) {
                if (!achievementsMap.has(achievement.id)) {
                    achievementsMap.set(achievement.id, {
                        id: achievement.id,
                        unlocked: false,
                        notified: false,
                    });
                }
            }
            this.state = {
                ...saveData,
                researchedTechs: new Set(saveData.researchedTechs),
                unlockedTroops: new Set(saveData.unlockedTroops),
                completedMissions: new Set(saveData.completedMissions || []),
                missions: generateMissions(), // Always regenerate missions
                activeBattle: null,
                battleAnimationSpeed: saveData.battleAnimationSpeed || 800,
                statistics: saveData.statistics || createInitialStatistics(),
                achievements: achievementsMap,
                pendingAchievementNotifications: [],
            };
            // Calculate offline progress if save time is available
            if (saveData.saveTime) {
                this.calculateOfflineProgress(saveData.saveTime);
            }
            return true;
        }
        catch {
            return false;
        }
    }
    resetGame() {
        this.state = this.createInitialState();
        this.offlineProgress = null;
        this.notifyStateChange();
    }
}
// Export for global use
export { ERAS, TECHNOLOGIES, TROOP_TYPES, ACHIEVEMENTS };
//# sourceMappingURL=game.js.map