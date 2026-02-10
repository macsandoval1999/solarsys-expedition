import ExternalServices from "./externalServices.mjs";
import { loadHeaderFooter, loadPlanetsConfig } from "./utils.mjs";

const params = new URLSearchParams(window.location.search);
const planet = params.get("planet");

const services = new ExternalServices();

async function loadPlanet() {
  loadHeaderFooter();

  const data = await services.getPlanet(planet);
    document.getElementById("planet-name").textContent = data.englishName ?? data.name ?? planet;

    const facts = document.getElementById("facts");
    const gravity = data.gravity ?? "n/a";
    const density = data.density ?? "n/a";
    const radius = data.radius ?? "n/a";
    const mass = data.mass ?? "n/a";
    facts.innerHTML = `
    <p>Gravity: ${gravity}</p>
    <p>Density: ${density}</p>
    <p>Radius: ${radius}</p>
    <p>Mass: ${mass}</p>
  `;

    const gallery = document.getElementById("gallery");
    const planets = await loadPlanetsConfig();
    const planetConfig = planets.find(
      (item) => item.name.toLowerCase() === planet?.toLowerCase()
    );
    if (planetConfig) {
      const image = document.createElement("img");
      image.src = planetConfig.imageMed;
      image.alt = `${data.englishName} image`;
      gallery.appendChild(image);
    }

    const nasaItems = await services.getPlanetImages(data.englishName);
    nasaItems.slice(0, 5).forEach((item) => {
      const imageUrl = item?.links?.[0]?.href;
      if (!imageUrl) return;
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = `${data.englishName} NASA image`;
      gallery.appendChild(image);
    });
}

loadPlanet();
  
