// Importiere die benötigten Module (Player, ObstacleManager, UI, etc.)
import { Player } from './logic.js';
import { ObstacleManager } from './logic.js';
import { Floor } from './gui.js';  // Importiere die Floor-Klasse
import { UI } from './gui.js';
import { soundManager } from './sfx.js';  // Instanz des SoundManagers importieren
import { getRefreshRate } from "./refreshRate.js";

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
let speed = 18;
let obstacleSpeed = 8;
let lastSpeedIncrease = -10;
let jumpPower = -0.5;

// Erstelle die Spielfunktionen und Objekte
const ui = new UI(canvas.width, canvas.height);
const player = new Player(50, canvas.height - 100 - playerSize, playerSize, speed, jumpPower, gravity, ui);
const obstacles = new ObstacleManager(canvas.width, playerSize / 2, obstacleSpeed, ui);
const background = new Image();
background.src = '/assets/moon_background.png';

let floor = new Floor(canvas, '/assets/floor.png');
//let frameTimes = [];
//let refreshRate = 60; // Standard-Wert als Fallback

//function updateRefreshRate() {
//  const now = performance.now();
//  if (window.lastFrameTime) {
//      frameTimes.push(now - window.lastFrameTime);
//      if (frameTimes.length > 30) frameTimes.shift(); // Behalte nur die letzten 30 Frames
//  }
//   window.lastFrameTime = now;

//   const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
//   refreshRate = Math.round(1000 / avgFrameTime);
//}

//let targetFrameTime = 2400 / refreshRate;


// FPS Setup

let refresh = 10;

const TARGET_FPS = 60;
const TARGET_FRAME_TIME = refresh / TARGET_FPS; // 1000 ms / 60 FPS = ca. 16.67 ms pro Frame
let lastTime = 0; // Zeitstempel für DeltaTime
let accumulatedTime = 0; // Zeit, die sich über mehrere Frames ansammelt

// Spiel-Schleife
export function gameLoop(timestamp) {
    if (getRefreshRate() === 240) {
        refresh = 40;
        player.jumpPower = -0.6;
        player.gravity = 0.3;
        obstacles.obstaclespeed=80;
        player.speed=speed*4;
    } else if (getRefreshRate() === 60) {
        refresh = 10;
        player.jumpPower = -0.15;
        player.gravity = 0.75;
        obstacles.obstacleSpeed=20;
    }
    else if (getRefreshRate() === 144) {
        refresh = 24;
        player.jumpPower = -0.36;
        player.gravity = 0.18;
        obstacles.obstacleSpeed= 48;
        player.speed= 43.2;
    }

    // Berechne die DeltaTime (Zeitdifferenz zwischen den Frames)
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Ausgabe der aktuellen RefreshRate (Debugging)
    console.log("Refreshrate: " + getRefreshRate());

    accumulatedTime += deltaTime;

    // Begrenze die maximale Zeit, die wir ansammeln (max. 5 Frames)
    accumulatedTime = Math.min(accumulatedTime, 5 * TARGET_FRAME_TIME);

    // Frame-Update-Schleife
    while (accumulatedTime >= TARGET_FRAME_TIME) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Hintergrund rendern

        floor.update(ctx);

        if (score >= lastSpeedIncrease + 10) {
            if(getRefreshRate()===240){
                obstacleSpeed += 50;
            }
            else{
                obstacleSpeed += 12.5;
            }
            lastSpeedIncrease = score;
            console.log("obstacleSpeed erhöht:" +obstacleSpeed)
        }

        displayScoreAndHighscore();

        if (active) {
            soundManager.playBackgroundMusic();
            obstacles.render(ctx);
        }

        if (!active) {
            ui.showStartScreen(ctx);
        } else {
            const keys = getPressedKeys();
            player.move(keys, canvas.height - 100, canvas.width - playerSize * 2, deltaTime / 1000); // Spieler bewegen
            player.update(deltaTime / 1000); // Animation und Physik aktualisieren
            player.render(ctx); // Spieler rendern
        }

        // Kollisionsprüfung nach Spielerbewegung
        if (active) {
            score += obstacles.moveObstacles(deltaTime / 1000, obstacleSpeed);

            // Kollisionserkennung
            if (obstacles.checkCollision(player.getRect())) {
                soundManager.playDeathSound();
                if (score > highscore) {
                    highscore = score;
                    saveHighscore(highscore);
                }
                active = false; // Spiel beenden bei Kollision
            }
        }

        accumulatedTime -= TARGET_FRAME_TIME;
    }

    requestAnimationFrame(gameLoop); // Weiter zum nächsten Frame
}




// Funktion um Tasteneingaben zu holen
let keys = {}; // Objekt für die gedrückten Tasten
let spacePressed = false;

// Event-Listener für Tasteneingaben
window.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'A') {
        keys['A'] = true; // A-Taste für nach links
    }
    if (event.key === 'd' || event.key === 'D') {
        keys['D'] = true; // D-Taste für nach rechts
    }
    if (event.key === ' ' && !spacePressed) {
        keys['Space'] = true; // Leertaste für Sprung
        spacePressed = true;
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
        if (!active) {  // Wenn das Spiel beendet ist, neustarten
            startNewGame();
        } else {
            keys['Space'] = false; // Leertaste für Sprung
            spacePressed = false;
        }
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
    const scoreX = Math.max(canvas.width-50-scoreText.length); // Verhindert, dass der Score zu nah an der rechten Kante ist
    ctx.fillText(scoreText, scoreX, 30);

    // Highscore auf der linken Seite anzeigen, aber sicherstellen, dass es nicht zu nah an der linken Kante ist
    const highscoreX = Math.min(70); // Verhindert, dass der Highscore zu nah an der linken Kante ist
    ctx.fillText(highscoreText, highscoreX, 30);
}

function saveHighscore(score) {
    localStorage.setItem('highscore', score);
}

// Funktion zum Spielstart
function startNewGame() {
    if (score>highscore) {
        highscore=score;
    }
    player.reset(50, canvas.height - playerSize);   // Setze die Spielfigur zurück
    obstacles.reset();  // Setze die Hindernisse zurück
    score = 0;  // Setze den Punktestand zurück
    if (getRefreshRate()===240){
        obstacleSpeed = 100;
    }
    else if(getRefreshRate()===60){
        obstacleSpeed = 20;
    }
    else if(getRefreshRate()===144){
        obstacleSpeed = 48;
    }

    lastSpeedIncrease = Math.floor(score / 10) * 10; // Setze die letzte Geschwindigkeitserhöhung zurück
    active = true;
    soundManager.playBackgroundMusic();  // Hintergrundmusik starten
    keys = {};
    spacePressed = false;
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
