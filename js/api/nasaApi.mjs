const BASE_URL = "https://images-api.nasa.gov/search";
const APOD_URL = "https://api.nasa.gov/planetary/apod";
const APOD_API_KEY = "jJjg2hytKx5L8tBEkqLx5KhqUhYIVUY6c53EEMwY";

export async function fetchPlanetImages(name) {
    const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(name)}&media_type=image`
    );
    if (!response.ok) throw new Error("NASA image search failed");
    const data = await response.json();
    // console.log("NASA API response", data);
    return data.collection.items ?? [];
}

export async function fetchApod() {
    const response = await fetch(
        `${APOD_URL}?api_key=${APOD_API_KEY}&thumbs=true`
    );
    if (!response.ok) throw new Error("NASA APOD request failed");
    return response.json();
}

