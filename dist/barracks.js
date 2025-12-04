export const TROOP_TYPES = [
    // Stone Age
    {
        id: 'hunter',
        name: 'Hunter',
        description: 'Basic ranged unit with primitive weapons.',
        era: 'stone_age',
        unlockTech: 'hunting',
        cost: { food: 30, gold: 0 },
        trainTime: 5,
        stats: { attack: 3, defense: 1, health: 20 },
    },
    // Bronze Age
    {
        id: 'warrior',
        name: 'Warrior',
        description: 'Melee fighter with bronze weapons.',
        era: 'bronze_age',
        unlockTech: 'bronze_working',
        cost: { food: 50, gold: 10 },
        trainTime: 8,
        stats: { attack: 6, defense: 4, health: 40 },
    },
    {
        id: 'chariot',
        name: 'War Chariot',
        description: 'Fast mobile unit.',
        era: 'bronze_age',
        unlockTech: 'wheel',
        cost: { food: 40, gold: 30, wood: 50 },
        trainTime: 12,
        stats: { attack: 8, defense: 2, health: 30 },
    },
    // Iron Age
    {
        id: 'swordsman',
        name: 'Swordsman',
        description: 'Skilled fighter with iron sword.',
        era: 'iron_age',
        unlockTech: 'iron_working',
        cost: { food: 60, gold: 25 },
        trainTime: 10,
        stats: { attack: 10, defense: 6, health: 50 },
    },
    // Classical Age
    {
        id: 'horseman',
        name: 'Horseman',
        description: 'Mounted cavalry unit.',
        era: 'classical_age',
        unlockTech: 'horseback_riding',
        cost: { food: 80, gold: 40 },
        trainTime: 15,
        stats: { attack: 12, defense: 4, health: 45 },
    },
    {
        id: 'legionary',
        name: 'Legionary',
        description: 'Elite heavy infantry.',
        era: 'classical_age',
        unlockTech: 'iron_casting',
        cost: { food: 70, gold: 35 },
        trainTime: 12,
        stats: { attack: 11, defense: 10, health: 60 },
    },
    // Medieval Age
    {
        id: 'knight',
        name: 'Knight',
        description: 'Heavily armored mounted warrior.',
        era: 'medieval_age',
        unlockTech: 'feudalism',
        cost: { food: 100, gold: 80 },
        trainTime: 20,
        stats: { attack: 18, defense: 14, health: 80 },
    },
    {
        id: 'musketeer',
        name: 'Musketeer',
        description: 'Soldier armed with a musket.',
        era: 'medieval_age',
        unlockTech: 'gunpowder',
        cost: { food: 90, gold: 60 },
        trainTime: 15,
        stats: { attack: 22, defense: 8, health: 55 },
    },
    // Renaissance
    {
        id: 'rifleman',
        name: 'Rifleman',
        description: 'Soldier with advanced rifle.',
        era: 'renaissance',
        unlockTech: 'military_science',
        cost: { food: 100, gold: 70 },
        trainTime: 12,
        stats: { attack: 28, defense: 10, health: 60 },
    },
    // Industrial Age
    {
        id: 'artillery',
        name: 'Artillery',
        description: 'Powerful ranged siege weapon.',
        era: 'industrial_age',
        unlockTech: 'dynamite',
        cost: { food: 80, gold: 150, stone: 100 },
        trainTime: 25,
        stats: { attack: 45, defense: 5, health: 50 },
    },
    // Modern Age
    {
        id: 'tank',
        name: 'Tank',
        description: 'Armored fighting vehicle.',
        era: 'modern_age',
        unlockTech: 'combustion',
        cost: { food: 100, gold: 250 },
        trainTime: 30,
        stats: { attack: 55, defense: 35, health: 120 },
    },
    {
        id: 'fighter',
        name: 'Fighter',
        description: 'Military aircraft.',
        era: 'modern_age',
        unlockTech: 'flight',
        cost: { food: 80, gold: 300 },
        trainTime: 25,
        stats: { attack: 65, defense: 20, health: 80 },
    },
    // Atomic Age
    {
        id: 'rocket_artillery',
        name: 'Rocket Artillery',
        description: 'Long-range rocket launcher.',
        era: 'atomic_age',
        unlockTech: 'rocketry',
        cost: { food: 100, gold: 400 },
        trainTime: 30,
        stats: { attack: 80, defense: 10, health: 70 },
    },
    // Information Age
    {
        id: 'mech_infantry',
        name: 'Mechanized Infantry',
        description: 'Soldiers with powered exoskeletons.',
        era: 'information_age',
        unlockTech: 'robotics',
        cost: { food: 120, gold: 500 },
        trainTime: 20,
        stats: { attack: 70, defense: 50, health: 150 },
    },
    // Future Age
    {
        id: 'space_marine',
        name: 'Space Marine',
        description: 'Elite soldier for space combat.',
        era: 'future_age',
        unlockTech: 'space_colonization',
        cost: { food: 150, gold: 800 },
        trainTime: 25,
        stats: { attack: 100, defense: 80, health: 200 },
    },
];
export function getTroopTypeById(id) {
    return TROOP_TYPES.find(troop => troop.id === id);
}
export function getTroopsByEra(era) {
    return TROOP_TYPES.filter(troop => troop.era === era);
}
export function canTrainTroop(troopId, unlockedTroops, resources) {
    const troopType = getTroopTypeById(troopId);
    if (!troopType)
        return false;
    if (!unlockedTroops.has(troopId))
        return false;
    // Check costs
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
export function calculateArmyPower(troops) {
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
//# sourceMappingURL=barracks.js.map