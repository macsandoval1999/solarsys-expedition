const PLANETS_API_BASE = "https://api.api-ninjas.com/v1/planets";
const PLANETS_API_KEY = "YSinhnSOuDsl8RdneAf9S4cFdvsjAjGxNzh6WKya";

function getPlanetsApiHeaders() {
    return {
        "X-Api-Key": PLANETS_API_KEY,
    };
}

async function convertToJson(res) {
    const data = await res.json();
    if (res.ok) {
        return data;
    }
    throw { name: "servicesError", message: data };
}

export async function fetchPlanetData(name) {
    const normalizedName = name?.toLowerCase?.();
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
    return match;
}
