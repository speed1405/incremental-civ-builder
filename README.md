# Incremental Civ Builder

An incremental civilization building game that takes you from the Stone Age through to the Future Age!

## Features

### 🏛️ Era Progression
Progress through 11 different eras:
- Stone Age
- Bronze Age
- Iron Age
- Classical Age
- Medieval Age
- Renaissance
- Industrial Age
- Modern Age
- Atomic Age
- Information Age
- Future Age

### 🔬 Research Tree
- 40+ technologies to research
- Each technology unlocks new bonuses and abilities
- Research technologies to advance to the next era
- Technologies provide resource multipliers and unlock units

### ⚔️ Barracks System
- Train troops from various eras
- 15 unique unit types from Hunters to Space Marines
- Each unit has Attack, Defense, and Health stats
- Units cost resources and take time to train

### 📦 Resource Management
- 5 resource types: Food, Wood, Stone, Gold, Science
- Resources generate passively based on your era
- Click to gather resources manually
- Research improves resource generation rates

## Getting Started

### 🎮 Play Instantly (No Build Required!)

**Just open `index.html` in your browser!** That's it!

The game is completely self-contained in a single HTML file with all CSS and JavaScript inlined. No installation, no build process, no server required - it works completely offline!

- **Double-click** `index.html` to play
- **Works offline** - save the file anywhere and play anytime
- **Portable** - copy the single file to USB, share with friends, etc.

### For Developers

If you want to modify the TypeScript source files and rebuild:

```bash
npm install
npm run build
```

This compiles the TypeScript source files and creates an updated `index.html` with all assets inlined.

## How to Play

1. **Gather Resources**: Click the gather buttons to collect Food, Wood, and Stone
2. **Research Technologies**: Use accumulated Science to research new technologies
3. **Advance Eras**: Research key technologies to unlock new eras
4. **Build an Army**: Train troops in the Barracks once you unlock them through research
5. **Save Progress**: Use the Save button to save your progress (auto-saves every 30 seconds)

## Controls

- **Resources Tab**: Click to manually gather resources
- **Research Tab**: Research new technologies to advance your civilization
- **Barracks Tab**: Train military units
- **Army Tab**: View your army's combined power
- **Combat Tab**: Battle against enemy forces in missions or conquer territories
- **Military Tab**: Manage formations, heroes, defenses, naval forces, siege weapons, and espionage

## Technologies

Technologies are organized by era and require prerequisites to unlock. Key milestone technologies unlock new eras:

- Bronze Working → Bronze Age
- Iron Working → Iron Age
- Philosophy → Classical Age
- Feudalism → Medieval Age
- Printing Press → Renaissance
- Steam Power → Industrial Age
- Electricity → Modern Age
- Nuclear Fission → Atomic Age
- Computing → Information Age
- Artificial Intelligence → Future Age

## Suggestions for Future Development

Here are some ideas to enhance the game:

### 🎮 Gameplay Features
- **Combat System**: Add battles against AI civilizations or barbarians ✅ (Implemented!)
- **Wonder Building**: Construct famous wonders (Pyramids, Colosseum, etc.) for unique bonuses
- **Achievements System**: Unlock achievements for milestones like "First Technology" or "Space Age" ✅ (Implemented!)
- **Events System**: Random events (plague, gold discovery, etc.) that affect resources
- **Prestige/Rebirth**: Reset with bonuses for replayability
- **Daily Challenges**: Special missions that refresh daily with bonus rewards
- **Seasonal Events**: Limited-time content for holidays and special occasions
- **Difficulty Modes**: Easy, Normal, Hard modes with different resource rates
- **Victory Conditions**: Multiple win conditions (Science, Military, Cultural, Economic)
- **Diplomacy System**: Form alliances, declare war, or negotiate peace with AI civilizations

### 🏗️ Buildings & Infrastructure
- **Building System**: Farms, mines, libraries that boost resource production
- **City Management**: Multiple cities with different specializations
- **Population System**: Citizens that can be assigned to different tasks
- **Housing/Capacity**: Build homes to support larger populations
- **Great People**: Special units that provide unique bonuses when born
- **Districts**: Specialized city zones (Industrial, Commercial, Science)
- **Infrastructure Decay**: Buildings require maintenance over time
- **Terraforming**: Modify terrain for different building opportunities

