import { PLANETS } from "./config.js";
import { Planet } from "./planet.js";

export function initSolarSystem() {
    const system = document.getElementById("solar-system");

    PLANETS.forEach((planetData) => {
        const orbit = document.createElement("div");
        orbit.className = "orbit";
        orbit.style.width = `${planetData.distance * 2}px`;
        orbit.style.height = `${planetData.distance * 2}px`;
        orbit.style.top = "50%";
        orbit.style.left = "50%";
        orbit.style.transform = "translate(-50%, -50%)";

        const orbitSpinner = document.createElement("div");
        orbitSpinner.className = "orbit-rotation rotate";
        orbitSpinner.style.animationDuration = `${planetData.distance}s`;

        const planet = new Planet(planetData);
        planet.render(orbitSpinner);

        orbit.appendChild(orbitSpinner);
        system.appendChild(orbit);
    });
}
