let frames = 0;
let startTime = performance.now();
let refreshRate = 60; // Standard-Wert als Fallback

function measureRefreshRate() {
    frames++;
    let currentTime = performance.now();
    let elapsedTime = (currentTime - startTime) / 1000; // in Sekunden

    if (elapsedTime >= 1) { // Nach einer Sekunde berechnen
        refreshRate = Math.round(frames / elapsedTime);
        frames = 0;
        startTime = currentTime;
    }

    requestAnimationFrame(measureRefreshRate);
}

// Starte die Messung
measureRefreshRate();

// Exportiere die Refreshrate
export function getRefreshRate() {
    return refreshRate;
}
