import { fetchPlanetImages } from "./api/nasaApi.mjs";
import { fetchPlanetData } from "./api/ninjaPlanetsApi.mjs";
import {
  getLocalStorage,
  loadPageMutuals,
  loadPlanetsConfig,
  setLocalStorage,
} from "./utils.mjs";

const JUPITER_MASS_KG = 1.898e27;
const JUPITER_RADIUS_KM = 69911;

const params = new URLSearchParams(window.location.search);
const planetQuery = params.get("planet");

const planetsConfigPromise = loadPlanetsConfig();

const heroElements = {
  name: document.getElementById("planet-name"),
  heroImg: document.getElementById("planet-image"),
  heroSource: document.getElementById("planet-image-webp"),
};

const heroSection = document.getElementById("planet-hero");

const infoElements = {
  mass: document.getElementById("planet-mass"),
  radius: document.getElementById("planet-radius"),
  orbitalPeriod: document.getElementById("planet-orbital-period"),
  semiMajorAxis: document.getElementById("planet-semi-major-axis"),
  distance: document.getElementById("planet-distance"),
  temperature: document.getElementById("planet-temperature"),
  fullDescription: document.getElementById("planet-full-description"),
};

const imagesSection = document.getElementById("planet-images");
const FAVORITES_STORAGE_KEY = "favoriteResources";

loadPlanetDetails();

async function loadPlanetDetails() {
  await loadPageMutuals();

  if (!planetQuery) {
    displayError("No planet selected.");
    return;
  }

  try {
    const [planetData, planetsConfig] = await Promise.all([
      fetchPlanetData(planetQuery),
      planetsConfigPromise,
    ]);

    const displayName = planetData.englishName ?? planetData.name ?? toTitleCase(planetQuery);
    updateHero(displayName, planetsConfig);
    populateDataCards(planetData);
    await populateImages(displayName, planetsConfig);
  } catch (error) {
    console.error("Failed to load planet details", error);
    displayError("Unable to load planet details right now.");
  }
}

function updateHero(displayName, planetsConfig) {
  if (heroElements.name) {
    heroElements.name.textContent = displayName;
  }

  if (heroSection) {
    const isSaturn = displayName.toLowerCase() === "saturn";
    heroSection.classList.toggle("planet-hero-saturn", isSaturn);
  }

  const planetConfig = findPlanetConfig(planetsConfig, planetQuery);
  setHtml(
    infoElements.fullDescription,
    planetConfig?.fullDescription ?? planetConfig?.smallDescription
  );
  const preferredImage = resolveAssetPath(planetConfig?.imageMed ?? planetConfig?.imageSmall);
  const fallbackImage = resolveAssetPath(planetConfig?.imageSmall ?? planetConfig?.imageMed);

  if (heroElements.heroSource && preferredImage) {
    heroElements.heroSource.srcset = preferredImage;
  }

  if (heroElements.heroImg) {
    heroElements.heroImg.src = preferredImage ?? fallbackImage ?? "";
    heroElements.heroImg.alt = `${displayName} image`;
  }
}

function populateDataCards(planetData) {
  setText(infoElements.mass, formatMass(planetData.mass));
  const radiusValue = planetData.meanRadius ?? planetData.radius ?? planetData.equaRadius;
  setText(infoElements.radius, formatRadius(radiusValue));

  const orbitalPeriod = planetData.sideralOrbit ?? planetData.orbital_period ?? planetData.orbitalPeriod ?? planetData.period;
  setText(infoElements.orbitalPeriod, formatPeriod(orbitalPeriod));

  setText(infoElements.semiMajorAxis, formatSemiMajorAxis(planetData));
  setText(infoElements.distance, formatDistanceFromEarth(planetData));

  const temperature = planetData.avgTemp ?? planetData.temperature;
  setText(infoElements.temperature, formatTemperature(temperature));
}

async function populateImages(displayName, planetsConfig) {
  if (!imagesSection) return;
  imagesSection.textContent = "";

  try {
    const nasaItems = await fetchPlanetImages(displayName);
    const randomItems = selectRandomItems(nasaItems, 6);
    randomItems.forEach((item) => {
      const imageUrl = item?.links?.[0]?.href;
      const metadata = item?.data?.[0] ?? {};
      if (!imageUrl) return;
      imagesSection.appendChild(
        createGalleryFigure(
          imageUrl,
          `${displayName} NASA image`,
          buildNasaCaption(metadata, displayName),
          buildFavoriteResource(metadata, imageUrl, displayName)
        )
      );
    });

    if (!imagesSection.hasChildNodes()) {
      imagesSection.appendChild(createStatusMessage("No imagery available right now."));
    }
  } catch (error) {
    console.error("Failed to load NASA imagery", error);
    imagesSection.appendChild(createStatusMessage("NASA imagery is unavailable."));
  }
}

function findPlanetConfig(planetsConfig, query) {
  if (!Array.isArray(planetsConfig) || !query) return null;
  const target = query.toLowerCase();
  return planetsConfig.find((planet) => planet.name?.toLowerCase() === target) ?? null;
}

function resolveAssetPath(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path.slice(1);
  return path;
}

function buildNasaCaption(metadata, displayName) {
  const title = metadata?.title ?? `${displayName} NASA image`;
  const dateCreated = metadata?.date_created ?? "Date unavailable";
  const secondaryCreator = metadata?.secondary_creator ?? "Creator unavailable";
  return `${title} | ${dateCreated} | ${secondaryCreator}`;
}

