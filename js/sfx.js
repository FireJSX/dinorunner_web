class SoundManager {
    /**
     * Verwaltet die Soundeffekte und Hintergrundmusik des Spiels.
     */
    constructor() {
        this.volume = 0.5;

        // Verzeichnis der Sounddateien
        this.soundDir = "/sound"; // Falls der Pfad anders ist, anpassen

        // Sounddateien
        this.backgroundMusicFile = `${this.soundDir}/somebody_told_you.ogg`;
        this.jumpSoundFile = `${this.soundDir}/jump-sound.ogg`;
        this.deathSoundFile = `${this.soundDir}/death-sound.ogg`;

        this.jumpSoundVolume = 0.2;

        // Sound-Objekte
        this.jumpSound = null;
        this.deathSound = null;
    }

    /**
     * Setzt die Lautstärke der Hintergrundmusik auf den Standardwert.
     */
    standardVolume() {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume;
        }
    }

    /**
     * Lädt die Hintergrundmusik, falls die Datei existiert.
     */
    loadMusic() {
        const audio = new Audio(this.backgroundMusicFile);
        audio.oncanplaythrough = () => {
            this.backgroundMusic = audio;
            console.log("Musik geladen:", this.backgroundMusicFile);
        };
        audio.onerror = () => {
            console.error("Fehler beim Laden der Musik:", this.backgroundMusicFile);
        };
    }

    /**
     * Startet die Hintergrundmusik in einer Endlosschleife.
     */
    playBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.paused) {
            this.backgroundMusic.loop = true;
            this.backgroundMusic.play();
            console.log("Hintergrundmusik spielt.");
        }
    }

    /**
     * Lädt den Sprung-Sound aus der Datei.
     */
    loadJumpSound() {
        this.jumpSound = new Audio(this.jumpSoundFile);
        this.jumpSound.oncanplaythrough = () => {
            console.log("Sprung-Sound geladen:", this.jumpSoundFile);
        };
        this.jumpSound.onerror = () => {
            console.error("Sprung-Sound nicht gefunden:", this.jumpSoundFile);
        };
    }

    /**
     * Spielt den geladenen Sprung-Sound ab.
     */
    playJumpSound() {
        if (this.jumpSound) {
            this.jumpSound.volume = this.jumpSoundVolume;
            this.jumpSound.play();
        }
    }

    /**
     * Lädt den Todes-Sound aus der Datei.
     */
    loadDeathSound() {
        this.deathSound = new Audio(this.deathSoundFile);
        this.deathSound.oncanplaythrough = () => {
            console.log("Todes-Sound geladen:", this.deathSoundFile);
        };
        this.deathSound.onerror = () => {
            console.error("Todes-Sound nicht gefunden:", this.deathSoundFile);
        };
    }

    /**
     * Spielt den geladenen Todes-Sound ab.
     */
    playDeathSound() {
        if (this.deathSound) {
            this.deathSound.play();
        }
    }
}

const soundManager = new SoundManager();
export { soundManager }; // Diese Instanz exportieren, nicht die Klasse