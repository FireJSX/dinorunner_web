class UI {
    /**
     * Die Hauptklasse für die Benutzeroberfläche des Spiels.
     *
     * @param {number} screenWidth - Die Breite des Spielfensters.
     * @param {number} screenHeight - Die Höhe des Spielfensters.
     */
    constructor(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.screen = document.getElementById('gameCanvas'); // Das Canvas-Element
        this.ctx = this.screen.getContext('2d'); // Der 2D-Kontext für das Zeichnen
        this.font = '35px Helvetica';
        this.FPS = 60;
        this.volume = 0.5;
        this.pauseMenuActive = false;
        this.screen.width = screenWidth;
        this.screen.height = screenHeight;
    }

    /**
     * Gibt den absoluten Pfad einer Datei zurück, relativ zum aktuellen Skriptverzeichnis.
     *
     * @param {string} filename - Der Dateiname.
     * @returns {string} Der absolute Pfad zur Datei.
     */
    getRessourcesPath(filename) {
        return `../assets/${filename}`;
    }

    /**
     * Zeigt den Startbildschirm des Spiels an.
     */
    showStartScreen() {
        this.ctx.font = this.font;
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';

        // Zeigt die Startnachricht an
        this.ctx.fillText("Press SPACE to start", this.screenWidth / 2, this.screenHeight / 2 - 100);
        this.ctx.fillText("Press SPACE to jump and A/D to move", this.screenWidth / 2, this.screenHeight / 2);

        // Zeigt das Copyright an
        this.ctx.font = '16px Helvetica';
        this.ctx.fillText("© 2025 Jonas 'FireJSX' Vogel", this.screenWidth / 2, this.screenHeight - 20);
    }

    /**
     * Zeigt das Pausenmenü und wartet auf die Benutzerinteraktion.
     */
    pauseMenu() {
        this.pauseMenuActive = true;
        let paused = true;

        // Bild für das Exit-Button
        const exitButton = new Image();
        exitButton.src = this.getRessourcesPath('exit-button-md.png');
        const exitButtonRect = { x: 15, y: 10, width: exitButton.width / 2, height: exitButton.height / 2 };

        // Bild für den Hintergrund
        const pauseBackground = new Image();
        pauseBackground.src = this.getRessourcesPath('background.jpg');

        pauseBackground.onload = () => {
            const scaleFactorX = this.screenWidth / pauseBackground.width;
            const scaleFactorY = this.screenHeight / pauseBackground.height;
            const scaleFactor = Math.max(scaleFactorX, scaleFactorY);
            const newWidth = pauseBackground.width * scaleFactor;
            const newHeight = pauseBackground.height * scaleFactor;
            const xPos = (newWidth - this.screenWidth) / -2;
            const yPos = (newHeight - this.screenHeight) / -2;

            // Pausenmenü Schleife
            const pauseText = 'Game paused – Press ESC to continue';
            this.ctx.font = '35px Helvetica';
            this.ctx.fillStyle = 'white';
            while (paused) {
                // Hintergrund zeichnen
                this.ctx.drawImage(pauseBackground, xPos, yPos, newWidth, newHeight);

                // Pausen-Text anzeigen
                this.ctx.fillText(pauseText, this.screenWidth / 2, this.screenHeight / 2 - 30);

                // Exit-Button anzeigen
                this.ctx.drawImage(exitButton, exitButtonRect.x, exitButtonRect.y, exitButtonRect.width, exitButtonRect.height);

                // Event-Listener für Benutzerinteraktion
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        paused = false;
                    }
                });

                document.addEventListener('click', (event) => {
                    const mouseX = event.clientX;
                    const mouseY = event.clientY;

                    // Überprüfen, ob der Exit-Button geklickt wurde
                    if (mouseX >= exitButtonRect.x && mouseX <= exitButtonRect.x + exitButtonRect.width &&
                        mouseY >= exitButtonRect.y && mouseY <= exitButtonRect.y + exitButtonRect.height) {
                        window.close(); // Schließt das Spiel
                    }
                });

                this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
            }

            this.pauseMenuActive = false;
        };
    }

    /**
     * Aktualisiert das UI, verarbeitet Benutzereingaben und rendert das Interface.
     */
    update() {
        if (this.pauseMenuActive) return;

        // Event-Listener für Benutzereingaben
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.pauseMenu();
            }
        });

        // Aktualisiere die UI
        this.ctx.clearRect(0, 0, this.screenWidth, this.screenHeight);
        this.manager.drawUI(this.ctx); // Die Benutzeroberflächen-Elemente aktualisieren
    }
}

