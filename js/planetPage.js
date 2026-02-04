import { fetchPlanetData } from "./api/solarApi.js";
import { PLANETS } from "./config.js";

const params = new URLSearchParams(window.location.search);
const planet = params.get("planet");

async function loadPlanet() {
    const data = await fetchPlanetData(planet);
    document.getElementById("planet-name").textContent = data.englishName;

    const facts = document.getElementById("facts");
    facts.innerHTML = `
    <p>Gravity: ${data.gravity}</p>
    <p>Density: ${data.density}</p>
  `;

    const gallery = document.getElementById("gallery");
    const planetConfig = PLANETS.find((item) => item.name === planet);
    if (planetConfig) {
        const image = document.createElement("img");
        image.src = planetConfig.imageMed;
        image.alt = `${data.englishName} image`;
        gallery.appendChild(image);
    }
}

loadPlanet();
