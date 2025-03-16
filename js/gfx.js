class SpriteSheet {
    /**
     * Eine Klasse zur Verarbeitung von Sprite-Sheets und Extraktion einzelner Frames.
     *
     * @param {string} filename - Der Pfad zur Sprite-Sheet-Datei.
     * @param {number} frameWidth - Die Breite jedes einzelnen Frames.
     * @param {number} frameHeight - Die Höhe jedes einzelnen Frames.
     */
    constructor(filename, frameWidth, frameHeight) {
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frames = [];
        this.spritesheet = new Image();

        // Setze den Onload-Handler
        this.spritesheet.onload = () => {
            console.log('Sprite-Sheet geladen!');
            if (this.spritesheet.width > 0 && this.spritesheet.height > 0) {
                this.frames = this.extractFrames();  // Extrahiere die Frames, wenn das Bild geladen wurde
            } else {
                console.error('Das Bild konnte nicht korrekt geladen werden.');
            }
        };

        // Fehlerbehandlung
        this.spritesheet.onerror = () => {
            console.error('Fehler beim Laden des Sprite-Sheets!');
        };

        // Lade das Bild
        this.spritesheet.src = filename;
    }

    /**
     * Extrahiert einzelne Frames aus dem Sprite-Sheet basierend auf der angegebenen Frame-Größe.
     *
     * @returns {Array} Eine Liste von <canvas>-Elementen, die die extrahierten Frames enthalten.
     */
    extractFrames() {
        const frames = [];
        const cols = Math.floor(this.spritesheet.width / this.frameWidth);
        const rows = Math.floor(this.spritesheet.height / this.frameHeight);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = this.frameWidth;
                canvas.height = this.frameHeight;

                // Zeichne den Frame aus dem Sprite-Sheet auf das Canvas
                context.drawImage(
                    this.spritesheet,
                    col * this.frameWidth,
                    row * this.frameHeight,
                    this.frameWidth,
                    this.frameHeight,
                    0,
                    0,
                    this.frameWidth,
                    this.frameHeight
                );

                frames.push(canvas);
            }
        }

        console.log(`Anzahl der Frames extrahiert: ${frames.length}`);
        return frames;
    }

    /**
     * Gibt den Frame aus dem Sprite-Sheet zurück, basierend auf dem Index.
     *
     * @param {number} index - Der Index des gewünschten Frames.
     * @returns {HTMLCanvasElement|null} Das extrahierte Frame als Canvas-Element oder null, wenn keine Frames vorhanden sind.
     */
    getFrame(index) {
        if (this.frames.length > 0) {
            return this.frames[index % this.frames.length];
        }
        console.error('Kein Frame vorhanden.');
        return null;
    }

    /**
     * Liefert die Anzahl der extrahierten Frames.
     *
     * @returns {number} Die Anzahl der Frames im Sprite-Sheet.
     */
    getFrameCount() {
        return this.frames.length;
    }

    /**
     * Gibt alle Frames zurück (z.B. für Animationen).
     *
     * @returns {Array} Eine Liste aller extrahierten Frames.
     */
    getAllFrames() {
        return this.frames;
    }
}

export { SpriteSheet };
