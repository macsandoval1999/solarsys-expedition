import { Planet } from "./solarPlanet.mjs";

async function loadPlanetsConfig() {
    const response = await fetch(new URL("../assets/json/planets.json", import.meta.url));
    const data = await response.json();
    return Object.values(data);
};

export async function initSolarSystem() {
    const system = document.getElementById("solar-system");
    const planets = await loadPlanetsConfig();
    const nowSeconds = Date.now() / 1000;

    planets.forEach((planetData) => {
        const orbit = document.createElement("div");
        orbit.className = "orbit";
        orbit.style.width = `${planetData.distance * 2}px`;
        orbit.style.height = `${planetData.distance * 2}px`;
        orbit.style.top = "50%";
        orbit.style.left = "50%";
        orbit.style.transform = "translate(-50%, -50%)";

        const orbitSpinner = document.createElement("div");
        orbitSpinner.className = "orbit-rotation rotate";
        const orbitDuration = Number(planetData.distance);
        orbitSpinner.style.animationDuration = `${orbitDuration}s`;
        if (orbitDuration) {
            const phaseOffset = nowSeconds % orbitDuration;
            orbitSpinner.style.animationDelay = `-${phaseOffset}s`;
        }

        const planet = new Planet(planetData);
        planet.render(orbitSpinner);

        orbit.appendChild(orbitSpinner);
        system.appendChild(orbit);
    });
}
