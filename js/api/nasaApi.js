const BASE_URL = "https://images-api.nasa.gov/search";
const CACHE_PREFIX = "nasaApi:images:";
const memoryCache = new Map();

function readCache(key) {
    if (memoryCache.has(key)) return memoryCache.get(key);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
        const parsed = JSON.parse(stored);
        memoryCache.set(key, parsed);
        return parsed;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
}

function writeCache(key, value) {
    memoryCache.set(key, value);
    localStorage.setItem(key, JSON.stringify(value));
}

export async function fetchPlanetImages(name) {
    const key = `${CACHE_PREFIX}${name.toLowerCase()}`;
    const cached = readCache(key);
    if (cached) return cached;

    const response = await fetch(
        `${BASE_URL}?q=${name}&media_type=image`
    );
    if (!response.ok) throw new Error("NASA image search failed");
    const data = await response.json();
    const items = data.collection.items.slice(0, 5);
    writeCache(key, items);
    return items;
}