function createGalleryFigure(src, alt, caption, resource) {
  const figure = document.createElement("figure");
  figure.classList.add("planet-image-card");
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";
  figure.appendChild(img);
  if (resource) {
    figure.appendChild(createFavoriteButton(resource));
  }
  if (caption) {
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = caption;
    figure.appendChild(figcaption);
  }
  return figure;
}

function buildFavoriteResource(metadata, imageUrl, displayName) {
  const id = metadata?.nasa_id ?? imageUrl;
  return {
    id,
    title: metadata?.title ?? `${displayName} NASA image`,
    dateCreated: metadata?.date_created ?? null,
    secondaryCreator: metadata?.secondary_creator ?? null,
    imageUrl,
    planet: displayName,
  };
}

function createFavoriteButton(resource) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "favorite-button";
  button.setAttribute("aria-pressed", "false");

  const isFavorite = isFavorited(resource.id);
  setFavoriteButtonState(button, isFavorite);

  button.addEventListener("click", () => {
    const nextState = toggleFavorite(resource);
    setFavoriteButtonState(button, nextState);
  });

  return button;
}

function setFavoriteButtonState(button, isFavorite) {
  button.classList.toggle("is-favorited", isFavorite);
  button.setAttribute("aria-pressed", isFavorite ? "true" : "false");
  button.textContent = isFavorite ? "★" : "☆";
  button.setAttribute("aria-label", isFavorite ? "Remove favorite" : "Add favorite");
}

function loadFavorites() {
  const stored = getLocalStorage(FAVORITES_STORAGE_KEY);
  return Array.isArray(stored) ? stored : [];
}

function saveFavorites(favorites) {
  setLocalStorage(FAVORITES_STORAGE_KEY, favorites);
}

function isFavorited(id) {
  return loadFavorites().some((favorite) => favorite.id === id);
}

function toggleFavorite(resource) {
  const favorites = loadFavorites();
  const existingIndex = favorites.findIndex(
    (favorite) => favorite.id === resource.id
  );

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    saveFavorites(favorites);
    return false;
  }

  favorites.push(resource);
  saveFavorites(favorites);
  return true;
}

function createStatusMessage(message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  return paragraph;
}

function selectRandomItems(items, count) {
  if (!Array.isArray(items) || items.length === 0 || count <= 0) return [];
  const pool = items.slice();
  const selection = [];
  while (pool.length && selection.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    selection.push(pool.splice(index, 1)[0]);
  }
  return selection;
}

function setText(element, value) {
  if (element) {
    element.textContent = value ?? "n/a";
  }
}

function setHtml(element, value) {
  if (element) {
    element.innerHTML = value ?? "n/a";
  }
}

function formatMass(rawMass) {
  if (rawMass == null) return "n/a";
  const massJupiters = Number(rawMass);
  if (Number.isNaN(massJupiters)) return "n/a";

  const massKg = massJupiters * JUPITER_MASS_KG;
  const massLbs = massKg * 2.20462;

  const kg = massKg.toExponential(2);
  const lbs = massLbs.toExponential(2);
  return `${kg}kg or ${lbs}lbs`;
}

function formatRadius(valueKm) {
  if (valueKm == null) return "n/a";
  const radiusJupiters = Number(valueKm);
  if (Number.isNaN(radiusJupiters)) return `${valueKm}`;

  const kmNumber = radiusJupiters * JUPITER_RADIUS_KM;
  if (Number.isNaN(kmNumber)) return `${valueKm}`;
  const km = kmNumber.toFixed(2);
  const miles = (kmNumber * 0.621371).toFixed(2);
  return `${km}km or ${miles}mi`;
}

function formatKilometers(value) {
  if (value == null) return "n/a";
  const number = Number(value);
  if (Number.isNaN(number)) return `${value}`;
  return `${number.toLocaleString()} km`;
}

function formatPeriod(value) {
  if (value == null) return "n/a";
  const number = Number(value);
  if (Number.isNaN(number)) return `${value}`;
  return `${number.toLocaleString(undefined, { maximumFractionDigits: 1 })} Earth days`;
}

function formatSemiMajorAxis(data) {
  if (!data) return "n/a";
  if (data.semimajorAxis != null) {
    return formatKilometers(data.semimajorAxis);
  }
  if (data.semi_major_axis != null) {
    const number = Number(data.semi_major_axis);
    if (Number.isNaN(number)) return `${data.semi_major_axis}`;
    return `${number.toLocaleString(undefined, { maximumFractionDigits: 3 })} AU`;
  }
  return "n/a";
}

function formatDistanceFromEarth(data) {
  if (!data) return "n/a";
  if (data.distanceFromEarth != null) {
    return formatKilometers(data.distanceFromEarth);
  }
  if (data.distance_light_year != null) {
    const number = Number(data.distance_light_year);
    if (!Number.isNaN(number)) {
      return `${number.toLocaleString(undefined, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      })} ly`;
    }
    return `${data.distance_light_year}`;
  }
  if (data.aphelion != null && data.perihelion != null) {
    return `${formatKilometers(data.perihelion)} - ${formatKilometers(data.aphelion)}`;
  }
  return "n/a";
}

function formatTemperature(value) {
  if (value == null) return "n/a";
  const number = Number(value);
  if (Number.isNaN(number)) return `${value}`;
  const kelvin = number;
  const fahrenheit = (kelvin - 273.15) * (9 / 5) + 32;
  const kText = kelvin.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const fText = fahrenheit.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return `${kText} K or ${fText} °F`;
}

function toTitleCase(value) {
  if (!value) return "";
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function displayError(message) {
  if (heroElements.name) {
    heroElements.name.textContent = message;
  }
  if (imagesSection) {
    imagesSection.textContent = "";
    imagesSection.appendChild(createStatusMessage("Please return to the previous page and try again."));
  }
}

