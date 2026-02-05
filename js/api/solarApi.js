const BASE_URL = "https://api.le-systeme-solaire.net/rest/bodies/";
const CACHE_PREFIX = "solarApi:planet:";
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

export async function fetchPlanetData(name) {
    const key = `${CACHE_PREFIX}${name}`;
    const cached = readCache(key);
    if (cached) return cached;

    const response = await fetch(`${BASE_URL}${name}`);
    if (!response.ok) throw new Error("Planet data failed");
    const data = await response.json();
    writeCache(key, data);
    return data;
}