class GameController {
    /**
     * Verwaltet die Eingaben des Spielers und das Spielfenster.
     *
     * @param {HTMLCanvasElement} screen - Das Spielfenster.
     */
    constructor(screen) {
        this.screen = screen;
        this.screenWidth = screen.width;
        this.screenHeight = screen.height;
    }

    /**
     * Behandelt die Eingaben des Spielers.
     *
     * @param {Event} event - Das Eingabeereignis.
     * @param {number} yChange - Die vertikale Bewegung des Spielers.
     * @returns {number} Die aktualisierte vertikale Bewegung des Spielers.
     */
    handleInput(event, yChange) {
        if (event.type === 'keydown') {
            if (event.key === 'F11') {
                this.toggleFullscreen();
            }
            if (event.key === 'F12') {
                window.close(); // Beendet das Spiel
            }
            if (event.key === ' ' && yChange === 0) {
                yChange = 18; // Jumping Action
            }
        }
        return yChange;
    }

    /**
     * Schaltet zwischen Vollbild- und Fenstermodus um.
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.screen.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

class BackgroundImage {
    /**
     * Klasse zur Verwaltung und Skalierung des Hintergrundbildes.
     *
     * @param {string} filename - Der Dateiname des Hintergrundbildes.
     * @param {number} screenWidth - Die Breite des Spielfensters.
     * @param {number} screenHeight - Die Höhe des Spielfensters.
     */
    constructor(filename, screenWidth, screenHeight) {
        this.image = new Image();
        this.image.src = filename;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.image.onload = () => {
            const scaleFactorX = this.screenWidth / this.image.width;
            const scaleFactorY = this.screenHeight / this.image.height;
            const scaleFactor = Math.max(scaleFactorX, scaleFactorY);
            this.newWidth = this.image.width * scaleFactor;
            this.newHeight = this.image.height * scaleFactor;
            this.xPosition = (this.newWidth - this.screenWidth) / -2;
            this.yPosition = (this.newHeight - this.screenHeight) / -2;
        };
    }

    /**
     * Zeichnet den Hintergrund auf den Bildschirm.
     */
    blit(ctx) {
        ctx.drawImage(this.image, this.xPosition, this.yPosition, this.newWidth, this.newHeight);
    }
}

class Floor {
    /**
     * Klasse für das Bodenbild im Spiel.
     *
     * @param {HTMLCanvasElement} screen - Das Spielfenster.
     * @param {string} imagePath - Der Pfad zum Bild des Bodens.
     */
    constructor(screen, imagePath) {
        this.screen = screen;
        this.image = new Image();
        this.image.src = imagePath;
        this.screenWidth = screen.width;
        this.screenHeight = screen.height;

        this.image.onload = () => {
            const newHeight = this.image.height * 0.69;
            const scaleFactor = newHeight / this.image.height;
            const newWidth = this.image.width * scaleFactor;
            this.image = new Image();
            this.image.src = imagePath;
            this.rect = { x: 0, y: this.screenHeight - newHeight, width: newWidth, height: newHeight };
        };
    }

    /**
     * Zeichnet das Bodenbild auf das Spielfenster.
     */
    update(ctx) {
        ctx.drawImage(this.image, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }
}

export { UI, Floor };
