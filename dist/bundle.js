"use strict";
(() => {
  // dist/eras.js
  var ERAS = [
    {
      id: "stone_age",
      name: "Stone Age",
      description: "The dawn of civilization. Gather basic resources to survive.",
      requiredResearch: null,
      resources: {
        food: { baseRate: 1 },
        wood: { baseRate: 1 },
        stone: { baseRate: 0.5 },
        gold: { baseRate: 0 },
        science: { baseRate: 0.1 }
      }
    },
    {
      id: "bronze_age",
      name: "Bronze Age",
      description: "Metal tools revolutionize your civilization.",
      requiredResearch: "bronze_working",
      resources: {
        food: { baseRate: 2 },
        wood: { baseRate: 2 },
        stone: { baseRate: 1 },
        gold: { baseRate: 0.5 },
        science: { baseRate: 0.5 }
      }
    },
    {
      id: "iron_age",
      name: "Iron Age",
      description: "Iron strengthens your tools and weapons.",
      requiredResearch: "iron_working",
      resources: {
        food: { baseRate: 3 },
        wood: { baseRate: 3 },
        stone: { baseRate: 2 },
        gold: { baseRate: 1 },
        science: { baseRate: 1 }
      }
    },
    {
      id: "classical_age",
      name: "Classical Age",
      description: "Philosophy and culture flourish.",
      requiredResearch: "philosophy",
      resources: {
        food: { baseRate: 4 },
        wood: { baseRate: 4 },
        stone: { baseRate: 3 },
        gold: { baseRate: 2 },
        science: { baseRate: 2 }
      }
    },
    {
      id: "medieval_age",
      name: "Medieval Age",
      description: "Castles and knights dominate the land.",
      requiredResearch: "feudalism",
      resources: {
        food: { baseRate: 5 },
        wood: { baseRate: 5 },
        stone: { baseRate: 4 },
        gold: { baseRate: 3 },
        science: { baseRate: 3 }
      }
    },
    {
      id: "renaissance",
      name: "Renaissance",
      description: "Art, science, and exploration reach new heights.",
      requiredResearch: "printing_press",
      resources: {
        food: { baseRate: 7 },
        wood: { baseRate: 6 },
        stone: { baseRate: 5 },
        gold: { baseRate: 5 },
        science: { baseRate: 5 }
      }
    },
    {
      id: "industrial_age",
      name: "Industrial Age",
      description: "Machines transform production.",
      requiredResearch: "steam_power",
      resources: {
        food: { baseRate: 10 },
        wood: { baseRate: 8 },
        stone: { baseRate: 8 },
        gold: { baseRate: 8 },
        science: { baseRate: 8 }
      }
    },
    {
      id: "modern_age",
      name: "Modern Age",
      description: "Electricity and automobiles change everything.",
      requiredResearch: "electricity",
      resources: {
        food: { baseRate: 15 },
        wood: { baseRate: 12 },
        stone: { baseRate: 12 },
        gold: { baseRate: 15 },
        science: { baseRate: 15 }
      }
    },
    {
      id: "atomic_age",
      name: "Atomic Age",
      description: "Nuclear power and the space race.",
      requiredResearch: "nuclear_fission",
      resources: {
        food: { baseRate: 20 },
        wood: { baseRate: 15 },
        stone: { baseRate: 15 },
        gold: { baseRate: 25 },
        science: { baseRate: 25 }
      }
    },
    {
      id: "information_age",
      name: "Information Age",
      description: "Computers and the internet connect the world.",
      requiredResearch: "computing",
      resources: {
        food: { baseRate: 25 },
        wood: { baseRate: 18 },
        stone: { baseRate: 18 },
        gold: { baseRate: 40 },
        science: { baseRate: 50 }
      }
    },
    {
      id: "future_age",
      name: "Future Age",
      description: "Advanced AI and space colonization await.",
      requiredResearch: "artificial_intelligence",
      resources: {
        food: { baseRate: 50 },
        wood: { baseRate: 30 },
        stone: { baseRate: 30 },
        gold: { baseRate: 100 },
        science: { baseRate: 100 }
      }
    }
  ];
  function getEraById(id) {
    return ERAS.find((era) => era.id === id);
  }
  function getNextEra(currentEraId) {
    const currentIndex = ERAS.findIndex((era) => era.id === currentEraId);
    if (currentIndex === -1 || currentIndex === ERAS.length - 1) {
      return void 0;
    }
    return ERAS[currentIndex + 1];
  }

  // dist/research.js
  var TECHNOLOGIES = [
    // Stone Age
    {
      id: "hunting",
      name: "Hunting",
      description: "Learn to hunt animals for food.",
      era: "stone_age",
      cost: { science: 10 },
      prerequisites: [],
      effects: { resourceBonus: { resource: "food", multiplier: 1.5 }, unitUnlock: "hunter" }
    },
    {
      id: "stone_tools",
      name: "Stone Tools",
      description: "Craft basic tools from stone.",
      era: "stone_age",
      cost: { science: 15 },
      prerequisites: [],
      effects: { resourceBonus: { resource: "stone", multiplier: 1.5 } }
    },
    {
      id: "fire",
      name: "Fire Making",
      description: "Master the art of creating fire.",
      era: "stone_age",
      cost: { science: 20 },
      prerequisites: ["hunting"],
      effects: { resourceBonus: { resource: "food", multiplier: 1.3 } }
    },
    {
      id: "agriculture",
      name: "Agriculture",
      description: "Cultivate crops for sustainable food.",
      era: "stone_age",
      cost: { science: 30 },
      prerequisites: ["fire", "stone_tools"],
      effects: { resourceBonus: { resource: "food", multiplier: 2 } }
    },
    {
      id: "bronze_working",
      name: "Bronze Working",
      description: "Unlock the Bronze Age with metal tools.",
      era: "stone_age",
      cost: { science: 50 },
      prerequisites: ["agriculture"],
      effects: { unlocks: ["bronze_age"], unitUnlock: "warrior" }
    },
    // Bronze Age
    {
      id: "writing",
      name: "Writing",
      description: "Record knowledge for future generations.",
      era: "bronze_age",
      cost: { science: 80 },
      prerequisites: ["bronze_working"],
      effects: { resourceBonus: { resource: "science", multiplier: 1.5 } }
    },
    {
      id: "wheel",
      name: "The Wheel",
      description: "Revolutionary transportation technology.",
      era: "bronze_age",
      cost: { science: 100 },
      prerequisites: ["bronze_working"],
      effects: { resourceBonus: { resource: "gold", multiplier: 1.5 }, unitUnlock: "chariot" }
    },
    {
      id: "pottery",
      name: "Pottery",
      description: "Store goods and food more efficiently.",
      era: "bronze_age",
      cost: { science: 70 },
      prerequisites: ["bronze_working"],
      effects: { resourceBonus: { resource: "food", multiplier: 1.3 } }
    },
    {
      id: "iron_working",
      name: "Iron Working",
      description: "Unlock the Iron Age with stronger metals.",
      era: "bronze_age",
      cost: { science: 150 },
      prerequisites: ["writing", "wheel"],
      effects: { unlocks: ["iron_age"], unitUnlock: "swordsman" }
    },
    // Iron Age
    {
      id: "mathematics",
      name: "Mathematics",
      description: "Advanced calculations boost science.",
      era: "iron_age",
      cost: { science: 200 },
      prerequisites: ["iron_working"],
      effects: { resourceBonus: { resource: "science", multiplier: 1.5 } }
    },
    {
      id: "currency",
      name: "Currency",
      description: "Standardized money improves trade.",
      era: "iron_age",
      cost: { science: 180 },
      prerequisites: ["iron_working"],
      effects: { resourceBonus: { resource: "gold", multiplier: 2 } }
    },
    {
      id: "construction",
      name: "Construction",
      description: "Build larger structures.",
      era: "iron_age",
      cost: { science: 220 },
      prerequisites: ["mathematics"],
      effects: { resourceBonus: { resource: "stone", multiplier: 1.5 } }
    },
    {
      id: "philosophy",
      name: "Philosophy",
      description: "Unlock the Classical Age with deep thinking.",
      era: "iron_age",
      cost: { science: 300 },
      prerequisites: ["mathematics", "currency"],
      effects: { unlocks: ["classical_age"], resourceBonus: { resource: "science", multiplier: 1.3 } }
    },
    // Classical Age
    {
      id: "engineering",
      name: "Engineering",
      description: "Advanced construction techniques.",
      era: "classical_age",
      cost: { science: 400 },
      prerequisites: ["philosophy", "construction"],
      effects: { resourceBonus: { resource: "stone", multiplier: 2 } }
    },
    {
      id: "horseback_riding",
      name: "Horseback Riding",
      description: "Mount horses for faster movement.",
      era: "classical_age",
      cost: { science: 350 },
      prerequisites: ["philosophy"],
      effects: { unitUnlock: "horseman" }
    },
    {
      id: "iron_casting",
      name: "Iron Casting",
      description: "Improved metalworking techniques.",
      era: "classical_age",
      cost: { science: 380 },
      prerequisites: ["engineering"],
      effects: { unitUnlock: "legionary" }
    },
    {
      id: "feudalism",
      name: "Feudalism",
      description: "Unlock the Medieval Age.",
      era: "classical_age",
      cost: { science: 500 },
      prerequisites: ["engineering", "horseback_riding"],
      effects: { unlocks: ["medieval_age"], unitUnlock: "knight" }
    },
    // Medieval Age
    {
      id: "metal_casting",
      name: "Metal Casting",
      description: "Mass produce metal goods.",
      era: "medieval_age",
      cost: { science: 600 },
      prerequisites: ["feudalism"],
      effects: { resourceBonus: { resource: "gold", multiplier: 1.5 } }
    },
    {
      id: "machinery",
      name: "Machinery",
      description: "Mechanical devices improve production.",
      era: "medieval_age",
      cost: { science: 650 },
      prerequisites: ["metal_casting"],
      effects: { resourceBonus: { resource: "wood", multiplier: 2 } }
    },
    {
      id: "gunpowder",
      name: "Gunpowder",
      description: "Explosive new military technology.",
      era: "medieval_age",
      cost: { science: 700 },
      prerequisites: ["metal_casting"],
      effects: { unitUnlock: "musketeer" }
    },
    {
      id: "printing_press",
      name: "Printing Press",
      description: "Unlock the Renaissance with mass communication.",
      era: "medieval_age",
      cost: { science: 800 },
      prerequisites: ["machinery", "gunpowder"],
      effects: { unlocks: ["renaissance"], resourceBonus: { resource: "science", multiplier: 2 } }
    },
    // Renaissance
    {
      id: "astronomy",
      name: "Astronomy",
      description: "Study the stars and navigation.",
      era: "renaissance",
      cost: { science: 1e3 },
      prerequisites: ["printing_press"],
      effects: { resourceBonus: { resource: "science", multiplier: 1.5 } }
    },
    {
      id: "banking",
      name: "Banking",
      description: "Advanced financial systems.",
      era: "renaissance",
      cost: { science: 1100 },
      prerequisites: ["printing_press"],
      effects: { resourceBonus: { resource: "gold", multiplier: 2 } }
    },
    {
      id: "military_science",
      name: "Military Science",
      description: "Organized military tactics.",
      era: "renaissance",
      cost: { science: 1200 },
      prerequisites: ["astronomy"],
      effects: { unitUnlock: "rifleman" }
    },
    {
      id: "steam_power",
      name: "Steam Power",
      description: "Unlock the Industrial Age.",
      era: "renaissance",
      cost: { science: 1500 },
      prerequisites: ["banking", "military_science"],
      effects: { unlocks: ["industrial_age"] }
    },
    // Industrial Age
    {
      id: "industrialization",
      name: "Industrialization",
      description: "Factory production methods.",
      era: "industrial_age",
      cost: { science: 2e3 },
      prerequisites: ["steam_power"],
      effects: { resourceBonus: { resource: "gold", multiplier: 2 } }
    },
    {
      id: "railroad",
      name: "Railroad",
      description: "Efficient transportation networks.",
      era: "industrial_age",
      cost: { science: 2200 },
      prerequisites: ["steam_power"],
      effects: { resourceBonus: { resource: "food", multiplier: 1.5 } }
    },
    {
      id: "dynamite",
      name: "Dynamite",
      description: "Powerful explosives for mining and warfare.",
      era: "industrial_age",
      cost: { science: 2400 },
      prerequisites: ["industrialization"],
      effects: { unitUnlock: "artillery" }
    },
    {
      id: "electricity",
      name: "Electricity",
      description: "Unlock the Modern Age.",
      era: "industrial_age",
      cost: { science: 3e3 },
      prerequisites: ["railroad", "dynamite"],
      effects: { unlocks: ["modern_age"] }
    },
    // Modern Age
    {
      id: "radio",
      name: "Radio",
      description: "Wireless communication.",
      era: "modern_age",
      cost: { science: 4e3 },
      prerequisites: ["electricity"],
      effects: { resourceBonus: { resource: "science", multiplier: 1.5 } }
    },
    {
      id: "combustion",
      name: "Combustion Engine",
      description: "Vehicles revolutionize transport.",
      era: "modern_age",
      cost: { science: 4500 },
      prerequisites: ["electricity"],
      effects: { unitUnlock: "tank" }
    },
    {
      id: "flight",
      name: "Flight",
      description: "Take to the skies.",
      era: "modern_age",
      cost: { science: 5e3 },
      prerequisites: ["combustion"],
      effects: { unitUnlock: "fighter" }
    },
    {
      id: "nuclear_fission",
      name: "Nuclear Fission",
      description: "Unlock the Atomic Age.",
      era: "modern_age",
      cost: { science: 6e3 },
      prerequisites: ["radio", "flight"],
      effects: { unlocks: ["atomic_age"] }
    },
    // Atomic Age
    {
      id: "rocketry",
      name: "Rocketry",
      description: "Launch into space.",
      era: "atomic_age",
      cost: { science: 8e3 },
      prerequisites: ["nuclear_fission"],
      effects: { unitUnlock: "rocket_artillery" }
    },
    {
      id: "nuclear_power",
      name: "Nuclear Power",
      description: "Clean energy from atoms.",
      era: "atomic_age",
      cost: { science: 9e3 },
      prerequisites: ["nuclear_fission"],
      effects: { resourceBonus: { resource: "gold", multiplier: 2 } }
    },
    {
      id: "satellites",
      name: "Satellites",
      description: "Eyes in the sky.",
      era: "atomic_age",
      cost: { science: 1e4 },
      prerequisites: ["rocketry"],
      effects: { resourceBonus: { resource: "science", multiplier: 2 } }
    },
    {
      id: "computing",
      name: "Computing",
      description: "Unlock the Information Age.",
      era: "atomic_age",
      cost: { science: 12e3 },
      prerequisites: ["satellites", "nuclear_power"],
      effects: { unlocks: ["information_age"] }
    },
    // Information Age
    {
      id: "internet",
      name: "Internet",
      description: "Global network of information.",
      era: "information_age",
      cost: { science: 15e3 },
      prerequisites: ["computing"],
      effects: { resourceBonus: { resource: "science", multiplier: 2 } }
    },
    {
      id: "robotics",
      name: "Robotics",
      description: "Automated machines.",
      era: "information_age",
      cost: { science: 18e3 },
      prerequisites: ["computing"],
      effects: { unitUnlock: "mech_infantry" }
    },
    {
      id: "cloud_computing",
      name: "Cloud Computing",
      description: "Earn resources even while offline. Your civilization continues to grow while you are away!",
      era: "information_age",
      cost: { science: 16e3 },
      prerequisites: ["internet"],
      effects: { specialUnlock: "offline_progress" }
    },
    {
      id: "nanotechnology",
      name: "Nanotechnology",
      description: "Microscopic engineering.",
      era: "information_age",
      cost: { science: 2e4 },
      prerequisites: ["internet", "robotics"],
      effects: { resourceBonus: { resource: "gold", multiplier: 2 } }
    },
    {
      id: "artificial_intelligence",
      name: "Artificial Intelligence",
      description: "Unlock the Future Age.",
      era: "information_age",
      cost: { science: 25e3 },
      prerequisites: ["nanotechnology"],
      effects: { unlocks: ["future_age"] }
    },
    // Future Age
    {
      id: "quantum_computing",
      name: "Quantum Computing",
      description: "Computing at the quantum level.",
      era: "future_age",
      cost: { science: 35e3 },
      prerequisites: ["artificial_intelligence"],
      effects: { resourceBonus: { resource: "science", multiplier: 3 } }
    },
    {
      id: "fusion_power",
      name: "Fusion Power",
      description: "Unlimited clean energy.",
      era: "future_age",
      cost: { science: 4e4 },
      prerequisites: ["artificial_intelligence"],
      effects: { resourceBonus: { resource: "gold", multiplier: 3 } }
    },
    {
      id: "space_colonization",
      name: "Space Colonization",
      description: "Expand to the stars.",
      era: "future_age",
      cost: { science: 5e4 },
      prerequisites: ["quantum_computing", "fusion_power"],
      effects: { unitUnlock: "space_marine" }
    },
    {
      id: "singularity",
      name: "Technological Singularity",
      description: "The ultimate achievement of civilization.",
      era: "future_age",
      cost: { science: 1e5 },
      prerequisites: ["space_colonization"],
      effects: { resourceBonus: { resource: "science", multiplier: 10 } }
    }
  ];
  function getTechById(id) {
    return TECHNOLOGIES.find((tech) => tech.id === id);
  }
  function canResearch(techId, researchedTechs, science) {
    const tech = getTechById(techId);
    if (!tech)
      return false;
    if (researchedTechs.has(techId))
      return false;
    for (const prereq of tech.prerequisites) {
      if (!researchedTechs.has(prereq))
        return false;
    }
    return science >= tech.cost.science;
  }

  // dist/barracks.js
  var TROOP_TYPES = [
    // Stone Age
    {
      id: "hunter",
      name: "Hunter",
      description: "Basic ranged unit with primitive weapons.",
      era: "stone_age",
      unlockTech: "hunting",
      cost: { food: 30, gold: 0 },
      trainTime: 5,
      stats: { attack: 3, defense: 1, health: 20 }
    },
    // Bronze Age
    {
      id: "warrior",
      name: "Warrior",
      description: "Melee fighter with bronze weapons.",
      era: "bronze_age",
      unlockTech: "bronze_working",
      cost: { food: 50, gold: 10 },
      trainTime: 8,
      stats: { attack: 6, defense: 4, health: 40 }
    },
    {
      id: "chariot",
      name: "War Chariot",
      description: "Fast mobile unit.",
      era: "bronze_age",
      unlockTech: "wheel",
      cost: { food: 40, gold: 30, wood: 50 },
      trainTime: 12,
      stats: { attack: 8, defense: 2, health: 30 }
    },
    // Iron Age
    {
      id: "swordsman",
      name: "Swordsman",
      description: "Skilled fighter with iron sword.",
      era: "iron_age",
      unlockTech: "iron_working",
      cost: { food: 60, gold: 25 },
      trainTime: 10,
      stats: { attack: 10, defense: 6, health: 50 }
    },
    // Classical Age
    {
      id: "horseman",
      name: "Horseman",
      description: "Mounted cavalry unit.",
      era: "classical_age",
      unlockTech: "horseback_riding",
      cost: { food: 80, gold: 40 },
      trainTime: 15,
      stats: { attack: 12, defense: 4, health: 45 }
    },
    {
      id: "legionary",
      name: "Legionary",
      description: "Elite heavy infantry.",
      era: "classical_age",
      unlockTech: "iron_casting",
      cost: { food: 70, gold: 35 },
      trainTime: 12,
      stats: { attack: 11, defense: 10, health: 60 }
    },
    // Medieval Age
    {
      id: "knight",
      name: "Knight",
      description: "Heavily armored mounted warrior.",
      era: "medieval_age",
      unlockTech: "feudalism",
      cost: { food: 100, gold: 80 },
      trainTime: 20,
      stats: { attack: 18, defense: 14, health: 80 }
    },
    {
      id: "musketeer",
      name: "Musketeer",
      description: "Soldier armed with a musket.",
      era: "medieval_age",
      unlockTech: "gunpowder",
      cost: { food: 90, gold: 60 },
      trainTime: 15,
      stats: { attack: 22, defense: 8, health: 55 }
    },
    // Renaissance
    {
      id: "rifleman",
      name: "Rifleman",
      description: "Soldier with advanced rifle.",
      era: "renaissance",
      unlockTech: "military_science",
      cost: { food: 100, gold: 70 },
      trainTime: 12,
      stats: { attack: 28, defense: 10, health: 60 }
    },
    // Industrial Age
    {
      id: "artillery",
      name: "Artillery",
      description: "Powerful ranged siege weapon.",
      era: "industrial_age",
      unlockTech: "dynamite",
      cost: { food: 80, gold: 150, stone: 100 },
      trainTime: 25,
      stats: { attack: 45, defense: 5, health: 50 }
    },
    // Modern Age
    {
      id: "tank",
      name: "Tank",
      description: "Armored fighting vehicle.",
      era: "modern_age",
      unlockTech: "combustion",
      cost: { food: 100, gold: 250 },
      trainTime: 30,
      stats: { attack: 55, defense: 35, health: 120 }
    },
    {
      id: "fighter",
      name: "Fighter",
      description: "Military aircraft.",
      era: "modern_age",
      unlockTech: "flight",
      cost: { food: 80, gold: 300 },
      trainTime: 25,
      stats: { attack: 65, defense: 20, health: 80 }
    },
    // Atomic Age
    {
      id: "rocket_artillery",
      name: "Rocket Artillery",
      description: "Long-range rocket launcher.",
      era: "atomic_age",
      unlockTech: "rocketry",
      cost: { food: 100, gold: 400 },
      trainTime: 30,
      stats: { attack: 80, defense: 10, health: 70 }
    },
    // Information Age
    {
      id: "mech_infantry",
      name: "Mechanized Infantry",
      description: "Soldiers with powered exoskeletons.",
      era: "information_age",
      unlockTech: "robotics",
      cost: { food: 120, gold: 500 },
      trainTime: 20,
      stats: { attack: 70, defense: 50, health: 150 }
    },
    // Future Age
    {
      id: "space_marine",
      name: "Space Marine",
      description: "Elite soldier for space combat.",
      era: "future_age",
      unlockTech: "space_colonization",
      cost: { food: 150, gold: 800 },
      trainTime: 25,
      stats: { attack: 100, defense: 80, health: 200 }
    }
  ];
  function getTroopTypeById(id) {
    return TROOP_TYPES.find((troop) => troop.id === id);
  }
  function canTrainTroop(troopId, unlockedTroops, resources) {
    const troopType = getTroopTypeById(troopId);
    if (!troopType)
      return false;
    if (!unlockedTroops.has(troopId))
      return false;
    if (resources.food < troopType.cost.food)
      return false;
    if (resources.gold < troopType.cost.gold)
      return false;
    if (troopType.cost.wood && resources.wood < troopType.cost.wood)
      return false;
    if (troopType.cost.stone && resources.stone < troopType.cost.stone)
      return false;
    return true;
  }
  function calculateArmyPower(troops) {
    let totalAttack = 0;
    let totalDefense = 0;
    let totalHealth = 0;
    for (const troop of troops) {
      const troopType = getTroopTypeById(troop.typeId);
      if (troopType) {
        totalAttack += troopType.stats.attack * troop.count;
        totalDefense += troopType.stats.defense * troop.count;
        totalHealth += troopType.stats.health * troop.count;
      }
    }
    return { attack: totalAttack, defense: totalDefense, health: totalHealth };
  }

  // dist/combat.js
  var DEFENSE_MITIGATION_FACTOR = 0.3;
  var MAX_BATTLE_ROUNDS = 50;
  var DAMAGE_RANDOM_MIN = 0.8;
  var DAMAGE_RANDOM_RANGE = 0.4;
  function generateMissions() {
    const missions = [];
    missions.push({
      id: "stone_wolves",
      name: "Wolf Pack",
      description: "A pack of wolves threatens your village. Defend your people!",
      era: "stone_age",
      enemyArmy: {
        name: "Wolf Pack",
        troops: [],
        attack: 5,
        defense: 2,
        health: 30
      },
      rewards: { food: 50, wood: 20, stone: 10, gold: 0, science: 5 },
      unlocked: true
    });
    missions.push({
      id: "stone_raiders",
      name: "Rival Tribe Raiders",
      description: "A rival tribe is raiding your supplies. Fight them off!",
      era: "stone_age",
      enemyArmy: {
        name: "Tribal Raiders",
        troops: [],
        attack: 10,
        defense: 5,
        health: 60
      },
      rewards: { food: 100, wood: 50, stone: 30, gold: 0, science: 10 },
      unlocked: true
    });
    missions.push({
      id: "bronze_bandits",
      name: "Bronze Bandits",
      description: "Bandits with bronze weapons attack your trade routes.",
      era: "bronze_age",
      enemyArmy: {
        name: "Bronze Bandits",
        troops: [],
        attack: 25,
        defense: 15,
        health: 120
      },
      rewards: { food: 150, wood: 100, stone: 80, gold: 50, science: 30 },
      unlocked: true
    });
    missions.push({
      id: "bronze_warlord",
      name: "Warlord's Army",
      description: "A warlord seeks to conquer your lands with his chariot army.",
      era: "bronze_age",
      enemyArmy: {
        name: "Warlord's Forces",
        troops: [],
        attack: 40,
        defense: 20,
        health: 180
      },
      rewards: { food: 250, wood: 150, stone: 120, gold: 100, science: 50 },
      unlocked: true
    });
    missions.push({
      id: "iron_invaders",
      name: "Iron Invaders",
      description: "An invading army with iron weapons threatens your borders.",
      era: "iron_age",
      enemyArmy: {
        name: "Iron Invaders",
        troops: [],
        attack: 60,
        defense: 40,
        health: 300
      },
      rewards: { food: 400, wood: 250, stone: 200, gold: 200, science: 100 },
      unlocked: true
    });
    missions.push({
      id: "iron_empire",
      name: "Empire Strike",
      description: "The neighboring empire sends its legions against you.",
      era: "iron_age",
      enemyArmy: {
        name: "Imperial Legion",
        troops: [],
        attack: 90,
        defense: 60,
        health: 450
      },
      rewards: { food: 600, wood: 400, stone: 300, gold: 350, science: 150 },
      unlocked: true
    });
    missions.push({
      id: "classical_horde",
      name: "Barbarian Horde",
      description: "A massive barbarian horde approaches your civilization.",
      era: "classical_age",
      enemyArmy: {
        name: "Barbarian Horde",
        troops: [],
        attack: 120,
        defense: 70,
        health: 600
      },
      rewards: { food: 800, wood: 500, stone: 400, gold: 500, science: 200 },
      unlocked: true
    });
    missions.push({
      id: "classical_rivals",
      name: "Rival Kingdom",
      description: "The rival kingdom declares war. Defend your honor!",
      era: "classical_age",
      enemyArmy: {
        name: "Royal Army",
        troops: [],
        attack: 160,
        defense: 100,
        health: 800
      },
      rewards: { food: 1e3, wood: 700, stone: 500, gold: 700, science: 300 },
      unlocked: true
    });
    missions.push({
      id: "medieval_siege",
      name: "Castle Siege",
      description: "Enemy forces besiege your castle. Hold the walls!",
      era: "medieval_age",
      enemyArmy: {
        name: "Siege Army",
        troops: [],
        attack: 200,
        defense: 150,
        health: 1e3
      },
      rewards: { food: 1500, wood: 1e3, stone: 800, gold: 1e3, science: 400 },
      unlocked: true
    });
    missions.push({
      id: "medieval_crusade",
      name: "Holy Crusade",
      description: "A crusading army marches against your lands.",
      era: "medieval_age",
      enemyArmy: {
        name: "Crusader Army",
        troops: [],
        attack: 280,
        defense: 200,
        health: 1400
      },
      rewards: { food: 2e3, wood: 1500, stone: 1200, gold: 1500, science: 600 },
      unlocked: true
    });
    missions.push({
      id: "renaissance_pirates",
      name: "Pirate Invasion",
      description: "Pirates raid your coastal cities with advanced weaponry.",
      era: "renaissance",
      enemyArmy: {
        name: "Pirate Fleet",
        troops: [],
        attack: 350,
        defense: 200,
        health: 1800
      },
      rewards: { food: 3e3, wood: 2e3, stone: 1500, gold: 2500, science: 800 },
      unlocked: true
    });
    missions.push({
      id: "renaissance_empire",
      name: "Colonial War",
      description: "A colonial empire threatens your independence.",
      era: "renaissance",
      enemyArmy: {
        name: "Colonial Army",
        troops: [],
        attack: 450,
        defense: 280,
        health: 2400
      },
      rewards: { food: 4e3, wood: 3e3, stone: 2e3, gold: 3500, science: 1200 },
      unlocked: true
    });
    missions.push({
      id: "industrial_revolution",
      name: "Revolution Forces",
      description: "Revolutionary forces threaten to overthrow your government.",
      era: "industrial_age",
      enemyArmy: {
        name: "Revolutionary Army",
        troops: [],
        attack: 600,
        defense: 350,
        health: 3e3
      },
      rewards: { food: 6e3, wood: 4e3, stone: 3e3, gold: 5e3, science: 2e3 },
      unlocked: true
    });
    missions.push({
      id: "industrial_invasion",
      name: "Great War",
      description: "A great power declares total war against your nation.",
      era: "industrial_age",
      enemyArmy: {
        name: "War Machine",
        troops: [],
        attack: 800,
        defense: 500,
        health: 4e3
      },
      rewards: { food: 8e3, wood: 6e3, stone: 4e3, gold: 7e3, science: 3e3 },
      unlocked: true
    });
    missions.push({
      id: "modern_conflict",
      name: "Regional Conflict",
      description: "A regional power challenges your military supremacy.",
      era: "modern_age",
      enemyArmy: {
        name: "Modern Army",
        troops: [],
        attack: 1e3,
        defense: 600,
        health: 5e3
      },
      rewards: { food: 1e4, wood: 7e3, stone: 5e3, gold: 1e4, science: 5e3 },
      unlocked: true
    });
    missions.push({
      id: "modern_superpower",
      name: "Superpower Clash",
      description: "Face the military might of a global superpower.",
      era: "modern_age",
      enemyArmy: {
        name: "Superpower Forces",
        troops: [],
        attack: 1400,
        defense: 900,
        health: 7e3
      },
      rewards: { food: 15e3, wood: 1e4, stone: 8e3, gold: 15e3, science: 8e3 },
      unlocked: true
    });
    missions.push({
      id: "atomic_crisis",
      name: "Nuclear Crisis",
      description: "A nuclear-armed enemy threatens global destruction.",
      era: "atomic_age",
      enemyArmy: {
        name: "Nuclear Forces",
        troops: [],
        attack: 2e3,
        defense: 1200,
        health: 1e4
      },
      rewards: { food: 2e4, wood: 15e3, stone: 12e3, gold: 25e3, science: 12e3 },
      unlocked: true
    });
    missions.push({
      id: "atomic_world_war",
      name: "World War III",
      description: "The final conflict. Win or face extinction.",
      era: "atomic_age",
      enemyArmy: {
        name: "World Coalition",
        troops: [],
        attack: 3e3,
        defense: 1800,
        health: 15e3
      },
      rewards: { food: 3e4, wood: 25e3, stone: 2e4, gold: 4e4, science: 2e4 },
      unlocked: true
    });
    missions.push({
      id: "info_cyber",
      name: "Cyber Warfare",
      description: "A cyber-enhanced army attacks your infrastructure.",
      era: "information_age",
      enemyArmy: {
        name: "Cyber Army",
        troops: [],
        attack: 4e3,
        defense: 2500,
        health: 2e4
      },
      rewards: { food: 4e4, wood: 3e4, stone: 25e3, gold: 6e4, science: 35e3 },
      unlocked: true
    });
    missions.push({
      id: "info_ai_uprising",
      name: "AI Uprising",
      description: "Rogue AI systems control an army of machines.",
      era: "information_age",
      enemyArmy: {
        name: "Machine Army",
        troops: [],
        attack: 5500,
        defense: 3500,
        health: 28e3
      },
      rewards: { food: 6e4, wood: 45e3, stone: 35e3, gold: 8e4, science: 5e4 },
      unlocked: true
    });
    missions.push({
      id: "future_alien",
      name: "Alien Invasion",
      description: "Extraterrestrial forces invade Earth. Humanity's last stand!",
      era: "future_age",
      enemyArmy: {
        name: "Alien Fleet",
        troops: [],
        attack: 8e3,
        defense: 5e3,
        health: 4e4
      },
      rewards: { food: 1e5, wood: 7e4, stone: 5e4, gold: 15e4, science: 1e5 },
      unlocked: true
    });
    missions.push({
      id: "future_singularity",
      name: "Singularity War",
      description: "Battle the transcended intelligence for the fate of the universe.",
      era: "future_age",
      enemyArmy: {
        name: "Singularity Entity",
        troops: [],
        attack: 12e3,
        defense: 8e3,
        health: 6e4
      },
      rewards: { food: 2e5, wood: 15e4, stone: 1e5, gold: 3e5, science: 2e5 },
      unlocked: true
    });
    return missions;
  }
  function getMissionsByEra(missions, era) {
    return missions.filter((m) => m.era === era);
  }
  function getMissionById(missions, id) {
    return missions.find((m) => m.id === id);
  }
  function calculateDamage(attack, defense) {
    const baseDamage = Math.max(1, attack - defense * DEFENSE_MITIGATION_FACTOR);
    const randomFactor = DAMAGE_RANDOM_MIN + Math.random() * DAMAGE_RANDOM_RANGE;
    return Math.floor(baseDamage * randomFactor);
  }
  function simulateBattleRound(playerHealth, enemyHealth, playerAttack, playerDefense, enemyAttack, enemyDefense, round) {
    const playerDamage = calculateDamage(playerAttack, enemyDefense);
    const enemyDamage = calculateDamage(enemyAttack, playerDefense);
    const newPlayerHealth = Math.max(0, playerHealth - enemyDamage);
    const newEnemyHealth = Math.max(0, enemyHealth - playerDamage);
    const messages = [
      `Your army deals ${playerDamage} damage!`,
      `Enemy army deals ${enemyDamage} damage!`
    ];
    return {
      round,
      playerDamage,
      enemyDamage,
      playerHealth: newPlayerHealth,
      enemyHealth: newEnemyHealth,
      message: messages.join(" ")
    };
  }
  function generateBattleLogs(playerArmy, enemyArmy) {
    const logs = [];
    let playerHealth = playerArmy.health;
    let enemyHealth = enemyArmy.health;
    let round = 1;
    while (playerHealth > 0 && enemyHealth > 0 && round <= MAX_BATTLE_ROUNDS) {
      const log = simulateBattleRound(playerHealth, enemyHealth, playerArmy.attack, playerArmy.defense, enemyArmy.attack, enemyArmy.defense, round);
      playerHealth = log.playerHealth;
      enemyHealth = log.enemyHealth;
      logs.push(log);
      round++;
    }
    return logs;
  }
  function determineBattleResult(logs, playerStartHealth, enemyStartHealth, mission) {
    const lastLog = logs[logs.length - 1];
    const victory = lastLog.enemyHealth <= 0;
    const playerEndHealth = lastLog.playerHealth;
    const enemyEndHealth = lastLog.enemyHealth;
    const casualtyPercent = Math.round((playerStartHealth - playerEndHealth) / playerStartHealth * 100);
    return {
      victory,
      logs,
      playerStartHealth,
      enemyStartHealth,
      playerEndHealth,
      enemyEndHealth,
      rewards: victory ? mission.rewards : void 0,
      casualtyPercent
    };
  }
  function simulateCombat(playerArmy, mission) {
    const playerPower = calculateArmyPower(playerArmy);
    if (playerPower.health <= 0) {
      return {
        victory: false,
        logs: [{
          round: 1,
          playerDamage: 0,
          enemyDamage: mission.enemyArmy.health,
          playerHealth: 0,
          enemyHealth: mission.enemyArmy.health,
          message: "You have no army to fight! The enemy claims victory."
        }],
        playerStartHealth: 0,
        enemyStartHealth: mission.enemyArmy.health,
        playerEndHealth: 0,
        enemyEndHealth: mission.enemyArmy.health,
        casualtyPercent: 100
      };
    }
    const logs = generateBattleLogs(playerPower, mission.enemyArmy);
    return determineBattleResult(logs, playerPower.health, mission.enemyArmy.health, mission);
  }
  function canStartMission(playerArmy) {
    const power = calculateArmyPower(playerArmy);
    return power.health > 0;
  }
  function getEraIndex(eraId) {
    return ERAS.findIndex((e) => e.id === eraId);
  }
  function isMissionAvailable(mission, currentEra) {
    const missionEraIndex = getEraIndex(mission.era);
    const currentEraIndex = getEraIndex(currentEra);
    return missionEraIndex <= currentEraIndex;
  }

  // dist/achievements.js
  var ACHIEVEMENTS = [
    // Resource Achievements
    {
      id: "first_food",
      name: "First Meal",
      description: "Gather 100 total food",
      icon: "\u{1F356}",
      category: "resources",
      condition: { type: "resource_total", target: "food", amount: 100 }
    },
    {
      id: "food_stockpile",
      name: "Food Stockpile",
      description: "Gather 1,000 total food",
      icon: "\u{1F356}",
      category: "resources",
      condition: { type: "resource_total", target: "food", amount: 1e3 }
    },
    {
      id: "feast_master",
      name: "Feast Master",
      description: "Gather 10,000 total food",
      icon: "\u{1F356}",
      category: "resources",
      condition: { type: "resource_total", target: "food", amount: 1e4 },
      reward: { type: "multiplier", resource: "food", amount: 1.1 }
    },
    {
      id: "first_lumber",
      name: "Lumberjack",
      description: "Gather 100 total wood",
      icon: "\u{1FAB5}",
      category: "resources",
      condition: { type: "resource_total", target: "wood", amount: 100 }
    },
    {
      id: "wood_stockpile",
      name: "Timber Baron",
      description: "Gather 1,000 total wood",
      icon: "\u{1FAB5}",
      category: "resources",
      condition: { type: "resource_total", target: "wood", amount: 1e3 }
    },
    {
      id: "forest_cleared",
      name: "Forest Cleared",
      description: "Gather 10,000 total wood",
      icon: "\u{1FAB5}",
      category: "resources",
      condition: { type: "resource_total", target: "wood", amount: 1e4 },
      reward: { type: "multiplier", resource: "wood", amount: 1.1 }
    },
    {
      id: "first_stone",
      name: "Stone Collector",
      description: "Gather 50 total stone",
      icon: "\u{1FAA8}",
      category: "resources",
      condition: { type: "resource_total", target: "stone", amount: 50 }
    },
    {
      id: "quarry_master",
      name: "Quarry Master",
      description: "Gather 1,000 total stone",
      icon: "\u{1FAA8}",
      category: "resources",
      condition: { type: "resource_total", target: "stone", amount: 1e3 }
    },
    {
      id: "mountain_mover",
      name: "Mountain Mover",
      description: "Gather 10,000 total stone",
      icon: "\u{1FAA8}",
      category: "resources",
      condition: { type: "resource_total", target: "stone", amount: 1e4 },
      reward: { type: "multiplier", resource: "stone", amount: 1.1 }
    },
    {
      id: "first_gold",
      name: "Gold Rush",
      description: "Accumulate 100 total gold",
      icon: "\u{1F4B0}",
      category: "resources",
      condition: { type: "resource_total", target: "gold", amount: 100 }
    },
    {
      id: "wealthy",
      name: "Wealthy",
      description: "Accumulate 1,000 total gold",
      icon: "\u{1F4B0}",
      category: "resources",
      condition: { type: "resource_total", target: "gold", amount: 1e3 }
    },
    {
      id: "tycoon",
      name: "Tycoon",
      description: "Accumulate 10,000 total gold",
      icon: "\u{1F4B0}",
      category: "resources",
      condition: { type: "resource_total", target: "gold", amount: 1e4 },
      reward: { type: "multiplier", resource: "gold", amount: 1.1 }
    },
    {
      id: "first_science",
      name: "Curious Mind",
      description: "Generate 50 total science",
      icon: "\u{1F52C}",
      category: "resources",
      condition: { type: "resource_total", target: "science", amount: 50 }
    },
    {
      id: "scientist",
      name: "Scientist",
      description: "Generate 500 total science",
      icon: "\u{1F52C}",
      category: "resources",
      condition: { type: "resource_total", target: "science", amount: 500 }
    },
    {
      id: "genius",
      name: "Genius",
      description: "Generate 5,000 total science",
      icon: "\u{1F52C}",
      category: "resources",
      condition: { type: "resource_total", target: "science", amount: 5e3 },
      reward: { type: "multiplier", resource: "science", amount: 1.1 }
    },
    // Research Achievements
    {
      id: "first_tech",
      name: "First Discovery",
      description: "Research your first technology",
      icon: "\u{1F4DA}",
      category: "research",
      condition: { type: "tech_count", target: "any", amount: 1 }
    },
    {
      id: "tech_5",
      name: "Scholar",
      description: "Research 5 technologies",
      icon: "\u{1F4DA}",
      category: "research",
      condition: { type: "tech_count", target: "any", amount: 5 }
    },
    {
      id: "tech_10",
      name: "Researcher",
      description: "Research 10 technologies",
      icon: "\u{1F4DA}",
      category: "research",
      condition: { type: "tech_count", target: "any", amount: 10 }
    },
    {
      id: "tech_20",
      name: "Professor",
      description: "Research 20 technologies",
      icon: "\u{1F4DA}",
      category: "research",
      condition: { type: "tech_count", target: "any", amount: 20 },
      reward: { type: "multiplier", resource: "science", amount: 1.15 }
    },
    {
      id: "tech_all",
      name: "Omniscient",
      description: "Research all technologies",
      icon: "\u{1F9E0}",
      category: "research",
      condition: { type: "tech_count", target: "any", amount: 44 },
      reward: { type: "multiplier", resource: "science", amount: 1.5 }
    },
    // Military Achievements
    {
      id: "first_troop",
      name: "First Recruit",
      description: "Train your first troop",
      icon: "\u2694\uFE0F",
      category: "military",
      condition: { type: "troop_count", target: "any", amount: 1 }
    },
    {
      id: "small_army",
      name: "Small Army",
      description: "Have 10 troops in your army",
      icon: "\u2694\uFE0F",
      category: "military",
      condition: { type: "troop_count", target: "any", amount: 10 }
    },
    {
      id: "large_army",
      name: "Large Army",
      description: "Have 50 troops in your army",
      icon: "\u2694\uFE0F",
      category: "military",
      condition: { type: "troop_count", target: "any", amount: 50 }
    },
    {
      id: "massive_army",
      name: "Massive Army",
      description: "Have 100 troops in your army",
      icon: "\u{1F6E1}\uFE0F",
      category: "military",
      condition: { type: "troop_count", target: "any", amount: 100 }
    },
    // Progress Achievements
    {
      id: "bronze_age",
      name: "Bronze Age",
      description: "Reach the Bronze Age",
      icon: "\u{1F949}",
      category: "progress",
      condition: { type: "era_reached", target: "bronze_age", amount: 1 }
    },
    {
      id: "iron_age",
      name: "Iron Age",
      description: "Reach the Iron Age",
      icon: "\u2699\uFE0F",
      category: "progress",
      condition: { type: "era_reached", target: "iron_age", amount: 1 }
    },
    {
      id: "classical_age",
      name: "Classical Age",
      description: "Reach the Classical Age",
      icon: "\u{1F3DB}\uFE0F",
      category: "progress",
      condition: { type: "era_reached", target: "classical_age", amount: 1 }
    },
    {
      id: "medieval_age",
      name: "Medieval Age",
      description: "Reach the Medieval Age",
      icon: "\u{1F3F0}",
      category: "progress",
      condition: { type: "era_reached", target: "medieval_age", amount: 1 }
    },
    {
      id: "renaissance",
      name: "Renaissance",
      description: "Reach the Renaissance",
      icon: "\u{1F3A8}",
      category: "progress",
      condition: { type: "era_reached", target: "renaissance", amount: 1 }
    },
    {
      id: "industrial_age",
      name: "Industrial Age",
      description: "Reach the Industrial Age",
      icon: "\u{1F3ED}",
      category: "progress",
      condition: { type: "era_reached", target: "industrial_age", amount: 1 }
    },
    {
      id: "modern_age",
      name: "Modern Age",
      description: "Reach the Modern Age",
      icon: "\u{1F697}",
      category: "progress",
      condition: { type: "era_reached", target: "modern_age", amount: 1 }
    },
    {
      id: "atomic_age",
      name: "Atomic Age",
      description: "Reach the Atomic Age",
      icon: "\u2622\uFE0F",
      category: "progress",
      condition: { type: "era_reached", target: "atomic_age", amount: 1 }
    },
    {
      id: "information_age",
      name: "Information Age",
      description: "Reach the Information Age",
      icon: "\u{1F4BB}",
      category: "progress",
      condition: { type: "era_reached", target: "information_age", amount: 1 }
    },
    {
      id: "future_age",
      name: "Future Age",
      description: "Reach the Future Age",
      icon: "\u{1F680}",
      category: "progress",
      condition: { type: "era_reached", target: "future_age", amount: 1 },
      reward: { type: "multiplier", resource: "science", amount: 2 }
    },
    // Combat Achievements
    {
      id: "first_victory",
      name: "First Victory",
      description: "Win your first battle",
      icon: "\u{1F3C6}",
      category: "combat",
      condition: { type: "battles_won", target: "any", amount: 1 }
    },
    {
      id: "veteran",
      name: "Veteran",
      description: "Win 5 battles",
      icon: "\u{1F3C6}",
      category: "combat",
      condition: { type: "battles_won", target: "any", amount: 5 }
    },
    {
      id: "war_hero",
      name: "War Hero",
      description: "Win 10 battles",
      icon: "\u{1F396}\uFE0F",
      category: "combat",
      condition: { type: "battles_won", target: "any", amount: 10 }
    },
    {
      id: "legendary_commander",
      name: "Legendary Commander",
      description: "Win 25 battles",
      icon: "\u{1F451}",
      category: "combat",
      condition: { type: "battles_won", target: "any", amount: 25 }
    },
    {
      id: "mission_complete_1",
      name: "Mission Accomplished",
      description: "Complete your first mission",
      icon: "\u2705",
      category: "combat",
      condition: { type: "missions_completed", target: "any", amount: 1 }
    },
    {
      id: "mission_complete_5",
      name: "Mission Specialist",
      description: "Complete 5 unique missions",
      icon: "\u2705",
      category: "combat",
      condition: { type: "missions_completed", target: "any", amount: 5 }
    },
    {
      id: "mission_complete_10",
      name: "Mission Master",
      description: "Complete 10 unique missions",
      icon: "\u{1F31F}",
      category: "combat",
      condition: { type: "missions_completed", target: "any", amount: 10 }
    },
    {
      id: "all_missions",
      name: "Conqueror",
      description: "Complete all missions",
      icon: "\u{1F30D}",
      category: "combat",
      condition: { type: "missions_completed", target: "any", amount: 22 }
    },
    // Building Achievements
    {
      id: "first_building",
      name: "First Construction",
      description: "Construct your first building",
      icon: "\u{1F3E0}",
      category: "buildings",
      condition: { type: "building_count", target: "any", amount: 1 }
    },
    {
      id: "small_village",
      name: "Small Village",
      description: "Have 5 buildings in your civilization",
      icon: "\u{1F3D8}\uFE0F",
      category: "buildings",
      condition: { type: "building_count", target: "any", amount: 5 }
    },
    {
      id: "town",
      name: "Growing Town",
      description: "Have 15 buildings in your civilization",
      icon: "\u{1F3D9}\uFE0F",
      category: "buildings",
      condition: { type: "building_count", target: "any", amount: 15 }
    },
    {
      id: "city",
      name: "City Builder",
      description: "Have 30 buildings in your civilization",
      icon: "\u{1F306}",
      category: "buildings",
      condition: { type: "building_count", target: "any", amount: 30 },
      reward: { type: "multiplier", resource: "gold", amount: 1.15 }
    },
    {
      id: "metropolis",
      name: "Metropolis",
      description: "Have 50 buildings in your civilization",
      icon: "\u{1F303}",
      category: "buildings",
      condition: { type: "building_count", target: "any", amount: 50 },
      reward: { type: "multiplier", resource: "gold", amount: 1.25 }
    }
  ];
  function getAchievementById(id) {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }
  function getAchievementsByCategory(category) {
    return ACHIEVEMENTS.filter((a) => a.category === category);
  }
  function createInitialStatistics() {
    return {
      totalFoodGathered: 0,
      totalWoodGathered: 0,
      totalStoneGathered: 0,
      totalGoldEarned: 0,
      totalScienceGenerated: 0,
      totalTroopsTrained: 0,
      battlesWon: 0,
      battlesLost: 0,
      clickCount: 0,
      offlineEarnings: 0,
      totalBuildingsConstructed: 0
    };
  }
  function createInitialAchievementProgress() {
    const progress = /* @__PURE__ */ new Map();
    for (const achievement of ACHIEVEMENTS) {
      progress.set(achievement.id, {
        id: achievement.id,
        unlocked: false,
        notified: false
      });
    }
    return progress;
  }

  // dist/buildings.js
  var BUILDING_TYPES = [
    // Stone Age Buildings
    {
      id: "hut",
      name: "Hut",
      description: "A simple shelter that increases food production.",
      era: "stone_age",
      unlockTech: null,
      // Available from start
      cost: { food: 10, wood: 10, stone: 5, gold: 0 },
      buildTime: 10,
      production: { food: 0.5 },
      maxCount: 10
    },
    {
      id: "campfire",
      name: "Campfire",
      description: "Provides warmth and allows better cooking. Increases food and science.",
      era: "stone_age",
      unlockTech: "fire",
      cost: { food: 5, wood: 20, stone: 10, gold: 0 },
      buildTime: 8,
      production: { food: 0.3, science: 0.1 },
      maxCount: 5
    },
    {
      id: "farm",
      name: "Farm",
      description: "Cultivate crops for a steady food supply.",
      era: "stone_age",
      unlockTech: "agriculture",
      cost: { food: 15, wood: 20, stone: 5, gold: 0 },
      buildTime: 15,
      production: { food: 1 },
      maxCount: 15
    },
    // Bronze Age Buildings
    {
      id: "granary",
      name: "Granary",
      description: "Store grain to prevent food spoilage. Greatly increases food production.",
      era: "bronze_age",
      unlockTech: "pottery",
      cost: { food: 50, wood: 80, stone: 60, gold: 20 },
      buildTime: 20,
      production: { food: 2 },
      maxCount: 10
    },
    {
      id: "workshop",
      name: "Workshop",
      description: "Craft tools and goods. Increases wood and stone production.",
      era: "bronze_age",
      unlockTech: "bronze_working",
      cost: { food: 40, wood: 100, stone: 80, gold: 30 },
      buildTime: 25,
      production: { wood: 1, stone: 0.5 },
      maxCount: 8
    },
    {
      id: "library",
      name: "Library",
      description: "A place of learning. Increases science production.",
      era: "bronze_age",
      unlockTech: "writing",
      cost: { food: 30, wood: 60, stone: 40, gold: 50 },
      buildTime: 30,
      production: { science: 0.5 },
      maxCount: 5
    },
    // Iron Age Buildings
    {
      id: "mine",
      name: "Mine",
      description: "Extract ore and stone from the earth.",
      era: "iron_age",
      unlockTech: "iron_working",
      cost: { food: 60, wood: 100, stone: 150, gold: 80 },
      buildTime: 40,
      production: { stone: 2, gold: 0.5 },
      maxCount: 10
    },
    {
      id: "market",
      name: "Market",
      description: "Trade goods for gold. Increases gold production.",
      era: "iron_age",
      unlockTech: "currency",
      cost: { food: 50, wood: 80, stone: 60, gold: 100 },
      buildTime: 35,
      production: { gold: 1.5 },
      maxCount: 8
    },
    {
      id: "academy",
      name: "Academy",
      description: "Train scholars and philosophers. Greatly increases science.",
      era: "iron_age",
      unlockTech: "philosophy",
      cost: { food: 40, wood: 70, stone: 80, gold: 150 },
      buildTime: 45,
      production: { science: 1.5 },
      maxCount: 5
    },
    // Classical Age Buildings
    {
      id: "aqueduct",
      name: "Aqueduct",
      description: "Bring water to your cities. Boosts food and stone production.",
      era: "classical_age",
      unlockTech: "engineering",
      cost: { food: 80, wood: 100, stone: 200, gold: 150 },
      buildTime: 60,
      production: { food: 2.5, stone: 1.5 },
      maxCount: 5
    },
    {
      id: "colosseum",
      name: "Colosseum",
      description: "Entertainment venue. Attracts trade and boosts gold.",
      era: "classical_age",
      unlockTech: "construction",
      cost: { food: 100, wood: 150, stone: 300, gold: 200 },
      buildTime: 80,
      production: { gold: 3 },
      maxCount: 3
    },
    // Medieval Age Buildings
    {
      id: "blacksmith",
      name: "Blacksmith",
      description: "Forge weapons and tools. Increases gold and stone production.",
      era: "medieval_age",
      unlockTech: "metal_casting",
      cost: { food: 100, wood: 150, stone: 200, gold: 250 },
      buildTime: 50,
      production: { gold: 2, stone: 1 },
      maxCount: 8
    },
    {
      id: "cathedral",
      name: "Cathedral",
      description: "A grand place of worship. Boosts science and gold.",
      era: "medieval_age",
      unlockTech: "feudalism",
      cost: { food: 150, wood: 200, stone: 400, gold: 500 },
      buildTime: 100,
      production: { science: 2.5, gold: 2 },
      maxCount: 3
    },
    {
      id: "windmill",
      name: "Windmill",
      description: "Harness wind power for grinding grain. Increases food production.",
      era: "medieval_age",
      unlockTech: "machinery",
      cost: { food: 80, wood: 200, stone: 100, gold: 150 },
      buildTime: 45,
      production: { food: 3.5 },
      maxCount: 10
    },
    // Renaissance Buildings
    {
      id: "bank",
      name: "Bank",
      description: "Financial institution. Greatly increases gold production.",
      era: "renaissance",
      unlockTech: "banking",
      cost: { food: 100, wood: 150, stone: 200, gold: 800 },
      buildTime: 60,
      production: { gold: 5 },
      maxCount: 5
    },
    {
      id: "observatory",
      name: "Observatory",
      description: "Study the stars. Greatly increases science production.",
      era: "renaissance",
      unlockTech: "astronomy",
      cost: { food: 80, wood: 100, stone: 300, gold: 600 },
      buildTime: 70,
      production: { science: 4 },
      maxCount: 3
    },
    {
      id: "shipyard",
      name: "Shipyard",
      description: "Build ships for trade. Increases gold and wood production.",
      era: "renaissance",
      unlockTech: "printing_press",
      cost: { food: 150, wood: 400, stone: 200, gold: 500 },
      buildTime: 80,
      production: { gold: 3.5, wood: 2 },
      maxCount: 5
    },
    // Industrial Age Buildings
    {
      id: "factory",
      name: "Factory",
      description: "Mass produce goods. Increases all resource production.",
      era: "industrial_age",
      unlockTech: "industrialization",
      cost: { food: 200, wood: 300, stone: 400, gold: 1e3 },
      buildTime: 90,
      production: { food: 3, wood: 3, stone: 2, gold: 4 },
      maxCount: 8
    },
    {
      id: "railroad_station",
      name: "Railroad Station",
      description: "Connect cities via rail. Boosts all production.",
      era: "industrial_age",
      unlockTech: "railroad",
      cost: { food: 150, wood: 250, stone: 350, gold: 800 },
      buildTime: 70,
      production: { food: 2, wood: 2, stone: 2, gold: 3 },
      maxCount: 5
    },
    {
      id: "power_plant",
      name: "Power Plant",
      description: "Generate electricity. Greatly boosts production.",
      era: "industrial_age",
      unlockTech: "electricity",
      cost: { food: 100, wood: 200, stone: 500, gold: 1500 },
      buildTime: 100,
      production: { gold: 8, science: 3 },
      maxCount: 5
    },
    // Modern Age Buildings
    {
      id: "research_lab",
      name: "Research Lab",
      description: "Advanced scientific research. Greatly increases science.",
      era: "modern_age",
      unlockTech: "radio",
      cost: { food: 200, wood: 150, stone: 300, gold: 2e3 },
      buildTime: 80,
      production: { science: 8 },
      maxCount: 8
    },
    {
      id: "oil_refinery",
      name: "Oil Refinery",
      description: "Process petroleum. Increases gold production significantly.",
      era: "modern_age",
      unlockTech: "combustion",
      cost: { food: 150, wood: 200, stone: 400, gold: 2500 },
      buildTime: 100,
      production: { gold: 10 },
      maxCount: 5
    },
    {
      id: "airport",
      name: "Airport",
      description: "Enable air travel and trade. Boosts gold and science.",
      era: "modern_age",
      unlockTech: "flight",
      cost: { food: 200, wood: 300, stone: 500, gold: 3e3 },
      buildTime: 120,
      production: { gold: 8, science: 5 },
      maxCount: 3
    },
    // Atomic Age Buildings
    {
      id: "nuclear_plant",
      name: "Nuclear Plant",
      description: "Clean nuclear energy. Massive production boost.",
      era: "atomic_age",
      unlockTech: "nuclear_power",
      cost: { food: 300, wood: 200, stone: 800, gold: 5e3 },
      buildTime: 150,
      production: { gold: 15, science: 10 },
      maxCount: 5
    },
    {
      id: "space_center",
      name: "Space Center",
      description: "Launch rockets and satellites. Greatly increases science.",
      era: "atomic_age",
      unlockTech: "rocketry",
      cost: { food: 400, wood: 300, stone: 1e3, gold: 8e3 },
      buildTime: 180,
      production: { science: 20 },
      maxCount: 3
    },
    // Information Age Buildings
    {
      id: "data_center",
      name: "Data Center",
      description: "Store and process information. Massive science boost.",
      era: "information_age",
      unlockTech: "internet",
      cost: { food: 300, wood: 200, stone: 500, gold: 1e4 },
      buildTime: 100,
      production: { science: 30, gold: 10 },
      maxCount: 8
    },
    {
      id: "robotics_facility",
      name: "Robotics Facility",
      description: "Automate production with robots. Boosts all resources.",
      era: "information_age",
      unlockTech: "robotics",
      cost: { food: 400, wood: 300, stone: 600, gold: 15e3 },
      buildTime: 120,
      production: { food: 10, wood: 8, stone: 6, gold: 12 },
      maxCount: 5
    },
    // Future Age Buildings
    {
      id: "fusion_reactor",
      name: "Fusion Reactor",
      description: "Unlimited clean energy. Massive production boost.",
      era: "future_age",
      unlockTech: "fusion_power",
      cost: { food: 500, wood: 400, stone: 800, gold: 25e3 },
      buildTime: 200,
      production: { gold: 50, science: 30 },
      maxCount: 5
    },
    {
      id: "quantum_lab",
      name: "Quantum Lab",
      description: "Quantum computing research. Extreme science production.",
      era: "future_age",
      unlockTech: "quantum_computing",
      cost: { food: 400, wood: 300, stone: 600, gold: 3e4 },
      buildTime: 150,
      production: { science: 80 },
      maxCount: 5
    },
    {
      id: "space_colony",
      name: "Space Colony",
      description: "Expand to the stars. Produces all resources.",
      era: "future_age",
      unlockTech: "space_colonization",
      cost: { food: 1e3, wood: 800, stone: 1200, gold: 5e4 },
      buildTime: 300,
      production: { food: 30, wood: 25, stone: 20, gold: 40, science: 50 },
      maxCount: 3
    }
  ];
  function getBuildingTypeById(id) {
    return BUILDING_TYPES.find((b) => b.id === id);
  }
  function canBuildBuilding(buildingId, unlockedBuildings, builtBuildings, resources) {
    const buildingType = getBuildingTypeById(buildingId);
    if (!buildingType)
      return false;
    if (buildingType.unlockTech && !unlockedBuildings.has(buildingType.id))
      return false;
    const existing = builtBuildings.find((b) => b.typeId === buildingId);
    if (existing && existing.count >= buildingType.maxCount)
      return false;
    if (resources.food < buildingType.cost.food)
      return false;
    if (resources.wood < buildingType.cost.wood)
      return false;
    if (resources.stone < buildingType.cost.stone)
      return false;
    if (resources.gold < buildingType.cost.gold)
      return false;
    return true;
  }
  function calculateBuildingProduction(buildings) {
    let totalFood = 0;
    let totalWood = 0;
    let totalStone = 0;
    let totalGold = 0;
    let totalScience = 0;
    for (const building of buildings) {
      const buildingType = getBuildingTypeById(building.typeId);
      if (buildingType) {
        const count = building.count;
        totalFood += (buildingType.production.food || 0) * count;
        totalWood += (buildingType.production.wood || 0) * count;
        totalStone += (buildingType.production.stone || 0) * count;
        totalGold += (buildingType.production.gold || 0) * count;
        totalScience += (buildingType.production.science || 0) * count;
      }
    }
    return {
      food: totalFood,
      wood: totalWood,
      stone: totalStone,
      gold: totalGold,
      science: totalScience
    };
  }
  function getTotalBuildingCount(buildings) {
    return buildings.reduce((sum, b) => sum + b.count, 0);
  }

  // dist/game.js
  var Game = class {
    constructor() {
      this.updateInterval = null;
      this.onStateChange = null;
      this.onAchievementUnlocked = null;
      this.offlineProgress = null;
      this.state = this.createInitialState();
    }
    createInitialState() {
      return {
        currentEra: "stone_age",
        resources: {
          food: 0,
          wood: 0,
          stone: 0,
          gold: 0,
          science: 0
        },
        resourceMultipliers: {
          food: 1,
          wood: 1,
          stone: 1,
          gold: 1,
          science: 1
        },
        researchedTechs: /* @__PURE__ */ new Set(),
        currentResearch: null,
        researchProgress: 0,
        unlockedTroops: /* @__PURE__ */ new Set(),
        army: [],
        trainingQueue: [],
        lastUpdate: Date.now(),
        totalPlayTime: 0,
        // Combat system
        missions: generateMissions(),
        completedMissions: /* @__PURE__ */ new Set(),
        activeBattle: null,
        battleAnimationSpeed: 800,
        // 800ms per round
        // Achievements and statistics
        statistics: createInitialStatistics(),
        achievements: createInitialAchievementProgress(),
        pendingAchievementNotifications: [],
        // Buildings system
        buildings: [],
        constructionQueue: [],
        unlockedBuildings: /* @__PURE__ */ new Set(["hut"])
        // Hut is available from start
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
      const delta = (now - this.state.lastUpdate) / 1e3;
      this.state.lastUpdate = now;
      this.state.totalPlayTime += delta;
      const era = getEraById(this.state.currentEra);
      if (!era)
        return;
      const buildingProduction = calculateBuildingProduction(this.state.buildings);
      const foodGain = (era.resources.food.baseRate + buildingProduction.food) * this.state.resourceMultipliers.food * delta;
      const woodGain = (era.resources.wood.baseRate + buildingProduction.wood) * this.state.resourceMultipliers.wood * delta;
      const stoneGain = (era.resources.stone.baseRate + buildingProduction.stone) * this.state.resourceMultipliers.stone * delta;
      const goldGain = (era.resources.gold.baseRate + buildingProduction.gold) * this.state.resourceMultipliers.gold * delta;
      const scienceGain = (era.resources.science.baseRate + buildingProduction.science) * this.state.resourceMultipliers.science * delta;
      this.state.resources.food += foodGain;
      this.state.resources.wood += woodGain;
      this.state.resources.stone += stoneGain;
      this.state.resources.gold += goldGain;
      this.state.resources.science += scienceGain;
      this.state.statistics.totalFoodGathered += foodGain;
      this.state.statistics.totalWoodGathered += woodGain;
      this.state.statistics.totalStoneGathered += stoneGain;
      this.state.statistics.totalGoldEarned += goldGain;
      this.state.statistics.totalScienceGenerated += scienceGain;
      if (this.state.currentResearch) {
        const tech = getTechById(this.state.currentResearch);
        if (tech) {
          this.state.researchProgress += (era.resources.science.baseRate + buildingProduction.science) * this.state.resourceMultipliers.science * delta;
          if (this.state.researchProgress >= tech.cost.science) {
            this.completeResearch();
          }
        }
      }
      this.updateTrainingQueue(now);
      this.updateConstructionQueue(now);
      this.checkAchievements();
      this.notifyStateChange();
    }
    updateTrainingQueue(now) {
      const completed = [];
      for (let i = 0; i < this.state.trainingQueue.length; i++) {
        const training = this.state.trainingQueue[i];
        if (now >= training.endTime) {
          this.addTroopToArmy(training.troopId);
          this.state.statistics.totalTroopsTrained++;
          completed.push(i);
        }
      }
      for (let i = completed.length - 1; i >= 0; i--) {
        this.state.trainingQueue.splice(completed[i], 1);
      }
    }
    addTroopToArmy(troopId) {
      const existing = this.state.army.find((t) => t.typeId === troopId);
      if (existing) {
        existing.count++;
      } else {
        this.state.army.push({ typeId: troopId, count: 1 });
      }
    }
    updateConstructionQueue(now) {
      const completed = [];
      for (let i = 0; i < this.state.constructionQueue.length; i++) {
        const construction = this.state.constructionQueue[i];
        if (now >= construction.endTime) {
          this.addBuilding(construction.buildingId);
          this.state.statistics.totalBuildingsConstructed = (this.state.statistics.totalBuildingsConstructed || 0) + 1;
          completed.push(i);
        }
      }
      for (let i = completed.length - 1; i >= 0; i--) {
        this.state.constructionQueue.splice(completed[i], 1);
      }
    }
    addBuilding(buildingId) {
      const existing = this.state.buildings.find((b) => b.typeId === buildingId);
      if (existing) {
        existing.count++;
      } else {
        this.state.buildings.push({ typeId: buildingId, count: 1 });
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
      if (tech.effects.resourceBonus) {
        const resource = tech.effects.resourceBonus.resource;
        this.state.resourceMultipliers[resource] *= tech.effects.resourceBonus.multiplier;
      }
      if (tech.effects.unitUnlock) {
        this.state.unlockedTroops.add(tech.effects.unitUnlock);
      }
      if (tech.effects.unlocks) {
        const nextEra = getNextEra(this.state.currentEra);
        if (nextEra && tech.effects.unlocks.includes(nextEra.id)) {
          this.state.currentEra = nextEra.id;
        }
      }
      this.checkBuildingUnlocks(this.state.currentResearch);
      this.state.currentResearch = null;
      this.state.researchProgress = 0;
      this.notifyStateChange();
    }
    checkBuildingUnlocks(techId) {
      for (const building of BUILDING_TYPES) {
        if (building.unlockTech === techId) {
          this.state.unlockedBuildings.add(building.id);
        }
      }
    }
    // Building system
    constructBuilding(buildingId) {
      const buildingType = getBuildingTypeById(buildingId);
      if (!buildingType)
        return false;
      if (!canBuildBuilding(buildingId, this.state.unlockedBuildings, this.state.buildings, this.state.resources)) {
        return false;
      }
      this.state.resources.food -= buildingType.cost.food;
      this.state.resources.wood -= buildingType.cost.wood;
      this.state.resources.stone -= buildingType.cost.stone;
      this.state.resources.gold -= buildingType.cost.gold;
      const now = Date.now();
      this.state.constructionQueue.push({
        buildingId,
        startTime: now,
        endTime: now + buildingType.buildTime * 1e3
      });
      this.notifyStateChange();
      return true;
    }
    getBuildingCount(buildingId) {
      const building = this.state.buildings.find((b) => b.typeId === buildingId);
      return building ? building.count : 0;
    }
    getBuildingProduction() {
      return calculateBuildingProduction(this.state.buildings);
    }
    getAvailableBuildings() {
      return BUILDING_TYPES.filter((building) => {
        if (building.unlockTech === null)
          return true;
        return this.state.unlockedBuildings.has(building.id);
      });
    }
    getTotalBuildingCount() {
      return getTotalBuildingCount(this.state.buildings);
    }
    // Barracks system
    trainTroop(troopId) {
      const troopType = getTroopTypeById(troopId);
      if (!troopType)
        return false;
      if (!canTrainTroop(troopId, this.state.unlockedTroops, this.state.resources)) {
        return false;
      }
      this.state.resources.food -= troopType.cost.food;
      this.state.resources.gold -= troopType.cost.gold;
      if (troopType.cost.wood)
        this.state.resources.wood -= troopType.cost.wood;
      if (troopType.cost.stone)
        this.state.resources.stone -= troopType.cost.stone;
      const now = Date.now();
      this.state.trainingQueue.push({
        troopId,
        startTime: now,
        endTime: now + troopType.trainTime * 1e3
      });
      this.notifyStateChange();
      return true;
    }
    getArmyPower() {
      return calculateArmyPower(this.state.army);
    }
    // Combat system methods
    getAvailableMissions() {
      return this.state.missions.filter((m) => isMissionAvailable(m, this.state.currentEra));
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
      const result = simulateCombat(this.state.army, mission);
      const playerPower = calculateArmyPower(this.state.army);
      this.state.activeBattle = {
        missionId,
        logs: result.logs,
        currentRound: 0,
        isComplete: false,
        result,
        playerStartHealth: playerPower.health,
        enemyStartHealth: mission.enemyArmy.health
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
        this.state.resources.food += result.rewards.food;
        this.state.resources.wood += result.rewards.wood;
        this.state.resources.stone += result.rewards.stone;
        this.state.resources.gold += result.rewards.gold;
        this.state.resources.science += result.rewards.science;
        this.state.statistics.totalFoodGathered += result.rewards.food;
        this.state.statistics.totalWoodGathered += result.rewards.wood;
        this.state.statistics.totalStoneGathered += result.rewards.stone;
        this.state.statistics.totalGoldEarned += result.rewards.gold;
        this.state.statistics.totalScienceGenerated += result.rewards.science;
        this.state.completedMissions.add(this.state.activeBattle.missionId);
        this.state.statistics.battlesWon++;
      } else {
        this.state.statistics.battlesLost++;
      }
      if (result.casualtyPercent > 0) {
        this.applyCasualties(result.casualtyPercent);
      }
      this.checkAchievements();
    }
    applyCasualties(casualtyPercent) {
      for (const troop of this.state.army) {
        const casualtyFactor = casualtyPercent / 100;
        const troopsLost = Math.floor(troop.count * casualtyFactor * 0.5);
        troop.count = Math.max(0, troop.count - troopsLost);
      }
      this.state.army = this.state.army.filter((t) => t.count > 0);
    }
    dismissBattle() {
      this.state.activeBattle = null;
      this.notifyStateChange();
    }
    setBattleSpeed(speed) {
      this.state.battleAnimationSpeed = Math.max(100, Math.min(2e3, speed));
      this.notifyStateChange();
    }
    isMissionCompleted(missionId) {
      return this.state.completedMissions.has(missionId);
    }
    // Get available technologies
    getAvailableTechs() {
      return TECHNOLOGIES.filter((tech) => {
        if (this.state.researchedTechs.has(tech.id))
          return false;
        for (const prereq of tech.prerequisites) {
          if (!this.state.researchedTechs.has(prereq))
            return false;
        }
        return true;
      });
    }
    // Get available troops
    getAvailableTroops() {
      return TROOP_TYPES.filter((troop) => this.state.unlockedTroops.has(troop.id));
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
        case "resource_total":
          return this.getStatisticForResource(condition.target) >= condition.amount;
        case "resource_current":
          return this.state.resources[condition.target] >= condition.amount;
        case "tech_count":
          return this.state.researchedTechs.size >= condition.amount;
        case "troop_count":
          return this.getTotalTroopCount() >= condition.amount;
        case "era_reached":
          return this.hasReachedEra(condition.target);
        case "battles_won":
          return this.state.statistics.battlesWon >= condition.amount;
        case "missions_completed":
          return this.state.completedMissions.size >= condition.amount;
        case "building_count":
          return this.getTotalBuildingCount() >= condition.amount;
        default:
          return false;
      }
    }
    getStatisticForResource(resource) {
      switch (resource) {
        case "food":
          return this.state.statistics.totalFoodGathered;
        case "wood":
          return this.state.statistics.totalWoodGathered;
        case "stone":
          return this.state.statistics.totalStoneGathered;
        case "gold":
          return this.state.statistics.totalGoldEarned;
        case "science":
          return this.state.statistics.totalScienceGenerated;
        default:
          return 0;
      }
    }
    getTotalTroopCount() {
      return this.state.army.reduce((sum, troop) => sum + troop.count, 0);
    }
    hasReachedEra(eraId) {
      const currentIndex = ERAS.findIndex((e) => e.id === this.state.currentEra);
      const targetIndex = ERAS.findIndex((e) => e.id === eraId);
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
      this.state.pendingAchievementNotifications.push(achievementId);
      if (achievement.reward) {
        if (achievement.reward.type === "multiplier" && achievement.reward.resource) {
          const resource = achievement.reward.resource;
          this.state.resourceMultipliers[resource] *= achievement.reward.amount;
        }
      }
      if (this.onAchievementUnlocked) {
        this.onAchievementUnlocked(achievement);
      }
    }
    getUnlockedAchievements() {
      return ACHIEVEMENTS.filter((a) => {
        const progress = this.state.achievements.get(a.id);
        return progress && progress.unlocked;
      });
    }
    getLockedAchievements() {
      return ACHIEVEMENTS.filter((a) => {
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
      if (!this.state.researchedTechs.has("cloud_computing")) {
        this.offlineProgress = null;
        return;
      }
      const now = Date.now();
      const offlineDuration = (now - lastSaveTime) / 1e3;
      const maxOfflineTime = 8 * 60 * 60;
      const cappedDuration = Math.min(offlineDuration, maxOfflineTime);
      if (cappedDuration < 60) {
        this.offlineProgress = null;
        return;
      }
      const era = getEraById(this.state.currentEra);
      if (!era) {
        this.offlineProgress = null;
        return;
      }
      const offlineEfficiency = 0.5;
      const buildingProduction = calculateBuildingProduction(this.state.buildings);
      const food = (era.resources.food.baseRate + buildingProduction.food) * this.state.resourceMultipliers.food * cappedDuration * offlineEfficiency;
      const wood = (era.resources.wood.baseRate + buildingProduction.wood) * this.state.resourceMultipliers.wood * cappedDuration * offlineEfficiency;
      const stone = (era.resources.stone.baseRate + buildingProduction.stone) * this.state.resourceMultipliers.stone * cappedDuration * offlineEfficiency;
      const gold = (era.resources.gold.baseRate + buildingProduction.gold) * this.state.resourceMultipliers.gold * cappedDuration * offlineEfficiency;
      const science = (era.resources.science.baseRate + buildingProduction.science) * this.state.resourceMultipliers.science * cappedDuration * offlineEfficiency;
      this.state.resources.food += food;
      this.state.resources.wood += wood;
      this.state.resources.stone += stone;
      this.state.resources.gold += gold;
      this.state.resources.science += science;
      this.state.statistics.totalFoodGathered += food;
      this.state.statistics.totalWoodGathered += wood;
      this.state.statistics.totalStoneGathered += stone;
      this.state.statistics.totalGoldEarned += gold;
      this.state.statistics.totalScienceGenerated += science;
      this.state.statistics.offlineEarnings += food + wood + stone + gold + science;
      this.offlineProgress = {
        earned: true,
        resources: { food, wood, stone, gold, science },
        duration: cappedDuration
      };
    }
    dismissOfflineProgress() {
      this.offlineProgress = null;
    }
    // Save/Load
    saveGame() {
      const achievementsArray = Array.from(this.state.achievements.entries());
      const saveData = {
        ...this.state,
        researchedTechs: Array.from(this.state.researchedTechs),
        unlockedTroops: Array.from(this.state.unlockedTroops),
        completedMissions: Array.from(this.state.completedMissions),
        unlockedBuildings: Array.from(this.state.unlockedBuildings),
        achievements: achievementsArray,
        activeBattle: null,
        // Don't save active battles
        saveTime: Date.now()
        // Save timestamp for offline progress
      };
      return JSON.stringify(saveData);
    }
    loadGame(saveString) {
      try {
        const saveData = JSON.parse(saveString);
        let achievementsMap;
        if (saveData.achievements && Array.isArray(saveData.achievements)) {
          achievementsMap = new Map(saveData.achievements);
        } else {
          achievementsMap = createInitialAchievementProgress();
        }
        for (const achievement of ACHIEVEMENTS) {
          if (!achievementsMap.has(achievement.id)) {
            achievementsMap.set(achievement.id, {
              id: achievement.id,
              unlocked: false,
              notified: false
            });
          }
        }
        let unlockedBuildingsSet;
        if (saveData.unlockedBuildings && Array.isArray(saveData.unlockedBuildings)) {
          unlockedBuildingsSet = new Set(saveData.unlockedBuildings);
        } else {
          unlockedBuildingsSet = /* @__PURE__ */ new Set(["hut"]);
          const researchedTechs = new Set(saveData.researchedTechs || []);
          for (const building of BUILDING_TYPES) {
            if (building.unlockTech && researchedTechs.has(building.unlockTech)) {
              unlockedBuildingsSet.add(building.id);
            }
          }
        }
        this.state = {
          ...saveData,
          researchedTechs: new Set(saveData.researchedTechs),
          unlockedTroops: new Set(saveData.unlockedTroops),
          completedMissions: new Set(saveData.completedMissions || []),
          missions: generateMissions(),
          // Always regenerate missions
          activeBattle: null,
          battleAnimationSpeed: saveData.battleAnimationSpeed || 800,
          statistics: saveData.statistics || createInitialStatistics(),
          achievements: achievementsMap,
          pendingAchievementNotifications: [],
          // Buildings system
          buildings: saveData.buildings || [],
          constructionQueue: saveData.constructionQueue || [],
          unlockedBuildings: unlockedBuildingsSet
        };
        if (saveData.saveTime) {
          this.calculateOfflineProgress(saveData.saveTime);
        }
        return true;
      } catch {
        return false;
      }
    }
    resetGame() {
      this.state = this.createInitialState();
      this.offlineProgress = null;
      this.notifyStateChange();
    }
  };

  // dist/ui.js
  var GameUI = class {
    constructor(game) {
      this.currentTab = "resources";
      this.battleAnimationInterval = null;
      this.achievementNotificationQueue = [];
      this.isShowingAchievement = false;
      this.renderTimeout = null;
      this.isUserInteracting = false;
      this.game = game;
      this.game.setOnStateChange(() => this.scheduleRender());
      this.game.setOnAchievementUnlocked((achievement) => this.queueAchievementNotification(achievement));
      this.setupEventListeners();
    }
    // Debounced render to prevent rapid re-renders from interfering with clicks
    scheduleRender() {
      if (this.isUserInteracting) {
        return;
      }
      if (this.renderTimeout !== null) {
        window.clearTimeout(this.renderTimeout);
      }
      this.renderTimeout = window.setTimeout(() => {
        this.renderTimeout = null;
        this.render();
      }, 50);
    }
    // Mark interaction start - prevents re-renders during click processing
    startInteraction() {
      this.isUserInteracting = true;
      window.setTimeout(() => {
        this.isUserInteracting = false;
        this.scheduleRender();
      }, 100);
    }
    setupEventListeners() {
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const target = e.target;
          const tab = target.dataset.tab;
          if (tab) {
            this.switchTab(tab);
          }
        });
      });
      document.getElementById("gather-food")?.addEventListener("click", () => {
        this.startInteraction();
        this.game.gatherFood();
      });
      document.getElementById("gather-wood")?.addEventListener("click", () => {
        this.startInteraction();
        this.game.gatherWood();
      });
      document.getElementById("gather-stone")?.addEventListener("click", () => {
        this.startInteraction();
        this.game.gatherStone();
      });
      document.getElementById("save-game")?.addEventListener("click", () => this.saveGame());
      document.getElementById("load-game")?.addEventListener("click", () => this.loadGame());
      document.getElementById("reset-game")?.addEventListener("click", () => this.resetGame());
      document.getElementById("buildings-content")?.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("build-btn") && !target.hasAttribute("disabled")) {
          const buildingId = target.dataset.building;
          if (buildingId) {
            this.startInteraction();
            this.game.constructBuilding(buildingId);
          }
        }
      });
      document.getElementById("research-tree")?.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("research-btn") && !target.hasAttribute("disabled")) {
          const techId = target.dataset.tech;
          if (techId) {
            this.startInteraction();
            this.game.startResearch(techId);
          }
        }
      });
      document.getElementById("barracks-content")?.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("train-btn") && !target.hasAttribute("disabled")) {
          const troopId = target.dataset.troop;
          if (troopId) {
            this.startInteraction();
            this.game.trainTroop(troopId);
          }
        }
      });
      document.getElementById("combat-content")?.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("mission-btn") && !target.hasAttribute("disabled")) {
          const missionId = target.dataset.mission;
          if (missionId) {
            this.startInteraction();
            this.startMission(missionId);
          }
        }
        if (target.id === "dismiss-battle") {
          this.startInteraction();
          this.game.dismissBattle();
        }
      });
      document.getElementById("combat-content")?.addEventListener("input", (e) => {
        const target = e.target;
        if (target.id === "battle-speed") {
          const speed = parseInt(target.value);
          this.game.setBattleSpeed(speed);
          const speedDisplay = document.getElementById("speed-display");
          if (speedDisplay)
            speedDisplay.textContent = `${speed}ms`;
          if (!this.game.state.activeBattle?.isComplete) {
            this.startBattleAnimation();
          }
        }
      });
    }
    switchTab(tab) {
      this.currentTab = tab;
      if (tab !== "combat" && this.battleAnimationInterval) {
        clearInterval(this.battleAnimationInterval);
        this.battleAnimationInterval = null;
      }
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.dataset.tab === tab) {
          btn.classList.add("active");
        }
      });
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(`${tab}-tab`)?.classList.add("active");
      this.render();
    }
    render() {
      this.renderHeader();
      this.renderResources();
      switch (this.currentTab) {
        case "resources":
          this.renderResourcesTab();
          break;
        case "buildings":
          this.renderBuildingsTab();
          break;
        case "research":
          this.renderResearchTab();
          break;
        case "barracks":
          this.renderBarracksTab();
          break;
        case "army":
          this.renderArmyTab();
          break;
        case "combat":
          this.renderCombatTab();
          break;
        case "achievements":
          this.renderAchievementsTab();
          break;
      }
      this.checkOfflineProgress();
      this.processAchievementNotifications();
    }
    renderHeader() {
      const era = getEraById(this.game.state.currentEra);
      const headerEl = document.getElementById("current-era");
      if (headerEl && era) {
        headerEl.textContent = era.name;
      }
      const descEl = document.getElementById("era-description");
      if (descEl && era) {
        descEl.textContent = era.description;
      }
      const eraIndex = ERAS.findIndex((e) => e.id === this.game.state.currentEra);
      const progressEl = document.getElementById("era-progress");
      if (progressEl) {
        progressEl.textContent = `Era ${eraIndex + 1} of ${ERAS.length}`;
      }
    }
    renderResources() {
      const { resources } = this.game.state;
      document.getElementById("food-amount").textContent = Math.floor(resources.food).toString();
      document.getElementById("wood-amount").textContent = Math.floor(resources.wood).toString();
      document.getElementById("stone-amount").textContent = Math.floor(resources.stone).toString();
      document.getElementById("gold-amount").textContent = Math.floor(resources.gold).toString();
      document.getElementById("science-amount").textContent = Math.floor(resources.science).toString();
      const era = getEraById(this.game.state.currentEra);
      if (era) {
        const { resourceMultipliers } = this.game.state;
        document.getElementById("food-rate").textContent = `+${(era.resources.food.baseRate * resourceMultipliers.food).toFixed(1)}/s`;
        document.getElementById("wood-rate").textContent = `+${(era.resources.wood.baseRate * resourceMultipliers.wood).toFixed(1)}/s`;
        document.getElementById("stone-rate").textContent = `+${(era.resources.stone.baseRate * resourceMultipliers.stone).toFixed(1)}/s`;
        document.getElementById("gold-rate").textContent = `+${(era.resources.gold.baseRate * resourceMultipliers.gold).toFixed(1)}/s`;
        document.getElementById("science-rate").textContent = `+${(era.resources.science.baseRate * resourceMultipliers.science).toFixed(1)}/s`;
      }
    }
    renderResourcesTab() {
      const { resourceMultipliers } = this.game.state;
      const foodBtn = document.getElementById("gather-food");
      const woodBtn = document.getElementById("gather-wood");
      const stoneBtn = document.getElementById("gather-stone");
      if (foodBtn) {
        foodBtn.textContent = `\u{1F356} Gather Food (+${resourceMultipliers.food.toFixed(1)})`;
      }
      if (woodBtn) {
        woodBtn.textContent = `\u{1FAB5} Gather Wood (+${resourceMultipliers.wood.toFixed(1)})`;
      }
      if (stoneBtn) {
        stoneBtn.textContent = `\u{1FAA8} Gather Stone (+${resourceMultipliers.stone.toFixed(1)})`;
      }
    }
    renderBuildingsTab() {
      const container = document.getElementById("buildings-content");
      if (!container)
        return;
      let html = "";
      html += "<h3>\u{1F528} Construction Queue</h3>";
      if (this.game.state.constructionQueue.length > 0) {
        html += '<div class="construction-queue">';
        const now = Date.now();
        for (const construction of this.game.state.constructionQueue) {
          const buildingType = getBuildingTypeById(construction.buildingId);
          if (buildingType) {
            const remaining = Math.max(0, (construction.endTime - now) / 1e3);
            const progress = (buildingType.buildTime - remaining) / buildingType.buildTime * 100;
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
        html += "</div>";
      } else {
        html += '<p class="empty-message">No buildings under construction</p>';
      }
      const buildingProduction = this.game.getBuildingProduction();
      const totalBuildings = this.game.getTotalBuildingCount();
      html += `
      <div class="building-overview">
        <h3>\u{1F4CA} Building Production (${totalBuildings} buildings)</h3>
        <div class="production-stats">
          ${buildingProduction.food > 0 ? `<span class="production-stat">\u{1F356} +${buildingProduction.food.toFixed(1)}/s</span>` : ""}
          ${buildingProduction.wood > 0 ? `<span class="production-stat">\u{1FAB5} +${buildingProduction.wood.toFixed(1)}/s</span>` : ""}
          ${buildingProduction.stone > 0 ? `<span class="production-stat">\u{1FAA8} +${buildingProduction.stone.toFixed(1)}/s</span>` : ""}
          ${buildingProduction.gold > 0 ? `<span class="production-stat">\u{1F4B0} +${buildingProduction.gold.toFixed(1)}/s</span>` : ""}
          ${buildingProduction.science > 0 ? `<span class="production-stat">\u{1F52C} +${buildingProduction.science.toFixed(1)}/s</span>` : ""}
          ${totalBuildings === 0 ? '<span class="empty-message">Build your first building to start producing resources!</span>' : ""}
        </div>
      </div>
    `;
      const buildingsByEra = /* @__PURE__ */ new Map();
      for (const era of ERAS) {
        buildingsByEra.set(era.id, []);
      }
      for (const building of BUILDING_TYPES) {
        buildingsByEra.get(building.era)?.push(building);
      }
      html += "<h3>\u{1F3D7}\uFE0F Available Buildings</h3>";
      for (const era of ERAS) {
        const buildings = buildingsByEra.get(era.id) || [];
        if (buildings.length === 0)
          continue;
        const hasUnlockedBuildings = buildings.some((b) => b.unlockTech === null || this.game.state.unlockedBuildings.has(b.id));
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
          let statusClass = "locked";
          if (atMax)
            statusClass = "maxed";
          else if (canBuild)
            statusClass = "available";
          html += `
          <div class="building-card ${statusClass}">
            <div class="building-header">
              <h5>${building.name}</h5>
              <span class="building-count">${currentCount}/${building.maxCount}</span>
            </div>
            <p class="building-desc">${building.description}</p>
            <div class="building-production">
              <span class="label">Production:</span>
              ${building.production.food ? `<span>\u{1F356} +${building.production.food}/s</span>` : ""}
              ${building.production.wood ? `<span>\u{1FAB5} +${building.production.wood}/s</span>` : ""}
              ${building.production.stone ? `<span>\u{1FAA8} +${building.production.stone}/s</span>` : ""}
              ${building.production.gold ? `<span>\u{1F4B0} +${building.production.gold}/s</span>` : ""}
              ${building.production.science ? `<span>\u{1F52C} +${building.production.science}/s</span>` : ""}
            </div>
            <div class="building-cost">
              <span class="label">Cost:</span>
              ${building.cost.food > 0 ? `<span>\u{1F356} ${building.cost.food}</span>` : ""}
              ${building.cost.wood > 0 ? `<span>\u{1FAB5} ${building.cost.wood}</span>` : ""}
              ${building.cost.stone > 0 ? `<span>\u{1FAA8} ${building.cost.stone}</span>` : ""}
              ${building.cost.gold > 0 ? `<span>\u{1F4B0} ${building.cost.gold}</span>` : ""}
            </div>
            <p class="build-time">\u23F1\uFE0F ${building.buildTime}s</p>
            <button class="build-btn" data-building="${building.id}" ${!canBuild || atMax ? "disabled" : ""}>
              ${atMax ? "Max Built" : "Build"}
            </button>
          </div>
        `;
        }
        html += "</div></div>";
      }
      container.innerHTML = html;
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
      const container = document.getElementById("research-tree");
      if (!container)
        return;
      let html = "";
      if (this.game.state.currentResearch) {
        const tech = getTechById(this.game.state.currentResearch);
        if (tech) {
          const progress = this.game.state.researchProgress / tech.cost.science * 100;
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
      const techsByEra = /* @__PURE__ */ new Map();
      for (const era of ERAS) {
        techsByEra.set(era.id, []);
      }
      for (const tech of TECHNOLOGIES) {
        techsByEra.get(tech.era)?.push(tech);
      }
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
          let statusClass = "locked";
          if (isResearched)
            statusClass = "researched";
          else if (isCurrent)
            statusClass = "current";
          else if (isAvailable)
            statusClass = "available";
          html += `
          <div class="tech-card ${statusClass}" data-tech-id="${tech.id}">
            <h4>${tech.name}</h4>
            <p class="tech-desc">${tech.description}</p>
            <p class="tech-cost">Cost: ${tech.cost.science} science</p>
            ${isResearched ? '<span class="badge">\u2713 Researched</span>' : ""}
            ${isAvailable && !isResearched && !isCurrent ? `<button class="research-btn" data-tech="${tech.id}">Research</button>` : ""}
          </div>
        `;
        }
        html += "</div></div>";
      }
      container.innerHTML = html;
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
      const container = document.getElementById("barracks-content");
      if (!container)
        return;
      let html = "<h3>Training Queue</h3>";
      if (this.game.state.trainingQueue.length > 0) {
        html += '<div class="training-queue">';
        const now = Date.now();
        for (const training of this.game.state.trainingQueue) {
          const troopType = getTroopTypeById(training.troopId);
          if (troopType) {
            const remaining = Math.max(0, (training.endTime - now) / 1e3);
            const progress = (troopType.trainTime - remaining) / troopType.trainTime * 100;
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
        html += "</div>";
      } else {
        html += '<p class="empty-message">No troops in training</p>';
      }
      html += "<h3>Available Units</h3>";
      const availableTroops = this.game.getAvailableTroops();
      if (availableTroops.length === 0) {
        html += '<p class="empty-message">Research technologies to unlock troops!</p>';
      } else {
        html += '<div class="troop-grid">';
        for (const troop of availableTroops) {
          const canTrain = this.canTrainTroop(troop);
          html += `
          <div class="troop-card ${canTrain ? "available" : "unavailable"}">
            <h4>${troop.name}</h4>
            <p class="troop-desc">${troop.description}</p>
            <div class="troop-stats">
              <span>\u2694\uFE0F ${troop.stats.attack}</span>
              <span>\u{1F6E1}\uFE0F ${troop.stats.defense}</span>
              <span>\u2764\uFE0F ${troop.stats.health}</span>
            </div>
            <div class="troop-cost">
              <span>\u{1F356} ${troop.cost.food}</span>
              <span>\u{1F4B0} ${troop.cost.gold}</span>
              ${troop.cost.wood ? `<span>\u{1FAB5} ${troop.cost.wood}</span>` : ""}
              ${troop.cost.stone ? `<span>\u{1FAA8} ${troop.cost.stone}</span>` : ""}
            </div>
            <p class="train-time">\u23F1\uFE0F ${troop.trainTime}s</p>
            <button class="train-btn" data-troop="${troop.id}" ${!canTrain ? "disabled" : ""}>
              Train
            </button>
          </div>
        `;
        }
        html += "</div>";
      }
      container.innerHTML = html;
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
      const container = document.getElementById("army-content");
      if (!container)
        return;
      const { army } = this.game.state;
      const power = this.game.getArmyPower();
      let html = `
      <div class="army-overview">
        <h3>Army Power</h3>
        <div class="power-stats">
          <div class="power-stat">
            <span class="power-icon">\u2694\uFE0F</span>
            <span class="power-value">${power.attack}</span>
            <span class="power-label">Attack</span>
          </div>
          <div class="power-stat">
            <span class="power-icon">\u{1F6E1}\uFE0F</span>
            <span class="power-value">${power.defense}</span>
            <span class="power-label">Defense</span>
          </div>
          <div class="power-stat">
            <span class="power-icon">\u2764\uFE0F</span>
            <span class="power-value">${power.health}</span>
            <span class="power-label">Health</span>
          </div>
        </div>
      </div>
    `;
      html += "<h3>Your Troops</h3>";
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
                <span>\u2694\uFE0F ${troopType.stats.attack * troop.count}</span>
                <span>\u{1F6E1}\uFE0F ${troopType.stats.defense * troop.count}</span>
                <span>\u2764\uFE0F ${troopType.stats.health * troop.count}</span>
              </div>
            </div>
          `;
          }
        }
        html += "</div>";
      }
      container.innerHTML = html;
    }
    renderCombatTab() {
      const container = document.getElementById("combat-content");
      if (!container)
        return;
      if (this.game.state.activeBattle) {
        this.renderActiveBattle(container);
        return;
      }
      let html = "<h3>\u2694\uFE0F Combat Missions</h3>";
      html += '<p class="combat-intro">Choose a mission to test your army against enemy forces. Missions are organized by era - higher eras have tougher enemies but better rewards!</p>';
      const playerPower = this.game.getArmyPower();
      html += `
      <div class="army-power-summary">
        <span>Your Army: \u2694\uFE0F ${playerPower.attack} | \u{1F6E1}\uFE0F ${playerPower.defense} | \u2764\uFE0F ${playerPower.health}</span>
      </div>
    `;
      if (playerPower.health === 0) {
        html += '<div class="warning-message">\u26A0\uFE0F You need troops to start missions! Train some in the Barracks first.</div>';
      }
      for (const era of ERAS) {
        const eraMissions = getMissionsByEra(this.game.state.missions, era.id);
        if (eraMissions.length === 0)
          continue;
        const isEraAvailable = isMissionAvailable(eraMissions[0], this.game.state.currentEra);
        html += `
        <div class="mission-era-section ${!isEraAvailable ? "locked" : ""}">
          <h4 class="mission-era-title">${era.name} Missions ${!isEraAvailable ? "\u{1F512}" : ""}</h4>
          <div class="mission-grid">
      `;
        for (const mission of eraMissions) {
          const isAvailable = isMissionAvailable(mission, this.game.state.currentEra);
          const isCompleted = this.game.isMissionCompleted(mission.id);
          const canStart = isAvailable && playerPower.health > 0;
          const difficultyRating = this.getDifficultyRating(playerPower, mission);
          html += `
          <div class="mission-card ${isCompleted ? "completed" : ""} ${!isAvailable ? "locked" : ""}">
            <div class="mission-header">
              <h5>${mission.name}</h5>
              ${isCompleted ? '<span class="completed-badge">\u2713 Completed</span>' : ""}
            </div>
            <p class="mission-desc">${mission.description}</p>
            <div class="enemy-stats">
              <span class="enemy-label">Enemy: ${mission.enemyArmy.name}</span>
              <div class="enemy-power">
                <span>\u2694\uFE0F ${mission.enemyArmy.attack}</span>
                <span>\u{1F6E1}\uFE0F ${mission.enemyArmy.defense}</span>
                <span>\u2764\uFE0F ${mission.enemyArmy.health}</span>
              </div>
            </div>
            <div class="difficulty-indicator ${difficultyRating.class}">
              Difficulty: ${difficultyRating.label}
            </div>
            <div class="mission-rewards">
              <span class="rewards-label">Rewards:</span>
              <div class="rewards-list">
                ${mission.rewards.food > 0 ? `<span>\u{1F356} ${mission.rewards.food}</span>` : ""}
                ${mission.rewards.wood > 0 ? `<span>\u{1FAB5} ${mission.rewards.wood}</span>` : ""}
                ${mission.rewards.stone > 0 ? `<span>\u{1FAA8} ${mission.rewards.stone}</span>` : ""}
                ${mission.rewards.gold > 0 ? `<span>\u{1F4B0} ${mission.rewards.gold}</span>` : ""}
                ${mission.rewards.science > 0 ? `<span>\u{1F52C} ${mission.rewards.science}</span>` : ""}
              </div>
            </div>
            <button class="mission-btn ${!canStart ? "disabled" : ""}" 
                    data-mission="${mission.id}" 
                    ${!canStart ? "disabled" : ""}>
              ${!isAvailable ? "\u{1F512} Locked" : isCompleted ? "\u2694\uFE0F Replay" : "\u2694\uFE0F Start Mission"}
            </button>
          </div>
        `;
        }
        html += "</div></div>";
      }
      container.innerHTML = html;
    }
    getDifficultyRating(playerPower, mission) {
      const playerTotal = playerPower.attack + playerPower.defense + playerPower.health;
      const enemyTotal = mission.enemyArmy.attack + mission.enemyArmy.defense + mission.enemyArmy.health;
      if (playerTotal === 0)
        return { label: "Impossible", class: "difficulty-impossible" };
      const ratio = playerTotal / enemyTotal;
      if (ratio >= 2)
        return { label: "Very Easy", class: "difficulty-very-easy" };
      if (ratio >= 1.5)
        return { label: "Easy", class: "difficulty-easy" };
      if (ratio >= 1)
        return { label: "Medium", class: "difficulty-medium" };
      if (ratio >= 0.7)
        return { label: "Hard", class: "difficulty-hard" };
      if (ratio >= 0.4)
        return { label: "Very Hard", class: "difficulty-very-hard" };
      return { label: "Extreme", class: "difficulty-extreme" };
    }
    startMission(missionId) {
      if (this.game.startMission(missionId)) {
        this.startBattleAnimation();
      }
    }
    startBattleAnimation() {
      if (this.battleAnimationInterval) {
        clearInterval(this.battleAnimationInterval);
      }
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
      const playerHealthPercent = playerHealth / battle.playerStartHealth * 100;
      const enemyHealthPercent = enemyHealth / battle.enemyStartHealth * 100;
      let html = `
      <div class="battle-arena">
        <h3 class="battle-title">\u2694\uFE0F Battle: ${mission.name}</h3>
        <p class="battle-vs">Your Army vs ${mission.enemyArmy.name}</p>
        
        <div class="battle-field">
          <!-- Player Side -->
          <div class="battle-side player-side">
            <div class="army-icon ${battle.isComplete && battle.result?.victory ? "victorious" : ""} ${battle.isComplete && !battle.result?.victory ? "defeated" : ""}">
              \u{1F3F0}
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
            <div class="battle-clash ${!battle.isComplete ? "animating" : ""}">
              \u2694\uFE0F
            </div>
            <div class="round-counter">
              Round ${battle.currentRound} / ${battle.logs.length}
            </div>
          </div>
          
          <!-- Enemy Side -->
          <div class="battle-side enemy-side">
            <div class="army-icon ${battle.isComplete && !battle.result?.victory ? "victorious" : ""} ${battle.isComplete && battle.result?.victory ? "defeated" : ""}">
              \u{1F479}
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
      for (let i = 0; i < battle.currentRound; i++) {
        const log = battle.logs[i];
        html += `
        <div class="log-entry ${i === battle.currentRound - 1 ? "latest" : ""}">
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
      if (battle.isComplete && battle.result) {
        const result = battle.result;
        html += `
        <div class="battle-result ${result.victory ? "victory" : "defeat"}">
          <h3>${result.victory ? "\u{1F389} Victory!" : "\u{1F480} Defeat!"}</h3>
          <p class="casualty-report">Casualties: ${result.casualtyPercent}% of your army</p>
          ${result.victory && result.rewards ? `
            <div class="battle-rewards">
              <h4>Rewards Earned:</h4>
              <div class="rewards-list">
                ${result.rewards.food > 0 ? `<span>\u{1F356} +${result.rewards.food}</span>` : ""}
                ${result.rewards.wood > 0 ? `<span>\u{1FAB5} +${result.rewards.wood}</span>` : ""}
                ${result.rewards.stone > 0 ? `<span>\u{1FAA8} +${result.rewards.stone}</span>` : ""}
                ${result.rewards.gold > 0 ? `<span>\u{1F4B0} +${result.rewards.gold}</span>` : ""}
                ${result.rewards.science > 0 ? `<span>\u{1F52C} +${result.rewards.science}</span>` : ""}
              </div>
            </div>
          ` : ""}
          <button class="dismiss-battle-btn" id="dismiss-battle">Return to Missions</button>
        </div>
      `;
      }
      html += `
      <div class="battle-controls">
        <label>Battle Speed:</label>
        <input type="range" id="battle-speed" min="100" max="2000" step="100" 
               value="${this.game.state.battleAnimationSpeed}">
        <span id="speed-display">${this.game.state.battleAnimationSpeed}ms</span>
      </div>
    `;
      html += "</div>";
      container.innerHTML = html;
      const battleLog = document.getElementById("battle-log");
      if (battleLog) {
        battleLog.scrollTop = battleLog.scrollHeight;
      }
    }
    saveGame() {
      const saveString = this.game.saveGame();
      localStorage.setItem("civGameSave", saveString);
      this.showNotification("Game saved!");
    }
    loadGame() {
      const saveString = localStorage.getItem("civGameSave");
      if (saveString && this.game.loadGame(saveString)) {
        this.showNotification("Game loaded!");
      } else {
        this.showNotification("No save found!");
      }
    }
    resetGame() {
      if (confirm("Are you sure you want to reset? All progress will be lost!")) {
        this.game.resetGame();
        localStorage.removeItem("civGameSave");
        this.showNotification("Game reset!");
      }
    }
    showNotification(message) {
      const notification = document.createElement("div");
      notification.className = "notification";
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 500);
      }, 2e3);
    }
    // Achievements tab
    renderAchievementsTab() {
      const container = document.getElementById("achievements-content");
      if (!container)
        return;
      let html = "";
      html += this.renderStatisticsSection();
      const categories = [
        { id: "progress", name: "Era Progress", icon: "\u{1F3DB}\uFE0F" },
        { id: "resources", name: "Resource Gathering", icon: "\u{1F4E6}" },
        { id: "buildings", name: "Buildings", icon: "\u{1F3D7}\uFE0F" },
        { id: "research", name: "Research", icon: "\u{1F52C}" },
        { id: "military", name: "Military", icon: "\u2694\uFE0F" },
        { id: "combat", name: "Combat", icon: "\u{1F3AF}" }
      ];
      html += "<h3>\u{1F3C6} Achievements</h3>";
      const unlockedCount = this.game.getUnlockedAchievements().length;
      const totalCount = ACHIEVEMENTS.length;
      html += `<div class="achievement-progress-bar">
      <div class="achievement-progress-fill" style="width: ${unlockedCount / totalCount * 100}%"></div>
      <span class="achievement-progress-text">${unlockedCount} / ${totalCount} Unlocked</span>
    </div>`;
      for (const category of categories) {
        const categoryAchievements = getAchievementsByCategory(category.id);
        const unlockedInCategory = categoryAchievements.filter((a) => {
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
          <div class="achievement-card ${isUnlocked ? "unlocked" : "locked"}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
              <h5>${achievement.name}</h5>
              <p>${achievement.description}</p>
              ${achievement.reward ? `<span class="achievement-reward">Reward: ${achievement.reward.resource ? achievement.reward.resource + " " : ""}\xD7${achievement.reward.amount}</span>` : ""}
            </div>
            ${isUnlocked ? '<span class="achievement-badge">\u2713</span>' : ""}
          </div>
        `;
        }
        html += "</div></div>";
      }
      container.innerHTML = html;
    }
    renderStatisticsSection() {
      const stats = this.game.state.statistics;
      const formatNumber = (n) => Math.floor(n).toLocaleString();
      const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0)
          return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0)
          return `${minutes}m ${secs}s`;
        return `${secs}s`;
      };
      return `
      <div class="statistics-section">
        <h3>\u{1F4CA} Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">\u{1F356}</span>
            <span class="stat-value">${formatNumber(stats.totalFoodGathered)}</span>
            <span class="stat-label">Total Food</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1FAB5}</span>
            <span class="stat-value">${formatNumber(stats.totalWoodGathered)}</span>
            <span class="stat-label">Total Wood</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1FAA8}</span>
            <span class="stat-value">${formatNumber(stats.totalStoneGathered)}</span>
            <span class="stat-label">Total Stone</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F4B0}</span>
            <span class="stat-value">${formatNumber(stats.totalGoldEarned)}</span>
            <span class="stat-label">Total Gold</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F52C}</span>
            <span class="stat-value">${formatNumber(stats.totalScienceGenerated)}</span>
            <span class="stat-label">Total Science</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F446}</span>
            <span class="stat-value">${formatNumber(stats.clickCount)}</span>
            <span class="stat-label">Clicks</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F3D7}\uFE0F</span>
            <span class="stat-value">${this.game.getTotalBuildingCount()}</span>
            <span class="stat-label">Buildings</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u2694\uFE0F</span>
            <span class="stat-value">${formatNumber(stats.totalTroopsTrained)}</span>
            <span class="stat-label">Troops Trained</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F3C6}</span>
            <span class="stat-value">${stats.battlesWon}</span>
            <span class="stat-label">Battles Won</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F480}</span>
            <span class="stat-value">${stats.battlesLost}</span>
            <span class="stat-label">Battles Lost</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u23F1\uFE0F</span>
            <span class="stat-value">${formatTime(this.game.state.totalPlayTime)}</span>
            <span class="stat-label">Play Time</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F4A4}</span>
            <span class="stat-value">${formatNumber(stats.offlineEarnings)}</span>
            <span class="stat-label">Offline Earnings</span>
          </div>
          <div class="stat-card">
            <span class="stat-icon">\u{1F4DA}</span>
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
      const popup = document.createElement("div");
      popup.className = "achievement-popup";
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
      setTimeout(() => popup.classList.add("show"), 10);
      setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => {
          popup.remove();
          this.isShowingAchievement = false;
          this.processAchievementNotifications();
        }, 500);
      }, 3e3);
    }
    // Offline progress popup
    checkOfflineProgress() {
      const offlineProgress = this.game.offlineProgress;
      if (!offlineProgress || !offlineProgress.earned)
        return;
      this.game.dismissOfflineProgress();
      this.showOfflineProgressPopup(offlineProgress);
    }
    showOfflineProgressPopup(progress) {
      const formatNumber = (n) => Math.floor(n).toLocaleString();
      const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        if (hours > 0)
          return `${hours}h ${minutes}m`;
        return `${minutes}m`;
      };
      const popup = document.createElement("div");
      popup.className = "offline-popup-overlay";
      popup.innerHTML = `
      <div class="offline-popup">
        <h3>\u{1F4A4} Welcome Back!</h3>
        <p>You were away for ${formatTime(progress.duration)}</p>
        <p class="offline-subtitle">Your civilization earned while you were gone:</p>
        <div class="offline-rewards">
          ${progress.resources.food > 0 ? `<span>\u{1F356} +${formatNumber(progress.resources.food)}</span>` : ""}
          ${progress.resources.wood > 0 ? `<span>\u{1FAB5} +${formatNumber(progress.resources.wood)}</span>` : ""}
          ${progress.resources.stone > 0 ? `<span>\u{1FAA8} +${formatNumber(progress.resources.stone)}</span>` : ""}
          ${progress.resources.gold > 0 ? `<span>\u{1F4B0} +${formatNumber(progress.resources.gold)}</span>` : ""}
          ${progress.resources.science > 0 ? `<span>\u{1F52C} +${formatNumber(progress.resources.science)}</span>` : ""}
        </div>
        <p class="offline-note">Offline earnings are 50% of normal rate (max 8 hours)</p>
        <button class="offline-dismiss-btn">Continue Playing</button>
      </div>
    `;
      document.body.appendChild(popup);
      popup.querySelector(".offline-dismiss-btn")?.addEventListener("click", () => {
        popup.classList.add("fade-out");
        setTimeout(() => popup.remove(), 300);
      });
      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          popup.classList.add("fade-out");
          setTimeout(() => popup.remove(), 300);
        }
      });
    }
  };

  // dist/main.js
  function initGame() {
    const game = new Game();
    const ui = new GameUI(game);
    const saveString = localStorage.getItem("civGameSave");
    if (saveString) {
      game.loadGame(saveString);
    }
    game.start();
    ui.render();
    setInterval(() => {
      const saveData = game.saveGame();
      localStorage.setItem("civGameSave", saveData);
    }, 3e4);
    window.game = game;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame);
  } else {
    initGame();
  }
})();
