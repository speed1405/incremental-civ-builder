export const BUILDING_TYPES = [
    // Stone Age Buildings
    {
        id: 'hut',
        name: 'Hut',
        description: 'A simple shelter that increases food production.',
        era: 'stone_age',
        unlockTech: null, // Available from start
        cost: { food: 10, wood: 10, stone: 5, gold: 0 },
        buildTime: 10,
        production: { food: 0.5 },
        maxCount: 10,
    },
    {
        id: 'campfire',
        name: 'Campfire',
        description: 'Provides warmth and allows better cooking. Increases food and science.',
        era: 'stone_age',
        unlockTech: 'fire',
        cost: { food: 5, wood: 20, stone: 10, gold: 0 },
        buildTime: 8,
        production: { food: 0.3, science: 0.1 },
        maxCount: 5,
    },
    {
        id: 'farm',
        name: 'Farm',
        description: 'Cultivate crops for a steady food supply.',
        era: 'stone_age',
        unlockTech: 'agriculture',
        cost: { food: 15, wood: 20, stone: 5, gold: 0 },
        buildTime: 15,
        production: { food: 1.0 },
        maxCount: 15,
    },
    // Bronze Age Buildings
    {
        id: 'granary',
        name: 'Granary',
        description: 'Store grain to prevent food spoilage. Greatly increases food production.',
        era: 'bronze_age',
        unlockTech: 'pottery',
        cost: { food: 50, wood: 80, stone: 60, gold: 20 },
        buildTime: 20,
        production: { food: 2.0 },
        maxCount: 10,
    },
    {
        id: 'workshop',
        name: 'Workshop',
        description: 'Craft tools and goods. Increases wood and stone production.',
        era: 'bronze_age',
        unlockTech: 'bronze_working',
        cost: { food: 40, wood: 100, stone: 80, gold: 30 },
        buildTime: 25,
        production: { wood: 1.0, stone: 0.5 },
        maxCount: 8,
    },
    {
        id: 'library',
        name: 'Library',
        description: 'A place of learning. Increases science production.',
        era: 'bronze_age',
        unlockTech: 'writing',
        cost: { food: 30, wood: 60, stone: 40, gold: 50 },
        buildTime: 30,
        production: { science: 0.5 },
        maxCount: 5,
    },
    // Iron Age Buildings
    {
        id: 'mine',
        name: 'Mine',
        description: 'Extract ore and stone from the earth.',
        era: 'iron_age',
        unlockTech: 'iron_working',
        cost: { food: 60, wood: 100, stone: 150, gold: 80 },
        buildTime: 40,
        production: { stone: 2.0, gold: 0.5 },
        maxCount: 10,
    },
    {
        id: 'market',
        name: 'Market',
        description: 'Trade goods for gold. Increases gold production.',
        era: 'iron_age',
        unlockTech: 'currency',
        cost: { food: 50, wood: 80, stone: 60, gold: 100 },
        buildTime: 35,
        production: { gold: 1.5 },
        maxCount: 8,
    },
    {
        id: 'academy',
        name: 'Academy',
        description: 'Train scholars and philosophers. Greatly increases science.',
        era: 'iron_age',
        unlockTech: 'philosophy',
        cost: { food: 40, wood: 70, stone: 80, gold: 150 },
        buildTime: 45,
        production: { science: 1.5 },
        maxCount: 5,
    },
    // Classical Age Buildings
    {
        id: 'aqueduct',
        name: 'Aqueduct',
        description: 'Bring water to your cities. Boosts food and stone production.',
        era: 'classical_age',
        unlockTech: 'engineering',
        cost: { food: 80, wood: 100, stone: 200, gold: 150 },
        buildTime: 60,
        production: { food: 2.5, stone: 1.5 },
        maxCount: 5,
    },
    {
        id: 'colosseum',
        name: 'Colosseum',
        description: 'Entertainment venue. Attracts trade and boosts gold.',
        era: 'classical_age',
        unlockTech: 'construction',
        cost: { food: 100, wood: 150, stone: 300, gold: 200 },
        buildTime: 80,
        production: { gold: 3.0 },
        maxCount: 3,
    },
    // Medieval Age Buildings
    {
        id: 'blacksmith',
        name: 'Blacksmith',
        description: 'Forge weapons and tools. Increases gold and stone production.',
        era: 'medieval_age',
        unlockTech: 'metal_casting',
        cost: { food: 100, wood: 150, stone: 200, gold: 250 },
        buildTime: 50,
        production: { gold: 2.0, stone: 1.0 },
        maxCount: 8,
    },
    {
        id: 'cathedral',
        name: 'Cathedral',
        description: 'A grand place of worship. Boosts science and gold.',
        era: 'medieval_age',
        unlockTech: 'feudalism',
        cost: { food: 150, wood: 200, stone: 400, gold: 500 },
        buildTime: 100,
        production: { science: 2.5, gold: 2.0 },
        maxCount: 3,
    },
    {
        id: 'windmill',
        name: 'Windmill',
        description: 'Harness wind power for grinding grain. Increases food production.',
        era: 'medieval_age',
        unlockTech: 'machinery',
        cost: { food: 80, wood: 200, stone: 100, gold: 150 },
        buildTime: 45,
        production: { food: 3.5 },
        maxCount: 10,
    },
    // Renaissance Buildings
    {
        id: 'bank',
        name: 'Bank',
        description: 'Financial institution. Greatly increases gold production.',
        era: 'renaissance',
        unlockTech: 'banking',
        cost: { food: 100, wood: 150, stone: 200, gold: 800 },
        buildTime: 60,
        production: { gold: 5.0 },
        maxCount: 5,
    },
    {
        id: 'observatory',
        name: 'Observatory',
        description: 'Study the stars. Greatly increases science production.',
        era: 'renaissance',
        unlockTech: 'astronomy',
        cost: { food: 80, wood: 100, stone: 300, gold: 600 },
        buildTime: 70,
        production: { science: 4.0 },
        maxCount: 3,
    },
    {
        id: 'shipyard',
        name: 'Shipyard',
        description: 'Build ships for trade. Increases gold and wood production.',
        era: 'renaissance',
        unlockTech: 'printing_press',
        cost: { food: 150, wood: 400, stone: 200, gold: 500 },
        buildTime: 80,
        production: { gold: 3.5, wood: 2.0 },
        maxCount: 5,
    },
    // Industrial Age Buildings
    {
        id: 'factory',
        name: 'Factory',
        description: 'Mass produce goods. Increases all resource production.',
        era: 'industrial_age',
        unlockTech: 'industrialization',
        cost: { food: 200, wood: 300, stone: 400, gold: 1000 },
        buildTime: 90,
        production: { food: 3.0, wood: 3.0, stone: 2.0, gold: 4.0 },
        maxCount: 8,
    },
    {
        id: 'railroad_station',
        name: 'Railroad Station',
        description: 'Connect cities via rail. Boosts all production.',
        era: 'industrial_age',
        unlockTech: 'railroad',
        cost: { food: 150, wood: 250, stone: 350, gold: 800 },
        buildTime: 70,
        production: { food: 2.0, wood: 2.0, stone: 2.0, gold: 3.0 },
        maxCount: 5,
    },
    {
        id: 'power_plant',
        name: 'Power Plant',
        description: 'Generate electricity. Greatly boosts production.',
        era: 'industrial_age',
        unlockTech: 'electricity',
        cost: { food: 100, wood: 200, stone: 500, gold: 1500 },
        buildTime: 100,
        production: { gold: 8.0, science: 3.0 },
        maxCount: 5,
    },
    // Modern Age Buildings
    {
        id: 'research_lab',
        name: 'Research Lab',
        description: 'Advanced scientific research. Greatly increases science.',
        era: 'modern_age',
        unlockTech: 'radio',
        cost: { food: 200, wood: 150, stone: 300, gold: 2000 },
        buildTime: 80,
        production: { science: 8.0 },
        maxCount: 8,
    },
    {
        id: 'oil_refinery',
        name: 'Oil Refinery',
        description: 'Process petroleum. Increases gold production significantly.',
        era: 'modern_age',
        unlockTech: 'combustion',
        cost: { food: 150, wood: 200, stone: 400, gold: 2500 },
        buildTime: 100,
        production: { gold: 10.0 },
        maxCount: 5,
    },
    {
        id: 'airport',
        name: 'Airport',
        description: 'Enable air travel and trade. Boosts gold and science.',
        era: 'modern_age',
        unlockTech: 'flight',
        cost: { food: 200, wood: 300, stone: 500, gold: 3000 },
        buildTime: 120,
        production: { gold: 8.0, science: 5.0 },
        maxCount: 3,
    },
    // Atomic Age Buildings
    {
        id: 'nuclear_plant',
        name: 'Nuclear Plant',
        description: 'Clean nuclear energy. Massive production boost.',
        era: 'atomic_age',
        unlockTech: 'nuclear_power',
        cost: { food: 300, wood: 200, stone: 800, gold: 5000 },
        buildTime: 150,
        production: { gold: 15.0, science: 10.0 },
        maxCount: 5,
    },
    {
        id: 'space_center',
        name: 'Space Center',
        description: 'Launch rockets and satellites. Greatly increases science.',
        era: 'atomic_age',
        unlockTech: 'rocketry',
        cost: { food: 400, wood: 300, stone: 1000, gold: 8000 },
        buildTime: 180,
        production: { science: 20.0 },
        maxCount: 3,
    },
    // Information Age Buildings
    {
        id: 'data_center',
        name: 'Data Center',
        description: 'Store and process information. Massive science boost.',
        era: 'information_age',
        unlockTech: 'internet',
        cost: { food: 300, wood: 200, stone: 500, gold: 10000 },
        buildTime: 100,
        production: { science: 30.0, gold: 10.0 },
        maxCount: 8,
    },
    {
        id: 'robotics_facility',
        name: 'Robotics Facility',
        description: 'Automate production with robots. Boosts all resources.',
        era: 'information_age',
        unlockTech: 'robotics',
        cost: { food: 400, wood: 300, stone: 600, gold: 15000 },
        buildTime: 120,
        production: { food: 10.0, wood: 8.0, stone: 6.0, gold: 12.0 },
        maxCount: 5,
    },
    // Future Age Buildings
    {
        id: 'fusion_reactor',
        name: 'Fusion Reactor',
        description: 'Unlimited clean energy. Massive production boost.',
        era: 'future_age',
        unlockTech: 'fusion_power',
        cost: { food: 500, wood: 400, stone: 800, gold: 25000 },
        buildTime: 200,
        production: { gold: 50.0, science: 30.0 },
        maxCount: 5,
    },
    {
        id: 'quantum_lab',
        name: 'Quantum Lab',
        description: 'Quantum computing research. Extreme science production.',
        era: 'future_age',
        unlockTech: 'quantum_computing',
        cost: { food: 400, wood: 300, stone: 600, gold: 30000 },
        buildTime: 150,
        production: { science: 80.0 },
        maxCount: 5,
    },
    {
        id: 'space_colony',
        name: 'Space Colony',
        description: 'Expand to the stars. Produces all resources.',
        era: 'future_age',
        unlockTech: 'space_colonization',
        cost: { food: 1000, wood: 800, stone: 1200, gold: 50000 },
        buildTime: 300,
        production: { food: 30.0, wood: 25.0, stone: 20.0, gold: 40.0, science: 50.0 },
        maxCount: 3,
    },
];
export function getBuildingTypeById(id) {
    return BUILDING_TYPES.find(b => b.id === id);
}
export function getBuildingsByEra(era) {
    return BUILDING_TYPES.filter(b => b.era === era);
}
export function canBuildBuilding(buildingId, unlockedBuildings, builtBuildings, resources) {
    const buildingType = getBuildingTypeById(buildingId);
    if (!buildingType)
        return false;
    // Check if unlocked (either no tech requirement or tech has been researched)
    if (buildingType.unlockTech && !unlockedBuildings.has(buildingType.id))
        return false;
    // Check if we've reached max count
    const existing = builtBuildings.find(b => b.typeId === buildingId);
    if (existing && existing.count >= buildingType.maxCount)
        return false;
    // Check costs
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
export function calculateBuildingProduction(buildings) {
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
        science: totalScience,
    };
}
export function getTotalBuildingCount(buildings) {
    return buildings.reduce((sum, b) => sum + b.count, 0);
}
//# sourceMappingURL=buildings.js.map