const BASE_URL = "https://images-api.nasa.gov/search";

export async function fetchPlanetImages(name) {
    const response = await fetch(
        `${BASE_URL}?q=${name}&media_type=image`
    );
    const data = await response.json();
    return data.collection.items.slice(0, 5);
}
