const BASE_URL = "https://images-api.nasa.gov/search";

export async function fetchPlanetImages(name) {
    const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(name)}&media_type=image`
    );
    if (!response.ok) throw new Error("NASA image search failed");
    const data = await response.json();
    // console.log("NASA API response", data);
    return data.collection.items ?? [];
}
