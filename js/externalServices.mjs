const PLANETS_API_BASE = "https://api.api-ninjas.com/v1/planets";
const NASA_API_BASE = "https://images-api.nasa.gov/search";
const PLANETS_API_KEY = "YSinhnSOuDsl8RdneAf9S4cFdvsjAjGxNzh6WKya";

const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const memoryCache = new Map();

function readCache(key) {
    const now = Date.now();
    const cached = memoryCache.get(key);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
        const parsed = JSON.parse(stored);
        if (!parsed?.timestamp || now - parsed.timestamp >= CACHE_TTL_MS) {
            localStorage.removeItem(key);
            return null;
        }
        memoryCache.set(key, parsed);
        return parsed.data;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
}

function writeCache(key, data) {
    const entry = { timestamp: Date.now(), data };
    memoryCache.set(key, entry);
    localStorage.setItem(key, JSON.stringify(entry));
}

async function convertToJson(res) {
    const data = await res.json();
    if (res.ok) {
        return data;
    }
    throw { name: "servicesError", message: data };
}

function getPlanetsApiHeaders() {
    return {
        "X-Api-Key": PLANETS_API_KEY,
    };
}


export default class ExternalServices {
    async getPlanet(name) {
        const normalizedName = name?.toLowerCase?.();
        const cacheKey = `apiNinjas:planet:${normalizedName}`;
        const cached = readCache(cacheKey);
        if (cached) return cached;

        const res = await fetch(
            `${PLANETS_API_BASE}?name=${encodeURIComponent(normalizedName)}`,
            {
                headers: getPlanetsApiHeaders(),
            }
        );
        const data = await convertToJson(res);
        const match = Array.isArray(data) ? data[0] : null;
        if (!match) {
            throw { name: "servicesError", message: "Planet data unavailable" };
        }
        writeCache(cacheKey, match);
        return match;
    }

    async getPlanetImages(name) {
        const cacheKey = `nasaApi:images:${name.toLowerCase()}`;
        const cached = readCache(cacheKey);
        if (cached) return cached;

        const url = `${NASA_API_BASE}?q=${encodeURIComponent(name)}&media_type=image`;
        const res = await fetch(url);
        const data = await convertToJson(res);
        const items = data?.collection?.items ?? [];
        writeCache(cacheKey, items);
        return items;
    }
}