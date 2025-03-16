// Importiere die benötigten Module (Player, ObstacleManager, UI, etc.)
import { Player } from './logic.js';
import { ObstacleManager } from './logic.js';
import { Floor } from './gui.js';  // Importiere die Floor-Klasse
import { UI } from './gui.js';
import { soundManager } from './sfx.js';  // Instanz des SoundManagers importieren

// Setup für das HTML5 Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Spielvariablen
let score = 0;
let highscore = 0;
let active = false;
let playerSize = 20;
let gravity = 0.1;
let speed = 15;
let obstacleSpeed = 6;
let lastSpeedIncrease = -10;

// Erstelle die Spielfunktionen und Objekte
const ui = new UI(canvas.width, canvas.height);
const player = new Player(50, canvas.height - 100 - playerSize, playerSize, speed, gravity, ui);
const obstacles = new ObstacleManager(canvas.width, playerSize / 2, obstacleSpeed, ui);
const background = new Image();
background.src = 'assets/moon_background.png';

let floor = new Floor(canvas, 'assets/floor.png');

// FPS Setup
const TARGET_FPS = 60;
const TARGET_FRAME_TIME = 10 / TARGET_FPS; // 1000 ms / 60 FPS = ca. 16.67 ms pro Frame
let lastTime = 0; // Zeitstempel für DeltaTime
let accumulatedTime = 0; // Zeit, die sich über mehrere Frames ansammelt

// Spiel-Schleife
export function gameLoop(timestamp) {
    // Berechne die DeltaTime (Zeitdifferenz zwischen den Frames)
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp; // Speichere den aktuellen Zeitstempel als "letzten" Zeitpunkt

    accumulatedTime += deltaTime;

    // Wenn mehr als 16.67 ms vergangen sind (also ein Frame bei 60 FPS), dann rendere und aktualisiere das Spiel
    while (accumulatedTime >= TARGET_FRAME_TIME) {
        // Canvas leeren
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Hintergrund rendern
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        floor.update(ctx);

        // Geschwindigkeit alle 10 Punkte erhöhen
        if (score >= lastSpeedIncrease + 10) {
            obstacleSpeed += 0.5;  // Erhöhe die Hindernisgeschwindigkeit
            lastSpeedIncrease = score;  // Merkt sich, wann zuletzt erhöht wurde
        }

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
            // Spielerbewegung und Animation aktualisieren
            const keys = getPressedKeys();
            player.move(keys, canvas.height - 100, canvas.width - playerSize * 2, deltaTime / 1000);  // DeltaTime an die move-Methode übergeben (in Sekunden)
            player.update(deltaTime / 1000);  // DeltaTime an die update-Methode übergeben (in Sekunden)
            player.render(ctx);  // Spieler rendern

            // Debugging: Ausgabe der Spielerposition
            console.log(`Player position: x = ${player.x}, y = ${player.y}`);
        }

        // Kollisionsprüfung
        if (active) {
            score += obstacles.moveObstacles(deltaTime / 1000);  // DeltaTime in Sekunden übergeben

            if (obstacles.checkCollision(player.getRect())) {
                soundManager.playDeathSound();
                if (score > highscore) {
                    highscore = score;
                    saveHighscore(highscore);
                }
                active = false;
            }
        }

        accumulatedTime -= TARGET_FRAME_TIME; // Ziehe die verbrauchte Zeit ab
    }

    // Spiel-Schleife fortsetzen
    requestAnimationFrame(gameLoop);
}

// Funktion um Tasteneingaben zu holen
let keys = {}; // Objekt für die gedrückten Tasten

// Event-Listener für Tasteneingaben
window.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        keys['A'] = true; // A-Taste für nach links
    }
    if (event.key === 'd' || event.key === 'D') {
        keys['D'] = true; // D-Taste für nach rechts
    }
    if (event.key === ' ') {
        keys['Space'] = true; // Leertaste für Sprung
        console.log("Space key pressed!");  // Debugging: Leertaste gedrückt
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        keys['A'] = false;
    }
    if (event.key === 'd' || event.key === 'D') {
        keys['D'] = false;
    }
    if (event.key === ' ') {
        keys['Space'] = false;
    }
});

// Funktion um die gedrückten Tasten zurückzugeben
function getPressedKeys() {
    return keys;
}

// Anzeige von Score und Highscore
function displayScoreAndHighscore() {
    const scoreText = `Score: ${score}`;
    const highscoreText = `Highscore: ${highscore}`;

    ctx.font = '16px Helvetica';
    ctx.fillStyle = 'white';

    // Score auf der rechten Seite anzeigen, aber sicherstellen, dass es nicht aus dem Bild verschwindet
    const scoreX = Math.max(canvas.width - 150, 10); // Verhindert, dass der Score zu nah an der rechten Kante ist
    ctx.fillText(scoreText, scoreX, 20);

    // Highscore auf der linken Seite anzeigen, aber sicherstellen, dass es nicht zu nah an der linken Kante ist
    const highscoreX = Math.min(20, canvas.width - 150); // Verhindert, dass der Highscore zu nah an der linken Kante ist
    ctx.fillText(highscoreText, highscoreX, 20);
}

function saveHighscore(score) {
    localStorage.setItem('highscore', score);
}

// Funktion zum Spielstart
function startNewGame() {
    player.reset(50, canvas.height - playerSize);   // Setze die Spielfigur zurück
    obstacles.reset();  // Setze die Hindernisse zurück
    score = 0;  // Setze den Punktestand zurück
    obstacleSpeed = 2;  // Setze die Hindernisgeschwindigkeit zurück
    lastSpeedIncrease = -10;  // Setze die letzte Geschwindigkeitserhöhung zurück
    active = true;
    soundManager.playBackgroundMusic();  // Hintergrundmusik starten
}

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
    requestAnimationFrame(gameLoop); // Das Spiel starten, wenn alles bereit ist
};
