// Importiere die benötigten Module (Player, ObstacleManager, UI, etc.)
import { Player } from './logic.js';
import { ObstacleManager } from './logic.js';
import { UI } from './gui.js';
import { soundManager } from './sfx.js';

// Setup für das HTML5 Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Spielvariablen
let score = 0;
let highscoreValue = loadHighscore();
let active = false;
let playerSize = 20;
let gravity = 1;
let speed = 5;
let obstacleSpeed = 2;
let lastSpeedIncrease = -10;

// Erstelle die Spielfunktionen und Objekte
const ui = new UI(canvas.width, canvas.height);
const player = new Player(50, canvas.height - 100 - playerSize, playerSize, speed, gravity, ui);
const obstacles = new ObstacleManager(canvas.width, playerSize / 2, obstacleSpeed, ui);
const background = new Image();
background.src = 'assets/moon_background.png';

const floor = new Image();
floor.src = 'assets/floor.png';

// FPS Setup
const fps = 60;
let timer = 1000 / fps;

// Spiel-Schleife
function gameLoop() {
    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hintergrund rendern
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Score und Highscore anzeigen
    displayScoreAndHighscore();

    if (active) {
        soundManager.playBackgroundMusic();
        obstacles.render(ctx);
    }

    // Wenn das Spiel nicht aktiv ist, zeige das Startmenü
    if (!active) {
        ui.showStartScreen(ctx);
    } else {
        // Spieler bewegen
        const keys = getPressedKeys();
        player.update(keys, canvas.height - 100, canvas.width - playerSize * 2);
    }

    // Kollisionsprüfung
    if (active) {
        score += obstacles.moveObstacles();

        if (obstacles.checkCollision(player.getRect())) {
            soundManager.playDeathSound();
            if (score > highscoreValue) {
                highscoreValue = score;
                saveHighscore(highscoreValue);
            }
            active = false;
        }
    }

    // Spiel-Schleife fortsetzen
    requestAnimationFrame(gameLoop);
}

// Funktion um Tasteneingaben zu holen
function getPressedKeys() {
    const keys = {};
    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    return keys;
}

// Anzeige von Score und Highscore
function displayScoreAndHighscore() {
    const scoreText = `Score: ${score}`;
    const highscoreText = `Highscore: ${highscoreValue}`;

    ctx.font = '16px Helvetica';
    ctx.fillStyle = 'white';
    ctx.fillText(scoreText, canvas.width - 150, 20);
    ctx.fillText(highscoreText, 20, 20);
}

// Hochscore laden und speichern
function loadHighscore() {
    let highscore = localStorage.getItem('highscore');
    return highscore ? parseInt(highscore) : 0;
}

function saveHighscore(score) {
    localStorage.setItem('highscore', score);
}

// Funktion zum Spielstart
function startNewGame() {
    player.reset();
    obstacles.reset();
    score = 0;
    active = true;
    soundManager.playBackgroundMusic(); // Hintergrundmusik starten
}

// Event-Listener für die Tasteneingaben
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        ui.togglePause();
    }
    if (event.key === ' ' && !active) {
        startNewGame();
    }
});

// Event-Listener für den Startbutton
document.getElementById('startButton').addEventListener('click', () => {
    startNewGame();
    // Start-Button ausblenden
    document.getElementById('startButton').style.display = 'none';
});

// Das Spiel starten
soundManager.loadMusic();
soundManager.loadJumpSound();
soundManager.loadDeathSound();

// Warten bis alle Ressourcen geladen sind, bevor wir den Hauptloop starten
window.onload = () => {
    gameLoop(); // Das Spiel starten, wenn alles bereit ist
};
