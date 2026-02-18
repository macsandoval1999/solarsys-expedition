/* NASA Images and Videos API gives access to a wide range of media content from NASA's archives. This module provides functions to fetch images of specific planets and the Astronomy Picture of the Day (APOD) from NASA's APIs. 

NASA APOD API provides the Astronomy Picture of the Day, which is a daily image or video along with a brief explanation. This module includes functions to fetch the APOD data and build URLs for the APOD archive pages.
*/



const BASE_URL = "https://images-api.nasa.gov/search";
const APOD_URL = "https://api.nasa.gov/planetary/apod";
const APOD_API_KEY = "jJjg2hytKx5L8tBEkqLx5KhqUhYIVUY6c53EEMwY";

export async function fetchPlanetImages(name)
/* This function fetches images of a specific planet from the NASA Images API. It takes the planet name as an argument, constructs the API request URL with the encoded planet name, and fetches the data. If the response is not successful, it throws an error. */
{
    const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(name)}&media_type=image`
    );
    if (!response.ok) throw new Error("NASA image search failed"); // if the response is not ok "successful" (i.e., the status code is not in the 200-299 range), we throw an error indicating that the NASA image search failed.
    const data = await response.json();
    return data.collection.items ?? [];
}



export async function fetchApod()
/* This function fetches the Astronomy Picture of the Day (APOD) from the NASA APOD API. It constructs the API request URL with the API key and fetches the data. If the response is not successful, it throws an error. */
{
    const response = await fetch(
        `${APOD_URL}?api_key=${APOD_API_KEY}&thumbs=true`
    );
    if (!response.ok) throw new Error("NASA APOD request failed");
    return response.json();
}

