/**
 * Initialisiert den 1:1 Regel Rechner für Kamerawinkel, Flughöhe und Distanz.
 *
 * Funktionsweise:
 * - Liest Eingaben aus drei Feldern: Winkel (Grad), Höhe (m), Distanz (m).
 * - Bei Eingabe von zwei Werten wird der dritte automatisch berechnet.
 * - Unterstützt Sperrlogik über Radio-Buttons zur Fixierung von Winkel oder Höhe.
 * - Zeigt Statusmeldungen an, ob die 1:1 Regel erfüllt ist (Distanz ≥ Höhe).
 * - Berechnet Differenz und aktualisiert UI dynamisch.
 *
 * @file 1-1-rule-calculator.js
 * @since 1.0.0
 * @example
 * // Automatische Initialisierung bei DOMContentLoaded
 * // Keine externe Funktion erforderlich.
 */
document.addEventListener('DOMContentLoaded', () => {
    const camAngleInput = document.getElementById("CamAngle");    // Grad
    const droneHeightInput = document.getElementById("DroneHeight"); // Meter
    const distanceInput = document.getElementById("distance");    // Meter

    // Radio-Buttons
    const radioAngle = document.getElementById('radio-angle');
    const radioHeight = document.getElementById('radio-height');

    // Status-Texte
    const okEl = document.getElementById('calc-1-1-text-ok');        // Distance >= Höhe
    const nokEl = document.getElementById('calc-1-1-text-nok');       // Distance <  Höhe
    const nokValueEl = document.getElementById('calc-1-1-text-nok-value'); // Differenz (Höhe − Distanz)

    // Fallback: sicherstellen, dass Winkel per Default aktiv ist
    if (radioAngle && radioHeight && !radioAngle.checked && !radioHeight.checked) {
        radioAngle.checked = true;
    }

    let isUpdating = false; // Guard gegen rekursive "input"-Events

    /**
     * Wandelt Grad in Radiant um.
     * @function toRad
     * @param {number} deg - Winkel in Grad.
     * @returns {number} Radiant.
     */
    const toRad = deg => deg * Math.PI / 180;
    
    /**
     * Wandelt Radiant in Grad um.
     * @function toDeg
     * @param {number} rad - Winkel in Radiant.
     * @returns {number} Grad.
     */
    const toDeg = rad => rad * 180 / Math.PI;

    /**
     * Prüft, ob ein Wert eine gültige Zahl ist.
     * @function isNum
     * @param {*} v - Zu prüfender Wert.
     * @returns {boolean} true, wenn Zahl.
     */
    const isNum = v => !isNaN(v);

    /**
     * Liest den numerischen Wert eines Input-Elements.
     * @function readF
     * @param {HTMLInputElement} el - Eingabefeld.
     * @returns {number} Parsed float oder NaN.
     */
    const readF = el => parseFloat(el.value);

    /**
     * Formatiert eine Zahl auf zwei Dezimalstellen.
     * @function fmt
     * @param {number} n - Zu formatierende Zahl.
     * @returns {string} Formatierter String oder leer.
     */
    const fmt = n => Number.isFinite(n) ? n.toFixed(2) : "";

    /**
     * Berechnet den Tangens eines Winkels sicher.
     * @function safeTan
     * @param {number} angleDeg - Winkel in Grad.
     * @returns {number|null} Tangenswert oder null bei ungültigem Wert.
     */
    function safeTan(angleDeg) {
        const t = Math.tan(toRad(angleDeg));
        if (!Number.isFinite(t) || Math.abs(t) < 1e-8) return null;
        return t;
    }

    /**
     * Setzt die Sichtbarkeit eines Elements.
     * @function setVisibility
     * @param {HTMLElement} el - Ziel-Element.
     * @param {boolean} show - Sichtbarkeit.
     * @returns {void}
     */
    function setVisibility(el, show) {
        if (!el) return;
        el.style.display = show ? "" : "none";
    }

    /**
     * Prüft, ob ein Eingabefeld durch die Radio-Logik gesperrt ist.
     * @function isLocked
     * @param {HTMLInputElement} inputEl - Zu prüfendes Eingabefeld.
     * @returns {boolean} true, wenn gesperrt.
     */
    function isLocked(inputEl) {
        if (!radioAngle || !radioHeight) return false;
        if (radioAngle.checked && inputEl === camAngleInput) return true; // Winkel fix
        if (radioHeight.checked && inputEl === droneHeightInput) return true; // Höhe  fix
        return false;
    }

    /**
 * Aktualisiert die Benutzeroberfläche basierend auf der Einhaltung der 1:1-Regel.
 *
 * Funktionsweise:
 * - Vergleicht Distanz und Höhe.
 * - Blendet Statusmeldungen ein oder aus.
 * - Zeigt bei Verfehlung der Regel die Differenz (Höhe − Distanz) als positiven Wert an.
 *
 * @function updateStatusUI
 * @returns {void}
 */
    function updateStatusUI() {
        const h = readF(droneHeightInput);
        const d = readF(distanceInput);

        // Reset bei unvollständigen Eingaben
        if (!(isNum(h) && isNum(d))) {
            setVisibility(okEl, false);
            setVisibility(nokEl, false);
            if (nokValueEl) { nokValueEl.textContent = ""; setVisibility(nokValueEl, false); }
            return;
        }

        const eps = 1e-9;                 // Toleranz gegen Rundungsfehler
        const isOk = d - h >= -eps;        // Distance >= Höhe?

        if (isOk) {
            setVisibility(okEl, true);
            setVisibility(nokEl, false);
            if (nokValueEl) { nokValueEl.textContent = ""; setVisibility(nokValueEl, false); }
        } else {
            setVisibility(okEl, false);
            setVisibility(nokEl, true);
            // Differenz (Höhe − Distanz) als positiver Wert
            const diff = Math.max(0, h - d);
            if (nokValueEl) {
                nokValueEl.textContent = fmt(diff) + " m";
                setVisibility(nokValueEl, true);
            }
        }
    }

    /**
 * Berechnet die fehlende Größe (Winkel, Höhe oder Distanz), wenn zwei Werte vorhanden sind.
 *
 * Funktionsweise:
 * - Ermittelt, welches Feld sich geändert hat.
 * - Nutzt trigonometrische Beziehungen zur Berechnung.
 * - Verhindert rekursive Updates mittels Guard (isUpdating).
 * - Aktualisiert nach jeder Berechnung die Statusanzeige.
 *
 * @function calculateForChange
 * @param {HTMLInputElement|null} changedEl - Das geänderte Eingabeelement oder null bei Moduswechsel.
 * @returns {void}
 */
    function calculateForChange(changedEl) {
        if (isUpdating) return;

        const angle = readF(camAngleInput);
        const height = readF(droneHeightInput);
        const distance = readF(distanceInput);

        const aOK = isNum(angle);
        const hOK = isNum(height);
        const dOK = isNum(distance);

        isUpdating = true;

        // 1) Genau zwei Werte vorhanden → fehlenden berechnen (aber nicht, wenn gesperrt)
        if (aOK && hOK && !dOK && !isLocked(distanceInput)) {
            const t = safeTan(angle);
            distanceInput.value = t ? fmt(height / t) : "";
            isUpdating = false; updateStatusUI(); return;
        }
        if (aOK && dOK && !hOK && !isLocked(droneHeightInput)) {
            const t = safeTan(angle);
            droneHeightInput.value = t ? fmt(distance * t) : "";
            isUpdating = false; updateStatusUI(); return;
        }
        if (hOK && dOK && !aOK && !isLocked(camAngleInput)) {
            const ang = Math.atan(height / distance);
            camAngleInput.value = fmt(toDeg(ang));
            isUpdating = false; updateStatusUI(); return;
        }

        // 2) Alle drei befüllt → vom geänderten Feld abhängiges neu berechnen
        if (aOK && hOK && dOK) {
            if (changedEl === camAngleInput) {
                const t = safeTan(angle);
                if (t && !isLocked(distanceInput)) {
                    distanceInput.value = fmt(height / t);
                } else if (t && !isLocked(droneHeightInput)) {
                    droneHeightInput.value = fmt(distance * t);
                }
            } else if (changedEl === droneHeightInput) {
                const t = safeTan(angle);
                if (t && !isLocked(distanceInput)) {
                    distanceInput.value = fmt(height / t);
                } else if (!isLocked(camAngleInput)) {
                    camAngleInput.value = fmt(toDeg(Math.atan(height / distance)));
                }
            } else if (changedEl === distanceInput) {
                const t = safeTan(angle);
                if (t && !isLocked(droneHeightInput)) {
                    droneHeightInput.value = fmt(distance * t);
                } else if (!isLocked(camAngleInput)) {
                    camAngleInput.value = fmt(toDeg(Math.atan(height / distance)));
                }
            }
            isUpdating = false; updateStatusUI(); return;
        }

        // 3) Weniger als zwei Werte → nur Status-UI updaten
        isUpdating = false; updateStatusUI();
    }

    // Live-Update an allen Inputs
    camAngleInput.addEventListener("input", () => calculateForChange(camAngleInput));
    droneHeightInput.addEventListener("input", () => calculateForChange(droneHeightInput));
    distanceInput.addEventListener("input", () => calculateForChange(distanceInput));

    // Beim Wechsel des Lock-Modus neu prüfen
    [radioAngle, radioHeight].forEach(r => {
        if (!r) return;
        r.addEventListener('change', () => calculateForChange(null));
    });

    // Initialer Status
    updateStatusUI();
});