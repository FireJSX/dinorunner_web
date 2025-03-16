// Spieler-Klasse
import { SpriteSheet } from "./gfx.js";

class Player {
    constructor(x, y, size, speed, gravity, ui) {
        this.ui = ui;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.gravity = gravity;
        this.yChange = 0;
        this.xChange = 0;
        this.onGround = false;
        this.state = 'idle'; // Anfangszustand 'idle'

        // Animationen
        this.walkSpriteSheet = new SpriteSheet('/assets/dino_walk.png', 32, 32);
        this.jumpSpriteSheet = new SpriteSheet('/assets/dino_jump.png', 32, 32);
        this.idleSpriteSheet = new SpriteSheet('/assets/dino_idle.png', 32, 32);

        // Arrays zum Speichern der Frames
        this.walkFrames = [];
        this.jumpFrames = [];
        this.idleFrames = [];

        this.animationTimer = 0;
        this.animationSpeed = 0.2;
        this.walkFrameIndex = 0;
        this.jumpFrameIndex = 0;
        this.idleFrameIndex = 0;
        this.facingRight = true;

        // Lade die Sprite-Sheets
        this.loadAssets();
    }

    reset(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.yChange = 0;
        this.xChange = 0;
        this.onGround = false;
        this.state = 'idle';
    }

    // Lade die Assets
    loadAssets() {
        this.walkSpriteSheet.spritesheet.onload = () => {
            console.log("Walk Sprite-Sheet geladen!");
            this.walkFrames = this.walkSpriteSheet.extractFrames(); // Hier extrahieren wir die Frames
            console.log(this.walkFrames);
        };

        this.jumpSpriteSheet.spritesheet.onload = () => {
            console.log("Jump Sprite-Sheet geladen!");
            this.jumpFrames = this.jumpSpriteSheet.extractFrames(); // Frames extrahieren
            console.log(this.jumpFrames);
        };

        this.idleSpriteSheet.spritesheet.onload = () => {
            console.log("Idle Sprite-Sheet geladen!");
            this.idleFrames = this.idleSpriteSheet.extractFrames(); // Frames extrahieren
            console.log(this.idleFrames);
        };
    }

    // move() angepasst, um DeltaTime zu verwenden
    move(keys, floorTop, width, deltaTime) {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.xChange = -this.speed * deltaTime;  // Geschwindigkeit multipliziert mit DeltaTime
            this.state = 'walk';
        } else if (keys['ArrowRight'] && this.x <= width) {
            this.xChange = this.speed * deltaTime;  // Geschwindigkeit multipliziert mit DeltaTime
            this.state = 'walk';
        } else {
            this.xChange = 0;
            if (this.onGround) this.state = 'idle';
        }

        if (keys['Space'] && this.onGround) {
            this.yChange = 18 * deltaTime; // Sprungkraft multipliziert mit DeltaTime
            this.onGround = false;
            this.state = 'jump';
        }

        this.x += this.xChange;
        this.y -= this.yChange;
        this.yChange -= this.gravity * deltaTime; // Schwerekraft multipliziert mit DeltaTime

        if (this.y >= floorTop - this.size) {
            this.y = floorTop - this.size;
            this.yChange = 0;
            this.onGround = true;
        }
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }

    // update() angepasst, um DeltaTime zu berücksichtigen
    update(deltaTime) {
        this.animationTimer += this.animationSpeed * deltaTime;  // Animation wird ebenfalls framerate-unabhängig

        if (this.animationTimer >= 1) {
            this.animationTimer = 0;

            let newFrame = null;

            // Wechsle die Frames basierend auf dem Zustand
            if (this.state === 'walk') {
                newFrame = this.walkSpriteSheet.getFrame(this.walkFrameIndex); // Hole Frame mit getFrame
                this.walkFrameIndex = (this.walkFrameIndex + 1) % this.walkSpriteSheet.frames.length; // Update den Index
            } else if (this.state === 'jump') {
                newFrame = this.jumpSpriteSheet.getFrame(this.jumpFrameIndex); // Hole Frame mit getFrame
                this.jumpFrameIndex = (this.jumpFrameIndex + 1) % this.jumpSpriteSheet.frames.length;
            } else if (this.state === 'idle') {
                newFrame = this.idleSpriteSheet.getFrame(this.idleFrameIndex); // Hole Frame mit getFrame
                this.idleFrameIndex = (this.idleFrameIndex + 1) % this.idleSpriteSheet.frames.length;
            }

            if (!newFrame) newFrame = this.idleSpriteSheet.getFrame(0); // Falls kein Bild geladen wurde, zeige das erste Bild von 'idle'

            // Debugging: Überprüfe das Bild
            console.log("Aktuelles Frame:", newFrame);

            // Bestimmen der Blickrichtung
            if (this.xChange > 0) this.facingRight = true;
            else if (this.xChange < 0) this.facingRight = false;

            // Wenn der Spieler nach links schaut, dann das Bild spiegeln
            if (!this.facingRight) {
                newFrame = this.flipImage(newFrame);
            }

            this.image = newFrame;
        }
    }

    flipImage(frame) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = frame.width;
        canvas.height = frame.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.scale(-1, 1);
        context.drawImage(frame, -canvas.width, 0);
        return canvas;
    }

    render(context) {
        if (this.image) {
            console.log(`Rendering Dino an Position: (${this.x}, ${this.y})`); // Debug-Ausgabe
            context.drawImage(this.image, this.x, this.y - this.size);
        }
    }

}

// Hindernis-Manager-Klasse
class ObstacleManager {
    constructor(width, playerSize, speed, ui) {
        this.ui = ui;
        this.obstacles = [width - 150, width, width + 150];
        this.width = width;
        this.playerSize = playerSize;
        this.speed = speed;
        this.obstacleImages = [];
        this.loadObstacleAssets();
    }

    loadObstacleAssets() {
        const obstaclePath = this.ui.getRessourcesPath('meteor_1.png');
        const img = new Image();
        img.onload = () => this.obstacleImages.push(img);
        img.onerror = () => console.error(`Fehler beim Laden: ${obstaclePath}`);
        img.src = obstaclePath;
    }

    // moveObstacles() angepasst, um DeltaTime zu verwenden
    moveObstacles(deltaTime) {
        let points = 0;
        for (let i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i] -= this.speed * deltaTime;  // Geschwindigkeit multipliziert mit DeltaTime
            if (this.obstacles[i] < -this.playerSize) {
                this.obstacles[i] = Math.random() * this.width + this.playerSize;
                points++;
            }
        }
        return points;
    }

    checkCollision(playerRect) {
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacleRect = { x: this.obstacles[i], y: 500 - this.playerSize, width: this.playerSize, height: this.playerSize };
            if (this.rectsCollide(playerRect, obstacleRect)) return true;
        }
        return false;
    }

    reset() {
        this.obstacles = [this.width - 150, this.width, this.width + 150];
    }

    rectsCollide(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    render(context) {
        if (this.obstacleImages.length > 0) {
            for (let i = 0; i < this.obstacles.length; i++) {
                context.drawImage(this.obstacleImages[0], this.obstacles[i], 500 - this.playerSize);
            }
        }
    }
}

// Highscore-Funktionen
function loadHighscore() {
    const data = JSON.parse(localStorage.getItem('highscore')) || { highscore: 0 };
    return data.highscore;
}

function saveHighscore(highscoreValue) {
    localStorage.setItem('highscore', JSON.stringify({ highscore: highscoreValue }));
}

export { Player, ObstacleManager, loadHighscore, saveHighscore };
