// UI management for the game
import { ERAS, TECHNOLOGIES, ACHIEVEMENTS, BUILDING_TYPES } from './game.js';
import { getEraById } from './eras.js';
import { getTechById } from './research.js';
import { getTroopTypeById } from './barracks.js';
import { getMissionById, getMissionsByEra, isMissionAvailable } from './combat.js';
import { getAchievementsByCategory } from './achievements.js';
import { getBuildingTypeById } from './buildings.js';
export class GameUI {
    constructor(game) {
        this.currentTab = 'resources';
        this.battleAnimationInterval = null;
        this.achievementNotificationQueue = [];
        this.isShowingAchievement = false;
        this.game = game;
        this.game.setOnStateChange(() => this.render());
        this.game.setOnAchievementUnlocked((achievement) => this.queueAchievementNotification(achievement));
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target;
                const tab = target.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });
        // Resource gathering
        document.getElementById('gather-food')?.addEventListener('click', () => this.game.gatherFood());
        document.getElementById('gather-wood')?.addEventListener('click', () => this.game.gatherWood());
        document.getElementById('gather-stone')?.addEventListener('click', () => this.game.gatherStone());
        // Save/Load/Reset
        document.getElementById('save-game')?.addEventListener('click', () => this.saveGame());
        document.getElementById('load-game')?.addEventListener('click', () => this.loadGame());
        document.getElementById('reset-game')?.addEventListener('click', () => this.resetGame());
    }
    switchTab(tab) {
        this.currentTab = tab;
        // Clean up battle animation when switching away from combat tab
        if (tab !== 'combat' && this.battleAnimationInterval) {
            clearInterval(this.battleAnimationInterval);
            this.battleAnimationInterval = null;
        }
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`)?.classList.add('active');
        this.render();
    }
    render() {
        this.renderHeader();
        this.renderResources();
        switch (this.currentTab) {
            case 'resources':
                this.renderResourcesTab();
                break;
            case 'buildings':
                this.renderBuildingsTab();
                break;
            case 'research':
                this.renderResearchTab();
                break;
            case 'barracks':
                this.renderBarracksTab();
                break;
            case 'army':
                this.renderArmyTab();
                break;
            case 'combat':
                this.renderCombatTab();
                break;
            case 'achievements':
                this.renderAchievementsTab();
                break;
        }
        // Check for offline progress popup
        this.checkOfflineProgress();
        // Process achievement notifications
        this.processAchievementNotifications();
    }
    renderHeader() {
        const era = getEraById(this.game.state.currentEra);
        const headerEl = document.getElementById('current-era');
        if (headerEl && era) {
            headerEl.textContent = era.name;
        }
        const descEl = document.getElementById('era-description');
        if (descEl && era) {
            descEl.textContent = era.description;
        }
        // Update era progress
        const eraIndex = ERAS.findIndex(e => e.id === this.game.state.currentEra);
        const progressEl = document.getElementById('era-progress');
        if (progressEl) {
            progressEl.textContent = `Era ${eraIndex + 1} of ${ERAS.length}`;
        }
    }
    renderResources() {
        const { resources } = this.game.state;
        document.getElementById('food-amount').textContent = Math.floor(resources.food).toString();
        document.getElementById('wood-amount').textContent = Math.floor(resources.wood).toString();
        document.getElementById('stone-amount').textContent = Math.floor(resources.stone).toString();
        document.getElementById('gold-amount').textContent = Math.floor(resources.gold).toString();
        document.getElementById('science-amount').textContent = Math.floor(resources.science).toString();
        // Update rates
        const era = getEraById(this.game.state.currentEra);
        if (era) {
            const { resourceMultipliers } = this.game.state;
            document.getElementById('food-rate').textContent =
                `+${(era.resources.food.baseRate * resourceMultipliers.food).toFixed(1)}/s`;
            document.getElementById('wood-rate').textContent =
                `+${(era.resources.wood.baseRate * resourceMultipliers.wood).toFixed(1)}/s`;
            document.getElementById('stone-rate').textContent =
                `+${(era.resources.stone.baseRate * resourceMultipliers.stone).toFixed(1)}/s`;
            document.getElementById('gold-rate').textContent =
                `+${(era.resources.gold.baseRate * resourceMultipliers.gold).toFixed(1)}/s`;
            document.getElementById('science-rate').textContent =
                `+${(era.resources.science.baseRate * resourceMultipliers.science).toFixed(1)}/s`;
        }
    }
    renderResourcesTab() {
        const container = document.getElementById('gather-buttons');
        if (!container)
            return;
        // Gather buttons are already in HTML, just show current multipliers
        const { resourceMultipliers } = this.game.state;
        container.innerHTML = `
      <button id="gather-food" class="gather-btn">
        🍖 Gather Food (+${resourceMultipliers.food.toFixed(1)})
      </button>
      <button id="gather-wood" class="gather-btn">
        🪵 Gather Wood (+${resourceMultipliers.wood.toFixed(1)})
      </button>
      <button id="gather-stone" class="gather-btn">
        🪨 Gather Stone (+${resourceMultipliers.stone.toFixed(1)})
      </button>
    `;
        // Re-attach event listeners
        document.getElementById('gather-food')?.addEventListener('click', () => this.game.gatherFood());
        document.getElementById('gather-wood')?.addEventListener('click', () => this.game.gatherWood());
        document.getElementById('gather-stone')?.addEventListener('click', () => this.game.gatherStone());
    }
    renderBuildingsTab() {
        const container = document.getElementById('buildings-content');
        if (!container)
            return;
        let html = '';
        // Construction queue
        html += '<h3>🔨 Construction Queue</h3>';
        if (this.game.state.constructionQueue.length > 0) {
            html += '<div class="construction-queue">';
            const now = Date.now();
            for (const construction of this.game.state.constructionQueue) {
                const buildingType = getBuildingTypeById(construction.buildingId);
                if (buildingType) {
                    const remaining = Math.max(0, (construction.endTime - now) / 1000);
                    const progress = ((buildingType.buildTime - remaining) / buildingType.buildTime) * 100;
                    html += `
            <div class="construction-item">
              <span>${buildingType.name}</span>
              <div class="progress-bar small">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
              <span>${remaining.toFixed(1)}s</span>
            </div>
          `;
                }
            }
            html += '</div>';
        }
        else {
            html += '<p class="empty-message">No buildings under construction</p>';
        }
        // Building production overview
        const buildingProduction = this.game.getBuildingProduction();
        const totalBuildings = this.game.getTotalBuildingCount();
        html += `
      <div class="building-overview">
        <h3>📊 Building Production (${totalBuildings} buildings)</h3>
        <div class="production-stats">
          ${buildingProduction.food > 0 ? `<span class="production-stat">🍖 +${buildingProduction.food.toFixed(1)}/s</span>` : ''}
          ${buildingProduction.wood > 0 ? `<span class="production-stat">🪵 +${buildingProduction.wood.toFixed(1)}/s</span>` : ''}
          ${buildingProduction.stone > 0 ? `<span class="production-stat">🪨 +${buildingProduction.stone.toFixed(1)}/s</span>` : ''}
          ${buildingProduction.gold > 0 ? `<span class="production-stat">💰 +${buildingProduction.gold.toFixed(1)}/s</span>` : ''}
          ${buildingProduction.science > 0 ? `<span class="production-stat">🔬 +${buildingProduction.science.toFixed(1)}/s</span>` : ''}
          ${totalBuildings === 0 ? '<span class="empty-message">Build your first building to start producing resources!</span>' : ''}
        </div>
      </div>
    `;
        // Group buildings by era
        const buildingsByEra = new Map();
        for (const era of ERAS) {
            buildingsByEra.set(era.id, []);
        }
        for (const building of BUILDING_TYPES) {
            buildingsByEra.get(building.era)?.push(building);
        }
        // Render each era's buildings
        html += '<h3>🏗️ Available Buildings</h3>';
        for (const era of ERAS) {
            const buildings = buildingsByEra.get(era.id) || [];
            if (buildings.length === 0)
                continue;
            // Check if any building in this era is unlocked
            const hasUnlockedBuildings = buildings.some(b => b.unlockTech === null || this.game.state.unlockedBuildings.has(b.id));
            if (!hasUnlockedBuildings)
                continue;
            html += `<div class="era-section">
        <h4>${era.name} Buildings</h4>
        <div class="building-grid">`;
            for (const building of buildings) {
                const isUnlocked = building.unlockTech === null || this.game.state.unlockedBuildings.has(building.id);
                if (!isUnlocked)
                    continue;
                const currentCount = this.game.getBuildingCount(building.id);
                const canBuild = this.canBuildBuilding(building);
                const atMax = currentCount >= building.maxCount;
                let statusClass = 'locked';
                if (atMax)
                    statusClass = 'maxed';
                else if (canBuild)
                    statusClass = 'available';
                html += `
          <div class="building-card ${statusClass}">
            <div class="building-header">
              <h5>${building.name}</h5>
              <span class="building-count">${currentCount}/${building.maxCount}</span>
            </div>
            <p class="building-desc">${building.description}</p>
            <div class="building-production">
              <span class="label">Production:</span>
              ${building.production.food ? `<span>🍖 +${building.production.food}/s</span>` : ''}
              ${building.production.wood ? `<span>🪵 +${building.production.wood}/s</span>` : ''}
              ${building.production.stone ? `<span>🪨 +${building.production.stone}/s</span>` : ''}
              ${building.production.gold ? `<span>💰 +${building.production.gold}/s</span>` : ''}
              ${building.production.science ? `<span>🔬 +${building.production.science}/s</span>` : ''}
            </div>
            <div class="building-cost">
              <span class="label">Cost:</span>
              ${building.cost.food > 0 ? `<span>🍖 ${building.cost.food}</span>` : ''}
              ${building.cost.wood > 0 ? `<span>🪵 ${building.cost.wood}</span>` : ''}
              ${building.cost.stone > 0 ? `<span>🪨 ${building.cost.stone}</span>` : ''}
              ${building.cost.gold > 0 ? `<span>💰 ${building.cost.gold}</span>` : ''}
            </div>
            <p class="build-time">⏱️ ${building.buildTime}s</p>
            <button class="build-btn" data-building="${building.id}" ${!canBuild || atMax ? 'disabled' : ''}>
              ${atMax ? 'Max Built' : 'Build'}
            </button>
          </div>
        `;
            }
            html += '</div></div>';
        }
        container.innerHTML = html;
        // Attach build button listeners
        container.querySelectorAll('.build-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingId = e.target.dataset.building;
                if (buildingId) {
                    this.game.constructBuilding(buildingId);
                }
            });
        });
    }
    canBuildBuilding(building) {
        const { resources } = this.game.state;
        const currentCount = this.game.getBuildingCount(building.id);
        if (currentCount >= building.maxCount)
            return false;
        if (resources.food < building.cost.food)
            return false;
        if (resources.wood < building.cost.wood)
            return false;
        if (resources.stone < building.cost.stone)
            return false;
        if (resources.gold < building.cost.gold)
            return false;
        return true;
    }
    renderResearchTab() {
        const container = document.getElementById('research-tree');
        if (!container)
            return;
        // Show current research
        let html = '';
        if (this.game.state.currentResearch) {
            const tech = getTechById(this.game.state.currentResearch);
            if (tech) {
                const progress = (this.game.state.researchProgress / tech.cost.science) * 100;
                html += `
          <div class="current-research">
            <h3>Currently Researching: ${tech.name}</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            <p>${Math.floor(this.game.state.researchProgress)} / ${tech.cost.science} science</p>
          </div>
        `;
            }
        }
        // Group technologies by era
        const techsByEra = new Map();
        for (const era of ERAS) {
            techsByEra.set(era.id, []);
        }
        for (const tech of TECHNOLOGIES) {
            techsByEra.get(tech.era)?.push(tech);
        }
        // Render each era's technologies
        for (const era of ERAS) {
            const techs = techsByEra.get(era.id) || [];
            if (techs.length === 0)
                continue;
            html += `<div class="era-section">
        <h3>${era.name} Technologies</h3>
        <div class="tech-grid">`;
            for (const tech of techs) {
                const isResearched = this.game.state.researchedTechs.has(tech.id);
                const isAvailable = this.canResearchTech(tech);
                const isCurrent = this.game.state.currentResearch === tech.id;
                let statusClass = 'locked';
                if (isResearched)
                    statusClass = 'researched';
                else if (isCurrent)
                    statusClass = 'current';
                else if (isAvailable)
                    statusClass = 'available';
                html += `
          <div class="tech-card ${statusClass}" data-tech-id="${tech.id}">
            <h4>${tech.name}</h4>
            <p class="tech-desc">${tech.description}</p>
            <p class="tech-cost">Cost: ${tech.cost.science} science</p>
            ${isResearched ? '<span class="badge">✓ Researched</span>' : ''}
            ${isAvailable && !isResearched && !isCurrent ?
                    `<button class="research-btn" data-tech="${tech.id}">Research</button>` : ''}
          </div>
        `;
            }
            html += '</div></div>';
        }
        container.innerHTML = html;
        // Attach research button listeners
        container.querySelectorAll('.research-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const techId = e.target.dataset.tech;
                if (techId) {
                    this.game.startResearch(techId);
                }
            });
        });
    }
    canResearchTech(tech) {
        if (this.game.state.researchedTechs.has(tech.id))
            return false;
        if (this.game.state.currentResearch)
            return false;
        for (const prereq of tech.prerequisites) {
            if (!this.game.state.researchedTechs.has(prereq))
                return false;
        }
        return this.game.state.resources.science >= tech.cost.science;
    }
    renderBarracksTab() {
        const container = document.getElementById('barracks-content');
        if (!container)
            return;
        let html = '<h3>Training Queue</h3>';
        // Training queue
        if (this.game.state.trainingQueue.length > 0) {
            html += '<div class="training-queue">';
            const now = Date.now();
            for (const training of this.game.state.trainingQueue) {
                const troopType = getTroopTypeById(training.troopId);
                if (troopType) {
                    const remaining = Math.max(0, (training.endTime - now) / 1000);
                    const progress = ((troopType.trainTime - remaining) / troopType.trainTime) * 100;
                    html += `
            <div class="training-item">
              <span>${troopType.name}</span>
              <div class="progress-bar small">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
              <span>${remaining.toFixed(1)}s</span>
            </div>
          `;
                }
            }
            html += '</div>';
        }
        else {
            html += '<p class="empty-message">No troops in training</p>';
        }
        // Available troops to train
        html += '<h3>Available Units</h3>';
        const availableTroops = this.game.getAvailableTroops();
        if (availableTroops.length === 0) {
            html += '<p class="empty-message">Research technologies to unlock troops!</p>';
        }
        else {
            html += '<div class="troop-grid">';
            for (const troop of availableTroops) {
                const canTrain = this.canTrainTroop(troop);
                html += `
          <div class="troop-card ${canTrain ? 'available' : 'unavailable'}">
            <h4>${troop.name}</h4>
            <p class="troop-desc">${troop.description}</p>
            <div class="troop-stats">
              <span>⚔️ ${troop.stats.attack}</span>
              <span>🛡️ ${troop.stats.defense}</span>
              <span>❤️ ${troop.stats.health}</span>
            </div>
            <div class="troop-cost">
              <span>🍖 ${troop.cost.food}</span>
              <span>💰 ${troop.cost.gold}</span>
              ${troop.cost.wood ? `<span>🪵 ${troop.cost.wood}</span>` : ''}
              ${troop.cost.stone ? `<span>🪨 ${troop.cost.stone}</span>` : ''}
            </div>
            <p class="train-time">⏱️ ${troop.trainTime}s</p>
            <button class="train-btn" data-troop="${troop.id}" ${!canTrain ? 'disabled' : ''}>
              Train
            </button>
          </div>
        `;
            }
            html += '</div>';
        }
        container.innerHTML = html;
        // Attach train button listeners
        container.querySelectorAll('.train-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const troopId = e.target.dataset.troop;
                if (troopId) {
                    this.game.trainTroop(troopId);
                }
            });
        });
    }
    canTrainTroop(troop) {
        const { resources } = this.game.state;
        if (resources.food < troop.cost.food)
            return false;
        if (resources.gold < troop.cost.gold)
            return false;
        if (troop.cost.wood && resources.wood < troop.cost.wood)
            return false;
        if (troop.cost.stone && resources.stone < troop.cost.stone)
            return false;
        return true;
    }
    renderArmyTab() {
        const container = document.getElementById('army-content');
        if (!container)
            return;
        const { army } = this.game.state;
        const power = this.game.getArmyPower();
        let html = `
      <div class="army-overview">
        <h3>Army Power</h3>
        <div class="power-stats">
          <div class="power-stat">
            <span class="power-icon">⚔️</span>
            <span class="power-value">${power.attack}</span>
            <span class="power-label">Attack</span>
          </div>
          <div class="power-stat">
            <span class="power-icon">🛡️</span>
            <span class="power-value">${power.defense}</span>
            <span class="power-label">Defense</span>
          </div>
          <div class="power-stat">
            <span class="power-icon">❤️</span>
            <span class="power-value">${power.health}</span>
            <span class="power-label">Health</span>
          </div>
        </div>
      </div>
    `;
        html += '<h3>Your Troops</h3>';
        if (army.length === 0) {
            html += '<p class="empty-message">No troops recruited yet. Visit the Barracks to train troops!</p>';
        }
        else {
            html += '<div class="army-grid">';
            for (const troop of army) {
                const troopType = getTroopTypeById(troop.typeId);
                if (troopType) {
                    html += `
            <div class="army-unit">
              <h4>${troopType.name}</h4>
              <span class="unit-count">x${troop.count}</span>
              <div class="unit-stats">
                <span>⚔️ ${troopType.stats.attack * troop.count}</span>
                <span>🛡️ ${troopType.stats.defense * troop.count}</span>
                <span>❤️ ${troopType.stats.health * troop.count}</span>
              </div>
            </div>
          `;
                }
            }
            html += '</div>';
        }
        container.innerHTML = html;
    }
    renderCombatTab() {
        const container = document.getElementById('combat-content');
        if (!container)
            return;
        // Check if there's an active battle
        if (this.game.state.activeBattle) {
            this.renderActiveBattle(container);
            return;
        }
        // Show missions
        let html = '<h3>⚔️ Combat Missions</h3>';
        html += '<p class="combat-intro">Choose a mission to test your army against enemy forces. Missions are organized by era - higher eras have tougher enemies but better rewards!</p>';
        const playerPower = this.game.getArmyPower();
        html += `
      <div class="army-power-summary">
        <span>Your Army: ⚔️ ${playerPower.attack} | 🛡️ ${playerPower.defense} | ❤️ ${playerPower.health}</span>
      </div>
    `;
        if (playerPower.health === 0) {
            html += '<div class="warning-message">⚠️ You need troops to start missions! Train some in the Barracks first.</div>';
        }
        // Group missions by era
        for (const era of ERAS) {
            const eraMissions = getMissionsByEra(this.game.state.missions, era.id);
            if (eraMissions.length === 0)
                continue;
            const isEraAvailable = isMissionAvailable(eraMissions[0], this.game.state.currentEra);
            html += `
        <div class="mission-era-section ${!isEraAvailable ? 'locked' : ''}">
          <h4 class="mission-era-title">${era.name} Missions ${!isEraAvailable ? '🔒' : ''}</h4>
          <div class="mission-grid">
      `;
            for (const mission of eraMissions) {
                const isAvailable = isMissionAvailable(mission, this.game.state.currentEra);
                const isCompleted = this.game.isMissionCompleted(mission.id);
                const canStart = isAvailable && playerPower.health > 0;
                // Calculate difficulty rating
                const difficultyRating = this.getDifficultyRating(playerPower, mission);
                html += `
          <div class="mission-card ${isCompleted ? 'completed' : ''} ${!isAvailable ? 'locked' : ''}">
            <div class="mission-header">
              <h5>${mission.name}</h5>
              ${isCompleted ? '<span class="completed-badge">✓ Completed</span>' : ''}
            </div>
            <p class="mission-desc">${mission.description}</p>
            <div class="enemy-stats">
              <span class="enemy-label">Enemy: ${mission.enemyArmy.name}</span>
              <div class="enemy-power">
                <span>⚔️ ${mission.enemyArmy.attack}</span>
                <span>🛡️ ${mission.enemyArmy.defense}</span>
                <span>❤️ ${mission.enemyArmy.health}</span>
              </div>
            </div>
            <div class="difficulty-indicator ${difficultyRating.class}">
              Difficulty: ${difficultyRating.label}
            </div>
            <div class="mission-rewards">
              <span class="rewards-label">Rewards:</span>
              <div class="rewards-list">
                ${mission.rewards.food > 0 ? `<span>🍖 ${mission.rewards.food}</span>` : ''}
                ${mission.rewards.wood > 0 ? `<span>🪵 ${mission.rewards.wood}</span>` : ''}
                ${mission.rewards.stone > 0 ? `<span>🪨 ${mission.rewards.stone}</span>` : ''}
                ${mission.rewards.gold > 0 ? `<span>💰 ${mission.rewards.gold}</span>` : ''}
                ${mission.rewards.science > 0 ? `<span>🔬 ${mission.rewards.science}</span>` : ''}
              </div>
            </div>
            <button class="mission-btn ${!canStart ? 'disabled' : ''}" 
                    data-mission="${mission.id}" 
                    ${!canStart ? 'disabled' : ''}>
              ${!isAvailable ? '🔒 Locked' : isCompleted ? '⚔️ Replay' : '⚔️ Start Mission'}
            </button>
          </div>
        `;
            }
            html += '</div></div>';
        }
        container.innerHTML = html;
        // Attach mission button listeners
        container.querySelectorAll('.mission-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const missionId = e.target.dataset.mission;
                if (missionId) {
                    this.startMission(missionId);
                }
            });
        });
    }
    getDifficultyRating(playerPower, mission) {
        const playerTotal = playerPower.attack + playerPower.defense + playerPower.health;
        const enemyTotal = mission.enemyArmy.attack + mission.enemyArmy.defense + mission.enemyArmy.health;
        if (playerTotal === 0)
            return { label: 'Impossible', class: 'difficulty-impossible' };
        const ratio = playerTotal / enemyTotal;
        if (ratio >= 2.0)
            return { label: 'Very Easy', class: 'difficulty-very-easy' };
        if (ratio >= 1.5)
            return { label: 'Easy', class: 'difficulty-easy' };
        if (ratio >= 1.0)
            return { label: 'Medium', class: 'difficulty-medium' };
        if (ratio >= 0.7)
            return { label: 'Hard', class: 'difficulty-hard' };
        if (ratio >= 0.4)
            return { label: 'Very Hard', class: 'difficulty-very-hard' };
        return { label: 'Extreme', class: 'difficulty-extreme' };
    }
    startMission(missionId) {
        if (this.game.startMission(missionId)) {
            // Start battle animation
            this.startBattleAnimation();
        }
    }
    startBattleAnimation() {
        // Clear any existing animation
        if (this.battleAnimationInterval) {
            clearInterval(this.battleAnimationInterval);
        }
        // Start animating battle rounds
        this.battleAnimationInterval = window.setInterval(() => {
            if (!this.game.state.activeBattle || this.game.state.activeBattle.isComplete) {
                if (this.battleAnimationInterval) {
                    clearInterval(this.battleAnimationInterval);
                    this.battleAnimationInterval = null;
                }
                return;
            }
            this.game.advanceBattleRound();
        }, this.game.state.battleAnimationSpeed);
    }
    renderActiveBattle(container) {
        const battle = this.game.state.activeBattle;
        if (!battle)
            return;
        const mission = getMissionById(this.game.state.missions, battle.missionId);
        if (!mission)
            return;
        const currentLog = battle.logs[battle.currentRound - 1];
        const playerHealth = currentLog ? currentLog.playerHealth : battle.playerStartHealth;
        const enemyHealth = currentLog ? currentLog.enemyHealth : battle.enemyStartHealth;
        const playerHealthPercent = (playerHealth / battle.playerStartHealth) * 100;
        const enemyHealthPercent = (enemyHealth / battle.enemyStartHealth) * 100;
        let html = `
      <div class="battle-arena">
        <h3 class="battle-title">⚔️ Battle: ${mission.name}</h3>
        <p class="battle-vs">Your Army vs ${mission.enemyArmy.name}</p>
        
        <div class="battle-field">
          <!-- Player Side -->
          <div class="battle-side player-side">
            <div class="army-icon ${battle.isComplete && battle.result?.victory ? 'victorious' : ''} ${battle.isComplete && !battle.result?.victory ? 'defeated' : ''}">
              🏰
            </div>
            <h4>Your Army</h4>
            <div class="health-bar-container">
              <div class="health-bar">
                <div class="health-fill player-health" style="width: ${playerHealthPercent}%"></div>
              </div>
              <span class="health-text">${Math.max(0, Math.floor(playerHealth))} / ${battle.playerStartHealth}</span>
            </div>
          </div>
          
          <!-- Battle Animation -->
          <div class="battle-center">
            <div class="battle-clash ${!battle.isComplete ? 'animating' : ''}">
              ⚔️
            </div>
            <div class="round-counter">
              Round ${battle.currentRound} / ${battle.logs.length}
            </div>
          </div>
          
          <!-- Enemy Side -->
          <div class="battle-side enemy-side">
            <div class="army-icon ${battle.isComplete && !battle.result?.victory ? 'victorious' : ''} ${battle.isComplete && battle.result?.victory ? 'defeated' : ''}">
              👹
            </div>
            <h4>${mission.enemyArmy.name}</h4>
            <div class="health-bar-container">
              <div class="health-bar">
                <div class="health-fill enemy-health" style="width: ${enemyHealthPercent}%"></div>
              </div>
              <span class="health-text">${Math.max(0, Math.floor(enemyHealth))} / ${battle.enemyStartHealth}</span>
            </div>
          </div>
        </div>
        
        <!-- Battle Log -->
        <div class="battle-log-container">
          <h4>Battle Log</h4>
          <div class="battle-log" id="battle-log">
    `;
        // Show logs up to current round
        for (let i = 0; i < battle.currentRound; i++) {
            const log = battle.logs[i];
            html += `
        <div class="log-entry ${i === battle.currentRound - 1 ? 'latest' : ''}">
          <span class="log-round">Round ${log.round}:</span>
          <span class="log-damage player-damage">You deal ${log.playerDamage} dmg</span>
          <span class="log-separator">|</span>
          <span class="log-damage enemy-damage">Enemy deals ${log.enemyDamage} dmg</span>
        </div>
      `;
        }
        html += `
          </div>
        </div>
    `;
        // Show result if battle is complete
        if (battle.isComplete && battle.result) {
            const result = battle.result;
            html += `
        <div class="battle-result ${result.victory ? 'victory' : 'defeat'}">
          <h3>${result.victory ? '🎉 Victory!' : '💀 Defeat!'}</h3>
          <p class="casualty-report">Casualties: ${result.casualtyPercent}% of your army</p>
          ${result.victory && result.rewards ? `
            <div class="battle-rewards">
              <h4>Rewards Earned:</h4>
              <div class="rewards-list">
                ${result.rewards.food > 0 ? `<span>🍖 +${result.rewards.food}</span>` : ''}
                ${result.rewards.wood > 0 ? `<span>🪵 +${result.rewards.wood}</span>` : ''}
                ${result.rewards.stone > 0 ? `<span>🪨 +${result.rewards.stone}</span>` : ''}
                ${result.rewards.gold > 0 ? `<span>💰 +${result.rewards.gold}</span>` : ''}
                ${result.rewards.science > 0 ? `<span>🔬 +${result.rewards.science}</span>` : ''}
              </div>
            </div>
          ` : ''}
          <button class="dismiss-battle-btn" id="dismiss-battle">Return to Missions</button>
        </div>
      `;
        }
        // Speed control
        html += `
      <div class="battle-controls">
        <label>Battle Speed:</label>
        <input type="range" id="battle-speed" min="100" max="2000" step="100" 
               value="${this.game.state.battleAnimationSpeed}">
        <span id="speed-display">${this.game.state.battleAnimationSpeed}ms</span>
      </div>
    `;
        html += '</div>';
        container.innerHTML = html;
        // Auto-scroll battle log to bottom
        const battleLog = document.getElementById('battle-log');
        if (battleLog) {
            battleLog.scrollTop = battleLog.scrollHeight;
        }
        // Attach dismiss button listener
        document.getElementById('dismiss-battle')?.addEventListener('click', () => {
            this.game.dismissBattle();
        });
        // Attach speed control listener
        document.getElementById('battle-speed')?.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.game.setBattleSpeed(speed);
            const speedDisplay = document.getElementById('speed-display');
            if (speedDisplay)
                speedDisplay.textContent = `${speed}ms`;
            // Restart animation with new speed
            if (!this.game.state.activeBattle?.isComplete) {
                this.startBattleAnimation();
            }
        });
    }
    saveGame() {
        const saveString = this.game.saveGame();
        localStorage.setItem('civGameSave', saveString);
        this.showNotification('Game saved!');
    }
    loadGame() {
        const saveString = localStorage.getItem('civGameSave');
        if (saveString && this.game.loadGame(saveString)) {
            this.showNotification('Game loaded!');
        }
        else {
            this.showNotification('No save found!');
        }
    }
    resetGame() {
        if (confirm('Are you sure you want to reset? All progress will be lost!')) {
            this.game.resetGame();
            localStorage.removeItem('civGameSave');
            this.showNotification('Game reset!');
        }
    }
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
    // Achievements tab
    renderAchievementsTab() {
        const container = document.getElementById('achievements-content');
        if (!container)
            return;
        let html = '';
        // Statistics section
        html += this.renderStatisticsSection();
        // Achievement categories
        const categories = [
            { id: 'progress', name: 'Era Progress', icon: '🏛️' },
            { id: 'resources', name: 'Resource Gathering', icon: '📦' },
            { id: 'buildings', name: 'Buildings', icon: '🏗️' },
            { id: 'research', name: 'Research', icon: '🔬' },
            { id: 'military', name: 'Military', icon: '⚔️' },
            { id: 'combat', name: 'Combat', icon: '🎯' },
        ];
        html += '<h3>🏆 Achievements</h3>';
        const unlockedCount = this.game.getUnlockedAchievements().length;
        const totalCount = ACHIEVEMENTS.length;
        html += `<div class="achievement-progress-bar">
      <div class="achievement-progress-fill" style="width: ${(unlockedCount / totalCount) * 100}%"></div>
      <span class="achievement-progress-text">${unlockedCount} / ${totalCount} Unlocked</span>
    </div>`;
        for (const category of categories) {
            const categoryAchievements = getAchievementsByCategory(category.id);
            const unlockedInCategory = categoryAchievements.filter(a => {
                const progress = this.game.getAchievementProgress(a.id);
                return progress && progress.unlocked;
            }).length;
            html += `
        <div class="achievement-category">
          <h4>${category.icon} ${category.name} (${unlockedInCategory}/${categoryAchievements.length})</h4>
          <div class="achievement-grid">
      `;
            for (const achievement of categoryAchievements) {
                const progress = this.game.getAchievementProgress(achievement.id);
                const isUnlocked = progress && progress.unlocked;
                html += `
          <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
              <h5>${achievement.name}</h5>
              <p>${achievement.description}</p>
              ${achievement.reward ? `<span class="achievement-reward">Reward: ${achievement.reward.resource ? achievement.reward.resource + ' ' : ''}×${achievement.reward.amount}</span>` : ''}
            </div>
            ${isUnlocked ? '<span class="achievement-badge">✓</span>' : ''}
          </div>
        `;
            }
            html += '</div></div>';
        }
        container.innerHTML = html;
    }
    renderStatisticsSection() {
        const stats = this.game.state.statistics;
        const formatNumber = (n) => Math.floor(n).toLocaleString();
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            if (hours > 0)
                return `${hours}h ${minutes}m ${secs}s`;
            if (minutes > 0)
                return `${minutes}m ${secs}s`;
            return `${secs}s`;
        };
        return `
      <div class="statistics-section">
        <h3>📊 Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🍖</span>
            <span class="stat-value">${formatNumber(stats.totalFoodGathered)}</span>
            <span class="stat-label">Total Food</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🪵</span>
            <span class="stat-value">${formatNumber(stats.totalWoodGathered)}</span>
            <span class="stat-label">Total Wood</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🪨</span>
            <span class="stat-value">${formatNumber(stats.totalStoneGathered)}</span>
            <span class="stat-label">Total Stone</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">💰</span>
            <span class="stat-value">${formatNumber(stats.totalGoldEarned)}</span>
            <span class="stat-label">Total Gold</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🔬</span>
            <span class="stat-value">${formatNumber(stats.totalScienceGenerated)}</span>
            <span class="stat-label">Total Science</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">👆</span>
            <span class="stat-value">${formatNumber(stats.clickCount)}</span>
            <span class="stat-label">Clicks</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏗️</span>
            <span class="stat-value">${this.game.getTotalBuildingCount()}</span>
            <span class="stat-label">Buildings</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⚔️</span>
            <span class="stat-value">${formatNumber(stats.totalTroopsTrained)}</span>
            <span class="stat-label">Troops Trained</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">${stats.battlesWon}</span>
            <span class="stat-label">Battles Won</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">💀</span>
            <span class="stat-value">${stats.battlesLost}</span>
            <span class="stat-label">Battles Lost</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">⏱️</span>
            <span class="stat-value">${formatTime(this.game.state.totalPlayTime)}</span>
            <span class="stat-label">Play Time</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">💤</span>
            <span class="stat-value">${formatNumber(stats.offlineEarnings)}</span>
            <span class="stat-label">Offline Earnings</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">📚</span>
            <span class="stat-value">${this.game.state.researchedTechs.size}</span>
            <span class="stat-label">Technologies</span>
          </div>
        </div>
      </div>
    `;
    }
    // Achievement notifications
    queueAchievementNotification(achievement) {
        this.achievementNotificationQueue.push(achievement);
    }
    processAchievementNotifications() {
        if (this.isShowingAchievement || this.achievementNotificationQueue.length === 0)
            return;
        const achievement = this.achievementNotificationQueue.shift();
        if (!achievement)
            return;
        this.isShowingAchievement = true;
        this.showAchievementPopup(achievement);
    }
    showAchievementPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
      <div class="achievement-popup-content">
        <div class="achievement-popup-icon">${achievement.icon}</div>
        <div class="achievement-popup-info">
          <h4>Achievement Unlocked!</h4>
          <h5>${achievement.name}</h5>
          <p>${achievement.description}</p>
        </div>
      </div>
    `;
        document.body.appendChild(popup);
        // Animate in
        setTimeout(() => popup.classList.add('show'), 10);
        // Remove after delay
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
                this.isShowingAchievement = false;
                // Process next notification
                this.processAchievementNotifications();
            }, 500);
        }, 3000);
    }
    // Offline progress popup
    checkOfflineProgress() {
        const offlineProgress = this.game.offlineProgress;
        if (!offlineProgress || !offlineProgress.earned)
            return;
        // Only show once
        this.game.dismissOfflineProgress();
        this.showOfflineProgressPopup(offlineProgress);
    }
    showOfflineProgressPopup(progress) {
        const formatNumber = (n) => Math.floor(n).toLocaleString();
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            if (hours > 0)
                return `${hours}h ${minutes}m`;
            return `${minutes}m`;
        };
        const popup = document.createElement('div');
        popup.className = 'offline-popup-overlay';
        popup.innerHTML = `
      <div class="offline-popup">
        <h3>💤 Welcome Back!</h3>
        <p>You were away for ${formatTime(progress.duration)}</p>
        <p class="offline-subtitle">Your civilization earned while you were gone:</p>
        <div class="offline-rewards">
          ${progress.resources.food > 0 ? `<span>🍖 +${formatNumber(progress.resources.food)}</span>` : ''}
          ${progress.resources.wood > 0 ? `<span>🪵 +${formatNumber(progress.resources.wood)}</span>` : ''}
          ${progress.resources.stone > 0 ? `<span>🪨 +${formatNumber(progress.resources.stone)}</span>` : ''}
          ${progress.resources.gold > 0 ? `<span>💰 +${formatNumber(progress.resources.gold)}</span>` : ''}
          ${progress.resources.science > 0 ? `<span>🔬 +${formatNumber(progress.resources.science)}</span>` : ''}
        </div>
        <p class="offline-note">Offline earnings are 50% of normal rate (max 8 hours)</p>
        <button class="offline-dismiss-btn">Continue Playing</button>
      </div>
    `;
        document.body.appendChild(popup);
        // Add click handler
        popup.querySelector('.offline-dismiss-btn')?.addEventListener('click', () => {
            popup.classList.add('fade-out');
            setTimeout(() => popup.remove(), 300);
        });
        // Also dismiss on overlay click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.add('fade-out');
                setTimeout(() => popup.remove(), 300);
            }
        });
    }
}
//# sourceMappingURL=ui.js.map