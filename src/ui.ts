// UI management for the game
import { Game, ERAS, TECHNOLOGIES, TROOP_TYPES, ACHIEVEMENTS, BUILDING_TYPES, CIVILIZATIONS, LEADERS, NATURAL_WONDERS, RELIGION_TEMPLATES, CULTURAL_POLICIES, UNIT_UPGRADES, FORMATIONS, DEFENSE_STRUCTURES, HEROES, NAVAL_UNITS, SIEGE_WEAPONS, MILITARY_TRADITIONS, SPY_MISSIONS, Mission, ActiveBattle, Achievement, BuildingType, Territory, Civilization, Leader, NaturalWonder, Religion, CulturalPolicy, UnitUpgrade, Formation, DefenseStructure, Hero, NavalUnit, SiegeWeapon, MilitaryTradition, SpyMission, Spy } from './game.js';
import { getEraById } from './eras.js';
import { getTechById } from './research.js';
import { getTroopTypeById, calculateArmyPower } from './barracks.js';
import { getMissionById, getMissionsByEra, isMissionAvailable, getTerritoryById, getTerritoriesByEra, isTerritoryAvailable } from './combat.js';
import { getAchievementsByCategory } from './achievements.js';
import { getBuildingTypeById, calculateBuildingProduction } from './buildings.js';
import { SKILLS, LEGACY_MILESTONES, getSkillById, getSkillsByCategory, canUnlockSkill, getSkillLevel, getSkillCost, getSkillEffect, calculateSkillBonuses, Skill } from './skills.js';
import { getCivilizationById, getLeaderById, getNaturalWonderById, getPolicyById, canAdoptPolicy } from './lore.js';
import { getFormationById, getDefenseStructureById, getHeroById, getNavalUnitById, getSiegeWeaponById, getTraditionById, getSpyMissionById, checkTraditionUnlock, canUpgradeUnit, getUpgradeById } from './military.js';

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
  // Track if a completed battle has already been rendered to avoid animation restarts
  private battleResultRendered: boolean = false;
  private conquestResultRendered: boolean = false;
  // Track previous resource values for animation
  private previousResources: { food: number; wood: number; stone: number; gold: number; science: number } | null = null;

  constructor(game: Game) {
    this.game = game;
    this.game.setOnStateChange(() => this.scheduleRender());
    this.game.setOnAchievementUnlocked((achievement) => this.queueAchievementNotification(achievement));
    this.setupEventListeners();
    this.initThemeToggle();
    this.addTooltips();
  }

  // Debounced render to prevent rapid re-renders from interfering with clicks
  private scheduleRender(): void {
    // If user is currently interacting, delay the render
    if (this.isUserInteracting) {
      return;
    }
    
    // If a render is already scheduled, don't reschedule
    // (prevents the timeout from being continuously reset and never firing)
    if (this.renderTimeout !== null) {
      return;
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
        this.battleResultRendered = false;
        this.game.dismissBattle();
      }
      // Dismiss conquest battle button
      if (target.id === 'dismiss-conquest-battle') {
        this.startInteraction();
        this.conquestResultRendered = false;
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

    // Skills tab - skill upgrade buttons
    document.getElementById('skills-content')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('skill-btn') && !target.hasAttribute('disabled')) {
        const skillId = target.dataset.skill;
        if (skillId) {
          this.startInteraction();
          this.game.upgradeSkill(skillId);
        }
      }
    });

    // World tab - civilization, leader, religion, and policy buttons
    document.getElementById('world-content')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Civilization selection
      if (target.classList.contains('civ-btn') && !target.hasAttribute('disabled')) {
        const civId = target.dataset.civilization;
        if (civId) {
          this.startInteraction();
          this.game.selectCivilization(civId);
        }
      }
      
      // Leader selection
      if (target.classList.contains('leader-btn') && !target.hasAttribute('disabled')) {
        const leaderId = target.dataset.leader;
        if (leaderId) {
          this.startInteraction();
          this.game.selectLeader(leaderId);
        }
      }
      
      // Religion founding
      if (target.classList.contains('religion-btn') && !target.hasAttribute('disabled')) {
        const religionId = target.dataset.religion;
        if (religionId) {
          this.startInteraction();
          this.game.foundNewReligion(religionId);
        }
      }
      
      // Policy adoption
      if (target.classList.contains('policy-btn') && !target.hasAttribute('disabled')) {
        const policyId = target.dataset.policy;
        if (policyId) {
          this.startInteraction();
          this.game.adoptCulturalPolicy(policyId);
        }
      }
      
      // Explore for natural wonders
      if (target.id === 'explore-wonder-btn') {
        this.startInteraction();
        const wonder = this.game.discoverNaturalWonder();
        if (wonder) {
          this.showNotification(`Discovered ${wonder.name}!`);
        } else {
          this.showNotification('Nothing discovered this time...');
        }
      }
    });

    // Military tab - all military-related interactions
    document.getElementById('military-content')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Formation selection
      if (target.classList.contains('formation-card') && !target.classList.contains('locked')) {
        const formationId = target.dataset.formation;
        if (formationId) {
          this.startInteraction();
          this.game.setFormation(formationId);
        }
      }
      
      // Hero recruitment
      if (target.classList.contains('hero-btn') && !target.hasAttribute('disabled')) {
        const heroId = target.dataset.hero;
        if (heroId) {
          this.startInteraction();
          if (target.classList.contains('recruit')) {
            this.game.recruitHero(heroId);
          } else if (target.classList.contains('set-active')) {
            this.game.setActiveHero(heroId);
          }
        }
      }
      
      // Defense building
      if (target.classList.contains('build-defense-btn') && !target.hasAttribute('disabled')) {
        const structureId = target.dataset.defense;
        if (structureId) {
          this.startInteraction();
          this.game.buildDefenseStructure(structureId);
        }
      }
      
      // Naval unit training
      if (target.classList.contains('train-naval-btn') && !target.hasAttribute('disabled')) {
        const unitId = target.dataset.naval;
        if (unitId) {
          this.startInteraction();
          this.game.trainNavalUnit(unitId);
        }
      }
      
      // Siege weapon training
      if (target.classList.contains('train-siege-btn') && !target.hasAttribute('disabled')) {
        const weaponId = target.dataset.siege;
        if (weaponId) {
          this.startInteraction();
          this.game.trainSiegeWeapon(weaponId);
        }
      }
      
      // Unit upgrade
      if (target.classList.contains('upgrade-btn') && !target.hasAttribute('disabled')) {
        const upgradeId = target.dataset.upgrade;
        if (upgradeId) {
          this.startInteraction();
          this.game.upgradeUnit(upgradeId);
        }
      }
      
      // Spy recruitment
      if (target.id === 'recruit-spy-btn' && !target.hasAttribute('disabled')) {
        this.startInteraction();
        if (this.game.recruitSpy()) {
          this.showNotification('New spy recruited!');
        }
      }
      
      // Spy mission start
      if (target.classList.contains('spy-mission-btn') && !target.hasAttribute('disabled')) {
        const spyId = target.dataset.spy;
        const missionId = target.dataset.mission;
        if (spyId && missionId) {
          this.startInteraction();
          if (this.game.startSpyMission(spyId, missionId)) {
            this.showNotification('Spy mission started!');
          }
        }
      }
    });
  }

  // Initialize the theme toggle button
  private initThemeToggle(): void {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('civGameTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Create theme toggle button
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'theme-toggle-container';
    toggleContainer.innerHTML = `
      <button class="theme-toggle-btn" id="theme-toggle" data-tooltip="Toggle Light/Dark Theme">
        ${theme === 'dark' ? '☀️' : '🌙'}
      </button>
    `;
    document.body.appendChild(toggleContainer);
    
    // Add event listener
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      this.toggleTheme();
    });
  }

  // Toggle between light and dark themes
  private toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Update button icon
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Save preference
    localStorage.setItem('civGameTheme', newTheme);
    
    this.showNotification(`${newTheme === 'light' ? '☀️ Light' : '🌙 Dark'} theme activated`);
  }

  // Add tooltips to various UI elements
  private addTooltips(): void {
    // Resource tooltips
    const resourceTooltips: Record<string, string> = {
      'food': 'Food is used to train troops and sustain your population. Gather food or build farms.',
      'wood': 'Wood is essential for construction. Gather wood or build lumber mills.',
      'stone': 'Stone is used for advanced buildings and defenses. Mine stone from quarries.',
      'gold': 'Gold is the universal currency. Earn gold through trade and mining.',
      'science': 'Science points are used to research new technologies. Build libraries and universities.'
    };

    // Apply tooltips to resource elements
    document.querySelectorAll('.resource').forEach(resource => {
      const name = resource.querySelector('.resource-name')?.textContent?.toLowerCase().trim();
      if (name && resourceTooltips[name]) {
        resource.setAttribute('data-tooltip', resourceTooltips[name]);
      }
    });

    // Tab button tooltips
    const tabTooltips: Record<string, string> = {
      'resources': 'Manually gather resources to boost your civilization',
      'buildings': 'Construct buildings that passively generate resources',
      'research': 'Research technologies to unlock new abilities and advance eras',
      'barracks': 'Train troops to build your army',
      'army': 'View your current military strength',
      'combat': 'Engage in battles and conquer territories',
      'world': 'Choose civilization, leaders, and cultural policies',
      'skills': 'Upgrade permanent skills using legacy points',
      'military': 'Manage formations, heroes, naval forces, and espionage',
      'achievements': 'View your accomplishments and statistics'
    };

    document.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = (btn as HTMLElement).dataset.tab;
      if (tab && tabTooltips[tab]) {
        btn.setAttribute('data-tooltip', tabTooltips[tab]);
      }
    });

    // Footer button tooltips
    document.getElementById('save-game')?.setAttribute('data-tooltip', 'Save your game progress to local storage');
    document.getElementById('load-game')?.setAttribute('data-tooltip', 'Load a previously saved game');
    document.getElementById('reset-game')?.setAttribute('data-tooltip', 'Reset all progress and start fresh (cannot be undone!)');
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
      case 'skills':
        if (tabChanged) {
          this.renderSkillsTab();
        } else {
          this.updateSkillsTab();
        }
        break;
      case 'world':
        if (tabChanged) {
          this.renderWorldTab();
        } else {
          this.updateWorldTab();
        }
        break;
      case 'military':
        if (tabChanged) {
          this.renderMilitaryTab();
        } else {
          this.updateMilitaryTab();
        }
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
    
    // Check for resource gains and trigger animations
    if (this.previousResources) {
      this.animateResourceGain('food', this.previousResources.food, resources.food);
      this.animateResourceGain('wood', this.previousResources.wood, resources.wood);
      this.animateResourceGain('stone', this.previousResources.stone, resources.stone);
      this.animateResourceGain('gold', this.previousResources.gold, resources.gold);
      this.animateResourceGain('science', this.previousResources.science, resources.science);
    }
    
    // Store current resources for next comparison
    this.previousResources = { ...resources };
    
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

  // Animate resource gain with visual feedback
  private animateResourceGain(resourceType: string, oldValue: number, newValue: number): void {
    const gain = Math.floor(newValue) - Math.floor(oldValue);
    
    // Only animate for significant gains (manual gather clicks)
    if (gain >= 1) {
      // Use getElementById and traverse to parent for better browser compatibility
      const amountEl = document.getElementById(`${resourceType}-amount`);
      const resourceEl = amountEl?.closest('.resource') as HTMLElement | null;
      
      if (resourceEl && amountEl) {
        // Add pulse animation to the resource card
        resourceEl.classList.add('gain-animation');
        amountEl.classList.add('gain-animation');
        
        // Remove animation class after it completes
        setTimeout(() => {
          resourceEl.classList.remove('gain-animation');
          amountEl.classList.remove('gain-animation');
        }, 500);
        
        // Create floating gain indicator
        this.showResourceGainPopup(resourceEl, gain);
      }
    }
  }

  // Show floating resource gain popup
  private showResourceGainPopup(resourceEl: HTMLElement, gain: number): void {
    const popup = document.createElement('span');
    popup.className = 'resource-gain-popup';
    popup.textContent = `+${gain}`;
    
    resourceEl.style.position = 'relative';
    resourceEl.appendChild(popup);
    
    // Remove popup after animation
    setTimeout(() => {
      popup.remove();
    }, 1000);
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
        const hasPrereqs = this.hasPrerequisites(tech);
        const canAfford = this.game.state.resources.science >= tech.cost.science;
        const isAvailable = this.canResearchTech(tech);
        const isCurrent = this.game.state.currentResearch === tech.id;
        const isAnyResearchInProgress = this.game.state.currentResearch !== null;
        
        let statusClass = 'locked';
        if (isResearched) statusClass = 'researched';
        else if (isCurrent) statusClass = 'current';
        else if (isAvailable) statusClass = 'available';
        else if (hasPrereqs) statusClass = 'unlocked'; // Has prereqs but can't afford or research in progress

        // Show button if: prerequisites are met, not researched, and not currently being researched
        const showButton = hasPrereqs && !isResearched && !isCurrent;
        // Button is disabled if: can't afford OR another research is in progress
        const buttonDisabled = !canAfford || isAnyResearchInProgress;

        html += `
          <div class="tech-card ${statusClass}" data-tech-id="${tech.id}">
            <h4>${tech.name}</h4>
            <p class="tech-desc">${tech.description}</p>
            <p class="tech-cost">Cost: ${tech.cost.science} science</p>
            ${isResearched ? '<span class="badge">✓ Researched</span>' : ''}
            ${showButton ? 
              `<button class="research-btn" data-tech="${tech.id}" ${buttonDisabled ? 'disabled' : ''}>Research</button>` : ''}
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

  // Check if prerequisites are met (regardless of science or current research)
  private hasPrerequisites(tech: typeof TECHNOLOGIES[0]): boolean {
    for (const prereq of tech.prerequisites) {
      if (!this.game.state.researchedTechs.has(prereq)) return false;
    }
    return true;
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
          const canAfford = this.game.state.resources.science >= tech.cost.science;
          const isAnyResearchInProgress = this.game.state.currentResearch !== null;
          btn.disabled = !canAfford || isAnyResearchInProgress;
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

    // Skip re-rendering if battle is complete and already rendered
    // This prevents the victory/defeat animation from restarting and causing flashing
    if (battle.isComplete && this.conquestResultRendered) {
      return;
    }

    const territory = getTerritoryById(this.game.state.territories, battle.missionId);
    if (!territory) return;

    const currentLog = battle.logs[battle.currentRound - 1];
    const playerHealth = currentLog ? currentLog.playerHealth : battle.playerStartHealth;
    const enemyHealth = currentLog ? currentLog.enemyHealth : battle.enemyStartHealth;
    
    const playerHealthPercent = (playerHealth / battle.playerStartHealth) * 100;
    const enemyHealthPercent = (enemyHealth / battle.enemyStartHealth) * 100;

    // Get player troops for visualization
    const playerTroops = this.game.state.army;
    const playerTroopDisplay = this.generateBattlefieldTroops(playerTroops, 'player', playerHealthPercent);
    const enemyTroopDisplay = this.generateEnemyTroops(territory.enemyArmy.size, enemyHealthPercent);

    let html = `
      <div class="battle-arena conquest-battle">
        <h3 class="battle-title">🏰 Conquest: ${territory.name}</h3>
        <p class="battle-vs">Your Army vs ${territory.enemyArmy.name}</p>
        
        <!-- Animated Battlefield -->
        <div class="battlefield-container" id="battlefield">
          <div class="battlefield-center-line"></div>
          
          <!-- Labels -->
          <div class="battlefield-label player-label">Your Army</div>
          <div class="battlefield-label enemy-label">${territory.enemyArmy.name}</div>
          
          <!-- Round indicator -->
          <div class="battlefield-round">
            Round ${battle.currentRound} / ${battle.logs.length}
          </div>
          
          <!-- Troops -->
          <div class="battlefield-troops" id="battlefield-troops">
            ${playerTroopDisplay}
            ${enemyTroopDisplay}
          </div>
          
          <!-- Health bars on battlefield -->
          <div class="battlefield-health player-health-bar">
            <div class="battlefield-health-fill player" style="width: ${playerHealthPercent}%"></div>
            <span class="battlefield-health-text">${Math.max(0, Math.floor(playerHealth))} / ${battle.playerStartHealth}</span>
          </div>
          <div class="battlefield-health enemy-health-bar">
            <div class="battlefield-health-fill enemy" style="width: ${enemyHealthPercent}%"></div>
            <span class="battlefield-health-text">${Math.max(0, Math.floor(enemyHealth))} / ${battle.enemyStartHealth}</span>
          </div>
          
          ${battle.isComplete && battle.result ? `
            <div class="battlefield-result-overlay ${battle.result.victory ? 'victory' : 'defeat'}">
              <div class="battlefield-result-text">${battle.result.victory ? '🏰 CONQUERED!' : '💀 DEFEAT!'}</div>
            </div>
          ` : ''}
        </div>
        
        <!-- Compact Battle Log -->
        <div class="battle-log-container">
          <h4>📜 Battle Log</h4>
          <div class="battle-log-compact" id="conquest-battle-log">
    `;
    
    // Show logs up to current round in compact format
    for (let i = 0; i < battle.currentRound; i++) {
      const log = battle.logs[i];
      html += `
        <span class="log-chip player-attack">R${log.round}: ⚔️ ${log.playerDamage}</span>
        <span class="log-chip enemy-attack">R${log.round}: 💥 ${log.enemyDamage}</span>
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
    
    // Trigger attack animations on current round
    if (!battle.isComplete && currentLog) {
      this.triggerBattleAnimations(currentLog.playerDamage, currentLog.enemyDamage);
    }
    
    // Mark conquest result as rendered to prevent re-render flashing
    if (battle.isComplete) {
      this.conquestResultRendered = true;
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
      // Reset battle result rendered flag for new battle
      this.battleResultRendered = false;
      // Start battle animation
      this.startBattleAnimation();
    }
  }

  private startConquest(territoryId: string): void {
    if (this.game.startConquest(territoryId)) {
      // Reset conquest result rendered flag for new battle
      this.conquestResultRendered = false;
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

    // Skip re-rendering if battle is complete and already rendered
    // This prevents the victory/defeat animation from restarting and causing flashing
    if (battle.isComplete && this.battleResultRendered) {
      return;
    }

    const mission = getMissionById(this.game.state.missions, battle.missionId);
    if (!mission) return;

    const currentLog = battle.logs[battle.currentRound - 1];
    const playerHealth = currentLog ? currentLog.playerHealth : battle.playerStartHealth;
    const enemyHealth = currentLog ? currentLog.enemyHealth : battle.enemyStartHealth;
    
    const playerHealthPercent = (playerHealth / battle.playerStartHealth) * 100;
    const enemyHealthPercent = (enemyHealth / battle.enemyStartHealth) * 100;

    // Get player troops for visualization
    const playerTroops = this.game.state.army;
    const playerTroopDisplay = this.generateBattlefieldTroops(playerTroops, 'player', playerHealthPercent);
    const enemyTroopDisplay = this.generateEnemyTroops(mission.enemyArmy.size, enemyHealthPercent);

    let html = `
      <div class="battle-arena">
        <h3 class="battle-title">⚔️ Battle: ${mission.name}</h3>
        <p class="battle-vs">Your Army vs ${mission.enemyArmy.name}</p>
        
        <!-- Animated Battlefield -->
        <div class="battlefield-container" id="battlefield">
          <div class="battlefield-center-line"></div>
          
          <!-- Labels -->
          <div class="battlefield-label player-label">Your Army</div>
          <div class="battlefield-label enemy-label">${mission.enemyArmy.name}</div>
          
          <!-- Round indicator -->
          <div class="battlefield-round">
            Round ${battle.currentRound} / ${battle.logs.length}
          </div>
          
          <!-- Troops -->
          <div class="battlefield-troops" id="battlefield-troops">
            ${playerTroopDisplay}
            ${enemyTroopDisplay}
          </div>
          
          <!-- Health bars on battlefield -->
          <div class="battlefield-health player-health-bar">
            <div class="battlefield-health-fill player" style="width: ${playerHealthPercent}%"></div>
            <span class="battlefield-health-text">${Math.max(0, Math.floor(playerHealth))} / ${battle.playerStartHealth}</span>
          </div>
          <div class="battlefield-health enemy-health-bar">
            <div class="battlefield-health-fill enemy" style="width: ${enemyHealthPercent}%"></div>
            <span class="battlefield-health-text">${Math.max(0, Math.floor(enemyHealth))} / ${battle.enemyStartHealth}</span>
          </div>
          
          ${battle.isComplete && battle.result ? `
            <div class="battlefield-result-overlay ${battle.result.victory ? 'victory' : 'defeat'}">
              <div class="battlefield-result-text">${battle.result.victory ? '🎉 VICTORY!' : '💀 DEFEAT!'}</div>
            </div>
          ` : ''}
        </div>
        
        <!-- Compact Battle Log -->
        <div class="battle-log-container">
          <h4>📜 Battle Log</h4>
          <div class="battle-log-compact" id="battle-log">
    `;
    
    // Show logs up to current round in compact format
    for (let i = 0; i < battle.currentRound; i++) {
      const log = battle.logs[i];
      html += `
        <span class="log-chip player-attack">R${log.round}: ⚔️ ${log.playerDamage}</span>
        <span class="log-chip enemy-attack">R${log.round}: 💥 ${log.enemyDamage}</span>
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
    
    // Trigger attack animations on current round
    if (!battle.isComplete && currentLog) {
      this.triggerBattleAnimations(currentLog.playerDamage, currentLog.enemyDamage);
    }
    
    // Mark battle result as rendered to prevent re-render flashing
    if (battle.isComplete) {
      this.battleResultRendered = true;
    }
    // Event listeners are handled by event delegation in setupEventListeners()
  }

  // Generate troop icons for battlefield visualization
  private generateBattlefieldTroops(troops: { typeId: string; count: number }[], side: 'player' | 'enemy', healthPercent: number): string {
    let html = '';
    const maxTroopsToShow = 8;
    let troopIndex = 0;
    
    // Get unique troop types with counts
    const troopDisplay: { icon: string; count: number; troopClass: string }[] = [];
    
    for (const troop of troops) {
      const troopType = getTroopTypeById(troop.typeId);
      if (troopType && troop.count > 0) {
        troopDisplay.push({
          icon: troopType.icon || '⚔️',
          count: troop.count,
          troopClass: troopType.troopClass || 'infantry'
        });
      }
    }
    
    // Distribute troops across battlefield
    const troopsToShow = troopDisplay.slice(0, maxTroopsToShow);
    const rows = 3;
    const cols = Math.ceil(troopsToShow.length / rows);
    
    troopsToShow.forEach((troop, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      
      // Position troops: player on left, enemy on right
      const baseX = side === 'player' ? 5 : 55;
      const xOffset = col * 12;
      const yPos = 20 + (row * 25);
      const xPos = side === 'player' ? baseX + xOffset : baseX + (cols - col - 1) * 12;
      
      // Reduce opacity based on health
      const opacity = healthPercent > 30 ? 1 : healthPercent / 30;
      
      html += `
        <div class="troop-unit ${side}-troop ${troop.troopClass}" 
             style="left: ${xPos}%; top: ${yPos}%; opacity: ${opacity}"
             data-troop-index="${idx}"
             data-side="${side}">
          <span class="troop-icon">${troop.icon}</span>
          <span class="troop-count">×${troop.count}</span>
        </div>
      `;
    });
    
    // If no troops, show a placeholder
    if (troopsToShow.length === 0 && side === 'player') {
      html += `
        <div class="troop-unit ${side}-troop infantry" style="left: 15%; top: 40%;">
          <span class="troop-icon">🏰</span>
          <span class="troop-count">×0</span>
        </div>
      `;
    }
    
    return html;
  }

  // Generate enemy troop icons based on army size
  private generateEnemyTroops(size: string | undefined, healthPercent: number): string {
    // Enemy troop configurations based on army size
    const enemyConfigs: Record<string, { icon: string; count: number; troopClass: string }[]> = {
      'small': [
        { icon: '👹', count: 5, troopClass: 'infantry' },
        { icon: '🏹', count: 3, troopClass: 'ranged' },
      ],
      'medium': [
        { icon: '👹', count: 10, troopClass: 'infantry' },
        { icon: '🏹', count: 5, troopClass: 'ranged' },
        { icon: '🐎', count: 3, troopClass: 'cavalry' },
      ],
      'large': [
        { icon: '👹', count: 20, troopClass: 'infantry' },
        { icon: '🏹', count: 10, troopClass: 'ranged' },
        { icon: '🐎', count: 8, troopClass: 'cavalry' },
        { icon: '💣', count: 5, troopClass: 'siege' },
      ],
      'boss': [
        { icon: '👑', count: 1, troopClass: 'special' },
        { icon: '💀', count: 15, troopClass: 'infantry' },
        { icon: '🏹', count: 10, troopClass: 'ranged' },
        { icon: '🐉', count: 3, troopClass: 'cavalry' },
        { icon: '⚡', count: 5, troopClass: 'siege' },
      ],
    };

    const config = enemyConfigs[size || 'medium'] || enemyConfigs['medium'];
    
    let html = '';
    const rows = 3;
    const cols = Math.ceil(config.length / rows);
    
    config.forEach((troop, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      
      const baseX = 55;
      const xOffset = (cols - col - 1) * 12;
      const yPos = 20 + (row * 25);
      const xPos = baseX + xOffset;
      
      const opacity = healthPercent > 30 ? 1 : healthPercent / 30;
      
      html += `
        <div class="troop-unit enemy-troop ${troop.troopClass}" 
             style="left: ${xPos}%; top: ${yPos}%; opacity: ${opacity}"
             data-troop-index="${idx}"
             data-side="enemy">
          <span class="troop-icon">${troop.icon}</span>
          <span class="troop-count">×${troop.count}</span>
        </div>
      `;
    });
    
    return html;
  }

  // Trigger attack animations and damage popups
  private triggerBattleAnimations(playerDamage: number, enemyDamage: number): void {
    const battlefield = document.getElementById('battlefield-troops');
    if (!battlefield) return;
    
    // Get all player and enemy troops
    const playerTroops = battlefield.querySelectorAll('.player-troop');
    const enemyTroops = battlefield.querySelectorAll('.enemy-troop');
    
    // Animate random player troop attacking
    if (playerTroops.length > 0) {
      const randomPlayer = playerTroops[Math.floor(Math.random() * playerTroops.length)] as HTMLElement;
      randomPlayer.classList.add('attacking');
      setTimeout(() => randomPlayer.classList.remove('attacking'), 400);
      
      // Show damage popup near enemy
      if (enemyTroops.length > 0) {
        const targetEnemy = enemyTroops[Math.floor(Math.random() * enemyTroops.length)] as HTMLElement;
        targetEnemy.classList.add('hit');
        setTimeout(() => targetEnemy.classList.remove('hit'), 300);
        this.showDamagePopup(targetEnemy, playerDamage, 'player-damage');
      }
    }
    
    // Animate random enemy troop attacking (with delay)
    setTimeout(() => {
      if (enemyTroops.length > 0) {
        const randomEnemy = enemyTroops[Math.floor(Math.random() * enemyTroops.length)] as HTMLElement;
        randomEnemy.classList.add('attacking');
        setTimeout(() => randomEnemy.classList.remove('attacking'), 400);
        
        // Show damage popup near player
        if (playerTroops.length > 0) {
          const targetPlayer = playerTroops[Math.floor(Math.random() * playerTroops.length)] as HTMLElement;
          targetPlayer.classList.add('hit');
          setTimeout(() => targetPlayer.classList.remove('hit'), 300);
          this.showDamagePopup(targetPlayer, enemyDamage, 'enemy-damage');
        }
      }
    }, 200);
  }

  // Show floating damage popup
  private showDamagePopup(element: HTMLElement, damage: number, className: string): void {
    const popup = document.createElement('div');
    popup.className = `damage-popup ${className}`;
    popup.textContent = `-${damage}`;
    
    // Position near the element
    const rect = element.getBoundingClientRect();
    const battlefield = document.getElementById('battlefield');
    if (battlefield) {
      const battlefieldRect = battlefield.getBoundingClientRect();
      popup.style.left = `${rect.left - battlefieldRect.left + rect.width / 2}px`;
      popup.style.top = `${rect.top - battlefieldRect.top}px`;
      battlefield.appendChild(popup);
      
      // Remove after animation
      setTimeout(() => popup.remove(), 1000);
    }
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

  // Skill Tree Tab
  private renderSkillsTab(): void {
    const container = document.getElementById('skills-content');
    if (!container) return;

    const { skillTree } = this.game.state;
    const bonuses = calculateSkillBonuses(skillTree.skillLevels);

    let html = '';

    // Legacy Points Overview
    html += `
      <div class="skill-overview">
        <div class="legacy-points-display">
          <span class="legacy-icon">✨</span>
          <span class="legacy-label">Legacy Points:</span>
          <span class="legacy-value">${skillTree.legacyPoints}</span>
        </div>
        <div class="legacy-stats">
          <span>Total Earned: ${skillTree.totalLegacyPointsEarned}</span>
          <span>Prestige Count: ${skillTree.prestigeCount}</span>
        </div>
      </div>
    `;

    // Active Bonuses Summary
    html += this.renderSkillBonusesSummary(bonuses);

    // Skill Categories
    const categories: { id: Skill['category']; name: string; icon: string }[] = [
      { id: 'production', name: 'Production', icon: '📦' },
      { id: 'military', name: 'Military', icon: '⚔️' },
      { id: 'research', name: 'Research', icon: '🔬' },
      { id: 'economy', name: 'Economy', icon: '💰' },
      { id: 'special', name: 'Special', icon: '🌟' },
    ];

    html += '<h3>🎯 Skill Trees</h3>';

    for (const category of categories) {
      const categorySkills = getSkillsByCategory(category.id);
      if (categorySkills.length === 0) continue;

      html += `
        <div class="skill-category">
          <h4>${category.icon} ${category.name}</h4>
          <div class="skill-grid">
      `;

      for (const skill of categorySkills) {
        html += this.renderSkillCard(skill, skillTree.skillLevels);
      }

      html += '</div></div>';
    }

    // Legacy Milestones
    html += this.renderLegacyMilestones();

    container.innerHTML = html;
  }

  private renderSkillBonusesSummary(bonuses: ReturnType<typeof calculateSkillBonuses>): string {
    const hasResourceBonuses = 
      bonuses.resourceMultipliers.food > 1 || bonuses.resourceMultipliers.wood > 1 ||
      bonuses.resourceMultipliers.stone > 1 || bonuses.resourceMultipliers.gold > 1 ||
      bonuses.resourceMultipliers.science > 1;
    const hasFlatBonuses = 
      bonuses.flatBonuses.food > 0 || bonuses.flatBonuses.wood > 0 ||
      bonuses.flatBonuses.stone > 0 || bonuses.flatBonuses.gold > 0 ||
      bonuses.flatBonuses.science > 0;
    const hasMilitaryBonuses = 
      bonuses.militaryMultipliers.attack > 1 || bonuses.militaryMultipliers.defense > 1 ||
      bonuses.militaryMultipliers.health > 1 || bonuses.militaryMultipliers.casualtyReduction > 0;
    const hasOtherBonuses = 
      bonuses.researchSpeedMultiplier > 1 || bonuses.startingResources > 0 ||
      bonuses.techRetention > 0 || bonuses.legacyPointsMultiplier > 1;

    if (!hasResourceBonuses && !hasFlatBonuses && !hasMilitaryBonuses && !hasOtherBonuses) {
      return `
        <div class="skill-bonuses-summary">
          <h4>Active Skill Bonuses</h4>
          <p class="no-bonuses">No skills unlocked yet. Spend legacy points to unlock permanent bonuses!</p>
        </div>
      `;
    }

    let html = `
      <div class="skill-bonuses-summary">
        <h4>Active Skill Bonuses</h4>
        <div class="bonuses-grid">
    `;

    if (hasResourceBonuses) {
      html += '<div class="bonus-group"><span class="bonus-group-label">Resource Multipliers:</span>';
      if (bonuses.resourceMultipliers.food > 1) html += `<span class="bonus-value">🍖 ×${bonuses.resourceMultipliers.food.toFixed(2)}</span>`;
      if (bonuses.resourceMultipliers.wood > 1) html += `<span class="bonus-value">🪵 ×${bonuses.resourceMultipliers.wood.toFixed(2)}</span>`;
      if (bonuses.resourceMultipliers.stone > 1) html += `<span class="bonus-value">🪨 ×${bonuses.resourceMultipliers.stone.toFixed(2)}</span>`;
      if (bonuses.resourceMultipliers.gold > 1) html += `<span class="bonus-value">💰 ×${bonuses.resourceMultipliers.gold.toFixed(2)}</span>`;
      if (bonuses.resourceMultipliers.science > 1) html += `<span class="bonus-value">🔬 ×${bonuses.resourceMultipliers.science.toFixed(2)}</span>`;
      html += '</div>';
    }

    if (hasFlatBonuses) {
      html += '<div class="bonus-group"><span class="bonus-group-label">Flat Bonuses:</span>';
      if (bonuses.flatBonuses.food > 0) html += `<span class="bonus-value">🍖 +${bonuses.flatBonuses.food.toFixed(1)}/s</span>`;
      if (bonuses.flatBonuses.wood > 0) html += `<span class="bonus-value">🪵 +${bonuses.flatBonuses.wood.toFixed(1)}/s</span>`;
      if (bonuses.flatBonuses.stone > 0) html += `<span class="bonus-value">🪨 +${bonuses.flatBonuses.stone.toFixed(1)}/s</span>`;
      if (bonuses.flatBonuses.gold > 0) html += `<span class="bonus-value">💰 +${bonuses.flatBonuses.gold.toFixed(1)}/s</span>`;
      if (bonuses.flatBonuses.science > 0) html += `<span class="bonus-value">🔬 +${bonuses.flatBonuses.science.toFixed(1)}/s</span>`;
      html += '</div>';
    }

    if (hasMilitaryBonuses) {
      html += '<div class="bonus-group"><span class="bonus-group-label">Military Bonuses:</span>';
      if (bonuses.militaryMultipliers.attack > 1) html += `<span class="bonus-value">⚔️ ×${bonuses.militaryMultipliers.attack.toFixed(2)}</span>`;
      if (bonuses.militaryMultipliers.defense > 1) html += `<span class="bonus-value">🛡️ ×${bonuses.militaryMultipliers.defense.toFixed(2)}</span>`;
      if (bonuses.militaryMultipliers.health > 1) html += `<span class="bonus-value">❤️ ×${bonuses.militaryMultipliers.health.toFixed(2)}</span>`;
      if (bonuses.militaryMultipliers.casualtyReduction > 0) html += `<span class="bonus-value">🎖️ -${(bonuses.militaryMultipliers.casualtyReduction * 100).toFixed(0)}% casualties</span>`;
      html += '</div>';
    }

    if (hasOtherBonuses) {
      html += '<div class="bonus-group"><span class="bonus-group-label">Other Bonuses:</span>';
      if (bonuses.researchSpeedMultiplier > 1) html += `<span class="bonus-value">⏱️ ×${bonuses.researchSpeedMultiplier.toFixed(2)} research</span>`;
      if (bonuses.startingResources > 0) html += `<span class="bonus-value">📦 +${bonuses.startingResources} starting</span>`;
      if (bonuses.techRetention > 0) html += `<span class="bonus-value">🧬 ${(bonuses.techRetention * 100).toFixed(0)}% tech kept</span>`;
      if (bonuses.legacyPointsMultiplier > 1) html += `<span class="bonus-value">✨ ×${bonuses.legacyPointsMultiplier.toFixed(2)} legacy</span>`;
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  private renderSkillCard(skill: Skill, skillLevels: Map<string, number>): string {
    const currentLevel = getSkillLevel(skill.id, skillLevels);
    const isMaxed = currentLevel >= skill.maxLevel;
    const cost = getSkillCost(skill, currentLevel);
    const canUnlock = canUnlockSkill(skill, skillLevels);
    const hasPoints = this.game.state.skillTree.legacyPoints >= cost;
    const canUpgrade = canUnlock && hasPoints && !isMaxed;

    // Calculate effect display
    let effectDisplay = '';
    const currentEffect = getSkillEffect(skill, currentLevel);
    const nextEffect = getSkillEffect(skill, currentLevel + 1);
    
    if (skill.effects.type === 'multiplier') {
      if (currentLevel > 0) {
        effectDisplay = `×${currentEffect.toFixed(2)}`;
        if (!isMaxed) effectDisplay += ` → ×${nextEffect.toFixed(2)}`;
      } else {
        effectDisplay = `→ ×${nextEffect.toFixed(2)}`;
      }
    } else {
      if (currentLevel > 0) {
        effectDisplay = `+${currentEffect.toFixed(1)}`;
        if (!isMaxed) effectDisplay += ` → +${nextEffect.toFixed(1)}`;
      } else {
        effectDisplay = `→ +${nextEffect.toFixed(1)}`;
      }
    }

    // Check prerequisites display
    let prereqDisplay = '';
    if (skill.prerequisites.length > 0 && !canUnlock) {
      const prereqNames = skill.prerequisites.map(id => {
        const prereqSkill = getSkillById(id);
        return prereqSkill ? prereqSkill.name : id;
      }).join(', ');
      prereqDisplay = `<span class="skill-prereq">Requires: ${prereqNames}</span>`;
    }

    let statusClass = 'locked';
    if (isMaxed) statusClass = 'maxed';
    else if (canUpgrade) statusClass = 'available';
    else if (canUnlock) statusClass = 'affordable';

    return `
      <div class="skill-card ${statusClass}">
        <div class="skill-header">
          <span class="skill-icon">${skill.icon}</span>
          <h5>${skill.name}</h5>
          <span class="skill-level">${currentLevel}/${skill.maxLevel}</span>
        </div>
        <p class="skill-desc">${skill.description}</p>
        <div class="skill-effect">
          <span class="effect-label">Effect:</span>
          <span class="effect-value">${effectDisplay}</span>
        </div>
        ${prereqDisplay}
        ${!isMaxed ? `
          <div class="skill-cost">
            <span>Cost: ✨ ${cost}</span>
          </div>
          <button class="skill-btn" data-skill="${skill.id}" ${!canUpgrade ? 'disabled' : ''}>
            ${canUnlock ? (hasPoints ? 'Upgrade' : 'Need Points') : 'Locked'}
          </button>
        ` : `
          <div class="skill-maxed">
            <span>✓ Maxed</span>
          </div>
        `}
      </div>
    `;
  }

  private renderLegacyMilestones(): string {
    const { skillTree } = this.game.state;
    let html = `
      <div class="legacy-milestones">
        <h3>🏆 Legacy Milestones</h3>
        <p>Complete milestones to earn legacy points!</p>
        <div class="milestone-grid">
    `;

    for (const milestone of LEGACY_MILESTONES) {
      const isCompleted = skillTree.completedMilestones.has(milestone.id);
      const completionCount = skillTree.milestoneCompletionCounts.get(milestone.id) || 0;
      const canComplete = this.checkMilestoneCondition(milestone);

      html += `
        <div class="milestone-card ${isCompleted ? 'completed' : ''} ${canComplete && !isCompleted ? 'available' : ''}">
          <div class="milestone-header">
            <span class="milestone-icon">${milestone.icon}</span>
            <h5>${milestone.name}</h5>
          </div>
          <p class="milestone-desc">${milestone.description}</p>
          <div class="milestone-reward">
            <span>Reward: ✨ ${milestone.legacyPoints} Legacy Points</span>
          </div>
          ${milestone.repeatable ? `<span class="milestone-repeatable">Repeatable (Completed: ${completionCount}×)</span>` : ''}
          ${isCompleted && !milestone.repeatable ? '<span class="milestone-complete-badge">✓ Completed</span>' : ''}
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  private checkMilestoneCondition(milestone: { condition: { type: string; target: string | number; amount: number } }): boolean {
    const condition = milestone.condition;
    const stats = this.game.state.statistics;
    
    switch (condition.type) {
      case 'era_reached':
        return this.game.hasReachedEra(condition.target as string);
      case 'battles_won':
        return stats.battlesWon >= condition.amount;
      case 'territories_conquered':
        return (stats.territoriesConquered || 0) >= condition.amount;
      case 'techs_researched':
        return this.game.state.researchedTechs.size >= condition.amount;
      case 'buildings_built':
        return (stats.totalBuildingsConstructed || 0) >= condition.amount;
      default:
        return false;
    }
  }

  private updateSkillsTab(): void {
    const container = document.getElementById('skills-content');
    if (!container) {
      this.renderSkillsTab();
      return;
    }

    // Check if skill state changed
    const { skillTree } = this.game.state;
    let totalLevels = 0;
    skillTree.skillLevels.forEach(level => { totalLevels += level; });
    const versionKey = `${skillTree.legacyPoints}-${totalLevels}-${skillTree.completedMilestones.size}`;
    const lastVersion = this.tabContentVersions.get('skills');

    if (lastVersion === undefined || lastVersion !== versionKey) {
      this.tabContentVersions.set('skills', versionKey);
      this.renderSkillsTab();
      return;
    }

    // Update legacy points display
    const legacyValue = container.querySelector('.legacy-value');
    if (legacyValue) {
      legacyValue.textContent = skillTree.legacyPoints.toString();
    }

    // Update skill button states
    const skillButtons = container.querySelectorAll('.skill-btn') as NodeListOf<HTMLButtonElement>;
    skillButtons.forEach(btn => {
      const skillId = btn.dataset.skill;
      if (skillId) {
        const skill = getSkillById(skillId);
        if (skill) {
          const currentLevel = getSkillLevel(skill.id, skillTree.skillLevels);
          const isMaxed = currentLevel >= skill.maxLevel;
          const cost = getSkillCost(skill, currentLevel);
          const canUnlock = canUnlockSkill(skill, skillTree.skillLevels);
          const hasPoints = skillTree.legacyPoints >= cost;
          const canUpgrade = canUnlock && hasPoints && !isMaxed;
          btn.disabled = !canUpgrade;
        }
      }
    });
  }

  // ===== World & Lore Tab =====
  
  renderWorldTab(): void {
    const container = document.getElementById('world-content');
    if (!container) return;

    const { lore } = this.game.state;
    const currentCiv = getCivilizationById(lore.selectedCivilization);
    const currentLeader = lore.selectedLeader ? getLeaderById(lore.selectedLeader) : null;

    let html = '';

    // Civilization Overview
    html += this.renderCivilizationSection(currentCiv, currentLeader, lore);
    
    // Leaders Section
    html += this.renderLeadersSection(currentLeader, lore);
    
    // Religion Section
    html += this.renderReligionSection(lore);
    
    // Natural Wonders Section
    html += this.renderNaturalWondersSection(lore);
    
    // Cultural Policies Section
    html += this.renderCulturalPoliciesSection(lore);

    container.innerHTML = html;
  }

  private renderCivilizationSection(currentCiv: Civilization | undefined, currentLeader: Leader | null | undefined, lore: typeof this.game.state.lore): string {
    let html = `
      <div class="world-section civilization-section">
        <h3>🏛️ Your Civilization</h3>
        ${currentCiv ? `
          <div class="current-civ-display">
            <span class="civ-icon">${currentCiv.icon}</span>
            <div class="civ-details">
              <h4>${currentCiv.name}</h4>
              <p>${currentCiv.description}</p>
              ${currentCiv.bonuses.specialAbility ? `<span class="special-ability">✨ ${currentCiv.bonuses.specialAbility}</span>` : ''}
            </div>
          </div>
          ${currentLeader ? `
            <div class="current-leader-display">
              <span class="leader-icon">${currentLeader.icon}</span>
              <div class="leader-details">
                <h5>${currentLeader.name} - ${currentLeader.title}</h5>
                <p>${currentLeader.description}</p>
                <span class="special-ability">✨ ${currentLeader.bonuses.specialAbility}</span>
              </div>
            </div>
          ` : '<p class="no-leader">No leader selected. Choose a leader below!</p>'}
        ` : ''}
        
        <h4>Choose Your Civilization</h4>
        <div class="civ-grid">
    `;

    for (const civ of CIVILIZATIONS) {
      const isSelected = civ.id === lore.selectedCivilization;
      const bonusText = this.getCivBonusText(civ);
      
      html += `
        <div class="civ-card ${isSelected ? 'selected' : ''}">
          <div class="civ-header">
            <span class="civ-icon">${civ.icon}</span>
            <h5>${civ.name}</h5>
          </div>
          <p class="civ-desc">${civ.description}</p>
          <div class="civ-bonuses">${bonusText}</div>
          ${civ.bonuses.specialAbility ? `<span class="civ-special">✨ ${civ.bonuses.specialAbility}</span>` : ''}
          <button class="civ-btn ${isSelected ? 'selected' : ''}" 
                  data-civilization="${civ.id}"
                  ${isSelected ? 'disabled' : ''}>
            ${isSelected ? '✓ Selected' : 'Select'}
          </button>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  private getCivBonusText(civ: Civilization): string {
    const bonuses: string[] = [];
    if (civ.bonuses.resourceMultipliers) {
      if (civ.bonuses.resourceMultipliers.food && civ.bonuses.resourceMultipliers.food > 1) {
        bonuses.push(`🍖 ×${civ.bonuses.resourceMultipliers.food.toFixed(2)}`);
      }
      if (civ.bonuses.resourceMultipliers.wood && civ.bonuses.resourceMultipliers.wood > 1) {
        bonuses.push(`🪵 ×${civ.bonuses.resourceMultipliers.wood.toFixed(2)}`);
      }
      if (civ.bonuses.resourceMultipliers.stone && civ.bonuses.resourceMultipliers.stone > 1) {
        bonuses.push(`🪨 ×${civ.bonuses.resourceMultipliers.stone.toFixed(2)}`);
      }
      if (civ.bonuses.resourceMultipliers.gold && civ.bonuses.resourceMultipliers.gold > 1) {
        bonuses.push(`💰 ×${civ.bonuses.resourceMultipliers.gold.toFixed(2)}`);
      }
      if (civ.bonuses.resourceMultipliers.science && civ.bonuses.resourceMultipliers.science > 1) {
        bonuses.push(`🔬 ×${civ.bonuses.resourceMultipliers.science.toFixed(2)}`);
      }
    }
    if (civ.bonuses.militaryBonuses) {
      if (civ.bonuses.militaryBonuses.attack && civ.bonuses.militaryBonuses.attack > 1) {
        bonuses.push(`⚔️ ×${civ.bonuses.militaryBonuses.attack.toFixed(2)}`);
      }
      if (civ.bonuses.militaryBonuses.defense && civ.bonuses.militaryBonuses.defense > 1) {
        bonuses.push(`🛡️ ×${civ.bonuses.militaryBonuses.defense.toFixed(2)}`);
      }
    }
    return bonuses.length > 0 ? bonuses.join(' ') : 'No special bonuses';
  }

  private renderLeadersSection(currentLeader: Leader | null | undefined, lore: typeof this.game.state.lore): string {
    const availableLeaders = this.game.getAvailableLeaders();
    
    let html = `
      <div class="world-section leaders-section">
        <h3>👑 Historical Leaders</h3>
        <p>Choose a leader to guide your civilization. More leaders unlock as you advance through eras.</p>
        <div class="leader-grid">
    `;

    if (availableLeaders.length === 0) {
      html += '<p class="empty-message">No leaders available yet. Keep progressing!</p>';
    } else {
      for (const leader of availableLeaders) {
        const isSelected = leader.id === lore.selectedLeader;
        
        html += `
          <div class="leader-card ${isSelected ? 'selected' : ''}">
            <div class="leader-header">
              <span class="leader-icon">${leader.icon}</span>
              <div>
                <h5>${leader.name}</h5>
                <span class="leader-title">${leader.title}</span>
              </div>
            </div>
            <p class="leader-desc">${leader.description}</p>
            <span class="leader-ability">✨ ${leader.bonuses.specialAbility}</span>
            <button class="leader-btn ${isSelected ? 'selected' : ''}"
                    data-leader="${leader.id}"
                    ${isSelected ? 'disabled' : ''}>
              ${isSelected ? '✓ Selected' : 'Select Leader'}
            </button>
          </div>
        `;
      }
    }

    html += '</div></div>';
    return html;
  }

  private renderReligionSection(lore: typeof this.game.state.lore): string {
    let html = `
      <div class="world-section religion-section">
        <h3>🙏 Religion</h3>
    `;

    if (lore.foundedReligion) {
      const religion = lore.foundedReligion;
      html += `
        <div class="founded-religion">
          <div class="religion-header">
            <span class="religion-icon">${religion.icon}</span>
            <div>
              <h4>${religion.name}</h4>
              <span class="follower-count">${religion.followers} followers</span>
            </div>
          </div>
          <p class="religion-desc">${religion.description}</p>
          <span class="religion-ability">✨ ${religion.bonuses.specialAbility}</span>
        </div>
      `;
    } else {
      html += `
        <p>Found a religion to gain permanent bonuses for your civilization.</p>
        <div class="religion-grid">
      `;

      for (const template of RELIGION_TEMPLATES) {
        html += `
          <div class="religion-card">
            <div class="religion-header">
              <span class="religion-icon">${template.icon}</span>
              <h5>${template.name}</h5>
            </div>
            <p class="religion-desc">${template.description}</p>
            <span class="religion-ability">✨ ${template.bonuses.specialAbility}</span>
            <button class="religion-btn" data-religion="${template.id}">
              Found Religion
            </button>
          </div>
        `;
      }

      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  private renderNaturalWondersSection(lore: typeof this.game.state.lore): string {
    const discoveredWonders = this.game.getDiscoveredWonders();
    
    let html = `
      <div class="world-section wonders-section">
        <h3>🌍 Natural Wonders</h3>
        <p>Explore the world to discover natural wonders that provide permanent bonuses.</p>
        <button id="explore-wonder-btn" class="explore-btn">🔍 Explore for Wonders</button>
        
        <h4>Discovered Wonders (${discoveredWonders.length}/${NATURAL_WONDERS.length})</h4>
        <div class="wonder-grid">
    `;

    if (discoveredWonders.length === 0) {
      html += '<p class="empty-message">No wonders discovered yet. Keep exploring!</p>';
    } else {
      for (const wonder of discoveredWonders) {
        const bonusText = this.getWonderBonusText(wonder);
        html += `
          <div class="wonder-card discovered">
            <div class="wonder-header">
              <span class="wonder-icon">${wonder.icon}</span>
              <h5>${wonder.name}</h5>
            </div>
            <p class="wonder-desc">${wonder.description}</p>
            <div class="wonder-bonuses">${bonusText}</div>
            ${wonder.bonuses.specialEffect ? `<span class="wonder-effect">✨ ${wonder.bonuses.specialEffect}</span>` : ''}
          </div>
        `;
      }
    }

    html += '</div></div>';
    return html;
  }

  private getWonderBonusText(wonder: NaturalWonder): string {
    const bonuses: string[] = [];
    if (wonder.bonuses.flatBonuses) {
      for (const bonus of wonder.bonuses.flatBonuses) {
        const emoji = this.getResourceEmoji(bonus.resource);
        bonuses.push(`${emoji} +${bonus.amount}/s`);
      }
    }
    if (wonder.bonuses.resourceMultiplier) {
      const emoji = this.getResourceEmoji(wonder.bonuses.resourceMultiplier.resource);
      bonuses.push(`${emoji} ×${wonder.bonuses.resourceMultiplier.multiplier.toFixed(2)}`);
    }
    return bonuses.length > 0 ? bonuses.join(' ') : 'Special effects only';
  }

  private renderCulturalPoliciesSection(lore: typeof this.game.state.lore): string {
    const adoptedPolicies = this.game.getAdoptedPolicies();
    const availablePolicies = this.game.getAvailablePolicies();
    
    let html = `
      <div class="world-section culture-section">
        <h3>🎭 Cultural Policies</h3>
        <div class="culture-overview">
          <div class="culture-points">
            <span class="culture-icon">🎨</span>
            <span class="culture-label">Culture Points:</span>
            <span class="culture-value">${Math.floor(lore.culturePoints)}</span>
          </div>
          <div class="culture-level">
            <span>Culture Level: ${lore.cultureLevel}</span>
          </div>
        </div>
        
        <h4>Adopted Policies (${adoptedPolicies.length}/${CULTURAL_POLICIES.length})</h4>
        <div class="adopted-policies">
    `;

    if (adoptedPolicies.length === 0) {
      html += '<p class="empty-message">No policies adopted yet.</p>';
    } else {
      for (const policy of adoptedPolicies) {
        html += `
          <div class="policy-card adopted">
            <span class="policy-icon">${policy.icon}</span>
            <div class="policy-info">
              <h5>${policy.name}</h5>
              <p>${policy.description}</p>
              ${policy.effects.special ? `<span class="policy-effect">✨ ${policy.effects.special}</span>` : ''}
            </div>
          </div>
        `;
      }
    }

    html += `
        </div>
        
        <h4>Available Policies</h4>
        <div class="policy-grid">
    `;

    if (availablePolicies.length === 0) {
      html += '<p class="empty-message">All policies adopted!</p>';
    } else {
      for (const policy of availablePolicies) {
        const canAdopt = canAdoptPolicy(policy.id, lore.culturePoints, lore.adoptedPolicies);
        html += `
          <div class="policy-card ${canAdopt ? 'available' : 'locked'}">
            <div class="policy-header">
              <span class="policy-icon">${policy.icon}</span>
              <h5>${policy.name}</h5>
            </div>
            <p class="policy-desc">${policy.description}</p>
            ${policy.effects.special ? `<span class="policy-effect">✨ ${policy.effects.special}</span>` : ''}
            <div class="policy-cost">Cost: 🎨 ${policy.cost}</div>
            <button class="policy-btn ${canAdopt ? '' : 'disabled'}"
                    data-policy="${policy.id}"
                    ${canAdopt ? '' : 'disabled'}>
              ${canAdopt ? 'Adopt Policy' : 'Need More Culture'}
            </button>
          </div>
        `;
      }
    }

    html += '</div></div>';
    return html;
  }

  updateWorldTab(): void {
    const container = document.getElementById('world-content');
    if (!container) {
      this.renderWorldTab();
      return;
    }

    const { lore } = this.game.state;
    const discoveredCount = lore.discoveredWonders.size;
    const policiesCount = lore.adoptedPolicies.size;
    const hasReligion = lore.foundedReligion ? 1 : 0;

    const versionKey = `${lore.selectedCivilization}-${lore.selectedLeader}-${discoveredCount}-${policiesCount}-${hasReligion}`;
    const lastVersion = this.tabContentVersions.get('world');

    if (lastVersion === undefined || lastVersion !== versionKey) {
      this.tabContentVersions.set('world', versionKey);
      this.renderWorldTab();
      return;
    }

    // Update culture points display
    const cultureValue = container.querySelector('.culture-value');
    if (cultureValue) {
      cultureValue.textContent = Math.floor(lore.culturePoints).toString();
    }

    // Update policy button states
    const policyButtons = container.querySelectorAll('.policy-btn') as NodeListOf<HTMLButtonElement>;
    policyButtons.forEach(btn => {
      const policyId = btn.dataset.policy;
      if (policyId) {
        const canAdopt = canAdoptPolicy(policyId, lore.culturePoints, lore.adoptedPolicies);
        btn.disabled = !canAdopt;
      }
    });
  }

  // ===== Military Tab =====
  
  private renderMilitaryTab(): void {
    const container = document.getElementById('military-content');
    if (!container) return;

    let html = '';

    // Military Overview
    html += this.renderMilitaryOverview();
    
    // Formations Section
    html += this.renderFormationsSection();
    
    // Unit Upgrades Section
    html += this.renderUnitUpgradesSection();
    
    // Heroes Section
    html += this.renderHeroesSection();
    
    // Defense Section
    html += this.renderDefenseSection();
    
    // Naval Forces Section
    html += this.renderNavalSection();
    
    // Siege Weapons Section
    html += this.renderSiegeSection();
    
    // Military Traditions Section
    html += this.renderTraditionsSection();
    
    // Espionage Section
    html += this.renderEspionageSection();

    container.innerHTML = html;
  }

  private renderMilitaryOverview(): string {
    const totalPower = this.game.getTotalMilitaryPower();
    const formation = this.game.getCurrentFormation();
    const activeHero = this.game.getActiveHero();
    const traditionBonuses = this.game.getTraditionBonuses();
    const defenseBonuses = this.game.getDefenseBonuses();
    const navalPower = this.game.getNavalPower();
    const siegePower = this.game.getSiegePower();

    return `
      <div class="military-section">
        <h3>📊 Military Overview</h3>
        <div class="military-overview">
          <div class="military-stat">
            <span class="military-stat-icon">⚔️</span>
            <span class="military-stat-value">${totalPower.attack}</span>
            <span class="military-stat-label">Total Attack</span>
          </div>
          <div class="military-stat">
            <span class="military-stat-icon">🛡️</span>
            <span class="military-stat-value">${totalPower.defense}</span>
            <span class="military-stat-label">Total Defense</span>
          </div>
          <div class="military-stat">
            <span class="military-stat-icon">❤️</span>
            <span class="military-stat-value">${totalPower.health}</span>
            <span class="military-stat-label">Total Health</span>
          </div>
          <div class="military-stat">
            <span class="military-stat-icon">${formation?.icon || '⚔️'}</span>
            <span class="military-stat-value">${formation?.name || 'Standard'}</span>
            <span class="military-stat-label">Formation</span>
          </div>
          <div class="military-stat">
            <span class="military-stat-icon">${activeHero?.icon || '❌'}</span>
            <span class="military-stat-value">${activeHero?.name || 'None'}</span>
            <span class="military-stat-label">Active Hero</span>
          </div>
          <div class="military-stat">
            <span class="military-stat-icon">🏰</span>
            <span class="military-stat-value">+${defenseBonuses.defense}</span>
            <span class="military-stat-label">Defense Bonus</span>
          </div>
          <div class="military-stat">
            <span class="military-stat-icon">⚓</span>
            <span class="military-stat-value">${navalPower.attack}</span>
            <span class="military-stat-label">Naval Power</span>
          </div>
          <div class="military-stat">
            <span class="military-stat-icon">💣</span>
            <span class="military-stat-value">${siegePower.siegeBonus}</span>
            <span class="military-stat-label">Siege Bonus</span>
          </div>
        </div>
        ${traditionBonuses.attackMultiplier > 1 || traditionBonuses.defenseMultiplier > 1 ? `
          <div class="tradition-bonuses-summary">
            <h4>Tradition Bonuses Active:</h4>
            <span>
              ${traditionBonuses.attackMultiplier > 1 ? `⚔️ ×${traditionBonuses.attackMultiplier.toFixed(2)}` : ''}
              ${traditionBonuses.defenseMultiplier > 1 ? `🛡️ ×${traditionBonuses.defenseMultiplier.toFixed(2)}` : ''}
              ${traditionBonuses.healthMultiplier > 1 ? `❤️ ×${traditionBonuses.healthMultiplier.toFixed(2)}` : ''}
              ${traditionBonuses.casualtyReduction > 0 ? `🎖️ -${(traditionBonuses.casualtyReduction * 100).toFixed(0)}% casualties` : ''}
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderFormationsSection(): string {
    const availableFormations = this.game.getAvailableFormations();
    const currentFormation = this.game.state.military.selectedFormation;

    let html = `
      <div class="military-section">
        <h3>⚔️ Combat Formations</h3>
        <p>Choose a formation to modify your army's combat effectiveness.</p>
        <div class="formation-grid">
    `;

    for (const formation of availableFormations) {
      const isActive = formation.id === currentFormation;
      
      html += `
        <div class="formation-card ${isActive ? 'active' : ''}" data-formation="${formation.id}">
          <div class="formation-header">
            <span class="formation-icon">${formation.icon}</span>
            <span class="formation-name">${formation.name}</span>
          </div>
          <p class="formation-desc">${formation.description}</p>
          <div class="formation-stats">
            <span class="formation-stat ${formation.attackModifier >= 1 ? 'positive' : 'negative'}">
              ⚔️ ${formation.attackModifier >= 1 ? '+' : ''}${((formation.attackModifier - 1) * 100).toFixed(0)}%
            </span>
            <span class="formation-stat ${formation.defenseModifier >= 1 ? 'positive' : 'negative'}">
              🛡️ ${formation.defenseModifier >= 1 ? '+' : ''}${((formation.defenseModifier - 1) * 100).toFixed(0)}%
            </span>
            <span class="formation-stat ${formation.healthModifier >= 1 ? 'positive' : 'negative'}">
              ❤️ ${formation.healthModifier >= 1 ? '+' : ''}${((formation.healthModifier - 1) * 100).toFixed(0)}%
            </span>
          </div>
          ${formation.specialEffect ? `<span class="formation-special">✨ ${formation.specialEffect}</span>` : ''}
          ${isActive ? '<span class="badge">✓ Active</span>' : ''}
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  private renderUnitUpgradesSection(): string {
    const availableUpgrades = this.game.getAvailableUnitUpgrades();
    
    let html = `
      <div class="military-section">
        <h3>⬆️ Unit Upgrades</h3>
        <p>Upgrade your existing units to more powerful versions.</p>
    `;

    if (availableUpgrades.length === 0) {
      html += '<p class="empty-message">No unit upgrades available. Train units and research technologies to unlock upgrades.</p>';
    } else {
      html += '<div class="upgrade-grid">';
      for (const upgrade of availableUpgrades) {
        html += `
          <div class="upgrade-card available">
            <h5>${upgrade.name}</h5>
            <p class="upgrade-desc">${upgrade.description}</p>
            <div class="upgrade-arrow">
              <span class="upgrade-from">${this.getTroopName(upgrade.fromUnit)}</span>
              <span>→</span>
              <span class="upgrade-to">${this.getTroopName(upgrade.toUnit)}</span>
            </div>
            <div class="upgrade-cost">
              <span>🍖 ${upgrade.cost.food}</span>
              <span>💰 ${upgrade.cost.gold}</span>
              <span>🔬 ${upgrade.cost.science}</span>
            </div>
            <button class="upgrade-btn" data-upgrade="${upgrade.id}">Upgrade</button>
          </div>
        `;
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  private getTroopName(troopId: string): string {
    const troop = getTroopTypeById(troopId);
    return troop ? troop.name : troopId;
  }

  private renderHeroesSection(): string {
    const availableHeroes = this.game.getAvailableHeroes();
    const recruitedHeroes = this.game.getRecruitedHeroes();
    const activeHeroId = this.game.state.military.activeHero;

    let html = `
      <div class="military-section">
        <h3>👑 Heroes & Generals</h3>
        <p>Recruit legendary commanders to lead your armies.</p>
    `;

    // Recruited Heroes
    if (recruitedHeroes.length > 0) {
      html += '<h4>Your Heroes</h4><div class="hero-grid">';
      for (const hero of recruitedHeroes) {
        const isActive = hero.id === activeHeroId;
        html += `
          <div class="hero-card recruited ${isActive ? 'active' : ''}">
            <div class="hero-header">
              <span class="hero-icon">${hero.icon}</span>
              <div class="hero-info">
                <h5>${hero.name}</h5>
                <span class="hero-title">${hero.title}</span>
              </div>
            </div>
            <p class="hero-desc">${hero.description}</p>
            <div class="hero-bonuses">
              <span class="hero-bonus">⚔️ +${hero.bonuses.attackBonus}</span>
              <span class="hero-bonus">🛡️ +${hero.bonuses.defenseBonus}</span>
              <span class="hero-bonus">❤️ +${hero.bonuses.healthBonus}</span>
            </div>
            <span class="hero-ability">✨ ${hero.bonuses.specialAbility}</span>
            <button class="hero-btn set-active" data-hero="${hero.id}" ${isActive ? 'disabled' : ''}>
              ${isActive ? '✓ Active' : 'Set Active'}
            </button>
          </div>
        `;
      }
      html += '</div>';
    }

    // Available Heroes to Recruit
    if (availableHeroes.length > 0) {
      html += '<h4>Available Heroes</h4><div class="hero-grid">';
      for (const hero of availableHeroes) {
        const canAfford = this.game.state.resources.gold >= hero.cost.gold && 
                          this.game.state.resources.science >= hero.cost.science;
        html += `
          <div class="hero-card ${canAfford ? 'available' : ''}">
            <div class="hero-header">
              <span class="hero-icon">${hero.icon}</span>
              <div class="hero-info">
                <h5>${hero.name}</h5>
                <span class="hero-title">${hero.title}</span>
              </div>
            </div>
            <p class="hero-desc">${hero.description}</p>
            <div class="hero-bonuses">
              <span class="hero-bonus">⚔️ +${hero.bonuses.attackBonus}</span>
              <span class="hero-bonus">🛡️ +${hero.bonuses.defenseBonus}</span>
              <span class="hero-bonus">❤️ +${hero.bonuses.healthBonus}</span>
            </div>
            <span class="hero-ability">✨ ${hero.bonuses.specialAbility}</span>
            <div class="hero-cost">
              <span>💰 ${hero.cost.gold}</span>
              <span>🔬 ${hero.cost.science}</span>
            </div>
            <button class="hero-btn recruit" data-hero="${hero.id}" ${!canAfford ? 'disabled' : ''}>
              Recruit
            </button>
          </div>
        `;
      }
      html += '</div>';
    }

    if (availableHeroes.length === 0 && recruitedHeroes.length === 0) {
      html += '<p class="empty-message">No heroes available. Research technologies to unlock heroes.</p>';
    }

    html += '</div>';
    return html;
  }

  private renderDefenseSection(): string {
    const availableStructures = this.game.getAvailableDefenseStructures();
    const defenseBuildings = this.game.state.military.defenseBuildings;
    const constructionQueue = this.game.state.military.defenseConstructionQueue;

    let html = `
      <div class="military-section">
        <h3>🏰 Defense Structures</h3>
        <p>Build fortifications to protect your civilization.</p>
    `;

    // Construction queue
    if (constructionQueue.length > 0) {
      html += '<h4>Under Construction</h4><div class="military-queue">';
      const now = Date.now();
      for (const construction of constructionQueue) {
        const structure = getDefenseStructureById(construction.typeId);
        if (structure) {
          const remaining = Math.max(0, (construction.endTime - now) / 1000);
          html += `
            <div class="military-queue-item">
              <span>${structure.icon} ${structure.name}</span>
              <span>${remaining.toFixed(1)}s</span>
            </div>
          `;
        }
      }
      html += '</div>';
    }

    // Available structures
    if (availableStructures.length > 0) {
      html += '<div class="defense-grid">';
      for (const structure of availableStructures) {
        const currentCount = defenseBuildings.find(b => b.typeId === structure.id)?.count || 0;
        const atMax = currentCount >= structure.maxCount;
        const canBuild = !atMax && 
          this.game.state.resources.food >= structure.cost.food &&
          this.game.state.resources.wood >= structure.cost.wood &&
          this.game.state.resources.stone >= structure.cost.stone &&
          this.game.state.resources.gold >= structure.cost.gold;

        html += `
          <div class="defense-card ${canBuild ? 'available' : ''} ${atMax ? 'maxed' : ''}">
            <div class="defense-header">
              <h5>${structure.icon} ${structure.name}</h5>
              <span class="defense-count">${currentCount}/${structure.maxCount}</span>
            </div>
            <p class="defense-desc">${structure.description}</p>
            <div class="defense-bonuses">
              <span>🛡️ +${structure.defenseBonus}</span>
              <span>❤️ +${structure.healthBonus}</span>
            </div>
            <div class="defense-cost">
              ${structure.cost.food > 0 ? `<span>🍖 ${structure.cost.food}</span>` : ''}
              ${structure.cost.wood > 0 ? `<span>🪵 ${structure.cost.wood}</span>` : ''}
              ${structure.cost.stone > 0 ? `<span>🪨 ${structure.cost.stone}</span>` : ''}
              ${structure.cost.gold > 0 ? `<span>💰 ${structure.cost.gold}</span>` : ''}
            </div>
            <p class="build-time">⏱️ ${structure.buildTime}s</p>
            <button class="build-defense-btn" data-defense="${structure.id}" ${!canBuild || atMax ? 'disabled' : ''}>
              ${atMax ? 'Max Built' : 'Build'}
            </button>
          </div>
        `;
      }
      html += '</div>';
    } else {
      html += '<p class="empty-message">No defense structures available. Research technologies to unlock.</p>';
    }

    html += '</div>';
    return html;
  }

  private renderNavalSection(): string {
    const availableNaval = this.game.getAvailableNavalUnits();
    const navy = this.game.state.military.navy;
    const trainingQueue = this.game.state.military.navalTrainingQueue;

    let html = `
      <div class="military-section">
        <h3>⚓ Naval Forces</h3>
        <p>Build a fleet to dominate the seas.</p>
    `;

    // Naval Power Summary
    const navalPower = this.game.getNavalPower();
    if (navy.length > 0) {
      html += `
        <div class="naval-summary">
          <span>Fleet Power: ⚔️ ${navalPower.attack} | 🛡️ ${navalPower.defense} | ❤️ ${navalPower.health}</span>
        </div>
      `;
    }

    // Training queue
    if (trainingQueue.length > 0) {
      html += '<h4>Shipyard Queue</h4><div class="military-queue">';
      const now = Date.now();
      for (const training of trainingQueue) {
        const unit = getNavalUnitById(training.typeId);
        if (unit) {
          const remaining = Math.max(0, (training.endTime - now) / 1000);
          html += `
            <div class="military-queue-item">
              <span>${unit.icon} ${unit.name}</span>
              <span>${remaining.toFixed(1)}s</span>
            </div>
          `;
        }
      }
      html += '</div>';
    }

    // Current Navy
    if (navy.length > 0) {
      html += '<h4>Your Fleet</h4><div class="naval-grid">';
      for (const ship of navy) {
        const unit = getNavalUnitById(ship.typeId);
        if (unit) {
          html += `
            <div class="naval-card">
              <div class="naval-header">
                <span class="naval-icon">${unit.icon}</span>
                <h5>${unit.name} (×${ship.count})</h5>
              </div>
              <div class="naval-stats">
                <span>⚔️ ${unit.stats.attack * ship.count}</span>
                <span>🛡️ ${unit.stats.defense * ship.count}</span>
                <span>❤️ ${unit.stats.health * ship.count}</span>
              </div>
            </div>
          `;
        }
      }
      html += '</div>';
    }

    // Available Ships to Build
    if (availableNaval.length > 0) {
      html += '<h4>Build Ships</h4><div class="naval-grid">';
      for (const unit of availableNaval) {
        const canTrain = this.game.state.resources.food >= unit.cost.food &&
                         this.game.state.resources.wood >= unit.cost.wood &&
                         this.game.state.resources.gold >= unit.cost.gold;

        html += `
          <div class="naval-card ${canTrain ? 'available' : ''}">
            <div class="naval-header">
              <span class="naval-icon">${unit.icon}</span>
              <h5>${unit.name}</h5>
            </div>
            <p class="naval-desc">${unit.description}</p>
            <div class="naval-stats">
              <span>⚔️ ${unit.stats.attack}</span>
              <span>🛡️ ${unit.stats.defense}</span>
              <span>❤️ ${unit.stats.health}</span>
            </div>
            <div class="naval-cost">
              <span>🍖 ${unit.cost.food}</span>
              <span>🪵 ${unit.cost.wood}</span>
              <span>💰 ${unit.cost.gold}</span>
            </div>
            <p class="train-time">⏱️ ${unit.trainTime}s</p>
            <button class="train-naval-btn" data-naval="${unit.id}" ${!canTrain ? 'disabled' : ''}>
              Build
            </button>
          </div>
        `;
      }
      html += '</div>';
    } else {
      html += '<p class="empty-message">No naval units available. Research technologies to unlock.</p>';
    }

    html += '</div>';
    return html;
  }

  private renderSiegeSection(): string {
    const availableSiege = this.game.getAvailableSiegeWeapons();
    const siegeWeapons = this.game.state.military.siegeWeapons;
    const trainingQueue = this.game.state.military.siegeTrainingQueue;

    let html = `
      <div class="military-section">
        <h3>💣 Siege Weapons</h3>
        <p>Build siege equipment to breach enemy fortifications.</p>
    `;

    // Siege Power Summary
    const siegePower = this.game.getSiegePower();
    if (siegeWeapons.length > 0) {
      html += `
        <div class="siege-summary">
          <span>Siege Power: ⚔️ ${siegePower.attack} | 💥 +${siegePower.siegeBonus} siege bonus</span>
        </div>
      `;
    }

    // Training queue
    if (trainingQueue.length > 0) {
      html += '<h4>Workshop Queue</h4><div class="military-queue">';
      const now = Date.now();
      for (const training of trainingQueue) {
        const weapon = getSiegeWeaponById(training.typeId);
        if (weapon) {
          const remaining = Math.max(0, (training.endTime - now) / 1000);
          html += `
            <div class="military-queue-item">
              <span>${weapon.icon} ${weapon.name}</span>
              <span>${remaining.toFixed(1)}s</span>
            </div>
          `;
        }
      }
      html += '</div>';
    }

    // Current Siege Weapons
    if (siegeWeapons.length > 0) {
      html += '<h4>Your Arsenal</h4><div class="siege-grid">';
      for (const weapon of siegeWeapons) {
        const unit = getSiegeWeaponById(weapon.typeId);
        if (unit) {
          html += `
            <div class="siege-card">
              <div class="siege-header">
                <span class="siege-icon">${unit.icon}</span>
                <h5>${unit.name} (×${weapon.count})</h5>
              </div>
              <div class="siege-stats">
                <span>⚔️ ${unit.stats.attack * weapon.count}</span>
                <span>💥 +${unit.stats.siegeBonus * weapon.count}</span>
              </div>
            </div>
          `;
        }
      }
      html += '</div>';
    }

    // Available Siege Weapons to Build
    if (availableSiege.length > 0) {
      html += '<h4>Build Siege Weapons</h4><div class="siege-grid">';
      for (const weapon of availableSiege) {
        const canTrain = this.game.state.resources.food >= weapon.cost.food &&
                         this.game.state.resources.wood >= weapon.cost.wood &&
                         this.game.state.resources.stone >= weapon.cost.stone &&
                         this.game.state.resources.gold >= weapon.cost.gold;

        html += `
          <div class="siege-card ${canTrain ? 'available' : ''}">
            <div class="siege-header">
              <span class="siege-icon">${weapon.icon}</span>
              <h5>${weapon.name}</h5>
            </div>
            <p class="siege-desc">${weapon.description}</p>
            <div class="siege-stats">
              <span>⚔️ ${weapon.stats.attack}</span>
              <span>💥 +${weapon.stats.siegeBonus}</span>
            </div>
            <div class="siege-cost">
              ${weapon.cost.food > 0 ? `<span>🍖 ${weapon.cost.food}</span>` : ''}
              ${weapon.cost.wood > 0 ? `<span>🪵 ${weapon.cost.wood}</span>` : ''}
              ${weapon.cost.stone > 0 ? `<span>🪨 ${weapon.cost.stone}</span>` : ''}
              ${weapon.cost.gold > 0 ? `<span>💰 ${weapon.cost.gold}</span>` : ''}
            </div>
            <p class="train-time">⏱️ ${weapon.trainTime}s</p>
            <button class="train-siege-btn" data-siege="${weapon.id}" ${!canTrain ? 'disabled' : ''}>
              Build
            </button>
          </div>
        `;
      }
      html += '</div>';
    } else {
      html += '<p class="empty-message">No siege weapons available. Research technologies to unlock.</p>';
    }

    html += '</div>';
    return html;
  }

  private renderTraditionsSection(): string {
    const unlockedTraditions = this.game.getUnlockedTraditions();
    const stats = {
      battlesWon: this.game.state.statistics.battlesWon,
      territoriesConquered: this.game.state.statistics.territoriesConquered || 0,
      heroesRecruited: this.game.state.statistics.heroesRecruited || 0,
      veteranUnits: 0, // Would need to track this
    };

    let html = `
      <div class="military-section">
        <h3>🎖️ Military Traditions</h3>
        <p>Earn permanent combat bonuses through military achievements.</p>
        <div class="traditions-grid">
    `;

    for (const tradition of MILITARY_TRADITIONS) {
      const isUnlocked = unlockedTraditions.some(t => t.id === tradition.id);
      const canUnlock = checkTraditionUnlock(tradition, stats);
      
      // Build requirement text
      let reqText = '';
      if (tradition.requirement.battlesWon) reqText = `Win ${tradition.requirement.battlesWon} battles (${stats.battlesWon}/${tradition.requirement.battlesWon})`;
      if (tradition.requirement.territoriesConquered) reqText = `Conquer ${tradition.requirement.territoriesConquered} territories (${stats.territoriesConquered}/${tradition.requirement.territoriesConquered})`;
      if (tradition.requirement.heroesRecruited) reqText = `Recruit ${tradition.requirement.heroesRecruited} heroes (${stats.heroesRecruited}/${tradition.requirement.heroesRecruited})`;
      if (tradition.requirement.veteranUnits) reqText = `Have ${tradition.requirement.veteranUnits} veteran units`;

      html += `
        <div class="tradition-card ${isUnlocked ? 'unlocked' : ''}">
          <div class="tradition-header">
            <span class="tradition-icon">${tradition.icon}</span>
            <h5>${tradition.name}</h5>
          </div>
          <p class="tradition-desc">${tradition.description}</p>
          <span class="tradition-bonus">${tradition.bonuses.special}</span>
          <span class="tradition-requirement ${canUnlock ? 'met' : ''}">${reqText}</span>
          ${isUnlocked ? '<span class="badge">✓ Unlocked</span>' : ''}
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  private renderEspionageSection(): string {
    const spies = this.game.state.military.spies;
    const maxSpies = this.game.state.military.maxSpies;
    const availableMissions = this.game.getAvailableSpyMissions();
    const spyCost = 500 * (spies.length + 1);
    const canRecruit = spies.length < maxSpies && this.game.state.resources.gold >= spyCost;

    let html = `
      <div class="military-section">
        <h3>🕵️ Espionage</h3>
        <p>Recruit spies for sabotage, theft, and intelligence gathering.</p>
        
        <div class="spy-overview">
          <span>Spies: ${spies.length}/${maxSpies}</span>
          <button class="recruit-spy-btn" id="recruit-spy-btn" ${!canRecruit ? 'disabled' : ''}>
            Recruit Spy (💰 ${spyCost})
          </button>
        </div>
    `;

    // Current Spies
    if (spies.length > 0) {
      html += '<h4>Your Agents</h4><div class="spy-grid">';
      for (const spy of spies) {
        const isBusy = spy.currentMission !== null;
        html += `
          <div class="spy-card ${isBusy ? 'busy' : ''}">
            <div class="spy-header">
              <span class="spy-name">🕵️ ${spy.name}</span>
              <span class="spy-level">Lvl ${spy.level}</span>
            </div>
            <span class="spy-status ${isBusy ? 'on-mission' : ''}">
              ${isBusy ? '🔄 On Mission' : '✓ Available'}
            </span>
          </div>
        `;
      }
      html += '</div>';
    }

    // Available Missions
    if (availableMissions.length > 0 && spies.some(s => !s.currentMission)) {
      html += '<h4>Available Missions</h4><div class="spy-mission-grid">';
      const availableSpy = spies.find(s => !s.currentMission);
      
      for (const mission of availableMissions) {
        const canAfford = this.game.state.resources.gold >= mission.cost.gold;
        html += `
          <div class="spy-mission-card ${canAfford ? 'available' : ''}">
            <div class="mission-header">
              <span class="mission-icon">${mission.icon}</span>
              <h5>${mission.name}</h5>
            </div>
            <p class="mission-desc">${mission.description}</p>
            <div class="mission-stats">
              <span>⏱️ ${mission.duration}s</span>
              <span>🎯 ${Math.floor(mission.successChance * 100)}%</span>
              <span>💰 ${mission.cost.gold}</span>
            </div>
            <button class="spy-mission-btn" 
                    data-spy="${availableSpy?.id || ''}" 
                    data-mission="${mission.id}"
                    ${!canAfford || !availableSpy ? 'disabled' : ''}>
              Start Mission
            </button>
          </div>
        `;
      }
      html += '</div>';
    } else if (spies.length === 0) {
      html += '<p class="empty-message">Recruit spies to start espionage missions.</p>';
    } else if (!spies.some(s => !s.currentMission)) {
      html += '<p class="empty-message">All spies are currently on missions.</p>';
    } else if (availableMissions.length === 0) {
      html += '<p class="empty-message">No spy missions available. Research technologies to unlock.</p>';
    }

    html += '</div>';
    return html;
  }

  private updateMilitaryTab(): void {
    const container = document.getElementById('military-content');
    if (!container) {
      this.renderMilitaryTab();
      return;
    }

    // Check if military state changed significantly
    const { military } = this.game.state;
    const heroCount = military.recruitedHeroes.size;
    const defenseCount = military.defenseBuildings.reduce((sum, b) => sum + b.count, 0);
    const navalCount = military.navy.reduce((sum, n) => sum + n.count, 0);
    const siegeCount = military.siegeWeapons.reduce((sum, s) => sum + s.count, 0);
    const traditionCount = military.unlockedTraditions.size;
    const spyCount = military.spies.length;
    const queueLength = military.defenseConstructionQueue.length + military.navalTrainingQueue.length + military.siegeTrainingQueue.length;

    const versionKey = `${military.selectedFormation}-${heroCount}-${defenseCount}-${navalCount}-${siegeCount}-${traditionCount}-${spyCount}-${queueLength}`;
    const lastVersion = this.tabContentVersions.get('military');

    if (lastVersion === undefined || lastVersion !== versionKey) {
      this.tabContentVersions.set('military', versionKey);
      this.renderMilitaryTab();
      return;
    }

    // Minor updates (e.g., button states) would go here
  }
}
