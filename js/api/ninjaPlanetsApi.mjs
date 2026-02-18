/* Planets API - API Ninjas provides a planets API that gives us access to various data about planets in our solar system. 

This module handles fetching planet data from the API Ninjas planets API. We fetch planet data individually by planet name. This is so loading times are optimized and we only request data for planets that are actually needed. In the dataStuff module, we handle the organization and processing of this data. 

One good reason for this approach is that it minimizes the amount of data transferred over the network, which can improve performance and reduce latency. And the fetch for a planet only happens once, ensuring that we don't make unnecessary repeated requests. We later store the fetched data in a local cache for quick access. */



// API Base URL and API key for the Planets API
const PLANETS_API_BASE = "https://api.api-ninjas.com/v1/planets";
const PLANETS_API_KEY = "YSinhnSOuDsl8RdneAf9S4cFdvsjAjGxNzh6WKya"; // Note: For grade purposes only. In the future, I plan to implement a feature that allows users to input their own API key for the Planets API, so that they can use their own key instead of mine. This way, I can avoid potential issues with rate limits or unauthorized use of my API key.



function getPlanetsApiHeaders()
// This function returns the header object for the Planets API requests, which includes the API key for authentication. The API Ninjas planets API requires the API key to be included in the request headers under the "X-Api-Key" field. By centralizing this logic in a function, we can easily manage and update the headers for all our API requests in one place instead of repeating the header configuration in every fetch call.
{
    return {
        "X-Api-Key": PLANETS_API_KEY,
    };
}



async function convertToJson(res)
// This function converts the response from the API to JSON. If the response is successful (res.ok is true), it returns the JSON data. If the response is not successful, it throws an error with the name "servicesError" and the message containing the error data. This centralizes error handling for all API requests. By using this function, we can ensure that all API responses are processed consistently, and any errors are handled in a standardized way across the application.
{
    const data = await res.json();
    if (res.ok) {
        return data;
    }
    throw { name: "servicesError", message: data };
}



export async function fetchPlanetData(name)
// This function fetches data for a specific planet by name. It normalizes the planet name to lowercase, constructs the API request URL, and includes the necessary headers for authentication. The function then processes the response using the convertToJson function and returns the first matching planet data. If no matching data is found, it throws an error indicating that the planet data is unavailable.
// We could've made it so that the fetch collects all planet data at once, but that would be inefficient and could lead to longer loading times, especially if the API returns a large amount of data. By fetching data for individual planets as needed, we can optimize performance and ensure that we're only requesting the data that is actually necessary for the user at any given time. Later on in the dataStuff module, we implement data saving to store fetched planet data, so that subsequent requests for the same planet can be served from local storage without needing to make another API call. This way, we get the best of both worlds: efficient data fetching and quick access to previously fetched data.
{
    const normalizedName = typeof name === "string" ? name.toLowerCase() : ""; // Check if the passed in name variable is a string, if so convert it to lowercase. If not, set it to an empty string.  
    const res = await fetch(
        `${PLANETS_API_BASE}?name=${encodeURIComponent(normalizedName)}`, //encodeURIComponent is used to ensure that the planet name is properly encoded for use in a URL query parameter. If for example I ever implement a feature that allows users to input their own planet names for fetching data, this will help prevent issues with special characters or spaces in the planet names that could break the URL. Example: Alpha Centauri Bb would be encoded as Alpha%20Centauri%20Bb.
        {
            headers: getPlanetsApiHeaders(), // This api needs the API key to be sent in the headers. We could've just included the headers object directly here, but I decided to create a separate function for it (getPlanetsApiHeaders) to keep the code organized and maintainable. This way, if we ever need to update the headers (for example, if the API key changes), we can do it in one place instead of having to update it in every fetch call.

            /**** In the future, if I implement the feature that allows users to input their own API key, I can modify the getPlanetsApiHeaders function to return the user-provided API key instead of the hardcoded one.****/
        }
    );
    const data = await convertToJson(res);
    const match = Array.isArray(data) ? data[0] : null; // Because the API returns an array of matching planets, we take the first one (data[0]) as the match, but only after confirming that the data is indeed an array. If the data is not an array, we set match to null.
    if (!match) { // If there is no match (i.e., the API returned an empty array or something that is not an array), we throw an error indicating that the planet data is unavailable.
        throw { name: "servicesError", message: "Planet data unavailable" };
    }
    return match;
}