### ⚔️ Military Enhancements
- **Unit Upgrades**: Upgrade existing units to more powerful versions ✅ (Implemented!)
- **Formations/Tactics**: Different combat strategies ✅ (Implemented!)
- **Defense System**: Walls and defensive structures ✅ (Implemented!)
- **Conquests**: Capture territories for resource bonuses ✅ (Implemented!)
- **Heroes/Generals**: Unique commander units with special abilities ✅ (Implemented!)
- **Unit Experience**: Troops gain experience and become veterans ✅ (Implemented!)
- **Naval Combat**: Ships and sea battles ✅ (Implemented!)
- **Siege Weapons**: Special units for attacking fortifications ✅ (Implemented!)
- **Military Traditions**: Permanent bonuses from combat experience ✅ (Implemented!)
- **Espionage**: Spy units for sabotage and intelligence gathering ✅ (Implemented!)

### 📊 Economy & Trade
- **Trading System**: Trade resources with AI merchants
- **Market Fluctuations**: Dynamic resource prices
- **Happiness/Morale**: Affects productivity and military effectiveness
- **Luxury Resources**: Rare resources that boost happiness
- **Trade Routes**: Establish routes between cities for automatic income
- **Banking Interest**: Earn interest on stored gold
- **Taxes**: Collect taxes from population
- **Economic Policies**: Choose between different economic strategies
- **Resource Conversion**: Transform one resource into another

### 🎨 UI/UX Improvements
- **Statistics Page**: Track historical data and graphs ✅ (Implemented!)
- **Offline Progress**: Earn resources while away ✅ (Implemented!)
- **Sound Effects & Music**: Audio feedback for actions
- **Dark/Light Theme Toggle**: User preference for visual theme
- **Tutorial System**: Guided introduction for new players
- **Mini-Map**: Visual representation of your civilization
- **Notification Center**: Centralized alerts and messages
- **Resource Forecast**: Predict future resource levels
- **Comparison Tools**: Compare units, technologies side-by-side
- **Customizable UI**: Drag and drop UI elements to preferred positions
- **Tooltips Enhancement**: Detailed hover information for all elements
- **Animation Effects**: Visual feedback for resource gains and combat

### 🔧 Technical Enhancements
- **Cloud Saves**: Sync progress across devices
- **Mobile Responsive**: Improve touch controls for mobile
- **Keyboard Shortcuts**: Quick actions for power users
- **Modding Support**: Allow custom technologies and units
- **Export/Import Saves**: Share save files with others
- **Performance Mode**: Reduce animations for slower devices
- **Accessibility Features**: Screen reader support, colorblind modes
- **Multi-language Support**: Localization for different languages
- **Game Speed Settings**: Adjust overall game speed
- **Auto-Save Frequency**: Customize how often the game saves

### 🌍 World & Lore
- **Civilization Choices**: Different starting civilizations with unique bonuses ✅ (Implemented!)
- **Historical Leaders**: Choose leaders with special abilities ✅ (Implemented!)
- **World Map**: Geographic territories to explore and conquer ✅ (Via Conquest Mode)
- **Natural Wonders**: Discoverable landmarks with unique effects ✅ (Implemented!)
- **Religion System**: Found and spread religions for cultural bonuses ✅ (Implemented!)
- **Cultural Influence**: Spread your culture to neighboring territories ✅ (Via Cultural Policies)

### 📈 Progression Systems
- **Skill Trees**: Unlock permanent bonuses through gameplay
- **Legacy System**: Carry over benefits between game sessions
- **Leaderboards**: Compare progress with other players
- **Challenges Mode**: Special restrictions for bonus rewards
- **Time Attack**: Speed-run mode with timers

## Mobile Version

A dedicated mobile version branch is available with enhanced touch support and mobile-optimized UI. See [MOBILE_README.md](MOBILE_README.md) for more details.

Key mobile features:
- Touch-optimized UI with larger tap targets
- Responsive layouts for all screen sizes
- Mobile-specific CSS optimizations
- Support for notched devices (safe area insets)
- Reduced motion support for accessibility

## License

ISC