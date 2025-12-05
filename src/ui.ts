// UI management for the game
import { Game, ERAS, TECHNOLOGIES, TROOP_TYPES, ACHIEVEMENTS, BUILDING_TYPES, Mission, ActiveBattle, Achievement, BuildingType, Territory } from './game.js';
import { getEraById } from './eras.js';
import { getTechById } from './research.js';
import { getTroopTypeById, calculateArmyPower } from './barracks.js';
import { getMissionById, getMissionsByEra, isMissionAvailable, getTerritoryById, getTerritoriesByEra, isTerritoryAvailable } from './combat.js';
import { getAchievementsByCategory } from './achievements.js';
import { getBuildingTypeById, calculateBuildingProduction } from './buildings.js';

// UI timing constants
const RENDER_DEBOUNCE_MS = 100;
const INTERACTION_PAUSE_MS = 300;

export class GameUI {
  private game: Game;
  private currentTab: string = 'resources';
  private battleAnimationInterval: number | null = null;
  private conquestAnimationInterval: number | null = null;
  private achievementNotificationQueue: Achievement[] = [];
  private isShowingAchievement: boolean = false;
  private renderTimeout: number | null = null;
  private isUserInteracting: boolean = false;
  // Track last rendered state to avoid unnecessary full re-renders
  private lastRenderedTab: string = '';
  private tabContentVersions: Map<string, string> = new Map();

  constructor(game: Game) {
    this.game = game;
    this.game.setOnStateChange(() => this.scheduleRender());
    this.game.setOnAchievementUnlocked((achievement) => this.queueAchievementNotification(achievement));
    this.setupEventListeners();
  }

  // Debounced render to prevent rapid re-renders from interfering with clicks
  private scheduleRender(): void {
    // If user is currently interacting, delay the render
    if (this.isUserInteracting) {
      return;
    }
    
    // Cancel any pending render
    if (this.renderTimeout !== null) {
      window.clearTimeout(this.renderTimeout);
    }
    
    // Schedule render with small delay to batch updates
    this.renderTimeout = window.setTimeout(() => {
      this.renderTimeout = null;
      this.render();
    }, RENDER_DEBOUNCE_MS);
  }

  // Mark interaction start - prevents re-renders during click processing
  private startInteraction(): void {
    this.isUserInteracting = true;
    // Clear interaction flag after a short delay to allow click to complete
    window.setTimeout(() => {
      this.isUserInteracting = false;
      // Trigger a render after interaction completes
      this.scheduleRender();
    }, INTERACTION_PAUSE_MS);
  }

