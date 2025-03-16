// logic.js

// Spieler-Klasse
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
        this.image = null;
        this.walkImages = [];
        this.jumpImages = [];
        this.idleImages = [];
        this.animationTimer = 0;
        this.animationSpeed = 0.2;
        this.walkFrameIndex = 0;
        this.jumpFrameIndex = 0;
        this.idleFrameIndex = 0;
        this.facingRight = true;

        // Lade Assets
        this.loadAssets();
    }

    loadAssets() {
        const idlePath = this.ui.getRessourcesPath('assets/dino_idle.png');
        const walkPath = this.ui.getRessourcesPath('assets/dino_walk.png');
        const jumpPath = this.ui.getRessourcesPath('assets/dino_jump.png');

        this.loadImage(idlePath, 'idle');
        this.loadImage(walkPath, 'walk');
        this.loadImage(jumpPath, 'jump');
    }

    loadImage(path, state) {
        const img = new Image();
        img.onload = () => {
            if (state === 'idle') this.idleImages.push(img);
            if (state === 'walk') this.walkImages.push(img);
            if (state === 'jump') this.jumpImages.push(img);
        };
        img.src = path;
    }

    move(keys, floorTop, width) {
        if (keys['ArrowLeft'] && this.x > 0) {
            this.xChange = -this.speed;
            this.state = 'walk';
        } else if (keys['ArrowRight'] && this.x <= width) {
            this.xChange = this.speed;
            this.state = 'walk';
        } else {
            this.xChange = 0;
            if (this.onGround) this.state = 'idle';
        }

        if (keys['Space'] && this.onGround) {
            this.yChange = 18; // Sprungkraft
            this.onGround = false;
            this.state = 'jump';
        }

        this.x += this.xChange;
        this.y -= this.yChange;
        this.yChange -= this.gravity;

        if (this.y >= floorTop - this.size) {
            this.y = floorTop - this.size;
            this.yChange = 0;
            this.onGround = true;
        }
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }

    updateAnimation() {
        this.animationTimer += this.animationSpeed;
        if (this.animationTimer >= 1) {
            this.animationTimer = 0;

            let newImage = null;
            if (this.state === 'walk' && this.walkImages.length) {
                newImage = this.walkImages[this.walkFrameIndex];
                this.walkFrameIndex = (this.walkFrameIndex + 1) % this.walkImages.length;
            } else if (this.state === 'jump' && this.jumpImages.length) {
                newImage = this.jumpImages[this.jumpFrameIndex];
                this.jumpFrameIndex = (this.jumpFrameIndex + 1) % this.jumpImages.length;
            } else if (this.state === 'idle' && this.idleImages.length) {
                newImage = this.idleImages[this.idleFrameIndex];
                this.idleFrameIndex = (this.idleFrameIndex + 1) % this.idleImages.length;
            }

            if (!newImage) newImage = new Image(); // Default Image

            // Überprüfen, ob der Spieler nach links oder rechts schaut
            if (this.xChange > 0) this.facingRight = true;
            else if (this.xChange < 0) this.facingRight = false;

            // Bild flippen, wenn der Spieler nach links schaut
            if (!this.facingRight) {
                newImage = this.flipImage(newImage);
            }

            this.image = newImage;
        }
    }

    flipImage(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.scale(-1, 1);
        context.drawImage(image, -image.width, 0);
        return canvas;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y - this.size);
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
        const obstaclePath = this.ui.getRessourcesPath('assets/meteor_1.png');
        const img = new Image();
        img.onload = () => this.obstacleImages.push(img);
        img.src = obstaclePath;
    }

    moveObstacles(active) {
        let points = 0;
        if (active) {
            for (let i = 0; i < this.obstacles.length; i++) {
                this.obstacles[i] -= this.speed;
                if (this.obstacles[i] < -this.playerSize) {
                    this.obstacles[i] = Math.random() * this.width + this.playerSize;
                    points++;
                }
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

    rectsCollide(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    draw(context) {
        for (let i = 0; i < this.obstacles.length; i++) {
            context.drawImage(this.obstacleImages[0], this.obstacles[i], 500 - this.playerSize);
        }
    }
}

// Highscore-Funktionen
function loadHighscore(ui) {
    try {
        const highscorePath = ui.getRessourcesPath('highscore.json');
        const data = JSON.parse(localStorage.getItem('highscore')) || { highscore: 0 };
        return data.highscore;
    } catch (e) {
        return 0;
    }
}

function saveHighscore(highscoreValue, ui) {
    localStorage.setItem('highscore', JSON.stringify({ highscore: highscoreValue }));
}
