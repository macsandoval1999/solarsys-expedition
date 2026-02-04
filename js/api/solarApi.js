const BASE_URL = "https://api.le-systeme-solaire.net/rest/bodies/";

export async function fetchPlanetData(name) {
    const response = await fetch(`${BASE_URL}${name}`);
    if (!response.ok) throw new Error("Planet data failed");
    return response.json();
}