  private setupEventListeners(): void {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tab = target.dataset.tab;
        if (tab) {
          this.switchTab(tab);
        }
      });
    });

    // Resource gathering
    document.getElementById('gather-food')?.addEventListener('click', () => {
      this.startInteraction();
      this.game.gatherFood();
    });
    document.getElementById('gather-wood')?.addEventListener('click', () => {
      this.startInteraction();
      this.game.gatherWood();
    });
    document.getElementById('gather-stone')?.addEventListener('click', () => {
      this.startInteraction();
      this.game.gatherStone();
    });

    // Save/Load/Reset
    document.getElementById('save-game')?.addEventListener('click', () => this.saveGame());
    document.getElementById('load-game')?.addEventListener('click', () => this.loadGame());
    document.getElementById('reset-game')?.addEventListener('click', () => this.resetGame());
    
    // Event delegation for dynamically created buttons
    // Buildings tab - build buttons
    document.getElementById('buildings-content')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('build-btn') && !target.hasAttribute('disabled')) {
        const buildingId = target.dataset.building;
        if (buildingId) {
          this.startInteraction();
          this.game.constructBuilding(buildingId);
        }
      }
    });
    
    // Research tab - research buttons
    // Note: Research buttons are only rendered when available, but we check disabled
    // for consistency with other button handlers and as a safety net for race conditions
    document.getElementById('research-tree')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('research-btn') && !target.hasAttribute('disabled')) {
        const techId = target.dataset.tech;
        if (techId) {
          this.startInteraction();
          this.game.startResearch(techId);
        }
      }
    });
    
    // Barracks tab - train buttons
    document.getElementById('barracks-content')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('train-btn') && !target.hasAttribute('disabled')) {
        const troopId = target.dataset.troop;
        if (troopId) {
          this.startInteraction();
          this.game.trainTroop(troopId);
        }
      }
    });
    
    // Combat tab - mission buttons
    document.getElementById('combat-content')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('mission-btn') && !target.hasAttribute('disabled')) {
        const missionId = target.dataset.mission;
        if (missionId) {
          this.startInteraction();
          this.startMission(missionId);
        }
      }
      // Territory conquest buttons
      if (target.classList.contains('territory-btn') && !target.hasAttribute('disabled')) {
        const territoryId = target.dataset.territory;
        if (territoryId) {
          this.startInteraction();
          this.startConquest(territoryId);
        }
      }
      // Toggle conquest mode
      if (target.id === 'toggle-conquest-mode' || target.id === 'toggle-missions-mode') {
        this.startInteraction();
        this.game.toggleConquestMode();
      }
      // Dismiss battle button
      if (target.id === 'dismiss-battle') {
        this.startInteraction();
        this.game.dismissBattle();
      }
      // Dismiss conquest battle button
      if (target.id === 'dismiss-conquest-battle') {
        this.startInteraction();
        this.game.dismissConquestBattle();
      }
    });
    
    // Combat tab - battle speed control
    // Uses 'input' event instead of 'click' because range sliders fire input events
    // when the value changes, separate from the click handler above
    document.getElementById('combat-content')?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'battle-speed') {
        const speed = parseInt(target.value);
        this.game.setBattleSpeed(speed);
        const speedDisplay = document.getElementById('speed-display');
        if (speedDisplay) speedDisplay.textContent = `${speed}ms`;
        
        // Restart animation with new speed
        if (!this.game.state.activeBattle?.isComplete) {
          this.startBattleAnimation();
        }
        // Restart conquest animation with new speed
        if (!this.game.state.activeConquestBattle?.isComplete) {
          this.startConquestAnimation();
        }
      }
    });
  }

  private switchTab(tab: string): void {
    this.currentTab = tab;
    
    // Clean up battle animation when switching away from combat tab
    if (tab !== 'combat' && this.battleAnimationInterval) {
      clearInterval(this.battleAnimationInterval);
      this.battleAnimationInterval = null;
    }
    
    // Clean up conquest animation when switching away from combat tab
    if (tab !== 'combat' && this.conquestAnimationInterval) {
      clearInterval(this.conquestAnimationInterval);
      this.conquestAnimationInterval = null;
    }
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if ((btn as HTMLElement).dataset.tab === tab) {
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

  render(): void {
    this.renderHeader();
    this.renderResources();
    
    // Only do a full tab re-render if the tab changed
    const tabChanged = this.lastRenderedTab !== this.currentTab;
    this.lastRenderedTab = this.currentTab;
    
    switch (this.currentTab) {
      case 'resources':
        this.renderResourcesTab();
        break;
      case 'buildings':
        if (tabChanged) {
          this.renderBuildingsTab();
        } else {
          this.updateBuildingsTab();
        }
        break;
      case 'research':
        if (tabChanged) {
          this.renderResearchTab();
        } else {
          this.updateResearchTab();
        }
        break;
      case 'barracks':
        if (tabChanged) {
          this.renderBarracksTab();
        } else {
          this.updateBarracksTab();
        }
        break;
      case 'army':
        // Army tab is simpler, can always re-render
        this.renderArmyTab();
        break;
      case 'combat':
        if (tabChanged) {
          this.renderCombatTab();
        } else {
          this.updateCombatTab();
        }
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

  private renderHeader(): void {
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

  private renderResources(): void {
    const { resources } = this.game.state;
    
    document.getElementById('food-amount')!.textContent = Math.floor(resources.food).toString();
    document.getElementById('wood-amount')!.textContent = Math.floor(resources.wood).toString();
    document.getElementById('stone-amount')!.textContent = Math.floor(resources.stone).toString();
    document.getElementById('gold-amount')!.textContent = Math.floor(resources.gold).toString();
    document.getElementById('science-amount')!.textContent = Math.floor(resources.science).toString();

    // Update rates
    const era = getEraById(this.game.state.currentEra);
    if (era) {
      const { resourceMultipliers } = this.game.state;
      document.getElementById('food-rate')!.textContent = 
        `+${(era.resources.food.baseRate * resourceMultipliers.food).toFixed(1)}/s`;
      document.getElementById('wood-rate')!.textContent = 
        `+${(era.resources.wood.baseRate * resourceMultipliers.wood).toFixed(1)}/s`;
      document.getElementById('stone-rate')!.textContent = 
        `+${(era.resources.stone.baseRate * resourceMultipliers.stone).toFixed(1)}/s`;
      document.getElementById('gold-rate')!.textContent = 
        `+${(era.resources.gold.baseRate * resourceMultipliers.gold).toFixed(1)}/s`;
      document.getElementById('science-rate')!.textContent = 
        `+${(era.resources.science.baseRate * resourceMultipliers.science).toFixed(1)}/s`;
    }
  }

  private renderResourcesTab(): void {
    const { resourceMultipliers } = this.game.state;
    
    // Only update button text, don't recreate the buttons (keeps event listeners intact)
    const foodBtn = document.getElementById('gather-food');
    const woodBtn = document.getElementById('gather-wood');
    const stoneBtn = document.getElementById('gather-stone');
    
    if (foodBtn) {
      foodBtn.textContent = `🍖 Gather Food (+${resourceMultipliers.food.toFixed(1)})`;
    }
    if (woodBtn) {
      woodBtn.textContent = `🪵 Gather Wood (+${resourceMultipliers.wood.toFixed(1)})`;
    }
    if (stoneBtn) {
      stoneBtn.textContent = `🪨 Gather Stone (+${resourceMultipliers.stone.toFixed(1)})`;
    }
  }

  private renderBuildingsTab(): void {
    const container = document.getElementById('buildings-content');
    if (!container) return;

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
    } else {
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
    const buildingsByEra = new Map<string, BuildingType[]>();
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
      if (buildings.length === 0) continue;

      // Check if any building in this era is unlocked
      const hasUnlockedBuildings = buildings.some(b => 
        b.unlockTech === null || this.game.state.unlockedBuildings.has(b.id)
      );
      
      if (!hasUnlockedBuildings) continue;

      html += `<div class="era-section">
        <h4>${era.name} Buildings</h4>
        <div class="building-grid">`;
      
      for (const building of buildings) {
        const isUnlocked = building.unlockTech === null || this.game.state.unlockedBuildings.has(building.id);
        if (!isUnlocked) continue;

        const currentCount = this.game.getBuildingCount(building.id);
        const canBuild = this.canBuildBuilding(building);
        const atMax = currentCount >= building.maxCount;
        
        let statusClass = 'locked';
        if (atMax) statusClass = 'maxed';
        else if (canBuild) statusClass = 'available';

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
    // Event listeners are handled by event delegation in setupEventListeners()
  }

  private canBuildBuilding(building: BuildingType): boolean {
    const { resources } = this.game.state;
    const currentCount = this.game.getBuildingCount(building.id);
    
    if (currentCount >= building.maxCount) return false;
    if (resources.food < building.cost.food) return false;
    if (resources.wood < building.cost.wood) return false;
    if (resources.stone < building.cost.stone) return false;
    if (resources.gold < building.cost.gold) return false;
    return true;
  }

  // Update buildings tab without full re-render - only updates dynamic elements
  private updateBuildingsTab(): void {
    const container = document.getElementById('buildings-content');
    if (!container) {
      // Container doesn't exist, need full render
      this.renderBuildingsTab();
      return;
    }
    
    // Check if structure changed (new buildings unlocked, construction completed, queue changed)
    const currentUnlockedCount = this.game.state.unlockedBuildings.size;
    const currentBuildingCount = this.game.getTotalBuildingCount();
    const currentQueueLength = this.game.state.constructionQueue.length;
    
    // Use a simple string key for version comparison
    const versionKey = `${currentUnlockedCount}-${currentBuildingCount}-${currentQueueLength}`;
    const lastVersion = this.tabContentVersions.get('buildings');
    
    if (lastVersion === undefined || lastVersion.toString() !== versionKey) {
      // Structure changed or first render, need full re-render
      this.tabContentVersions.set('buildings', versionKey);
      this.renderBuildingsTab();
      return;
    }
    
    // Update construction queue progress bars
    const now = Date.now();
    const constructionItems = container.querySelectorAll('.construction-item');
    constructionItems.forEach((item, index) => {
      const construction = this.game.state.constructionQueue[index];
      if (construction) {
        const buildingType = getBuildingTypeById(construction.buildingId);
        if (buildingType) {
          const remaining = Math.max(0, (construction.endTime - now) / 1000);
          const progress = ((buildingType.buildTime - remaining) / buildingType.buildTime) * 100;
          const progressFill = item.querySelector('.progress-fill') as HTMLElement;
          const timeSpan = item.querySelector('span:last-child');
          if (progressFill) progressFill.style.width = `${progress}%`;
          if (timeSpan) timeSpan.textContent = `${remaining.toFixed(1)}s`;
        }
      }
    });
    
    // Update build buttons enabled/disabled state
    const buildButtons = container.querySelectorAll('.build-btn') as NodeListOf<HTMLButtonElement>;
    buildButtons.forEach(btn => {
      const buildingId = btn.dataset.building;
      if (buildingId) {
        const buildingType = getBuildingTypeById(buildingId);
        if (buildingType) {
          const canBuild = this.canBuildBuilding(buildingType);
          const currentCount = this.game.getBuildingCount(buildingId);
          const atMax = currentCount >= buildingType.maxCount;
          btn.disabled = !canBuild || atMax;
        }
      }
    });
  }

  private renderResearchTab(): void {
    const container = document.getElementById('research-tree');
    if (!container) return;

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
    const techsByEra = new Map<string, typeof TECHNOLOGIES>();
    for (const era of ERAS) {
      techsByEra.set(era.id, []);
    }
    for (const tech of TECHNOLOGIES) {
      techsByEra.get(tech.era)?.push(tech);
    }

    // Render each era's technologies
    for (const era of ERAS) {
      const techs = techsByEra.get(era.id) || [];
      if (techs.length === 0) continue;

      html += `<div class="era-section">
        <h3>${era.name} Technologies</h3>
        <div class="tech-grid">`;
      
      for (const tech of techs) {
        const isResearched = this.game.state.researchedTechs.has(tech.id);
        const isAvailable = this.canResearchTech(tech);
        const isCurrent = this.game.state.currentResearch === tech.id;
        
        let statusClass = 'locked';
        if (isResearched) statusClass = 'researched';
        else if (isCurrent) statusClass = 'current';
        else if (isAvailable) statusClass = 'available';

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
    // Event listeners are handled by event delegation in setupEventListeners()
  }

  private canResearchTech(tech: typeof TECHNOLOGIES[0]): boolean {
    if (this.game.state.researchedTechs.has(tech.id)) return false;
    if (this.game.state.currentResearch) return false;
    
    for (const prereq of tech.prerequisites) {
      if (!this.game.state.researchedTechs.has(prereq)) return false;
    }
    
    return this.game.state.resources.science >= tech.cost.science;
  }

  // Update research tab without full re-render
  private updateResearchTab(): void {
    const container = document.getElementById('research-tree');
    if (!container) {
      this.renderResearchTab();
      return;
    }
    
    // Check if research completed or changed
    const researchedCount = this.game.state.researchedTechs.size;
    const currentResearch = this.game.state.currentResearch || '';
    const versionKey = `${researchedCount}-${currentResearch}`;
    const lastVersion = this.tabContentVersions.get('research');
    
    if (lastVersion === undefined || lastVersion.toString() !== versionKey) {
      // Research changed or first render, need full re-render
      this.tabContentVersions.set('research', versionKey);
      this.renderResearchTab();
      return;
    }
    
    // Update current research progress
    if (this.game.state.currentResearch) {
      const tech = getTechById(this.game.state.currentResearch);
      if (tech) {
        const progress = (this.game.state.researchProgress / tech.cost.science) * 100;
        const progressFill = container.querySelector('.current-research .progress-fill') as HTMLElement;
        const progressText = container.querySelector('.current-research p:last-child');
        if (progressFill) progressFill.style.width = `${Math.min(progress, 100)}%`;
        if (progressText) progressText.textContent = `${Math.floor(this.game.state.researchProgress)} / ${tech.cost.science} science`;
      }
    }
    
    // Update research buttons enabled/disabled state
    const researchButtons = container.querySelectorAll('.research-btn') as NodeListOf<HTMLButtonElement>;
    researchButtons.forEach(btn => {
      const techId = btn.dataset.tech;
      if (techId) {
        const tech = getTechById(techId);
        if (tech) {
          const canResearch = this.canResearchTech(tech);
          btn.disabled = !canResearch;
        }
      }
    });
  }

  private renderBarracksTab(): void {
    const container = document.getElementById('barracks-content');
    if (!container) return;

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
    } else {
      html += '<p class="empty-message">No troops in training</p>';
    }

    // Available troops to train
    html += '<h3>Available Units</h3>';
    
    const availableTroops = this.game.getAvailableTroops();
    if (availableTroops.length === 0) {
      html += '<p class="empty-message">Research technologies to unlock troops!</p>';
    } else {
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
    // Event listeners are handled by event delegation in setupEventListeners()
  }

  private canTrainTroop(troop: typeof TROOP_TYPES[0]): boolean {
    const { resources } = this.game.state;
    if (resources.food < troop.cost.food) return false;
    if (resources.gold < troop.cost.gold) return false;
    if (troop.cost.wood && resources.wood < troop.cost.wood) return false;
    if (troop.cost.stone && resources.stone < troop.cost.stone) return false;
    return true;
  }

  // Update barracks tab without full re-render
  private updateBarracksTab(): void {
    const container = document.getElementById('barracks-content');
    if (!container) {
      this.renderBarracksTab();
      return;
    }
    
    // Check if troops unlocked or training queue structure changed
    const unlockedCount = this.game.state.unlockedTroops.size;
    const queueLength = this.game.state.trainingQueue.length;
    const armyCount = this.game.state.army.reduce((sum, t) => sum + t.count, 0);
    const versionKey = `${unlockedCount}-${queueLength}-${armyCount}`;
    const lastVersion = this.tabContentVersions.get('barracks');
    
    if (lastVersion === undefined || lastVersion.toString() !== versionKey) {
      // Structure changed or first render, need full re-render
      this.tabContentVersions.set('barracks', versionKey);
      this.renderBarracksTab();
      return;
    }
    
    // Update training queue progress bars
    const now = Date.now();
    const trainingItems = container.querySelectorAll('.training-item');
    trainingItems.forEach((item, index) => {
      const training = this.game.state.trainingQueue[index];
      if (training) {
        const troopType = getTroopTypeById(training.troopId);
        if (troopType) {
          const remaining = Math.max(0, (training.endTime - now) / 1000);
          const progress = ((troopType.trainTime - remaining) / troopType.trainTime) * 100;
          const progressFill = item.querySelector('.progress-fill') as HTMLElement;
          const timeSpan = item.querySelector('span:last-child');
          if (progressFill) progressFill.style.width = `${progress}%`;
          if (timeSpan) timeSpan.textContent = `${remaining.toFixed(1)}s`;
        }
      }
    });
    
    // Update train buttons enabled/disabled state
    const trainButtons = container.querySelectorAll('.train-btn') as NodeListOf<HTMLButtonElement>;
    trainButtons.forEach(btn => {
      const troopId = btn.dataset.troop;
      if (troopId) {
        const troopType = getTroopTypeById(troopId);
        if (troopType) {
          const canTrain = this.canTrainTroop(troopType);
          btn.disabled = !canTrain;
        }
      }
    });
  }

  private renderArmyTab(): void {
    const container = document.getElementById('army-content');
    if (!container) return;

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
    } else {
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

  private renderCombatTab(): void {
    const container = document.getElementById('combat-content');
    if (!container) return;

    // Check if there's an active battle
    if (this.game.state.activeBattle) {
      this.renderActiveBattle(container);
      return;
    }

    // Check if there's an active conquest battle
    if (this.game.state.activeConquestBattle) {
      this.renderActiveConquestBattle(container);
      return;
    }

    const isConquestMode = this.game.state.conquestMode;
    const playerPower = this.game.getArmyPower();

    // Mode toggle header
    let html = `
      <div class="combat-mode-toggle">
        <button class="mode-toggle-btn ${!isConquestMode ? 'active' : ''}" id="toggle-missions-mode">
          ⚔️ Missions
        </button>
        <button class="mode-toggle-btn ${isConquestMode ? 'active' : ''}" id="toggle-conquest-mode">
          🏰 Conquest
        </button>
      </div>
    `;

    html += `
      <div class="army-power-summary">
        <span>Your Army: ⚔️ ${playerPower.attack} | 🛡️ ${playerPower.defense} | ❤️ ${playerPower.health}</span>
      </div>
    `;

    if (playerPower.health === 0) {
      html += '<div class="warning-message">⚠️ You need troops to start battles! Train some in the Barracks first.</div>';
    }

    if (isConquestMode) {
      // Render Conquest Mode
      html += this.renderConquestMode(playerPower);
    } else {
      // Render Missions Mode
      html += this.renderMissionsMode(playerPower);
    }

    container.innerHTML = html;
    // Event listeners are handled by event delegation in setupEventListeners()
  }

  private renderMissionsMode(playerPower: { attack: number; defense: number; health: number }): string {
    let html = '<h3>⚔️ Combat Missions</h3>';
    html += '<p class="combat-intro">Choose a mission to test your army against enemy forces. Missions are organized by era - higher eras have tougher enemies but better rewards! Missions feature armies of varying sizes: Small 🔹, Medium 🔸, Large 💎, and Boss 👑.</p>';

    // Group missions by era
    for (const era of ERAS) {
      const eraMissions = getMissionsByEra(this.game.state.missions, era.id);
      if (eraMissions.length === 0) continue;
      
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
        
        // Get army size indicator
        const sizeIndicator = this.getArmySizeIndicator(mission.enemyArmy.size);
        
        html += `
          <div class="mission-card ${isCompleted ? 'completed' : ''} ${!isAvailable ? 'locked' : ''}">
            <div class="mission-header">
              <h5>${sizeIndicator} ${mission.name}</h5>
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

    return html;
  }

  private renderConquestMode(playerPower: { attack: number; defense: number; health: number }): string {
    let html = '<h3>🏰 Conquest Mode</h3>';
    html += '<p class="combat-intro">Conquer territories to gain permanent bonuses! Each territory provides ongoing resource bonuses once conquered. Territories are organized by era - higher eras have stronger defenders but better rewards!</p>';

    // Show conquest bonuses
    const conquestBonuses = this.game.getConquestBonuses();
    const conquestMultipliers = this.game.getConquestMultipliers();
    const conqueredCount = this.game.getConqueredTerritoryCount();
    const totalCount = this.game.getTotalTerritoryCount();

    html += `
      <div class="conquest-overview">
        <div class="conquest-progress">
          <span>Territories Conquered: ${conqueredCount} / ${totalCount}</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(conqueredCount / totalCount) * 100}%"></div>
          </div>
        </div>
        <div class="conquest-bonuses">
          <h4>Active Bonuses:</h4>
          <div class="bonuses-list">
            ${conquestBonuses.food > 0 ? `<span class="bonus-item">🍖 +${conquestBonuses.food.toFixed(1)}/s</span>` : ''}
            ${conquestBonuses.wood > 0 ? `<span class="bonus-item">🪵 +${conquestBonuses.wood.toFixed(1)}/s</span>` : ''}
            ${conquestBonuses.stone > 0 ? `<span class="bonus-item">🪨 +${conquestBonuses.stone.toFixed(1)}/s</span>` : ''}
            ${conquestBonuses.gold > 0 ? `<span class="bonus-item">💰 +${conquestBonuses.gold.toFixed(1)}/s</span>` : ''}
            ${conquestBonuses.science > 0 ? `<span class="bonus-item">🔬 +${conquestBonuses.science.toFixed(1)}/s</span>` : ''}
            ${conquestMultipliers.food > 1 ? `<span class="bonus-item multiplier">🍖 ×${conquestMultipliers.food.toFixed(2)}</span>` : ''}
            ${conquestMultipliers.wood > 1 ? `<span class="bonus-item multiplier">🪵 ×${conquestMultipliers.wood.toFixed(2)}</span>` : ''}
            ${conquestMultipliers.stone > 1 ? `<span class="bonus-item multiplier">🪨 ×${conquestMultipliers.stone.toFixed(2)}</span>` : ''}
            ${conquestMultipliers.gold > 1 ? `<span class="bonus-item multiplier">💰 ×${conquestMultipliers.gold.toFixed(2)}</span>` : ''}
            ${conquestMultipliers.science > 1 ? `<span class="bonus-item multiplier">🔬 ×${conquestMultipliers.science.toFixed(2)}</span>` : ''}
            ${conqueredCount === 0 ? '<span class="no-bonuses">No territories conquered yet!</span>' : ''}
          </div>
        </div>
      </div>
    `;

    // Group territories by era
    for (const era of ERAS) {
      const eraTerritories = getTerritoriesByEra(this.game.state.territories, era.id);
      if (eraTerritories.length === 0) continue;
      
      const isEraAvailable = isTerritoryAvailable(eraTerritories[0], this.game.state.currentEra);
      
      html += `
        <div class="territory-era-section ${!isEraAvailable ? 'locked' : ''}">
          <h4 class="territory-era-title">${era.name} Territories ${!isEraAvailable ? '🔒' : ''}</h4>
          <div class="territory-grid">
      `;
      
      for (const territory of eraTerritories) {
        const isAvailable = isTerritoryAvailable(territory, this.game.state.currentEra);
        const isConquered = this.game.isTerritoryConquered(territory.id);
        const canStart = isAvailable && playerPower.health > 0 && !isConquered;
        
        // Calculate difficulty rating using a mission-like object
        const territoryAsMission = { enemyArmy: territory.enemyArmy } as Mission;
        const difficultyRating = this.getDifficultyRating(playerPower, territoryAsMission);
        
        // Get army size indicator
        const sizeIndicator = this.getArmySizeIndicator(territory.enemyArmy.size);
        
        // Format bonus display
        let bonusText = '';
        if (territory.bonuses.flatBonus) {
          bonusText = `+${territory.bonuses.flatBonus.amount} ${this.getResourceEmoji(territory.bonuses.flatBonus.resource)}/s`;
        } else if (territory.bonuses.resourceMultiplier) {
          bonusText = `×${territory.bonuses.resourceMultiplier.multiplier.toFixed(2)} ${this.getResourceEmoji(territory.bonuses.resourceMultiplier.resource)}`;
        }
        
        html += `
          <div class="territory-card ${isConquered ? 'conquered' : ''} ${!isAvailable ? 'locked' : ''}">
            <div class="territory-header">
              <h5>${sizeIndicator} ${territory.name}</h5>
              ${isConquered ? '<span class="conquered-badge">🏴 Conquered</span>' : ''}
            </div>
            <p class="territory-desc">${territory.description}</p>
            <div class="territory-bonus">
              <span class="bonus-label">Permanent Bonus:</span>
              <span class="bonus-value">${bonusText}</span>
            </div>
            <div class="enemy-stats">
              <span class="enemy-label">Defenders: ${territory.enemyArmy.name}</span>
              <div class="enemy-power">
                <span>⚔️ ${territory.enemyArmy.attack}</span>
                <span>🛡️ ${territory.enemyArmy.defense}</span>
                <span>❤️ ${territory.enemyArmy.health}</span>
              </div>
            </div>
            <div class="difficulty-indicator ${difficultyRating.class}">
              Difficulty: ${difficultyRating.label}
            </div>
            <div class="territory-rewards">
              <span class="rewards-label">One-time Rewards:</span>
              <div class="rewards-list">
                ${territory.rewards.food > 0 ? `<span>🍖 ${territory.rewards.food}</span>` : ''}
                ${territory.rewards.wood > 0 ? `<span>🪵 ${territory.rewards.wood}</span>` : ''}
                ${territory.rewards.stone > 0 ? `<span>🪨 ${territory.rewards.stone}</span>` : ''}
                ${territory.rewards.gold > 0 ? `<span>💰 ${territory.rewards.gold}</span>` : ''}
                ${territory.rewards.science > 0 ? `<span>🔬 ${territory.rewards.science}</span>` : ''}
              </div>
            </div>
            <button class="territory-btn ${!canStart ? 'disabled' : ''}" 
                    data-territory="${territory.id}" 
                    ${!canStart ? 'disabled' : ''}>
              ${!isAvailable ? '🔒 Locked' : isConquered ? '🏴 Conquered' : '⚔️ Attack Territory'}
            </button>
          </div>
        `;
      }
      
      html += '</div></div>';
    }

    return html;
  }

  private getArmySizeIndicator(size?: string): string {
    switch (size) {
      case 'small': return '🔹';
      case 'medium': return '🔸';
      case 'large': return '💎';
      case 'boss': return '👑';
      default: return '🔸';
    }
  }

  private getResourceEmoji(resource: string): string {
    switch (resource) {
      case 'food': return '🍖';
      case 'wood': return '🪵';
      case 'stone': return '🪨';
      case 'gold': return '💰';
      case 'science': return '🔬';
      default: return '📦';
    }
  }

  private renderActiveConquestBattle(container: HTMLElement): void {
    const battle = this.game.state.activeConquestBattle;
    if (!battle) return;

    const territory = getTerritoryById(this.game.state.territories, battle.missionId);
    if (!territory) return;

    const currentLog = battle.logs[battle.currentRound - 1];
    const playerHealth = currentLog ? currentLog.playerHealth : battle.playerStartHealth;
    const enemyHealth = currentLog ? currentLog.enemyHealth : battle.enemyStartHealth;
    
    const playerHealthPercent = (playerHealth / battle.playerStartHealth) * 100;
    const enemyHealthPercent = (enemyHealth / battle.enemyStartHealth) * 100;

    let html = `
      <div class="battle-arena conquest-battle">
        <h3 class="battle-title">🏰 Conquest: ${territory.name}</h3>
        <p class="battle-vs">Your Army vs ${territory.enemyArmy.name}</p>
        
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
              🛡️
            </div>
            <h4>${territory.enemyArmy.name}</h4>
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
          <div class="battle-log" id="conquest-battle-log">
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
      
      // Format bonus display
      let bonusText = '';
      if (territory.bonuses.flatBonus) {
        bonusText = `+${territory.bonuses.flatBonus.amount} ${this.getResourceEmoji(territory.bonuses.flatBonus.resource)}/s`;
      } else if (territory.bonuses.resourceMultiplier) {
        bonusText = `×${territory.bonuses.resourceMultiplier.multiplier.toFixed(2)} ${this.getResourceEmoji(territory.bonuses.resourceMultiplier.resource)}`;
      }
      
      html += `
        <div class="battle-result ${result.victory ? 'victory' : 'defeat'}">
          <h3>${result.victory ? '🎉 Territory Conquered!' : '💀 Conquest Failed!'}</h3>
          <p class="casualty-report">Casualties: ${result.casualtyPercent}% of your army</p>
          ${result.victory ? `
            <div class="conquest-reward">
              <h4>Territory Bonus Unlocked:</h4>
              <span class="bonus-unlocked">${bonusText}</span>
            </div>
            <div class="battle-rewards">
              <h4>Rewards Earned:</h4>
              <div class="rewards-list">
                ${result.rewards && result.rewards.food > 0 ? `<span>🍖 +${result.rewards.food}</span>` : ''}
                ${result.rewards && result.rewards.wood > 0 ? `<span>🪵 +${result.rewards.wood}</span>` : ''}
                ${result.rewards && result.rewards.stone > 0 ? `<span>🪨 +${result.rewards.stone}</span>` : ''}
                ${result.rewards && result.rewards.gold > 0 ? `<span>💰 +${result.rewards.gold}</span>` : ''}
                ${result.rewards && result.rewards.science > 0 ? `<span>🔬 +${result.rewards.science}</span>` : ''}
              </div>
            </div>
          ` : ''}
          <button class="dismiss-battle-btn" id="dismiss-conquest-battle">Return to Conquest</button>
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
    const battleLog = document.getElementById('conquest-battle-log');
    if (battleLog) {
      battleLog.scrollTop = battleLog.scrollHeight;
    }
    // Event listeners are handled by event delegation in setupEventListeners()
  }

  private getDifficultyRating(playerPower: { attack: number; defense: number; health: number }, mission: Mission): { label: string; class: string } {
    const playerTotal = playerPower.attack + playerPower.defense + playerPower.health;
    const enemyTotal = mission.enemyArmy.attack + mission.enemyArmy.defense + mission.enemyArmy.health;
    
    if (playerTotal === 0) return { label: 'Impossible', class: 'difficulty-impossible' };
    
    const ratio = playerTotal / enemyTotal;
    
    if (ratio >= 2.0) return { label: 'Very Easy', class: 'difficulty-very-easy' };
    if (ratio >= 1.5) return { label: 'Easy', class: 'difficulty-easy' };
    if (ratio >= 1.0) return { label: 'Medium', class: 'difficulty-medium' };
    if (ratio >= 0.7) return { label: 'Hard', class: 'difficulty-hard' };
    if (ratio >= 0.4) return { label: 'Very Hard', class: 'difficulty-very-hard' };
    return { label: 'Extreme', class: 'difficulty-extreme' };
  }

  // Update combat tab without full re-render
  private updateCombatTab(): void {
    const container = document.getElementById('combat-content');
    if (!container) {
      this.renderCombatTab();
      return;
    }
    
    // If there's an active battle, render battle view (it needs frequent updates)
    if (this.game.state.activeBattle) {
      // During active battle, we do need to re-render to show battle progress
      this.renderActiveBattle(container);
      return;
    }

    // If there's an active conquest battle, render conquest battle view
    if (this.game.state.activeConquestBattle) {
      this.renderActiveConquestBattle(container);
      return;
    }
    
    // Check if mission/conquest state changed
    const completedCount = this.game.state.completedMissions.size;
    const conqueredCount = this.game.state.conqueredTerritories.size;
    const armyHealth = this.game.getArmyPower().health;
    const isConquestMode = this.game.state.conquestMode;
    const versionKey = `${completedCount}-${conqueredCount}-${armyHealth}-${isConquestMode}`;
    const lastVersion = this.tabContentVersions.get('combat');
    
    if (lastVersion === undefined || lastVersion.toString() !== versionKey) {
      // Structure changed or first render, need full re-render
      this.tabContentVersions.set('combat', versionKey);
      this.renderCombatTab();
      return;
    }
    
    // Update mission buttons enabled/disabled state
    const playerPower = this.game.getArmyPower();
    const missionButtons = container.querySelectorAll('.mission-btn') as NodeListOf<HTMLButtonElement>;
    missionButtons.forEach(btn => {
      const missionId = btn.dataset.mission;
      if (missionId) {
        const mission = getMissionById(this.game.state.missions, missionId);
        if (mission) {
          const isAvailable = isMissionAvailable(mission, this.game.state.currentEra);
          const canStart = isAvailable && playerPower.health > 0;
          btn.disabled = !canStart;
        }
      }
    });

    // Update territory buttons enabled/disabled state
    const territoryButtons = container.querySelectorAll('.territory-btn') as NodeListOf<HTMLButtonElement>;
    territoryButtons.forEach(btn => {
      const territoryId = btn.dataset.territory;
      if (territoryId) {
        const territory = getTerritoryById(this.game.state.territories, territoryId);
        if (territory) {
          const isAvailable = isTerritoryAvailable(territory, this.game.state.currentEra);
          const isConquered = this.game.isTerritoryConquered(territory.id);
          const canStart = isAvailable && playerPower.health > 0 && !isConquered;
          btn.disabled = !canStart;
        }
      }
    });
  }

  private startMission(missionId: string): void {
    if (this.game.startMission(missionId)) {
      // Start battle animation
      this.startBattleAnimation();
    }
  }

  private startConquest(territoryId: string): void {
    if (this.game.startConquest(territoryId)) {
      // Start conquest animation
      this.startConquestAnimation();
    }
  }

  private startConquestAnimation(): void {
    // Clear any existing animation
    if (this.conquestAnimationInterval) {
      clearInterval(this.conquestAnimationInterval);
    }
    
    // Start animating battle rounds
    this.conquestAnimationInterval = window.setInterval(() => {
      if (!this.game.state.activeConquestBattle || this.game.state.activeConquestBattle.isComplete) {
        if (this.conquestAnimationInterval) {
          clearInterval(this.conquestAnimationInterval);
          this.conquestAnimationInterval = null;
        }
        return;
      }
      this.game.advanceConquestRound();
    }, this.game.state.battleAnimationSpeed);
  }

  private startBattleAnimation(): void {
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

  private renderActiveBattle(container: HTMLElement): void {
    const battle = this.game.state.activeBattle;
    if (!battle) return;

    const mission = getMissionById(this.game.state.missions, battle.missionId);
    if (!mission) return;

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
    // Event listeners are handled by event delegation in setupEventListeners()
  }

  private saveGame(): void {
    const saveString = this.game.saveGame();
    localStorage.setItem('civGameSave', saveString);
    this.showNotification('Game saved!');
  }

  private loadGame(): void {
    const saveString = localStorage.getItem('civGameSave');
    if (saveString && this.game.loadGame(saveString)) {
      this.showNotification('Game loaded!');
    } else {
      this.showNotification('No save found!');
    }
  }

  private resetGame(): void {
    if (confirm('Are you sure you want to reset? All progress will be lost!')) {
      this.game.resetGame();
      localStorage.removeItem('civGameSave');
      this.showNotification('Game reset!');
    }
  }

  private showNotification(message: string): void {
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
  private renderAchievementsTab(): void {
    const container = document.getElementById('achievements-content');
    if (!container) return;

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

  private renderStatisticsSection(): string {
    const stats = this.game.state.statistics;
    const formatNumber = (n: number) => Math.floor(n).toLocaleString();
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
      if (minutes > 0) return `${minutes}m ${secs}s`;
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
  private queueAchievementNotification(achievement: Achievement): void {
    this.achievementNotificationQueue.push(achievement);
  }

  private processAchievementNotifications(): void {
    if (this.isShowingAchievement || this.achievementNotificationQueue.length === 0) return;

    const achievement = this.achievementNotificationQueue.shift();
    if (!achievement) return;

    this.isShowingAchievement = true;
    this.showAchievementPopup(achievement);
  }

  private showAchievementPopup(achievement: Achievement): void {
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
  private checkOfflineProgress(): void {
    const offlineProgress = this.game.offlineProgress;
    if (!offlineProgress || !offlineProgress.earned) return;

    // Only show once
    this.game.dismissOfflineProgress();
    this.showOfflineProgressPopup(offlineProgress);
  }

  private showOfflineProgressPopup(progress: { resources: { food: number; wood: number; stone: number; gold: number; science: number }; duration: number }): void {
    const formatNumber = (n: number) => Math.floor(n).toLocaleString();
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes}m`;
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
