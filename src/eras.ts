// Era definitions - from Stone Age to Future
export interface Era {
  id: string;
  name: string;
  description: string;
  requiredResearch: string | null;
  resources: {
    food: { baseRate: number };
    wood: { baseRate: number };
    stone: { baseRate: number };
    gold: { baseRate: number };
    science: { baseRate: number };
  };
}

export const ERAS: Era[] = [
  {
    id: 'stone_age',
    name: 'Stone Age',
    description: 'The dawn of civilization. Gather basic resources to survive.',
    requiredResearch: null,
    resources: {
      food: { baseRate: 1 },
      wood: { baseRate: 1 },
      stone: { baseRate: 0.5 },
      gold: { baseRate: 0 },
      science: { baseRate: 0.1 },
    },
  },
  {
    id: 'bronze_age',
    name: 'Bronze Age',
    description: 'Metal tools revolutionize your civilization.',
    requiredResearch: 'bronze_working',
    resources: {
      food: { baseRate: 2 },
      wood: { baseRate: 2 },
      stone: { baseRate: 1 },
      gold: { baseRate: 0.5 },
      science: { baseRate: 0.5 },
    },
  },
  {
    id: 'iron_age',
    name: 'Iron Age',
    description: 'Iron strengthens your tools and weapons.',
    requiredResearch: 'iron_working',
    resources: {
      food: { baseRate: 3 },
      wood: { baseRate: 3 },
      stone: { baseRate: 2 },
      gold: { baseRate: 1 },
      science: { baseRate: 1 },
    },
  },
  {
    id: 'classical_age',
    name: 'Classical Age',
    description: 'Philosophy and culture flourish.',
    requiredResearch: 'philosophy',
    resources: {
      food: { baseRate: 4 },
      wood: { baseRate: 4 },
      stone: { baseRate: 3 },
      gold: { baseRate: 2 },
      science: { baseRate: 2 },
    },
  },
  {
    id: 'medieval_age',
    name: 'Medieval Age',
    description: 'Castles and knights dominate the land.',
    requiredResearch: 'feudalism',
    resources: {
      food: { baseRate: 5 },
      wood: { baseRate: 5 },
      stone: { baseRate: 4 },
      gold: { baseRate: 3 },
      science: { baseRate: 3 },
    },
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Art, science, and exploration reach new heights.',
    requiredResearch: 'printing_press',
    resources: {
      food: { baseRate: 7 },
      wood: { baseRate: 6 },
      stone: { baseRate: 5 },
      gold: { baseRate: 5 },
      science: { baseRate: 5 },
    },
  },
  {
    id: 'industrial_age',
    name: 'Industrial Age',
    description: 'Machines transform production.',
    requiredResearch: 'steam_power',
    resources: {
      food: { baseRate: 10 },
      wood: { baseRate: 8 },
      stone: { baseRate: 8 },
      gold: { baseRate: 8 },
      science: { baseRate: 8 },
    },
  },
  {
    id: 'modern_age',
    name: 'Modern Age',
    description: 'Electricity and automobiles change everything.',
    requiredResearch: 'electricity',
    resources: {
      food: { baseRate: 15 },
      wood: { baseRate: 12 },
      stone: { baseRate: 12 },
      gold: { baseRate: 15 },
      science: { baseRate: 15 },
    },
  },
  {
    id: 'atomic_age',
    name: 'Atomic Age',
    description: 'Nuclear power and the space race.',
    requiredResearch: 'nuclear_fission',
    resources: {
      food: { baseRate: 20 },
      wood: { baseRate: 15 },
      stone: { baseRate: 15 },
      gold: { baseRate: 25 },
      science: { baseRate: 25 },
    },
  },
  {
    id: 'information_age',
    name: 'Information Age',
    description: 'Computers and the internet connect the world.',
    requiredResearch: 'computing',
    resources: {
      food: { baseRate: 25 },
      wood: { baseRate: 18 },
      stone: { baseRate: 18 },
      gold: { baseRate: 40 },
      science: { baseRate: 50 },
    },
  },
  {
    id: 'future_age',
    name: 'Future Age',
    description: 'Advanced AI and space colonization await.',
    requiredResearch: 'artificial_intelligence',
    resources: {
      food: { baseRate: 50 },
      wood: { baseRate: 30 },
      stone: { baseRate: 30 },
      gold: { baseRate: 100 },
      science: { baseRate: 100 },
    },
  },
];

export function getEraById(id: string): Era | undefined {
  return ERAS.find(era => era.id === id);
}

export function getNextEra(currentEraId: string): Era | undefined {
  const currentIndex = ERAS.findIndex(era => era.id === currentEraId);
  if (currentIndex === -1 || currentIndex === ERAS.length - 1) {
    return undefined;
  }
  return ERAS[currentIndex + 1];
}
