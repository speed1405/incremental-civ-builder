// Main entry point
import { Game } from './game.js';
import { GameUI } from './ui.js';
// Initialize the game
function initGame() {
    const game = new Game();
    const ui = new GameUI(game);
    // Try to load saved game
    const saveString = localStorage.getItem('civGameSave');
    if (saveString) {
        game.loadGame(saveString);
    }
    // Start the game loop
    game.start();
    // Initial render
    ui.render();
    // Auto-save every 30 seconds
    setInterval(() => {
        const saveData = game.saveGame();
        localStorage.setItem('civGameSave', saveData);
    }, 30000);
    // Make game accessible from console for debugging
    window.game = game;
}
// Initialize when DOM is ready
// Check if DOM is already loaded (can happen with ES modules)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
}
else {
    // DOM is already ready
    initGame();
}
//# sourceMappingURL=main.js.map