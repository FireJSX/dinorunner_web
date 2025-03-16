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

        this.spritesheet.onload = () => {
            this.frames = this._extractFrames();
        };

        // Lade das Sprite-Sheet-Bild
        this.spritesheet.src = filename;
    }

    /**
     * Extrahiert einzelne Frames aus dem Sprite-Sheet basierend auf der angegebenen Frame-Größe.
     *
     * @returns {Array} Eine Liste von <canvas>-Elementen, die die extrahierten Frames enthalten.
     */
    _extractFrames() {
        const sheetWidth = this.spritesheet.width;
        const sheetHeight = this.spritesheet.height;
        const frames = [];

        // Debug: Zeige die Abmessungen des Spritesheets
        console.log(`SpriteSheet Größe: ${sheetWidth}x${sheetHeight}`);
        console.log(`Frame Größe: ${this.frameWidth}x${this.frameHeight}`);

        // Überprüfe, wie viele Frames wir in X und Y Richtung extrahieren können
        for (let y = 0; y < sheetHeight; y += this.frameHeight) {
            for (let x = 0; x < sheetWidth; x += this.frameWidth) {
                if (x + this.frameWidth <= sheetWidth && y + this.frameHeight <= sheetHeight) {
                    // Erstelle ein neues Canvas-Element für jedes Frame
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Zeichne den Frame auf das Canvas
                    canvas.width = this.frameWidth;
                    canvas.height = this.frameHeight;
                    ctx.drawImage(this.spritesheet, x, y, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);

                    // Füge das Frame zur Liste hinzu
                    frames.push(canvas);
                    // Debug: Ausgabe von jedem extrahierten Frame
                    console.log(`Frame extrahiert: ${x}, ${y} - Größe: ${this.frameWidth}x${this.frameHeight}`);
                }
            }
        }

        // Debug: Ausgabe der Anzahl der extrahierten Frames
        console.log(`Anzahl extrahierter Frames: ${frames.length}`);

        return frames;
    }

    /**
     * Gibt einen bestimmten Frame aus dem Sprite-Sheet zurück.
     *
     * @param {number} index - Der Index des gewünschten Frames.
     * @returns {HTMLCanvasElement|null} Das extrahierte Frame als Canvas-Element oder null, falls keine Frames vorhanden sind.
     */
    getFrame(index) {
        if (this.frames.length > 0) {
            return this.frames[index % this.frames.length];
        }
        return null;
    }
}
