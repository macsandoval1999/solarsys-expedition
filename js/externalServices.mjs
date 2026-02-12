const PLANETS_API_BASE = "https://api.api-ninjas.com/v1/planets";
const NASA_API_BASE = "https://images-api.nasa.gov/search";
const PLANETS_API_KEY = "YSinhnSOuDsl8RdneAf9S4cFdvsjAjGxNzh6WKya";

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

    async getPlanetImages(name) {
        const url = `${NASA_API_BASE}?q=${encodeURIComponent(name)}&media_type=image`;
        const res = await fetch(url);
        const data = await convertToJson(res);
        return data?.collection?.items ?? [];
    }
}