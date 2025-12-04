// Main entry point
import { Game } from './game.js';
import { GameUI } from './ui.js';
// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
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
});
//# sourceMappingURL=main.js.map