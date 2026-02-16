import { fetchApod, fetchPlanetImages } from "./api/nasaApi.mjs";
import { fetchPlanetData } from "./api/ninjaPlanetsApi.mjs";
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const APOD_ARCHIVE_BASE = "https://apod.nasa.gov/apod/ap";
const JUPITER_MASS_KG = 1.898e27;
const JUPITER_RADIUS_KM = 69911;
const NINJA_PLANETS_STORAGE_KEY = "planetData";

export async function getApodData() {
    return fetchApod();
}

export async function getPlanetData(query) {
    const normalized = query?.toLowerCase?.() ?? "";
    if (!normalized) {
        return fetchPlanetData(query);
    }

    const cache = getCachedNinjaPlanets();
    if (cache?.[normalized]) {
        return cache[normalized];
    }

    const fetched = await fetchPlanetData(query);
    if (fetched) {
        const nextCache = { ...(cache || {}) };
        nextCache[normalized] = fetched;
        setCachedNinjaPlanets(nextCache);
    }
    return fetched;
}

export async function getPlanetImages(name) {
    return fetchPlanetImages(name);
}

export async function loadPlanetsConfig() {
    const response = await fetch(
        new URL("../assets/json/planets.json", import.meta.url)
    );
    const data = await response.json();
    return Object.values(data);
}

export async function preloadNinjaPlanetsData() {
    const cache = getCachedNinjaPlanets();
    if (cache && Object.keys(cache).length) return cache;

    const planets = await loadPlanetsConfig();
    const names = planets
        .map((planet) => planet?.name)
        .filter((name) => typeof name === "string" && name.trim().length > 0);

    const results = await Promise.all(
        names.map(async (name) => {
            try {
                const data = await fetchPlanetData(name);
                return [name.toLowerCase(), data];
            } catch (error) {
                console.warn("Failed to preload planet data", name, error);
                return null;
            }
        })
    );

    const nextCache = results.reduce((acc, entry) => {
        if (!entry) return acc;
        const [key, value] = entry;
        if (value) {
            acc[key] = value;
        }
        return acc;
    }, {});

    setCachedNinjaPlanets(nextCache);
    return nextCache;
}

export function buildApodArchiveUrl(date) {
    if (!date) return "https://apod.nasa.gov/apod/";
    const [year, month, day] = date.split("-");
    if (!year || !month || !day) return "https://apod.nasa.gov/apod/";
    const shortYear = year.slice(-2);
    return `${APOD_ARCHIVE_BASE}${shortYear}${month}${day}.html`;
}

export function buildApodFavorite(
    apod,
    title,
    date,
    mediaType,
    mediaUrl,
    thumbnailUrl,
    archiveUrl
) {
    const imageUrl = mediaType === "video" ? (thumbnailUrl || mediaUrl) : mediaUrl;
    const idSource = date || apod?.url || title;
    return {
        id: `apod-${idSource}`,
        title: title ?? "NASA Picture of the Day",
        date: date ?? "",
        imageUrl,
        archiveUrl,
        type: "apod",
    };
}

export function buildFavoriteResource(metadata, imageUrl, displayName) {
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

export function selectRandomItems(items, count) {
    if (!Array.isArray(items) || items.length === 0 || count <= 0) return [];
    const pool = items.slice();
    const selection = [];
    while (pool.length && selection.length < count) {
        const index = Math.floor(Math.random() * pool.length);
        selection.push(pool.splice(index, 1)[0]);
    }
    return selection;
}

export function findPlanetConfig(planetsConfig, query) {
    if (!Array.isArray(planetsConfig) || !query) return null;
    const target = query.toLowerCase();
    return planetsConfig.find((planet) => planet.name?.toLowerCase() === target) ?? null;
}

export function resolveAssetPath(path) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path.slice(1);
    return path;
}

export function formatMass(rawMass) {
    if (rawMass == null) return "n/a";
    const massJupiters = Number(rawMass);
    if (Number.isNaN(massJupiters)) return "n/a";

    const massKg = massJupiters * JUPITER_MASS_KG;
    const massLbs = massKg * 2.20462;

    const kg = massKg.toExponential(2);
    const lbs = massLbs.toExponential(2);
    return `${kg}kg or ${lbs}lbs`;
}

export function formatRadius(valueKm) {
    if (valueKm == null) return "n/a";
    const radiusJupiters = Number(valueKm);
    if (Number.isNaN(radiusJupiters)) return `${valueKm}`;

    const kmNumber = radiusJupiters * JUPITER_RADIUS_KM;
    if (Number.isNaN(kmNumber)) return `${valueKm}`;
    const km = kmNumber.toFixed(2);
    const miles = (kmNumber * 0.621371).toFixed(2);
    return `${km}km or ${miles}mi`;
}

export function formatKilometers(value) {
    if (value == null) return "n/a";
    const number = Number(value);
    if (Number.isNaN(number)) return `${value}`;
    return `${number.toLocaleString()} km`;
}

export function formatPeriod(value) {
    if (value == null) return "n/a";
    const number = Number(value);
    if (Number.isNaN(number)) return `${value}`;
    return `${number.toLocaleString(undefined, { maximumFractionDigits: 1 })} Earth days`;
}

export function formatSemiMajorAxis(data) {
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

export function formatDistanceFromEarth(data) {
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

export function formatTemperature(value) {
    if (value == null) return "n/a";
    const number = Number(value);
    if (Number.isNaN(number)) return `${value}`;
    const kelvin = number;
    const fahrenheit = (kelvin - 273.15) * (9 / 5) + 32;
    const kText = kelvin.toLocaleString(undefined, { maximumFractionDigits: 0 });
    const fText = fahrenheit.toLocaleString(undefined, { maximumFractionDigits: 1 });
    return `${kText} K or ${fText} °F`;
}

export function toTitleCase(value) {
    if (!value) return "";
    return value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

function getCachedNinjaPlanets() {
    const stored = getLocalStorage(NINJA_PLANETS_STORAGE_KEY);
    if (stored && typeof stored === "object") {
        return stored;
    }
    return null;
}

function setCachedNinjaPlanets(cache) {
    setLocalStorage(NINJA_PLANETS_STORAGE_KEY, cache);
}
